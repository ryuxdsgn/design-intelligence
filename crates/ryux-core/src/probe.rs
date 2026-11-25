//! The rendered checks of `ryux scan <url>`, over what the in-page extract read (packages/cli/src/cli/page-probe.ts;
//! `fixtures/checks/probe.json` shows the shape): horizontal scroll, text contrast and size, target size, colliding
//! text, text under a fixed or sticky bar, visual tells, and textareas that do not grow. Two measurements need the
//! page to act (a text scrolled into view and hit-tested, a textarea filled for a moment), so the first call answers
//! `{ ask: { under, grow } }`; the CLI has the page do them and calls again with `answers`. JavaScript semantics are
//! kept where the first, JavaScript version relied on them.

use crate::audit::{contrast, luminance, max_js, min_js, over, Rgb};
use crate::js::{len16, num, num_str, round, slice16};
use crate::jsre::{js, JsRe};
use serde_json::{json, Map, Value};
use std::collections::{HashMap, HashSet};

/// What the rendered checks look for, one row per line of RENDER_CHECKS in packages/cli/src/checks.ts (which also
/// lists RX-QA-08, script errors, reported by the CLI itself). `cargo test` and the CLI tests hold them equal.
pub const CATALOGUE: [(&str, &str); 20] = [
    ("RX-RD-01", "fail"),
    ("RX-A11Y-01", "fail"),
    ("RX-A11Y-01", "warn"),
    ("RX-A11Y-01", "fail"),
    ("RX-A11Y-03", "fail"),
    ("RX-A11Y-02", "fail"),
    ("RX-QA-03", "warn"),
    ("RX-QA-03", "fail"),
    ("RX-AS-05", "warn"),
    ("RX-UI-10", "warn"),
    ("RX-AS-10", "warn"),
    ("RX-AS-03", "warn"),
    ("RX-AS-11", "warn"),
    ("RX-UI-26", "warn"),
    ("RX-UI-36", "warn"),
    ("RX-DS-02", "warn"),
    ("RX-UI-01", "warn"),
    ("RX-UI-03", "warn"),
    ("RX-UX-15", "warn"),
    ("RX-FM-05", "warn"),
];

/// The catalogue as JSON: `[{rule, level}]`.
pub fn catalogue() -> Value {
    Value::Array(CATALOGUE.iter().map(|(rule, level)| json!({ "rule": rule, "level": level })).collect())
}

const BODY: usize = 1;

/// Style values the extract leaves out because they are the default.
fn default_str(k: &str) -> &'static str {
    match k {
        "display" => "block",
        "visibility" => "visible",
        "opacity" => "1",
        "clip" => "auto",
        "clipPath" | "backgroundImage" | "filter" | "boxShadow" | "textShadow" | "backdropFilter" => "none",
        "overflow" | "overflowY" => "visible",
        "position" => "static",
        "backgroundColor" => "rgba(0, 0, 0, 0)",
        "mixBlendMode" | "fontStyle" => "normal",
        _ => "",
    }
}
fn default_num(k: &str) -> f64 {
    match k {
        "fontSize" => 16.0,
        "fontWeight" => 400.0,
        _ => 0.0,
    }
}

#[derive(Clone, Copy)]
struct Rect {
    x: f64,
    y: f64,
    w: f64,
    h: f64,
}
impl Rect {
    fn from(v: &Value) -> Rect {
        Rect { x: num(v.get(0)), y: num(v.get(1)), w: num(v.get(2)), h: num(v.get(3)) }
    }
    fn right(&self) -> f64 {
        self.x + self.w
    }
    fn bottom(&self) -> f64 {
        self.y + self.h
    }
}

struct El<'a> {
    p: Option<usize>,
    tag: &'a str,
    style: &'a Map<String, Value>,
    r: Rect,
    v: &'a Value,
}

struct Text<'a> {
    i: usize,
    e: usize,
    x: &'a str,
    r: Rect,
    open: Option<Vec<Option<usize>>>,
    end: Option<(Rect, Vec<Option<usize>>)>,
}

/// An element on the walk from a hit up to <body>, read with the page in one scroll state.
struct Link<'a> {
    position: &'a str,
    width: f64,
    top: f64,
    op: Option<usize>,
    text: Option<&'a str>,
}

struct Res {
    rgba: JsRe,
    rgba_all: JsRe,
    split: JsRe,
    px: JsRe,
    drop: regex::Regex,
    inset: JsRe,
    scrolls: JsRe,
    pinned: JsRe,
    status: JsRe,
    letters: JsRe,
    mono: JsRe,
    az3: JsRe,
    serif: JsRe,
    sans: JsRe,
    number: regex::Regex,
    amount: regex::Regex,
    emoji: regex::Regex,
    drawing: regex::Regex,
    stand_in: regex::Regex,
    logo: regex::Regex,
    initial: regex::Regex,
    device: regex::Regex,
}

impl Res {
    fn new() -> Res {
        Res {
            rgba: js(r"rgba?\(([^)]+)\)", ""),
            rgba_all: js(r"rgba?\([^)]+\)", "g"),
            split: js(r"[\s,/]+", "g"),
            px: js(r"-?\d+(\.\d+)?px", "g"),
            drop: regex::Regex::new(r"drop-shadow\(([^)]*\))\)").unwrap(),
            inset: js(r"inset\(50%\)", ""),
            scrolls: js(r"(auto|scroll)", ""),
            pinned: js(r"^(fixed|sticky)$", ""),
            amount: regex::Regex::new(r"(?:Rp|IDR|US\$|\$|€|£|¥|₹)\s?\d").unwrap(),
            status: js(r"\b(beta|new|baru|v\d|\d{4}|live|soon|segera|preview)\b", "i"),
            letters: js(r"\p{L}{2}", "u"),
            mono: js(r"mono|courier|consolas|menlo", "i"),
            az3: js(r"[a-z]{3}", "i"),
            serif: js(r"serif", "i"),
            sans: js(r"sans", "i"),
            // an emoji shown as a picture: one that is by default, or a symbol asked to be one (U+FE0F)
            emoji: regex::Regex::new(r"\p{Emoji_Presentation}|\p{Extended_Pictographic}\x{FE0F}").unwrap(),
            // a class that names a drawing, or a device a page pictures
            // a box that names what should be in it
            stand_in: regex::Regex::new(r"(?i)^\[?\s*(?:logo|qr|qris|kode qr|qr code|foto|photo|gambar|image|ilustrasi|illustration|ikon|icon|peta|map|video|banner)\b").unwrap(),
            logo: regex::Regex::new(r"(?i)logo|brand|wordmark").unwrap(),
            initial: regex::Regex::new(r"^\p{L}{1,2}$").unwrap(),
            drawing: regex::Regex::new(r"(?i)illus|artwork|drawing|(^|[-_])art($|[-_])").unwrap(),
            device: regex::Regex::new(r"(?i)phone|device|mockup|handset").unwrap(),
            number: regex::Regex::new(r"^[+-]?(?:[0-9]+\.?[0-9]*|\.[0-9]+)(?:[eE][+-]?[0-9]+)?$").unwrap(),
        }
    }
}

/// `Number(s)` for the tokens of a computed colour.
fn js_number(re: &Res, s: &str) -> f64 {
    let t = crate::js::trim(s);
    if t.is_empty() {
        return 0.0;
    }
    if re.number.is_match(t) {
        return t.parse().unwrap_or(f64::NAN);
    }
    match t {
        "Infinity" | "+Infinity" => f64::INFINITY,
        "-Infinity" => f64::NEG_INFINITY,
        _ => {
            let radix = |p: &str, r: u32| t.strip_prefix(p).or_else(|| t.strip_prefix(&p.to_uppercase())).and_then(|d| u64::from_str_radix(d, r).ok()).map(|n| n as f64);
            radix("0x", 16).or_else(|| radix("0o", 8)).or_else(|| radix("0b", 2)).unwrap_or(f64::NAN)
        }
    }
}

type Colour = [f64; 4];

/// Why the colours behind a text cannot be read from the styles.
#[derive(Clone, Copy)]
enum Unknown {
    /// A blend mode, or a filter that is not a colour function (blur, url): it changes the text and
    /// what is behind it in ways the styles do not tell.
    Mixed,
    /// An image or a gradient ("image" or "gradient") on the element given: only the page's pixels show it.
    Picture(&'static str, usize),
}

/// A colour function of `filter`, on 0-1 channels (Filter Effects 1, the shorthand functions). `opacity()` is not
/// one: it fades the element like the `opacity` property.
#[derive(Clone, Copy)]
enum Tint {
    Matrix([f64; 9]),
    Invert(f64),
    Brightness(f64),
    Contrast(f64),
}

impl Tint {
    fn apply(&self, c: [f64; 3]) -> [f64; 3] {
        let out = match *self {
            Tint::Matrix(m) => [
                m[0] * c[0] + m[1] * c[1] + m[2] * c[2],
                m[3] * c[0] + m[4] * c[1] + m[5] * c[2],
                m[6] * c[0] + m[7] * c[1] + m[8] * c[2],
            ],
            Tint::Invert(a) => c.map(|v| a * (1.0 - v) + (1.0 - a) * v),
            Tint::Brightness(b) => c.map(|v| v * b),
            Tint::Contrast(k) => c.map(|v| (v - 0.5) * k + 0.5),
        };
        out.map(|v| v.clamp(0.0, 1.0))
    }
}

/// Texts over an image or a gradient whose pixels the page is asked for, per width; the rest are not measured.
const MAX_BEHIND: usize = 40;
/// Controls a scan has the page focus, per width.
const MAX_FOCUS: usize = 80;

/// A text under its contrast: the colours at its weakest point, and what was behind it when that was a picture.
struct Fail {
    k: usize,
    ratio: f64,
    fg: Colour,
    bg: Colour,
    need: f64,
    /// The kind of picture and the element that carries it.
    over: Option<(&'static str, usize)>,
}

/// `Math.hypot` as V8 computes it: scaled by the largest value, with a compensated sum.
fn hypot(a: f64, b: f64) -> f64 {
    let vals = [a.abs(), b.abs()];
    let mut max = 0.0f64;
    let mut nan = false;
    for v in vals {
        if v.is_nan() {
            nan = true;
        } else if v > max {
            max = v;
        }
    }
    if max == f64::INFINITY {
        return f64::INFINITY;
    }
    if nan {
        return f64::NAN;
    }
    if max == 0.0 {
        return 0.0;
    }
    let (mut sum, mut comp) = (0.0f64, 0.0f64);
    for v in vals {
        let n = v / max;
        let summand = n * n - comp;
        let pre = sum + summand;
        comp = (pre - sum) - summand;
        sum = pre;
    }
    sum.sqrt() * max
}

struct Page<'a> {
    /// The colour behind a page with no background of its own: white, or the dark canvas of `color-scheme: dark`.
    canvas: Colour,
    /// The page's colour tokens (CSS custom properties that hold a colour) and the gradients declared as tokens.
    tokens: Vec<Colour>,
    token_gradients: Vec<&'a str>,
    re: Res,
    vw: f64,
    vh: f64,
    scroll_width: f64,
    els: Vec<El<'a>>,
    kids: Vec<Vec<usize>>,
    texts: Vec<Text<'a>>,
    open: HashMap<usize, Link<'a>>,
    end: HashMap<usize, Link<'a>>,
    scrolling: Option<usize>,
    top: Option<usize>,
    shown: Vec<bool>,
    outside: Vec<bool>,
    disabled: Vec<bool>,
    in_svg: Vec<bool>,
    in_code: Vec<bool>,
    pinned: Vec<bool>,
    /// Inside a region named as a prototype panel.
    in_proto: Vec<bool>,
}

fn idx(v: Option<&Value>) -> Option<usize> {
    v.and_then(Value::as_u64).map(|n| n as usize)
}
fn hits(v: Option<&Value>) -> Option<Vec<Option<usize>>> {
    v.and_then(Value::as_array).map(|a| a.iter().map(|h| idx(Some(h))).collect())
}
fn links(v: &Value) -> HashMap<usize, Link<'_>> {
    let mut out = HashMap::new();
    if let Some(o) = v.as_object() {
        for (k, l) in o {
            let Ok(i) = k.parse::<usize>() else { continue };
            out.insert(i, Link { position: l["position"].as_str().unwrap_or(""), width: num(l.get("width")), top: num(l.get("top")), op: idx(l.get("op")), text: l.get("text").and_then(Value::as_str) });
        }
    }
    out
}

fn finding(rule: &str, level: &str, selector: String, message: String) -> Value {
    json!({ "rule": rule, "level": level, "selector": selector, "message": message })
}

/// `"text"`, cut to 37 characters and an ellipsis past 40.
fn quote(s: &str) -> String {
    if len16(s) > 40 { format!("\"{}...\"", slice16(s, 0, Some(37))) } else { format!("\"{s}\"") }
}

impl<'a> Page<'a> {
    fn read(input: &'a Value) -> Result<Page<'a>, String> {
        static EMPTY: std::sync::OnceLock<Map<String, Value>> = std::sync::OnceLock::new();
        let empty = EMPTY.get_or_init(Map::new);
        let styles: Vec<&Map<String, Value>> = input["styles"].as_array().map_or(Vec::new(), |a| a.iter().map(|s| s.as_object().unwrap_or(empty)).collect());
        let raw = input["els"].as_array().ok_or("no els")?;
        if raw.len() < 2 {
            return Err("els must start with <html> and <body>".into());
        }
        let els: Vec<El> = raw
            .iter()
            .map(|e| El { p: idx(e.get("p")), tag: e["t"].as_str().unwrap_or(""), style: idx(e.get("s")).and_then(|s| styles.get(s).copied()).unwrap_or(empty), r: Rect::from(&e["r"]), v: e })
            .collect();
        let mut kids = vec![Vec::new(); els.len()];
        for (i, e) in els.iter().enumerate() {
            if let Some(p) = e.p.filter(|p| *p < i) {
                kids[p].push(i);
            }
        }
        let texts = input["texts"]
            .as_array()
            .map_or(Vec::new(), |a| {
                a.iter()
                    .enumerate()
                    .filter_map(|(i, t)| {
                        let e = idx(t.get("e")).filter(|e| *e < els.len())?;
                        let end = t.get("end").filter(|v| v.is_object()).and_then(|z| Some((Rect::from(&z["r"]), hits(z.get("h"))?)));
                        Some(Text { i, e, x: t["x"].as_str().unwrap_or(""), r: Rect::from(&t["r"]), open: hits(t.get("open")), end })
                    })
                    .collect()
            });
        let top = idx(input.get("top")).filter(|t| *t < els.len());
        // indexes the extract never sends past the elements are dropped, not followed
        let n = els.len();
        let texts: Vec<Text> = texts
            .into_iter()
            .map(|mut t| {
                let keep = |h: Vec<Option<usize>>| h.into_iter().map(|x| x.filter(|x| *x < n)).collect::<Vec<_>>();
                t.open = t.open.map(keep);
                t.end = t.end.map(|(r, h)| (r, keep(h)));
                t
            })
            .collect();
        let bounded = |mut m: HashMap<usize, Link<'a>>| {
            m.retain(|k, _| *k < n);
            for l in m.values_mut() {
                l.op = l.op.filter(|o| *o < n);
            }
            m
        };
        let re = Res::new();
        let canvas = input.get("canvas").and_then(Value::as_str).and_then(|c| re.rgba.exec(c).map(|_| c)).map(|c| {
            let m = re.rgba.exec(c).unwrap();
            let parts: Vec<f64> = re.split.split(m.g(1)).into_iter().filter(|p| !p.is_empty()).map(|p| js_number(&re, &p)).collect();
            [parts.first().copied().unwrap_or(255.0), parts.get(1).copied().unwrap_or(255.0), parts.get(2).copied().unwrap_or(255.0), 1.0]
        });
        let tokens: Vec<Colour> = input["tokens"]["colours"].as_array().map_or(Vec::new(), |a| a.iter().filter_map(Value::as_str).filter_map(|c| {
            let m = re.rgba.exec(c)?;
            let parts: Vec<f64> = re.split.split(m.g(1)).into_iter().filter(|p| !p.is_empty()).map(|p| js_number(&re, &p)).collect();
            (parts.len() >= 3).then(|| [parts[0], parts[1], parts[2], parts.get(3).copied().unwrap_or(1.0)])
        }).collect());
        let token_gradients: Vec<&str> = input["tokens"]["gradients"].as_array().map_or(Vec::new(), |a| a.iter().filter_map(Value::as_str).collect());
        let mut page = Page {
            canvas: canvas.unwrap_or([255.0, 255.0, 255.0, 1.0]),
            tokens,
            token_gradients,
            re,
            vw: num(input.get("vw")),
            vh: num(input.get("vh")),
            scroll_width: num(input.get("scrollWidth")),
            top,
            kids,
            texts,
            open: bounded(links(&input["chains"]["open"])),
            end: bounded(links(&input["chains"]["end"])),
            scrolling: idx(input.get("scrollingElement")),
            shown: Vec::new(),
            outside: Vec::new(),
            disabled: Vec::new(),
            in_svg: Vec::new(),
            in_code: Vec::new(),
            pinned: Vec::new(),
            in_proto: Vec::new(),
            els,
        };
        // What holds for an element and every ancestor, worked out once in document order (parents come first).
        let n = page.els.len();
        let (mut hidden, mut ignored) = (vec![false; n], vec![false; n]);
        let (mut dis, mut svg, mut code, mut pin, mut proto) = (vec![false; n], vec![false; n], vec![false; n], vec![false; n], vec![false; n]);
        for i in 0..n {
            let p = page.els[i].p.filter(|p| *p < i);
            let up = |v: &Vec<bool>| p.map_or(false, |p| v[p]);
            hidden[i] = page.hides(i) || up(&hidden);
            ignored[i] = page.flag(i, "ig") || up(&ignored);
            dis[i] = page.flag(i, "dis") || up(&dis);
            let tag = page.els[i].tag.to_ascii_lowercase();
            svg[i] = tag == "svg" || up(&svg);
            code[i] = matches!(tag.as_str(), "code" | "pre" | "kbd" | "samp" | "var" | "time") || page.flag(i, "cc") || up(&code);
            pin[i] = page.re.pinned.test(page.s(i, "position")) || up(&pin);
            proto[i] = page.flag(i, "pr") || up(&proto);
        }
        page.shown = (0..n).map(|i| !hidden[i] && page.els[i].r.w > 1.0 && page.els[i].r.h > 1.0).collect();
        page.outside = ignored.iter().map(|x| !x).collect();
        page.disabled = dis;
        page.in_svg = svg;
        page.in_code = code;
        page.pinned = pin;
        page.in_proto = proto;
        Ok(page)
    }

    fn s(&self, i: usize, k: &str) -> &'a str {
        match self.els[i].style.get(k) {
            Some(Value::String(v)) => v.as_str(),
            _ => default_str(k),
        }
    }
    fn n(&self, i: usize, k: &str) -> f64 {
        match self.els[i].style.get(k) {
            None => default_num(k),
            Some(v) => v.as_f64().unwrap_or(f64::NAN),
        }
    }
    fn color(&self, i: usize) -> &'a str {
        self.s(i, "color")
    }
    /// A style that the extract stores only when it differs from the text colour.
    fn or_color(&self, i: usize, k: &str) -> &'a str {
        match self.els[i].style.get(k) {
            Some(Value::String(v)) => v.as_str(),
            _ => self.color(i),
        }
    }
    fn flag(&self, i: usize, k: &str) -> bool {
        self.els[i].v.get(k).and_then(Value::as_f64).map_or(false, |x| x != 0.0)
    }
    fn text_of(&self, i: usize, k: &str) -> &'a str {
        self.els[i].v.get(k).and_then(Value::as_str).unwrap_or("")
    }
    fn parent(&self, i: usize) -> Option<usize> {
        self.els[i].p.filter(|p| *p < i)
    }
    /// The element's own part of `shown`: hidden, transparent, or visually hidden (the sr-only pattern: clipped, or
    /// a box of 1px or less that hides overflow).
    fn hides(&self, i: usize) -> bool {
        if self.s(i, "display") == "none" || self.s(i, "visibility") == "hidden" || self.s(i, "opacity") == "0" {
            return true;
        }
        let clip = self.s(i, "clip");
        if (!clip.is_empty() && clip != "auto") || self.re.inset.test(self.s(i, "clipPath")) {
            return true;
        }
        let r = self.els[i].r;
        self.s(i, "overflow") != "visible" && (r.w <= 1.0 || r.h <= 1.0)
    }
    /// `a.contains(b)`: a is b or one of its ancestors.
    /// The ancestors of an element, nearest first.
    fn ancestors(&self, i: usize) -> Vec<usize> {
        let mut out = Vec::new();
        let mut e = self.parent(i);
        while let Some(x) = e {
            out.push(x);
            e = self.parent(x);
        }
        out
    }
    fn contains(&self, a: usize, b: usize) -> bool {
        let mut e = Some(b);
        while let Some(x) = e {
            if x == a {
                return true;
            }
            e = self.parent(x);
        }
        false
    }
    fn selector(&self, i: usize) -> String {
        let mut parts: Vec<String> = Vec::new();
        let mut e = Some(i);
        while let Some(x) = e {
            if x == BODY || parts.len() >= 3 {
                break;
            }
            let mut s = self.els[x].tag.to_lowercase();
            let id = self.text_of(x, "id");
            if !id.is_empty() {
                parts.insert(0, format!("{s}#{id}"));
                break;
            }
            let c = self.text_of(x, "c");
            if !c.is_empty() {
                s = format!("{s}.{c}");
            }
            parts.insert(0, s);
            e = self.parent(x);
        }
        parts.join(" > ")
    }
    fn rgba(&self, c: &str) -> Option<Colour> {
        let m = self.re.rgba.exec(c)?;
        let parts: Vec<f64> = self.re.split.split(m.g(1)).into_iter().filter(|p| !p.is_empty()).map(|p| js_number(&self.re, &p)).collect();
        let at = |k: usize| parts.get(k).copied().unwrap_or(f64::NAN);
        Some([at(0), at(1), at(2), parts.get(3).copied().unwrap_or(1.0)])
    }
    fn colours(&self, text: &str) -> Vec<Colour> {
        self.re.rgba_all.matches(text).iter().filter_map(|m| self.rgba(m)).collect()
    }
    /// The colours an element's pixel shows, behind its text and with its text on top (`fg`), or None when an
    /// image, gradient, blend, or filter makes it unknown. Each layer is its background over what is behind it,
    /// and an element's opacity fades it with all it holds, its own background and text included.
    fn painted(&self, i: usize, fg: Option<Colour>) -> Option<(Colour, Colour)> {
        let chain = self.layers(i);
        if self.unknown_layer(&chain).is_some() {
            return None;
        }
        let op = |x: usize| self.opacity(x);
        // A colour filter changes everything its element paints, so each colour is tinted by the filters of the
        // element that paints it and of every element around that one (the colour functions are affine, so tinting
        // the parts before they blend is tinting the blend).
        let bg = |k: usize| self.rgba(self.s(chain[k], "backgroundColor")).filter(|c| c[3] > 0.0).map(|c| self.tinted(c, i, k));
        let fg = fg.map(|c| self.tinted(c, i, 0));
        // from the outermost layer in: what the element at `k` and all it holds paint over `behind`
        fn paint(chain: &[usize], k: usize, behind: Colour, fg: Option<Colour>, op: &dyn Fn(usize) -> f64, bg: &dyn Fn(usize) -> Option<Colour>) -> Colour {
            let x = chain[k];
            let mut c = bg(k).map_or(behind, |b| blend(b, behind));
            c = if k > 0 { paint(chain, k - 1, c, fg, op, bg) } else { fg.map_or(c, |f| blend(f, c)) };
            let o = op(x);
            if o >= 1.0 { c } else { [c[0] * o + behind[0] * (1.0 - o), c[1] * o + behind[1] * (1.0 - o), c[2] * o + behind[2] * (1.0 - o), 1.0] }
        }
        let top = chain.len() - 1;
        Some((paint(&chain, top, self.canvas, None, &op, &bg), paint(&chain, top, self.canvas, fg, &op, &bg)))
    }
    /// An element's opacity, times the `opacity()` functions of its filter.
    fn opacity(&self, x: usize) -> f64 {
        let o = js_number(&self.re, self.s(x, "opacity"));
        let o = if o.is_finite() { o.clamp(0.0, 1.0) } else { 1.0 };
        o * self.filter_fns(x).iter().filter(|(name, _)| *name == "opacity").map(|(_, a)| a.clamp(0.0, 1.0)).product::<f64>()
    }
    /// The functions of an element's filter as (name, argument): numbers and percentages as fractions, angles in
    /// degrees, a missing argument as the function's default. Empty for none.
    fn filter_fns(&self, x: usize) -> Vec<(&'a str, f64)> {
        let filter = self.s(x, "filter");
        if filter.is_empty() || filter == "none" {
            return Vec::new();
        }
        // name(argument) at the top level; an argument may hold parentheses (drop-shadow(rgba(...) 0 1px))
        let mut out = Vec::new();
        let (mut depth, mut start, mut open) = (0usize, 0usize, 0usize);
        for (k, ch) in filter.char_indices() {
            match ch {
                '(' => {
                    if depth == 0 {
                        open = k;
                    }
                    depth += 1;
                }
                ')' if depth > 0 => {
                    depth -= 1;
                    if depth == 0 {
                        out.push((filter[start..open].trim(), filter[open + 1..k].trim()));
                        start = k + 1;
                    }
                }
                _ => {}
            }
        }
        out.into_iter()
            .map(|(name, arg)| {
                let value = if name == "drop-shadow" {
                    0.0
                } else if arg.is_empty() {
                    if name == "hue-rotate" { 0.0 } else { 1.0 }
                } else if let Some(p) = arg.strip_suffix('%') {
                    js_number(&self.re, p) / 100.0
                } else if let Some(d) = arg.strip_suffix("deg") {
                    js_number(&self.re, d)
                } else if let Some(r) = arg.strip_suffix("rad") {
                    js_number(&self.re, r).to_degrees()
                } else if let Some(t) = arg.strip_suffix("turn") {
                    js_number(&self.re, t) * 360.0
                } else {
                    js_number(&self.re, arg)
                };
                (name, if value.is_finite() { value } else { f64::NAN })
            })
            .collect()
    }
    /// An element's filter as colour functions, in order, or None when it has one that changes colours in a way
    /// the styles do not tell (blur, a url, or an argument that does not read).
    fn tints(&self, x: usize) -> Option<Vec<Tint>> {
        let mut out = Vec::new();
        for (name, a) in self.filter_fns(x) {
            if a.is_nan() {
                return None;
            }
            let t = |v: f64| v.clamp(0.0, 1.0);
            out.push(match name {
                // opacity fades like the property; a drop shadow falls outside what the element paints
                "opacity" | "drop-shadow" => continue,
                "grayscale" => {
                    let b = 1.0 - t(a);
                    Tint::Matrix([
                        0.2126 + 0.7874 * b, 0.7152 - 0.7152 * b, 0.0722 - 0.0722 * b,
                        0.2126 - 0.2126 * b, 0.7152 + 0.2848 * b, 0.0722 - 0.0722 * b,
                        0.2126 - 0.2126 * b, 0.7152 - 0.7152 * b, 0.0722 + 0.9278 * b,
                    ])
                }
                "sepia" => {
                    let b = 1.0 - t(a);
                    Tint::Matrix([
                        0.393 + 0.607 * b, 0.769 - 0.769 * b, 0.189 - 0.189 * b,
                        0.349 - 0.349 * b, 0.686 + 0.314 * b, 0.168 - 0.168 * b,
                        0.272 - 0.272 * b, 0.534 - 0.534 * b, 0.131 + 0.869 * b,
                    ])
                }
                "saturate" => {
                    let s = a.max(0.0);
                    Tint::Matrix([
                        0.213 + 0.787 * s, 0.715 - 0.715 * s, 0.072 - 0.072 * s,
                        0.213 - 0.213 * s, 0.715 + 0.285 * s, 0.072 - 0.072 * s,
                        0.213 - 0.213 * s, 0.715 - 0.715 * s, 0.072 + 0.928 * s,
                    ])
                }
                "hue-rotate" => {
                    let (sin, cos) = a.to_radians().sin_cos();
                    Tint::Matrix([
                        0.213 + cos * 0.787 - sin * 0.213, 0.715 - cos * 0.715 - sin * 0.715, 0.072 - cos * 0.072 + sin * 0.928,
                        0.213 - cos * 0.213 + sin * 0.143, 0.715 + cos * 0.285 + sin * 0.140, 0.072 - cos * 0.072 - sin * 0.283,
                        0.213 - cos * 0.213 - sin * 0.787, 0.715 - cos * 0.715 + sin * 0.715, 0.072 + cos * 0.928 + sin * 0.072,
                    ])
                }
                "invert" => Tint::Invert(t(a)),
                "brightness" => Tint::Brightness(a.max(0.0)),
                "contrast" => Tint::Contrast(a.max(0.0)),
                _ => return None,
            });
        }
        Some(out)
    }
    /// Whether the element or an ancestor carries a colour filter (a grey or faded logo row is the usual case).
    fn colour_filtered(&self, i: usize) -> bool {
        let mut e = Some(i);
        while let Some(x) = e {
            if self.filter_fns(x).iter().any(|(name, _)| *name != "drop-shadow") {
                return true;
            }
            e = self.parent(x);
        }
        false
    }
    /// `c` as painted by the element `k` steps up from `i`: tinted by the colour filters of that element and every
    /// ancestor, the innermost first.
    fn tinted(&self, c: Colour, i: usize, k: usize) -> Colour {
        let mut e = Some(i);
        let mut up = 0;
        let mut rgb = [c[0] / 255.0, c[1] / 255.0, c[2] / 255.0];
        while let Some(x) = e {
            if up >= k {
                for t in self.tints(x).unwrap_or_default() {
                    rgb = t.apply(rgb);
                }
            }
            up += 1;
            e = self.parent(x);
        }
        [rgb[0] * 255.0, rgb[1] * 255.0, rgb[2] * 255.0, c[3]]
    }
    /// The layers that paint an element's pixel: it and its ancestors, up to the nearest opaque background with no
    /// fading at or above it (that background hides everything behind it).
    fn layers(&self, i: usize) -> Vec<usize> {
        let mut chain = Vec::new();
        let mut e = Some(i);
        while let Some(x) = e {
            chain.push(x);
            e = self.parent(x);
        }
        let bg = |x: usize| self.rgba(self.s(x, "backgroundColor")).filter(|c| c[3] > 0.0);
        let mut faded_above = vec![false; chain.len() + 1];
        for k in (0..chain.len()).rev() {
            faded_above[k] = faded_above[k + 1] || self.opacity(chain[k]) < 1.0;
        }
        let stop = (0..chain.len()).find(|&k| !faded_above[k] && bg(chain[k]).is_some_and(|c| c[3] >= 1.0));
        chain.truncate(stop.map_or(chain.len(), |k| k + 1));
        chain
    }
    /// What keeps the colours of these layers from being worked out from their styles: a blend mode or a filter
    /// (`Unknown::Mixed`, which changes the text too), else the nearest image or gradient (`Unknown::Picture`, which
    /// only the pixels show).
    fn unknown_layer(&self, chain: &[usize]) -> Option<Unknown> {
        let mut picture = None;
        for &x in chain {
            if self.s(x, "mixBlendMode") != "normal" {
                return Some(Unknown::Mixed);
            }
            let image = self.s(x, "backgroundImage");
            if image != "none" && picture.is_none() {
                picture = Some(Unknown::Picture(if image.contains("url(") { "image" } else { "gradient" }, x));
            }
        }
        // a filter above the layers still changes them
        let mut e = chain.first().copied();
        while let Some(x) = e {
            if self.tints(x).is_none() {
                return Some(Unknown::Mixed);
            }
            e = self.parent(x);
        }
        picture
    }
    /// The page's own colour: what is on top of its first line, unless that is a fixed or sticky bar over it.
    fn page_background(&self) -> Option<Colour> {
        let top = self.top.filter(|&t| !self.pinned[t]).unwrap_or(BODY);
        self.background(top).or_else(|| self.background(BODY))
    }
    /// The solid colour behind an element's text.
    fn background(&self, i: usize) -> Option<Colour> {
        self.painted(i, None).map(|p| p.0)
    }
    /// Inside an element (below <body>) that clips or scrolls sideways, so it does not widen the page.
    fn clipped_sideways(&self, i: usize) -> bool {
        let mut e = self.parent(i);
        while let Some(x) = e.filter(|&x| x > BODY) {
            if self.s(x, "overflow").split_whitespace().next().is_some_and(|o| o != "visible") {
                return true;
            }
            e = self.parent(x);
        }
        false
    }
    fn scroller_of(&self, i: usize) -> Option<usize> {
        let mut e = self.parent(i);
        while let Some(x) = e {
            if x == BODY {
                break;
            }
            let (sh, ch) = (self.els[x].v.get("sh").and_then(Value::as_f64), self.els[x].v.get("ch").and_then(Value::as_f64));
            if self.re.scrolls.test(self.s(x, "overflowY")) && matches!((sh, ch), (Some(sh), Some(ch)) if sh > ch + 1.0) {
                return Some(x);
            }
            e = self.parent(x);
        }
        self.scrolling
    }
    /// The bar over a text at a hit: the first element from the hit up that is at least 60% of the viewport wide
    /// and fixed, sticky, or absolute against a box outside the scroller the text moves in.
    fn bar_over(&self, hit: usize, t: &Text, chain: &HashMap<usize, Link>) -> Option<usize> {
        let own = self.scroller_of(t.e);
        let mut e = Some(hit);
        while let Some(x) = e {
            if x == BODY {
                break;
            }
            e = self.parent(x);
            let Some(l) = chain.get(&x) else { continue };
            if l.width < self.vw * 0.6 {
                continue;
            }
            if self.re.pinned.test(l.position) {
                return Some(x);
            }
            if l.position == "absolute" && !(own != self.scrolling && own.is_some() && l.op.map_or(false, |op| self.contains(own.unwrap(), op))) {
                return Some(x);
            }
        }
        None
    }
    /// How many of the 15 points over a text a bar covers, of those in the viewport, and the bar.
    fn coverage(&self, t: &Text, r: Rect, hits: Option<&Vec<Option<usize>>>, chain: &HashMap<usize, Link>) -> Option<(usize, usize, Option<usize>)> {
        let hits = hits?;
        if r.w < 2.0 || r.h < 2.0 || r.bottom() <= 0.0 || r.y >= self.vh || r.right() <= 0.0 || r.x >= self.vw {
            return None;
        }
        let (mut covered, mut seen, mut bar) = (0, 0, None);
        let mut k = 0;
        for fy in [0.15, 0.5, 0.85] {
            for fx in [0.1, 0.3, 0.5, 0.7, 0.9] {
                let (x, y) = (r.x + r.w * fx, r.y + r.h * fy);
                let hit = hits.get(k).copied().flatten();
                k += 1;
                if x < 0.0 || y < 0.0 || x >= self.vw || y >= self.vh {
                    continue;
                }
                seen += 1;
                let b = hit.filter(|h| !self.contains(t.e, *h) && !self.contains(*h, t.e)).and_then(|h| self.bar_over(h, t, chain));
                if let Some(b) = b.filter(|b| !self.contains(*b, t.e)) {
                    covered += 1;
                    bar = Some(b);
                }
            }
        }
        if seen == 0 { None } else { Some((covered, seen, bar)) }
    }
    fn hsl(&self, c: Colour) -> [f64; 3] {
        let (r, g, b) = (c[0] / 255.0, c[1] / 255.0, c[2] / 255.0);
        let (mx, mn) = (max_js(max_js(r, g), b), min_js(min_js(r, g), b));
        let (l, d) = ((mx + mn) / 2.0, mx - mn);
        if d == 0.0 || d.is_nan() {
            return [0.0, 0.0, l];
        }
        let sat = d / (1.0 - (2.0 * l - 1.0).abs());
        let h = if mx == r { ((g - b) / d) % 6.0 } else if mx == g { (b - r) / d + 2.0 } else { (r - g) / d + 4.0 };
        [(h * 60.0 + 360.0) % 360.0, sat, l]
    }
    fn vivid(&self, c: Colour) -> bool {
        let [_, sat, l] = self.hsl(c);
        c[3] > 0.15 && sat >= 0.45 && l >= 0.25 && l <= 0.8
    }
    /// A coloured shadow that spreads around the box or the text instead of falling below it.
    fn halo(&self, shadow: &str) -> bool {
        if shadow.is_empty() || shadow == "none" {
            return false;
        }
        split_shadows(shadow).iter().any(|part| {
            let Some(c) = self.colours(part).first().copied() else { return false };
            let rest = self.re.rgba_all_first_removed(part);
            let n: Vec<f64> = self.re.px.matches(&rest).iter().map(|m| m.trim_end_matches("px").parse::<f64>().unwrap_or(f64::NAN)).collect();
            let at = |k: usize| n.get(k).copied().unwrap_or(0.0);
            let (x, y, blur) = (at(0), at(1), at(2));
            self.vivid(c) && blur >= 12.0 && x.abs() <= blur / 3.0 && y.abs() <= blur / 3.0
        })
    }
}

impl Res {
    /// `part.replace(/rgba?\([^)]+\)/, "")`.
    fn rgba_all_first_removed(&self, part: &str) -> String {
        match self.rgba_all.exec(part) {
            Some(h) => format!("{}{}", &part[..h.start], &part[h.end..]),
            None => part.to_string(),
        }
    }
}

/// `shadow.split(/,(?![^(]*\))/)`: at commas outside parentheses.
/// The words of `text` (longer than two letters) that the bar shows too, as whole words in any case.
fn repeated_words(text: &str, bar: &str) -> Vec<String> {
    static WORDS: std::sync::OnceLock<JsRe> = std::sync::OnceLock::new();
    let words = WORDS.get_or_init(|| crate::jsre::js(r"[\p{L}\p{N}][\p{L}\p{N}.,:]*", "gu"));
    let in_bar: Vec<String> = words.matches(bar).into_iter().map(|w| w.to_lowercase()).collect();
    words.matches(text).into_iter().filter(|w| len16(w) > 2 && in_bar.contains(&w.to_lowercase())).collect()
}

fn split_shadows(s: &str) -> Vec<String> {
    let mut out = Vec::new();
    let mut last = 0;
    for (i, ch) in s.char_indices() {
        if ch != ',' {
            continue;
        }
        let inside = s[i + 1..].chars().find(|c| *c == '(' || *c == ')') == Some(')');
        if !inside {
            out.push(s[last..i].to_string());
            last = i + 1;
        }
    }
    out.push(s[last..].to_string());
    out
}

fn blend(top: Colour, bottom: Colour) -> Colour {
    let c = over(Rgb { r: top[0], g: top[1], b: top[2] }, top[3], Rgb { r: bottom[0], g: bottom[1], b: bottom[2] });
    [c.r, c.g, c.b, 1.0]
}
/// Cream, ivory, or warm off-white: light, warm (hue 25–70°), and only a little coloured (an RGB spread of 3% to 15%).
/// Pure white and a light yellow are not cream.
pub(crate) fn cream(c: Colour) -> bool {
    let (r, g, b) = (c[0] / 255.0, c[1] / 255.0, c[2] / 255.0);
    let (mx, mn) = (r.max(g).max(b), r.min(g).min(b));
    let d = mx - mn;
    if (mx + mn) / 2.0 < 0.88 || !(0.03..=0.15).contains(&d) {
        return false;
    }
    let h = if mx == r { ((g - b) / d).rem_euclid(6.0) } else if mx == g { (b - r) / d + 2.0 } else { (r - g) / d + 4.0 } * 60.0;
    (25.0..=70.0).contains(&h)
}

fn lum(c: Colour) -> f64 {
    luminance(Rgb { r: c[0] / 255.0, g: c[1] / 255.0, b: c[2] / 255.0 }, 0.04045)
}
fn hex(c: Colour) -> String {
    let part = |v: f64| {
        let r = round(v);
        if r.is_nan() { "NaN".to_string() } else { format!("{:02x}", r as i64) }
    };
    format!("#{}{}{}", part(c[0]), part(c[1]), part(c[2]))
}

/// Judge one extract. Returns `{ findings, ignored }`, or `{ ask }` when the page must act first and the input has
/// no `answers` yet.
pub fn probe(input: &Value) -> Value {
    let page = match Page::read(input) {
        Ok(p) => p,
        Err(e) => return json!({ "error": e }),
    };
    page.judge(input.get("answers"))
}

struct Group {
    t: usize,
    count: usize,
    ratio: f64,
    fg: Colour,
    bg: Colour,
    need: f64,
    over: Option<(&'static str, usize)>,
}

impl<'a> Page<'a> {
    fn judge(&self, answers: Option<&Value>) -> Value {
        let mut out: Vec<Value> = Vec::new();
        let vw = self.vw;
        let n = self.els.len();

        // Horizontal scroll (RX-RD-01): name the outermost elements that reach past the viewport.
        let sw = self.scroll_width;
        if sw > vw + 1.0 {
            let culprits: Vec<usize> = (2..n)
                .filter(|&i| {
                    let r = self.els[i].r;
                    let p = self.parent(i).map(|p| self.els[p].r);
                    r.right() > vw + 1.0 && r.w > 0.0 && p.map_or(true, |p| p.right() <= vw + 1.0) && self.shown[i] && !self.clipped_sideways(i)
                })
                .collect();
            let names: Vec<String> = culprits.iter().take(3).map(|&i| format!("{} (to {}px)", self.selector(i), num_str(round(self.els[i].r.right())))).collect();
            out.push(finding(
                "RX-RD-01",
                "fail",
                culprits.first().map_or("html".to_string(), |&i| self.selector(i)),
                format!("the page scrolls sideways: {}px of content in {}px{}", num_str(sw), num_str(vw), if names.is_empty() { String::new() } else { format!("; widest: {}", names.join(", ")) }),
            ));
        }

        // A choice out of view of its action (RX-UX-15): on a wide screen, the page's only radio group starts below the
        // first screen while a button that carries an amount is on it. A page with several choices is a form the
        // person scrolls through; one choice and a pay button is a checkout whose choice belongs beside the button.
        // The group's heading (its legend, or a card title just above it) on the first screen keeps it in view (owner,
        // A2 2026-11-21).
        if vw >= 1024.0 {
            let mut groups: Vec<(&str, f64, usize, usize)> = Vec::new();
            for i in 2..n {
                let key = self.text_of(i, "rg");
                let seen = self.shown[i] || self.parent(i).map_or(false, |p| self.shown[p]);
                if key.is_empty() || !self.outside[i] || !seen {
                    continue;
                }
                let top = self.els[i].r.y;
                match groups.iter_mut().find(|g| g.0 == key) {
                    Some(g) => {
                        g.1 = g.1.min(top);
                        g.2 += 1;
                    }
                    None => groups.push((key, top, 1, i)),
                }
            }
            if let [(_, top, count, first)] = groups[..] {
                let action = (2..n).find(|&i| {
                    let el = &self.els[i];
                    (matches!(el.tag, "BUTTON" | "A")
                        || (el.tag == "INPUT" && matches!(el.v.get("ty").and_then(Value::as_str), Some("submit" | "button")))
                        || el.v.get("role").and_then(Value::as_str) == Some("button"))
                        && self.shown[i]
                        && self.outside[i]
                        && el.r.w > 0.0
                        && el.r.y >= 0.0
                        && el.r.bottom() <= self.vh
                        && self.re.amount.is_match(self.text_of(i, "nm"))
                });
                let heading_seen = self.els[first].v.get("gh").and_then(Value::as_f64).map_or(false, |b| b <= self.vh);
                if let (true, false, Some(a)) = (top >= self.vh, heading_seen, action) {
                    let label = match self.text_of(first, "gl") {
                        "" => format!("the choice that starts with {}", quote(self.text_of(first, "ol"))),
                        gl => quote(gl),
                    };
                    out.push(finding(
                        "RX-UX-15",
                        "warn",
                        self.selector(first),
                        format!(
                            "{} ({} options) starts {}px below the first screen at {}px, while {} is on it: keep the choice in the same view as the action, or have the action name what is missing",
                            label,
                            count,
                            num_str(round(top - self.vh)),
                            num_str(vw),
                            quote(self.text_of(a, "nm"))
                        ),
                    ));
                }
            }
        }

        // Non-text contrast (RX-A11Y-01, WCAG 1.4.11): the edge of a field and the icon of an icon-only control.
        out.extend(self.edge_findings());

        // Text: every visible element with its own text, outside the ignored regions.
        let texts: Vec<&Text> = self.texts.iter().filter(|t| self.outside[t.e] && self.shown[t.e]).collect();

        // Contrast (RX-A11Y-01) and size (RX-A11Y-02), grouped so one style used 40 times is one finding.
        let mut small: Vec<(f64, usize, usize)> = Vec::new();
        let mut failing: Vec<Fail> = Vec::new();
        // texts over an image or a gradient, judged on the pixels the page sends back, and texts not measured
        let mut behind: Vec<(usize, Colour, f64, (&'static str, usize))> = Vec::new();
        let mut unmeasured: Vec<usize> = Vec::new();
        for (k, t) in texts.iter().enumerate() {
            let size = self.n(t.e, "fontSize");
            if size < 12.0 {
                match small.iter_mut().find(|g| g.0 == size) {
                    Some(g) => g.2 += 1,
                    None => small.push((size, k, 1)),
                }
            }
            if self.disabled[t.e] || self.or_color(t.e, "textFill") == "rgba(0, 0, 0, 0)" {
                continue;
            }
            let Some(fg_raw) = self.rgba(self.color(t.e)) else { continue };
            let large = size >= 24.0 || (size >= 18.66 && self.n(t.e, "fontWeight") >= 700.0);
            let need = if large { 3.0 } else { 4.5 };
            let Some((bg, fg)) = self.painted(t.e, Some(fg_raw)) else {
                match self.unknown_layer(&self.layers(t.e)) {
                    Some(Unknown::Picture(kind, el)) if behind.len() < MAX_BEHIND => behind.push((k, fg_raw, need, (kind, el))),
                    _ => unmeasured.push(k),
                }
                continue;
            };
            let ratio = contrast(lum(fg), lum(bg));
            if ratio >= need {
                continue;
            }
            failing.push(Fail { k, ratio, fg, bg, need, over: None });
        }
        let textareas: Vec<usize> = (2..n).filter(|&i| self.els[i].tag == "TEXTAREA" && self.outside[i] && self.shown[i] && !self.disabled[i] && !self.flag(i, "ro")).collect();
        let focus = self.focus_list();
        let Some(answers) = answers else {
            if !failing.is_empty() || !textareas.is_empty() || !behind.is_empty() || !focus.is_empty() {
                return json!({ "ask": {
                    "under": failing.iter().map(|f| texts[f.k].i).collect::<Vec<_>>(),
                    "grow": textareas,
                    "behind": behind.iter().map(|b| texts[b.0].i).collect::<Vec<_>>(),
                    "focus": focus,
                } });
            }
            return self.rest(out, texts, Vec::new(), &Value::Null, small, unmeasured);
        };
        let under = &answers["under"];
        let covered = |t: &Text| -> bool {
            match under.get(t.i.to_string()).and_then(|v| idx(Some(v))).filter(|b| *b < self.els.len()) {
                Some(b) => !self.contains(b, t.e),
                None => false,
            }
        };
        let mut failing: Vec<Fail> = failing.into_iter().filter(|f| !covered(texts[f.k])).collect();
        // Over a picture: the page hid the text and sent the colours under it on a grid. The text, faded by its own
        // opacity and its ancestors', is laid over each; the text fails when the weakest tenth of the grid is under
        // the need (one stray pixel of a photo does not decide it, a light band across a tenth of the text does).
        for (k, fg_raw, need, over) in behind {
            let t = texts[k];
            // rrggbb per point; a string that is not whole hex is not measured
            let px = answers["behind"][t.i.to_string()]["px"].as_str().unwrap_or("");
            let pixels: Vec<Colour> = if px.len() % 6 == 0 && px.bytes().all(|b| b.is_ascii_hexdigit()) {
                px.as_bytes()
                    .chunks(6)
                    .map(|c| {
                        let at = |k: usize| u8::from_str_radix(std::str::from_utf8(&c[k..k + 2]).unwrap_or("00"), 16).unwrap_or(0) as f64;
                        [at(0), at(2), at(4), 1.0]
                    })
                    .collect()
            } else {
                Vec::new()
            };
            if pixels.is_empty() {
                unmeasured.push(k);
                continue;
            }
            let mut fade = fg_raw[3];
            let mut e = Some(t.e);
            while let Some(x) = e {
                fade *= self.opacity(x);
                e = self.parent(x);
            }
            // the screenshot is already filtered; the text gets the same colour filters
            let ink = self.tinted(fg_raw, t.e, 0);
            let mut seen: Vec<(f64, Colour, Colour)> = pixels
                .iter()
                .map(|&p| {
                    let shown = blend([ink[0], ink[1], ink[2], fade], p);
                    (contrast(lum(shown), lum(p)), shown, p)
                })
                .collect();
            seen.sort_by(|a, b| a.0.total_cmp(&b.0));
            let (ratio, fg, bg) = seen[seen.len() / 10];
            if ratio < need {
                failing.push(Fail { k, ratio, fg, bg, need, over: Some(over) });
            }
        }
        unmeasured.sort_unstable();
        if let Some(shown) = answers.get("focus").filter(|v| v.is_object()) {
            out.extend(self.focus_findings(&focus, shown));
        }
        self.rest(out, texts, failing, &answers["grow"], small, unmeasured)
    }
}

impl<'a> Page<'a> {
    fn rest(&self, mut out: Vec<Value>, texts: Vec<&Text>, failing: Vec<Fail>, grow: &Value, small: Vec<(f64, usize, usize)>, unmeasured: Vec<usize>) -> Value {
        let (vw, vh) = (self.vw, self.vh);
        let n = self.els.len();
        let mut groups: Vec<(String, Group)> = Vec::new();
        for Fail { k, ratio, fg, bg, need, over } in failing {
            // over a picture, the texts of one colour on one picture are one finding (their weakest points differ)
            let key = match over {
                None => format!("{}|{}|{}", hex(fg), hex(bg), num_str(need)),
                Some((_, el)) => format!("{}|{}|picture {el}", hex(fg), num_str(need)),
            };
            match groups.iter_mut().find(|g| g.0 == key) {
                Some(g) => g.1.count += 1,
                None => groups.push((key, Group { t: k, count: 1, ratio, fg, bg, need, over })),
            }
        }
        for (_, g) in &groups {
            let t = texts[g.t];
            let more = match (g.count, g.over) {
                (1, _) => String::new(),
                (c, None) => format!("; {} more with the same colors", c - 1),
                (c, Some((kind, _))) => format!("; {} more in the same color over the same {kind}", c - 1),
            };
            let colours = match g.over {
                None => format!("{} on {}", hex(g.fg), hex(g.bg)),
                Some((kind, _)) => format!("{} on {}, the weakest tenth of the {kind} behind it", hex(g.fg), hex(g.bg)),
            };
            // WCAG 1.4.3 exempts logotypes, and a row of logos set as text is usually greyed with a filter; the
            // scan cannot tell a logo from a label, so it says how to leave one out instead of guessing
            let logo = if self.colour_filtered(t.e) { "; if this is a logotype (WCAG 1.4.3 exempts them), mark its row data-ryux-ignore" } else { "" };
            out.push(finding("RX-A11Y-01", "fail", self.selector(t.e), format!("{}: contrast {}:1 ({colours}), needs {}:1{more}{logo}", quote(t.x), crate::audit::ratio_text(g.ratio, g.need), num_str(g.need))));
        }
        // Texts whose contrast was not measured: under a blend mode or a filter, over a picture the page could not
        // photograph in view, or past the texts over pictures it is asked for. Said once, so a skipped text is never
        // read as a passing one.
        if let Some(&first) = unmeasured.first() {
            let t = texts[first];
            let count = if unmeasured.len() > 1 { format!("{} texts", unmeasured.len()) } else { "1 text".to_string() };
            let mut f = finding(
                "RX-A11Y-01",
                "warn",
                self.selector(t.e),
                format!("{count} not measured for contrast (under a blend mode or a filter other than a colour one (blur, url), over a picture the page could not photograph (out of view, or redrawn by the page), or past the {MAX_BEHIND} measured), first {}: check them by eye over the busiest part of what is behind", quote(t.x)),
            );
            f["once"] = Value::from("contrast-unmeasured");
            out.push(f);
        }
        for (size, k, count) in &small {
            let t = texts[*k];
            let many = if *count > 1 { format!(" ({count} elements)") } else { String::new() };
            out.push(finding("RX-A11Y-02", "warn", self.selector(t.e), format!("{}: {}px text{many}; body text is 14 to 16px on mobile, below 12px is hard to read", quote(t.x), num_str(*size))));
        }

        // Target size (RX-A11Y-02): under 24px fails unless spaced as WCAG 2.5.8 allows; inline links in a sentence
        // are exempt.
        let controls: Vec<usize> = (2..n).filter(|&i| self.flag(i, "ctl") && self.outside[i] && self.shown[i] && !self.disabled[i]).collect();
        let in_sentence = |i: usize| self.els[i].tag == "A" && self.s(i, "display") == "inline" && self.flag(i, "sib");
        let center = |r: Rect| (r.x + r.w / 2.0, r.y + r.h / 2.0);
        let undersized: Vec<bool> = controls.iter().map(|&i| (self.els[i].r.w < 24.0 || self.els[i].r.h < 24.0) && !in_sentence(i)).collect();
        for (a, &i) in controls.iter().enumerate() {
            if !undersized[a] {
                continue;
            }
            let ri = self.els[i].r;
            let (cx, cy) = center(ri);
            let crowded = controls.iter().enumerate().any(|(b, &j)| {
                if b == a || self.contains(i, j) || self.contains(j, i) {
                    return false;
                }
                let r = self.els[j].r;
                if undersized[b] {
                    let (x, y) = center(r);
                    return hypot(cx - x, cy - y) < 24.0;
                }
                let dx = max_js(max_js(r.x - cx, 0.0), cx - r.right());
                let dy = max_js(max_js(r.y - cy, 0.0), cy - r.bottom());
                hypot(dx, dy) < 12.0
            });
            let size = format!("{}x{}px", num_str(round(ri.w)), num_str(round(ri.h)));
            let name = quote(self.text_of(i, "nm"));
            out.push(if crowded {
                finding("RX-A11Y-02", "fail", self.selector(i), format!("{name}: target {size}, under 24x24 and crowded by its neighbours; 44x44 is the preferred hit area"))
            } else {
                finding("RX-A11Y-02", "warn", self.selector(i), format!("{name}: target {size}, under 24x24 (spaced enough to pass WCAG 2.5.8); 44x44 is the preferred hit area"))
            });
        }

        // Colliding text (RX-QA-03): the text boxes of two unrelated elements overlap. Content that scrolls under a
        // fixed or sticky bar is not a collision.
        let boxes: Vec<&Text> = texts.iter().take(1500).copied().collect();
        let mut seen: HashSet<usize> = HashSet::new();
        for i in 0..boxes.len() {
            for j in i + 1..boxes.len() {
                let (a, b) = (boxes[i], boxes[j]);
                if self.contains(a.e, b.e) || self.contains(b.e, a.e) || self.pinned[a.e] != self.pinned[b.e] {
                    continue;
                }
                let w = min_js(a.r.right(), b.r.right()) - max_js(a.r.x, b.r.x);
                let h = min_js(a.r.bottom(), b.r.bottom()) - max_js(a.r.y, b.r.y);
                if w <= 2.0 || h <= 2.0 {
                    continue;
                }
                let smaller = min_js(a.r.w * a.r.h, b.r.w * b.r.h);
                if w * h < 0.3 * smaller || seen.contains(&a.e) || seen.contains(&b.e) {
                    continue;
                }
                seen.insert(a.e);
                seen.insert(b.e);
                out.push(finding("RX-QA-03", "warn", self.selector(a.e), format!("{} overlaps {} ({})", quote(a.x), quote(b.x), self.selector(b.e))));
            }
        }

        // Text under a fixed or sticky bar (RX-QA-03). Content scrolling under a bar is normal; two cases are not:
        // text cut by a bar on the screen as loaded that repeats what the bar itself shows (one figure twice, one of
        // them sliced), and text a bottom bar still covers when every scroller is at its end (never readable).
        let free: Vec<&Text> = texts.iter().filter(|t| !t.x.is_empty() && self.outside[t.e] && !self.pinned[t.e] && self.shown[t.e]).take(1500).copied().collect();
        for t in &free {
            let Some((covered, seen_pts, Some(bar))) = self.coverage(t, t.r, t.open.as_ref(), &self.open) else { continue };
            if covered == 0 || covered == seen_pts {
                continue;
            }
            let bar_text = self.open.get(&bar).and_then(|l| l.text).unwrap_or("");
            let repeated = repeated_words(t.x, bar_text);
            let joined = repeated.join(" ");
            if !repeated.is_empty() && len16(&joined) >= 6.min(len16(t.x)) {
                out.push(finding(
                    "RX-QA-03",
                    "fail",
                    self.selector(t.e),
                    format!("{} is cut by the {} bar on the first screen, which shows {} again: the same content twice, one copy sliced", quote(t.x), self.selector(bar), quote(&joined)),
                ));
            }
        }
        for t in &free {
            let Some((r, h)) = t.end.as_ref() else { continue };
            let Some((covered, _, Some(bar))) = self.coverage(t, *r, Some(h), &self.end) else { continue };
            if covered == 0 || self.end.get(&bar).map_or(f64::NAN, |l| l.top) < vh / 2.0 {
                continue;
            }
            out.push(finding(
                "RX-QA-03",
                "fail",
                self.selector(t.e),
                format!("{} stays under the {} bar with the page scrolled to its end: it can never be read; add bottom space the height of the bar", quote(t.x), self.selector(bar)),
            ));
        }

        // Visual tells (knowledge/anti-slop.md, "Visual tells"): signals that a reason is missing, never banned styles,
        // so every one is a warn that names the purpose gate to run. Reported once per page (the CLI keeps the first width).
        let visible: Vec<usize> = (2..n).filter(|&i| self.outside[i] && !self.in_svg[i] && self.shown[i]).collect();
        let tell = |out: &mut Vec<Value>, rule: &str, key: &str, el: Option<usize>, message: String| {
            let mut f = finding(rule, "warn", el.map_or("page".to_string(), |e| self.selector(e)), message);
            f["once"] = Value::from(key);
            out.push(f);
        };
        let few = |els: &[usize]| {
            let names: Vec<String> = els.iter().take(3).map(|&e| self.selector(e)).collect();
            format!("{}{}", names.join(", "), if els.len() > 3 { format!(", and {} more", els.len() - 3) } else { String::new() })
        };

        // Glow: a coloured shadow that spreads around the box or the text instead of falling below it.
        let glowing: Vec<usize> = visible
            .iter()
            .copied()
            .filter(|&i| {
                let filter = self.s(i, "filter");
                self.halo(self.s(i, "boxShadow")) || self.halo(self.s(i, "textShadow")) || (filter.contains("drop-shadow(") && self.halo(&self.re.drop.replace_all(filter, "$1")))
            })
            .collect();
        if glowing.len() >= 3 {
            tell(&mut out, "RX-AS-05", "glow", Some(glowing[0]), format!("{} elements glow (a coloured shadow around them, not below): {}; a glow marks the one element that needs attention, so keep it on one or none", glowing.len(), few(&glowing)));
        }

        // Glass: background blur on several layers.
        let glass: Vec<usize> = visible.iter().copied().filter(|&i| self.s(i, "backdropFilter").contains("blur(")).collect();
        if glass.len() >= 3 {
            tell(&mut out, "RX-AS-05", "glass", Some(glass[0]), format!("{} layers blur what is behind them: {}; glass earns its place on the one surface that must show what is under it, and its text keeps contrast", glass.len(), few(&glass)));
        }

        // A blue-to-purple gradient across a large area.
        let wash = visible.iter().copied().find(|&i| {
            let bg = self.s(i, "backgroundImage");
            let r = self.els[i].r;
            if !bg.contains("gradient(") || !(r.w >= vw * 0.5 && r.h >= 200.0) {
                return false;
            }
            let hues: Vec<f64> = self.colours(bg).into_iter().filter(|c| self.hsl(*c)[1] >= 0.3 && c[3] > 0.2).map(|c| self.hsl(c)[0]).collect();
            hues.iter().any(|h| *h >= 195.0 && *h < 250.0) && hues.iter().any(|h| *h >= 250.0 && *h <= 320.0)
        });
        if let Some(w) = wash {
            tell(&mut out, "RX-UI-10", "wash", Some(w), "a blue-to-purple gradient behind a large area: it carries no meaning on its own; take colour from the brand's roles, or keep it only when the direction chose it".into());
        }

        // A dark page whose one accent is a saturated neon, glowing: the default look of an AI product.
        let page_bg = self.page_background();
        if page_bg.map_or(false, |bg| lum(bg) < 0.03) {
            let neon = visible
                .iter()
                .copied()
                .filter(|&i| {
                    let tag = self.els[i].tag.to_ascii_lowercase();
                    (tag == "button" || tag == "a" || self.text_of(i, "role") == "button") && self.els[i].r.h >= 28.0
                })
                .filter_map(|i| self.rgba(self.s(i, "backgroundColor")))
                .find(|c| {
                    let [_, sat, l] = self.hsl(*c);
                    c[3] > 0.8 && sat >= 0.75 && l >= 0.45 && l <= 0.75
                });
            if let Some(c) = neon.filter(|_| !glowing.is_empty()) {
                tell(
                    &mut out,
                    "RX-UI-26",
                    "neon",
                    None,
                    format!("a near-black page with a neon accent (rgb {}, {}, {}) and glow: the look an AI product gets by default; keep it only when the direction chose it over two others", num_str(c[0]), num_str(c[1]), num_str(c[2])),
                );
            }
        }

        // A cream page: the paper default of generated pages. Five of five H2 diversity runs (2026-11-25) put the page
        // on cream, two of them against a draw that said a saturated colour field; the owner noted it on every page.
        // the body too: a coloured hero on top of a cream page still leaves the rest of the page on cream (H2-U1, U2)
        if let Some(bg) = page_bg.filter(|c| cream(*c)).or_else(|| self.background(BODY).filter(|c| cream(*c))) {
            tell(
                &mut out,
                "RX-UI-26",
                "cream",
                None,
                format!("the page is cream ({}): the paper look generated pages fall back to; use the surface the direction drew, and keep cream only when the direction chose paper for a reason", hex(bg)),
            );
        }

        // A pill above the main heading that does not carry status.
        let heading = |i: usize| matches!(self.els[i].tag, "H1" | "H2");
        for &h in visible.iter().filter(|&&i| heading(i)).take(4) {
            let mut prev = self.prev_sibling(h);
            while let Some(p) = prev.filter(|p| !self.shown[*p]) {
                prev = self.prev_sibling(p);
            }
            let Some(p) = prev else { continue };
            let r = self.els[p].r;
            let text = self.text_of(p, "pt");
            let pill = self.n(p, "borderTopLeftRadius") >= r.h / 2.0 - 1.0 && r.h <= 40.0 && (self.s(p, "backgroundColor") != "rgba(0, 0, 0, 0)" || self.n(p, "borderTopWidth") > 0.0);
            let button = self.els[p].tag.eq_ignore_ascii_case("button") || self.text_of(p, "role") == "button";
            if pill && !button && self.re.letters.test(text) && text.split(' ').count() <= 6 && !self.re.status.test(text) {
                tell(&mut out, "RX-AS-05", "pill", Some(p), format!("a pill above the heading ({}) with no status in it: say something the heading does not (a version, a date, beta), or cut it", quote(text)));
            }
        }

        // Monospace set for mood: prose in a monospace face outside code.
        let mono: Vec<&Text> = texts.iter().copied().filter(|t| self.outside[t.e] && self.re.mono.test(self.s(t.e, "fontFamily")) && !self.in_code[t.e] && t.x.split(' ').count() >= 3 && self.re.az3.test(t.x)).collect();
        if mono.len() >= 3 {
            tell(&mut out, "RX-UI-10", "mono", Some(mono[0].e), format!("{} pieces of prose are set in monospace ({}): keep monospace for code, IDs, and aligned figures", mono.len(), quote(mono[0].x)));
        }

        // An italic serif word inside a sans display heading.
        for &h in visible.iter().filter(|&&i| heading(i) && self.n(i, "fontSize") >= 32.0).take(4) {
            let accent = (h + 1..n).take_while(|&d| self.contains(h, d)).find(|&d| {
                let family = self.s(d, "fontFamily");
                self.s(d, "fontStyle") == "italic" && self.re.serif.test(family) && !self.re.sans.test(family)
            });
            if let Some(a) = accent {
                tell(&mut out, "RX-UI-10", "serif", Some(a), format!("an italic serif word inside the heading ({}): a common generated accent; choose type for the product's voice, and keep it only when the direction names it", quote(self.text_of(a, "it"))));
                break;
            }
        }

        // The counts before handoff (RX-AS-10) that the render can make: emoji in the chrome, and gradients that do not
        // come from the page's colour tokens. Each is a count over a limit of 0, so a warn that names what was
        // counted; the reason, when there is one, is the brief's or DESIGN.md's.
        let chrome = |i: usize| {
            let mut e = Some(i);
            while let Some(x) = e {
                let role = self.text_of(x, "role");
                if self.flag(x, "ctl") || matches!(self.els[x].tag, "NAV" | "LABEL" | "LEGEND" | "TH" | "SUMMARY") || matches!(role, "navigation" | "tablist" | "tab" | "menu" | "menubar" | "menuitem" | "toolbar") {
                    return true;
                }
                e = self.parent(x);
            }
            false
        };
        let emoji: Vec<&Text> = texts.iter().copied().filter(|t| self.outside[t.e] && self.shown[t.e] && !self.in_svg[t.e] && self.re.emoji.is_match(t.x) && chrome(t.e)).collect();
        if let Some(first) = emoji.first() {
            let shown: Vec<String> = emoji.iter().take(3).map(|t| quote(t.x)).collect();
            let more = if emoji.len() > 3 { format!(", and {} more", emoji.len() - 3) } else { String::new() };
            let count = if emoji.len() == 1 { "1 control or navigation label carries".to_string() } else { format!("{} control or navigation labels carry", emoji.len()) };
            // a control that is only an emoji, with no aria-label: a screen reader reads the emoji's name
            let bare = emoji.iter().any(|t| self.re.emoji.replace_all(t.x, "").trim_matches(|c: char| c.is_whitespace() || c == '\u{FE0F}' || c == '\u{200D}').is_empty() && std::iter::once(t.e).chain(self.ancestors(t.e)).any(|x| self.flag(x, "ctl") && self.text_of(x, "nm") == t.x));
            let read = if bare { "; a control that is only an emoji is read by the emoji's name (\"telephone receiver\") and cannot take a token colour: use an icon with an aria-label" } else { "" };
            tell(&mut out, "RX-AS-10", "emoji", Some(first.e), format!("{count} an emoji ({}{more}): the count for emoji in the interface chrome is 0; use the icon set, or the word alone{read}", shown.join(", ")));
        }

        // a colour, not a grey, a near-white tint, or a near-black: its channels spread by 40 or more of 255 (a
        // skeleton shimmer in #e9e2d4 spreads 21, a pastel avatar in #c9d6ff 54)
        let saturated = |c: &Colour| c[3] > 0.2 && c[0].max(c[1]).max(c[2]) - c[0].min(c[1]).min(c[2]) >= 40.0;
        let token = |c: &Colour| self.tokens.iter().any(|t| (0..3).all(|k| (t[k] - c[k]).abs() <= 6.0));
        // A gradient that draws a thing is not a colour choice of the interface: one inside an element whose class
        // names a drawing; the wallpaper of a device the page pictures (it fills 80% of the device, and the device
        // holds less than half the page's text: one that holds more is the frame of the product itself, and a
        // control inside a pictured device is still the product's); or a small shape holding no text (a pictured
        // card's thumbnail). Owner review 2026-11-23, sheet 7: G2 (a KTP card), G3, G6 were false.
        let pictured = |i: usize| {
            let r = self.els[i].r;
            let named = std::iter::once(i).chain(self.ancestors(i)).any(|x| {
                let c = self.text_of(x, "c");
                let d = self.els[x].r;
                self.re.drawing.is_match(c) || (self.re.device.is_match(c) && r.w * r.h >= 0.8 * d.w * d.h && texts.iter().filter(|t| self.contains(x, t.e)).count() * 2 < texts.len())
            });
            named || (r.w < 120.0 && r.h < 120.0 && !texts.iter().any(|t| self.contains(i, t.e)))
        };
        let mut drawn: Vec<(usize, &str, Vec<Colour>)> = Vec::new();
        for &i in &visible {
            let bg = self.s(i, "backgroundImage");
            let r = self.els[i].r;
            if !bg.contains("gradient(") || r.w < 16.0 || r.h < 16.0 || Some(i) == wash || self.token_gradients.contains(&bg) || drawn.iter().any(|d| d.1 == bg) || pictured(i) {
                continue;
            }
            // a scrim or a shimmer of greys is not a colour choice; a stop not among the tokens is
            let off: Vec<Colour> = self.colours(bg).into_iter().filter(|c| saturated(c) && !token(c)).collect();
            if !off.is_empty() {
                drawn.push((i, bg, off));
            }
        }
        if let Some(&(first, _, _)) = drawn.first() {
            let named: Vec<String> = drawn
                .iter()
                .take(3)
                .map(|(i, _, off)| {
                    let mut hexes: Vec<String> = off.iter().map(|c| hex(*c)).collect();
                    hexes.dedup();
                    format!("{} ({})", self.selector(*i), hexes.join(", "))
                })
                .collect();
            let more = if drawn.len() > 3 { format!(", and {} more", drawn.len() - 3) } else { String::new() };
            let count = if drawn.len() == 1 { "1 gradient".to_string() } else { format!("{} gradients", drawn.len()) };
            let source = if self.tokens.is_empty() { "and the page names no colour tokens (CSS custom properties) they could come from" } else { "with colours that are not among the page's colour tokens" };
            tell(&mut out, "RX-AS-10", "gradient", Some(first), format!("{count} {source}: {}{more}; the count for gradients without a brand reason is 0: draw it from the brand's tokens and name the reason, or use a flat colour", named.join(", ")));
        }

        // A stand-in box (RX-AS-03): a dashed or dotted box whose words name what belongs in it ("Logo Kelasku", "QR").
        let boxed = visible.iter().copied().find_map(|i| {
            let r = self.els[i].r;
            if !matches!(self.s(i, "borderTopStyle"), "dashed" | "dotted") || self.n(i, "borderTopWidth") < 1.0 || r.w < 24.0 || r.h < 16.0 {
                return None;
            }
            let words: Vec<&str> = texts.iter().filter(|t| self.contains(i, t.e)).map(|t| t.x).collect();
            let said = words.join(" ");
            // a logo slot with the brand's name in plain text beside it (its parent's own text) is what RX-AS-11
            // allows while the file does not exist (owner review 2026-11-23, sheet 8: S2 false, S1 real)
            let named = said.to_ascii_lowercase().trim_start_matches(['[', ' ']).starts_with("logo")
                && self.parent(i).is_some_and(|p| texts.iter().any(|t| t.e == p && self.re.letters.test(t.x)));
            (len16(&said) <= 30 && self.re.stand_in.is_match(&said) && !named).then_some((i, said))
        });
        if let Some((i, said)) = boxed {
            tell(&mut out, "RX-AS-03", "stand-in", Some(i), format!("a dashed box that says {}: a stand-in set in the interface reads as unfinished; use the real file or a labeled sample asset, and for the product's own mark with no file, its name in plain text in the brand's type, listed as missing (RX-AS-11)", quote(&said)));
        }

        // A row that looks like a picker and is not one (RX-UI-36): three to fourteen boxes side by side, one height,
        // each bordered or filled with short text, one filled apart from the rest as if chosen, and no control in or
        // around any of them. People tap it and nothing happens. The owner flagged the day rows on two of five H3 pages
        // (2026-11-25); across 45 diversity pages it fires on 12, each a non-interactive day, slot, or category row.
        let ctl_near = |k: usize| self.flag(k, "ctl") || self.ancestors(k).into_iter().any(|a| self.flag(a, "ctl")) || (k + 1..self.els.len()).take_while(|&x| self.contains(k, x)).any(|x| self.flag(x, "ctl"));
        let mut kids: HashMap<usize, Vec<usize>> = HashMap::new();
        for i in BODY + 1..self.els.len() {
            if let Some(p) = self.parent(i).filter(|_| self.shown[i] && self.els[i].r.w > 0.0 && self.els[i].r.h > 0.0) {
                kids.entry(p).or_default().push(i);
            }
        }
        let mut parents: Vec<_> = kids.iter().filter(|(_, k)| (3..=14).contains(&k.len())).collect();
        parents.sort_by_key(|(p, _)| **p);
        let picker = parents.into_iter().find_map(|(_, ks)| {
            let said: Vec<String> = ks.iter().map(|&k| self.texts.iter().filter(|t| self.contains(k, t.e)).map(|t| t.x.trim()).collect::<Vec<_>>().join(" ")).collect();
            let boxy = ks.iter().zip(&said).all(|(&k, t)| {
                let r = self.els[k].r;
                !t.is_empty() && len16(t) <= 24 && (24.0..=72.0).contains(&r.h) && r.w <= 160.0 && self.n(k, "borderTopLeftRadius") >= 4.0
                    && (self.n(k, "borderTopWidth") >= 1.0 || self.rgba(self.s(k, "backgroundColor")).is_some_and(|c| c[3] > 0.0))
            });
            if !boxy {
                return None;
            }
            let (t0, h0) = (self.els[ks[0]].r.y, self.els[ks[0]].r.h);
            if ks.iter().any(|&k| (self.els[k].r.y - t0).abs() >= 4.0 || (self.els[k].r.h - h0).abs() > 4.0) {
                return None;
            }
            let mut fills: Vec<(&str, usize)> = Vec::new();
            for &k in ks {
                let f = self.s(k, "backgroundColor");
                match fills.iter_mut().find(|x| x.0 == f) { Some(x) => x.1 += 1, None => fills.push((f, 1)) }
            }
            (fills.len() == 2 && fills.iter().filter(|x| x.1 == 1).count() == 1 && !ks.iter().any(|&k| ctl_near(k))).then(|| (ks[0], said.join(" | ")))
        });
        if let Some((i, row)) = picker {
            tell(&mut out, "RX-UI-36", "fake-picker", Some(i), format!("a row that looks like a picker with one option chosen ({}) and no control in it: people tap it and nothing happens; make it a real choice (buttons or radios), or show it as plain text or a table", quote(&row)));
        }

        // A store badge drawn by hand (RX-AS-11): a control that names App Store or Google Play with an inline SVG icon and
        // no image. The stores' own badge images are the only allowed badges (Apple and Google badge guidelines); the owner
        // flagged the drawn ones on two of five H3 pages (a phone icon, a triangle), 2026-11-25. A plain text link is fine.
        let store = (BODY + 1..self.els.len()).find(|&i| {
            self.shown[i] && self.flag(i, "ctl") && {
                let nm = self.text_of(i, "nm").to_lowercase();
                nm.contains("app store") || nm.contains("google play")
            } && (i + 1..self.els.len()).take_while(|&k| self.contains(i, k)).any(|k| self.els[k].tag.eq_ignore_ascii_case("svg"))
                && !(i + 1..self.els.len()).take_while(|&k| self.contains(i, k)).any(|k| self.els[k].tag == "IMG")
        });
        if let Some(i) = store {
            tell(&mut out, "RX-AS-11", "store-badge", Some(i), format!("a store badge drawn with an icon of its own ({}): Apple and Google allow only their own badge images; use the official badge, in one language for both stores, or a plain text link", quote(self.text_of(i, "nm"))));
        }

        // Buttons in one shape (RX-DS-02). The button-shaped controls on screen: filled, 60 px wide or more, 30 to 72 tall,
        // not a segment of a row of three or more (a segmented control squares its inner corners).
        let segment = |i: usize| self.parent(i).is_some_and(|p| {
            let row: Vec<usize> = kids.get(&p).map(|k| k.iter().copied().filter(|&k| self.flag(k, "ctl")).collect()).unwrap_or_default();
            row.len() >= 3 && row.iter().all(|&k| (self.els[k].r.y - self.els[i].r.y).abs() < 4.0)
        });
        let buttons: Vec<usize> = (BODY + 1..self.els.len()).filter(|&i| {
            let r = self.els[i].r;
            self.shown[i] && self.flag(i, "ctl") && r.w >= 60.0 && (30.0..=72.0).contains(&r.h) && r.x + r.w > 0.0
                && self.rgba(self.s(i, "backgroundColor")).is_some_and(|c| c[3] > 0.5) && !segment(i)
        }).collect();
        let corner = |i: usize| { let (r, h) = (self.n(i, "borderTopLeftRadius"), self.els[i].r.h); if r >= h / 2.0 - 1.0 { -1.0 } else { r.round() } };
        let store_name = |i: usize| { let nm = self.text_of(i, "nm").to_lowercase(); nm.contains("app store") || nm.contains("google play") };
        let has_img = |i: usize| (i + 1..self.els.len()).take_while(|&k| self.contains(i, k)).any(|k| self.els[k].tag == "IMG");
        // the two store links in two forms: one store's badge image beside a text button for the other (owner H4 note, JO)
        let stores: Vec<usize> = (BODY + 1..self.els.len()).filter(|&i| self.shown[i] && self.flag(i, "ctl") && store_name(i)).collect();
        if stores.iter().any(|&i| has_img(i)) && stores.iter().any(|&i| !has_img(i)) {
            let i = *stores.iter().find(|&&i| !has_img(i)).unwrap();
            tell(&mut out, "RX-DS-02", "store-forms", Some(i), format!("the store links come in two forms, a badge image and {}: show both stores the same way, each store's own badge at one height", quote(self.text_of(i, "nm"))));
        }
        // the two stores at two heights, side by side or stacked (owner H5 note, CU): a pair reads as one control when
        // its badges match; the height is the badge image's when there is one
        let tall = |i: usize| (i + 1..self.els.len()).take_while(|&k| self.contains(i, k)).find(|&k| self.els[k].tag == "IMG").map_or(self.els[i].r.h, |k| self.els[k].r.h);
        let pair = stores.iter().flat_map(|&a| stores.iter().map(move |&b| (a, b))).find(|&(a, b)| {
            let (ra, rb) = (self.els[a].r, self.els[b].r);
            a < b && tall(a) > 0.0 && tall(b) > 0.0 && ((ra.y - rb.y).abs() < 4.0 || (rb.y - (ra.y + ra.h)).abs() < 24.0)
                && (tall(a) - tall(b)).abs() > 3.0
        });
        if let Some((a, b)) = pair {
            tell(&mut out, "RX-DS-02", "store-heights", Some(b), format!("the store badges stand at two heights ({} and {} px): give both stores' badges one height", tall(a).round(), tall(b).round()));
        }
        // one fill in two corner shapes: the same action colour on a pill and on a rounded box reads as two components
        let mut by_fill: Vec<(&str, Vec<usize>)> = Vec::new();
        for &i in buttons.iter().filter(|&&i| !has_img(i)) {
            let f = self.s(i, "backgroundColor");
            match by_fill.iter_mut().find(|x| x.0 == f) { Some(x) => x.1.push(i), None => by_fill.push((f, vec![i])) }
        }
        let mixed = by_fill.iter().find(|(_, is)| is.iter().any(|&i| corner(i) != corner(is[0])));
        if let Some((_, is)) = mixed {
            let other = *is.iter().find(|&&i| corner(i) != corner(is[0])).unwrap();
            let shape = |i: usize| if corner(i) < 0.0 { "a pill".to_string() } else { format!("{} px corners", num_str(corner(i))) };
            tell(&mut out, "RX-DS-02", "button-shapes", Some(other), format!("buttons of one colour in two shapes ({} with {}, {} with {}): one button component, one corner radius, size variants only", quote(self.text_of(is[0], "nm")), shape(is[0]), quote(self.text_of(other, "nm")), shape(other)));
        }

        // A letter in a tile as the logo (RX-AS-11): one or two letters in a filled or bordered box of 16 to 72 px,
        // in an element whose class names a logo or brand (itself or two levels up). An avatar's initials are not in
        // one. The scan cannot know there is no file, so it warns.
        let tile = texts.iter().copied().find(|t| {
            let r = self.els[t.e].r;
            let filled = self.rgba(self.s(t.e, "backgroundColor")).is_some_and(|c| c[3] > 0.0) || self.s(t.e, "backgroundImage").contains("gradient(") || self.n(t.e, "borderTopWidth") >= 1.0;
            self.outside[t.e] && self.shown[t.e] && self.re.initial.is_match(t.x.trim()) && filled && (16.0..=72.0).contains(&r.w) && (16.0..=72.0).contains(&r.h)
                && std::iter::once(t.e).chain(self.ancestors(t.e)).take(3).any(|x| self.re.logo.is_match(self.text_of(x, "c")))
        });
        if let Some(t) = tile {
            tell(&mut out, "RX-AS-11", "mark", Some(t.e), format!("a letter in a tile ({}) stands in for the logo: an invented mark; use the brand's own file, or with none, the name in plain text in the brand's type and the mark listed as missing", quote(t.x.trim())));
        }

        // Cards inside cards: a bordered or shadowed, rounded, filled box holding another one.
        let card = |i: usize| {
            if matches!(self.els[i].tag.to_ascii_lowercase().as_str(), "input" | "textarea" | "select" | "button" | "img" | "video" | "svg" | "a") {
                return false;
            }
            let r = self.els[i].r;
            let shadow = self.s(i, "boxShadow");
            let edge = (self.n(i, "borderTopWidth") >= 1.0 && self.rgba(self.or_color(i, "borderTopColor")).map_or(false, |c| c[3] > 0.1)) || (!shadow.is_empty() && shadow != "none");
            edge && self.n(i, "borderTopLeftRadius") >= 6.0 && r.w >= 120.0 && r.h >= 60.0
        };
        let cards: Vec<usize> = visible.iter().copied().filter(|&i| card(i)).collect();
        // The outer box is in the flow and shorter than the screen, so a device frame, a sheet, or a sticky panel is
        // not a card; and it holds two or more cards, so one framed product shot inside a stage is not counted.
        let in_flow = |i: usize| matches!(self.s(i, "position"), "static" | "relative") && self.els[i].r.h < vh * 0.9;
        let holds = |c: usize| -> Vec<usize> { cards.iter().copied().filter(|&d| d != c && self.contains(c, d) && !cards.iter().any(|&e| e != c && e != d && self.contains(c, e) && self.contains(e, d))).collect() };
        let nested: Vec<usize> = cards.iter().copied().filter(|&c| in_flow(c) && holds(c).len() >= 2).collect();
        let outer: Vec<usize> = nested.iter().copied().filter(|&c| !nested.iter().any(|&d| d != c && self.contains(d, c))).collect();
        if let Some(&first) = outer.first() {
            let boxes = if outer.len() == 1 { "one box".to_string() } else { format!("{} boxes", outer.len()) };
            tell(&mut out, "RX-UI-01", "cards", Some(first), format!("cards sit inside a card ({boxes}, the first holds {}): one container per real group; separate inside it with spacing or a divider", holds(first).len()));
        }

        // A type scale with steps (RX-UI-03): sizes picked one element at a time leave text in sizes 1 px apart
        // (13, 14, 15, 16, 17), which read as mistakes, not levels. Counted on text of 11 to 40 px that carries at least
        // 20 characters at its size; warned when three or more sizes have a neighbour 1 px above. Text in a prototype
        // panel or a sample or demo tag is left out, and a device mockup on the page is its own type system, counted
        // apart (owner sheet 10, 2026-11-23: T4 fired on a "Sample content" tag, T5 mixed a document with its mockup).
        let named = |x: usize, r: &regex::Regex| r.is_match(self.text_of(x, "c")) || r.is_match(self.text_of(x, "id"));
        let scaffold = regex::Regex::new(r"(?i)sample|demo|scaffold|placeholder|dev-?(?:note|banner|tag)").unwrap();
        let mut scopes: Vec<(usize, std::collections::BTreeMap<i64, usize>)> = Vec::new();
        for t in texts.iter().filter(|t| !self.in_svg[t.e] && !self.in_proto[t.e]) {
            let chain: Vec<usize> = std::iter::once(t.e).chain(self.ancestors(t.e)).collect();
            if chain.iter().take(3).any(|&x| named(x, &scaffold)) {
                continue;
            }
            let scope = chain.iter().copied().find(|&x| x > 1 && named(x, &self.re.device)).unwrap_or(0);
            let size = self.n(t.e, "fontSize").round() as i64;
            if !(11..=40).contains(&size) {
                continue;
            }
            let at = match scopes.iter().position(|(k, _)| *k == scope) {
                Some(i) => i,
                None => {
                    scopes.push((scope, std::collections::BTreeMap::new()));
                    scopes.len() - 1
                }
            };
            *scopes[at].1.entry(size).or_insert(0) += len16(t.x.trim());
        }
        for (scope, used) in &scopes {
            let sizes: Vec<i64> = used.iter().filter(|(_, n)| **n >= 20).map(|(s, _)| *s).collect();
            let close: Vec<i64> = sizes.iter().copied().filter(|s| sizes.contains(&(s + 1))).collect();
            if close.len() >= 3 {
                let list: Vec<String> = sizes.iter().map(|s| s.to_string()).collect();
                let place = if *scope == 0 { String::new() } else { format!(" in the mockup {}", self.selector(*scope)) };
                tell(&mut out, "RX-UI-03", "scale", if *scope == 0 { None } else { Some(*scope) }, format!("text{place} in {} sizes ({} px), {} of them 1 px from the next: steps that close read as mistakes, not levels; pick a scale (for example 12, 14, 16, 20, 28) and give each role one step", sizes.len(), list.join(", "), close.len()));
                break;
            }
        }

        // Textarea growth (RX-FM-05): filled with 8 lines for a moment, a textarea that keeps its height and hides the
        // text past its edge.
        for i in (2..n).filter(|&i| self.els[i].tag == "TEXTAREA") {
            let Some(g) = grow.get(i.to_string()).filter(|g| g.is_object()) else { continue };
            let (before, after, hidden) = (num(g.get("before")), num(g.get("after")), num(g.get("hidden")));
            if hidden > 4.0 && after <= before + 1.0 {
                out.push(finding(
                    "RX-FM-05",
                    "warn",
                    self.selector(i),
                    format!(
                        "{}: with 8 lines it stays {}px tall and hides {}px of text past its edge; let it grow (field-sizing: content, or set the height from scrollHeight on input)",
                        quote(g["name"].as_str().unwrap_or("")),
                        num_str(round(before)),
                        num_str(round(hidden))
                    ),
                ));
            }
        }

        let ignored: Vec<Value> = (2..n).filter(|&i| self.flag(i, "ig") && self.parent(i).map_or(true, |p| self.outside[p])).map(|i| Value::from(self.selector(i))).collect();
        json!({ "findings": out, "ignored": ignored })
    }

    fn prev_sibling(&self, i: usize) -> Option<usize> {
        let p = self.parent(i)?;
        let kids = &self.kids[p];
        let at = kids.iter().position(|k| *k == i)?;
        if at == 0 { None } else { Some(kids[at - 1]) }
    }
}

/// A part that is not text and fails 3:1 against what is around it (WCAG 1.4.11): the colour it shows, the colour
/// next to it, and what it is ("border", "ring", "fill", "icon", or "focus").
struct Edge {
    i: usize,
    ratio: f64,
    fg: Colour,
    bg: Colour,
    what: &'static str,
}

/// The strongest so far of the (ratio, colour shown, colour beside it) candidates.
fn stronger(best: &mut Option<(f64, Colour, Colour)>, ratio: f64, fg: Colour, bg: Colour) {
    if best.map_or(true, |b| ratio > b.0) {
        *best = Some((ratio, fg, bg));
    }
}

impl<'a> Page<'a> {
    /// The shadows of a box-shadow: colour, inset, and x, y, blur, spread in px.
    fn shadow_parts(&self, shadow: &str) -> Vec<(Colour, bool, [f64; 4])> {
        if shadow.is_empty() || shadow == "none" {
            return Vec::new();
        }
        split_shadows(shadow)
            .iter()
            .filter_map(|part| {
                let c = self.colours(part).first().copied()?;
                let rest = self.re.rgba_all_first_removed(part);
                let n: Vec<f64> = self.re.px.matches(&rest).iter().map(|m| m.trim_end_matches("px").parse::<f64>().unwrap_or(0.0)).collect();
                let at = |k: usize| n.get(k).copied().unwrap_or(0.0);
                Some((c, rest.contains("inset"), [at(0), at(1), at(2), at(3)]))
            })
            .collect()
    }

    /// The strongest mark of an element's edge against `outer`, the colour around it: its fill, a border side
    /// (`borders` as width and colour), or a ring (a shadow with no blur), as (ratio, colour shown, outer, what),
    /// and whether anything besides the fill draws an edge.
    fn edge(&self, i: usize, outer: Colour, borders: &[(f64, &str)]) -> Option<((f64, Colour, Colour, &'static str), bool)> {
        let fill = self.background(i)?;
        let mut best = (contrast(lum(fill), lum(outer)), fill, outer, "fill");
        let mut marked = false;
        for &(w, c) in borders {
            let Some(c) = self.rgba(c).filter(|c| c[3] > 0.0 && w >= 1.0) else { continue };
            let Some((_, shown)) = self.painted(i, Some(c)) else { continue };
            marked = true;
            let r = contrast(lum(shown), lum(outer));
            if r > best.0 {
                best = (r, shown, outer, "border");
            }
        }
        for (c, inset, [x, y, blur, spread]) in self.shadow_parts(self.s(i, "boxShadow")) {
            if c[3] <= 0.0 || blur > 0.0 || (spread < 1.0 && x.abs() < 1.0 && y.abs() < 1.0) {
                continue;
            }
            marked = true;
            let shown = blend(c, if inset { fill } else { outer });
            let r = contrast(lum(shown), lum(outer));
            if r > best.0 {
                best = (r, shown, outer, "ring");
            }
        }
        Some((best, marked))
    }

    /// Fields whose edge is under 3:1 against what is around them, and icon-only controls whose icon is under 3:1
    /// against the control. A field with no edge of its own inside a box that draws one (a search bar) is judged by
    /// the box. What sits on a picture, or under a blend or filter, is not judged.
    fn edges(&self) -> Vec<Edge> {
        let n = self.els.len();
        let mut out = Vec::new();
        let judged = |i: usize| self.shown[i] && self.outside[i] && !self.disabled[i] && !self.overlay(i) && !self.in_proto[i];
        for i in 2..n {
            let Some(fb) = self.els[i].v.get("fb").and_then(Value::as_array).filter(|a| a.len() == 8) else { continue };
            if !judged(i) {
                continue;
            }
            let Some(outer) = self.parent(i).and_then(|p| self.background(p)) else { continue };
            let borders: Vec<(f64, &str)> = (0..4).map(|k| (num(fb.get(k)), fb[k + 4].as_str().unwrap_or(""))).collect();
            let Some((mut best, marked)) = self.edge(i, outer, &borders) else { continue };
            if !marked && best.0 < 1.1 {
                let h = self.els[i].r.h;
                for a in self.ancestors(i).into_iter().take(3) {
                    if a <= BODY || self.els[a].r.h > h * 2.0 + 24.0 {
                        break;
                    }
                    let Some(around) = self.parent(a).and_then(|p| self.background(p)) else { break };
                    let style = self.s(a, "borderTopStyle");
                    let w = if style.is_empty() || style == "none" || style == "hidden" { 0.0 } else { self.n(a, "borderTopWidth") };
                    if let Some((b, m)) = self.edge(a, around, &[(w, self.or_color(a, "borderTopColor"))]) {
                        if m || b.0 >= 1.1 {
                            best = b;
                            break;
                        }
                    }
                }
            }
            if best.0 < 3.0 {
                out.push(Edge { i, ratio: best.0, fg: best.1, bg: best.2, what: best.3 });
            }
        }
        for i in 2..n {
            if !self.flag(i, "ico") || !judged(i) {
                continue;
            }
            let (mut best, mut unknown) = (None, false);
            for j in i + 1..n {
                if !self.contains(i, j) {
                    break;
                }
                let Some(ip) = self.els[j].v.get("ip").and_then(Value::as_array) else { continue };
                if !self.shown[j] {
                    continue;
                }
                for p in ip {
                    let Some(mut c) = p.get(0).and_then(Value::as_str).and_then(|c| self.rgba(c)) else { continue };
                    c[3] *= p.get(1).and_then(Value::as_f64).unwrap_or(1.0);
                    if c[3] <= 0.0 {
                        continue;
                    }
                    match self.painted(j, Some(c)) {
                        Some((bg, fg)) => stronger(&mut best, contrast(lum(fg), lum(bg)), fg, bg),
                        None => unknown = true,
                    }
                }
            }
            if let (Some((ratio, fg, bg)), false) = (best, unknown) {
                if ratio < 3.0 {
                    out.push(Edge { i, ratio, fg, bg, what: "icon" });
                }
            }
        }
        out
    }

    fn edge_findings(&self) -> Vec<Value> {
        let mut groups: Vec<(String, Edge, usize)> = Vec::new();
        for e in self.edges() {
            let key = format!("{}|{}|{}", e.what == "icon", hex(e.fg), hex(e.bg));
            match groups.iter_mut().find(|g| g.0 == key) {
                Some(g) => g.2 += 1,
                None => groups.push((key, e, 1)),
            }
        }
        groups
            .into_iter()
            .map(|(_, e, count)| {
                let more = if count > 1 { format!("; {} more with the same colors", count - 1) } else { String::new() };
                let message = match e.what {
                    "icon" => format!("{} icon: contrast {}:1 ({} on {}), needs 3:1 against the control (WCAG 1.4.11){more}", quote(self.text_of(e.i, "nm")), crate::audit::ratio_text(e.ratio, 3.0), hex(e.fg), hex(e.bg)),
                    "fill" if e.ratio < 1.1 => format!("{} field: no visible edge (no border, ring, or fill apart from {} around it), needs one at 3:1 (WCAG 1.4.11){more}", quote(self.text_of(e.i, "fl")), hex(e.bg)),
                    what => format!("{} field: edge {}:1 ({} {what} on {}), needs 3:1 against what is around it (WCAG 1.4.11){more}", quote(self.text_of(e.i, "fl")), crate::audit::ratio_text(e.ratio, 3.0), hex(e.fg), hex(e.bg)),
                };
                finding("RX-A11Y-01", "fail", self.selector(e.i), message)
            })
            .collect()
    }

    /// A field whose text is transparent: an input laid over boxes the page draws itself (a one-time code split in
    /// cells), whose edge and focus those boxes show.
    fn overlay(&self, i: usize) -> bool {
        self.els[i].v.get("fb").is_some() && self.rgba(self.color(i)).is_some_and(|c| c[3] == 0.0)
    }
    /// The colour at an element's outer edge: its top border when it has one, else its fill.
    fn outer_edge(&self, i: usize, fill: Colour) -> Colour {
        let style = self.s(i, "borderTopStyle");
        let w = if style.is_empty() || style == "none" || style == "hidden" { 0.0 } else { self.n(i, "borderTopWidth") };
        match self.rgba(self.or_color(i, "borderTopColor")).filter(|c| w >= 1.0 && c[3] > 0.0) {
            Some(c) => blend(c, fill),
            None => fill,
        }
    }
    /// The controls whose focus the page is asked to show: the ones in the tab order, outside a prototype panel
    /// (owner, sheet 9 Q2).
    fn focus_list(&self) -> Vec<usize> {
        (2..self.els.len()).filter(|&i| self.flag(i, "ctl") && !self.flag(i, "nt") && self.shown[i] && self.outside[i] && !self.disabled[i] && !self.overlay(i) && !self.in_proto[i]).take(MAX_FOCUS).collect()
    }
    /// How a control is named in a message: a field by its label, anything else by its name.
    fn control_name(&self, i: usize) -> &'a str {
        match self.text_of(i, "fl") {
            "" => self.text_of(i, "nm"),
            label => label,
        }
    }

    /// What focus changed on one element, from `b` (before) to `f` (focused), with `fill` its own colour and `adj`
    /// the colour around it: whether anything shows, and the strongest change as (ratio, colour, beside).
    ///
    /// A ring that touches the element's edge (an outline with no gap, a shadow with no offset) shows when it reaches
    /// 3:1 against that edge (`edge`: its border, else its fill) or against `adj`; a ring with a gap is measured
    /// against `adj`, which fills the gap (owner, sheet 9 Q1).
    fn focus_change(&self, b: &Value, f: &Value, fill: Colour, edge: Colour, adj: Colour, seen: &mut bool, best: &mut Option<(f64, Colour, Colour)>) {
        let touching = |best: &mut Option<(f64, Colour, Colour)>, c: Colour| {
            let shown = blend(c, adj);
            let (a, e) = (contrast(lum(shown), lum(adj)), contrast(lum(blend(c, edge)), lum(edge)));
            if a >= e { stronger(best, a, shown, adj) } else { stronger(best, e, blend(c, edge), edge) }
        };
        if !b.is_object() || !f.is_object() {
            return;
        }
        let colour = |v: &Value| v.as_str().and_then(|c| self.rgba(c));
        let o = &f["o"];
        if o[0].as_str().is_some_and(|s| s != "none") && num(o.get(1)) >= 1.0 && *o != b["o"] {
            *seen = true;
            if o[0] == "auto" {
                // the browser's own ring, drawn in two tones so it shows on any colour
                stronger(best, 21.0, adj, adj);
            } else if let Some(c) = colour(&o[2]) {
                let offset = num(o.get(3));
                if offset == 0.0 {
                    touching(best, c);
                } else {
                    let against = if offset < 0.0 { fill } else { adj };
                    let shown = blend(c, against);
                    stronger(best, contrast(lum(shown), lum(against)), shown, against);
                }
            }
        }
        if f["bs"] != b["bs"] {
            let before: Vec<String> = split_shadows(b["bs"].as_str().unwrap_or("")).iter().map(|p| p.trim().to_string()).collect();
            for part in split_shadows(f["bs"].as_str().unwrap_or("none")) {
                if before.contains(&part.trim().to_string()) {
                    continue;
                }
                for (c, inset, [x, y, blur, spread]) in self.shadow_parts(&part) {
                    if c[3] <= 0.0 || (blur <= 0.0 && spread <= 0.0 && x == 0.0 && y == 0.0) {
                        continue;
                    }
                    *seen = true;
                    if inset {
                        let shown = blend(c, fill);
                        stronger(best, contrast(lum(shown), lum(fill)), shown, fill);
                    } else if x == 0.0 && y == 0.0 {
                        touching(best, c);
                    } else {
                        let shown = blend(c, adj);
                        stronger(best, contrast(lum(shown), lum(adj)), shown, adj);
                    }
                }
            }
        }
        for k in 0..4 {
            let (fw, bw) = (num(f["bw"].get(k)), num(b["bw"].get(k)));
            if fw < 1.0 || (f["bc"][k] == b["bc"][k] && fw == bw) {
                continue;
            }
            let Some(c) = colour(&f["bc"][k]).filter(|c| c[3] > 0.0) else { continue };
            *seen = true;
            let shown = blend(c, fill);
            let old = colour(&b["bc"][k]).filter(|_| bw >= 1.0).map_or(adj, |o| blend(o, fill));
            let (a, o) = (contrast(lum(shown), lum(adj)), contrast(lum(shown), lum(old)));
            if a >= o { stronger(best, a, shown, adj) } else { stronger(best, o, shown, old) }
        }
        if f["bg"] != b["bg"] {
            if let Some(c) = colour(&f["bg"]).filter(|c| c[3] > 0.0) {
                *seen = true;
                let shown = blend(c, adj);
                let (a, o) = (contrast(lum(shown), lum(adj)), contrast(lum(shown), lum(fill)));
                if a >= o { stronger(best, a, shown, adj) } else { stronger(best, o, shown, fill) }
            }
        }
        // a control that comes into view or moves when focused (a skip link): the move is what shows
        let (rb, rf) = (&b["r"], &f["r"]);
        let at = |r: &Value, k: usize| num(r.get(k));
        let off = |r: &Value| at(r, 0) + at(r, 2) <= 0.0 || at(r, 1) + at(r, 3) <= 0.0 || at(r, 0) >= self.vw;
        let moved = rb.is_array() && rf.is_array() && ((off(rb) && !off(rf)) || (at(rb, 0) - at(rf, 0)).abs() >= 8.0 || (at(rb, 1) - at(rf, 1)).abs() >= 8.0);
        // a move, an underline, a picture, or a ::before or ::after that changes: shown, but not measured here
        if moved || f["td"] != b["td"] || f["bi"] != b["bi"] || f["ps"] != b["ps"] {
            *seen = true;
            stronger(best, 21.0, adj, adj);
        }
    }

    /// Focus (RX-A11Y-03): a control that shows nothing when focused, and a focus indicator under 3:1 against what
    /// is around it (WCAG 1.4.11), from what the page showed (`shown`, by element index). A change on the control's
    /// parent counts (a ring a search bar draws around its field).
    fn focus_findings(&self, list: &[usize], shown: &Value) -> Vec<Value> {
        let mut none: Vec<usize> = Vec::new();
        let mut weak: Vec<(String, Edge, usize)> = Vec::new();
        for &i in list {
            let a = &shown[i.to_string()];
            if a["a"].as_f64() != Some(1.0) {
                continue;
            }
            let Some(p) = self.parent(i) else { continue };
            let Some(adj) = self.background(p) else { continue };
            let fill = self.background(i).unwrap_or(adj);
            let (mut seen, mut best) = (false, None);
            self.focus_change(&a["b"], &a["f"], fill, self.outer_edge(i, fill), adj, &mut seen, &mut best);
            if let Some(around) = self.parent(p).filter(|&g| g >= BODY).and_then(|g| self.background(g)) {
                self.focus_change(&a["pb"], &a["pf"], adj, self.outer_edge(p, adj), around, &mut seen, &mut best);
            }
            match best {
                None if !seen => none.push(i),
                Some((ratio, fg, bg)) if ratio < 3.0 => {
                    let key = format!("{}|{}", hex(fg), hex(bg));
                    match weak.iter_mut().find(|g| g.0 == key) {
                        Some(g) => g.2 += 1,
                        None => weak.push((key, Edge { i, ratio, fg, bg, what: "focus" }, 1)),
                    }
                }
                _ => {}
            }
        }
        let mut out = Vec::new();
        if let Some(&first) = none.first() {
            let more = if none.len() > 1 { format!(" and {} more controls", none.len() - 1) } else { String::new() };
            out.push(finding(
                "RX-A11Y-03",
                "fail",
                self.selector(first),
                format!("{}{more}: no focus indicator when reached from the keyboard (no outline, ring, border, fill, or underline appears); give :focus-visible an outline at 3:1 against what is around it", quote(self.control_name(first))),
            ));
        }
        for (_, e, count) in weak {
            let more = if count > 1 { format!("; {} more with the same colors", count - 1) } else { String::new() };
            out.push(finding(
                "RX-A11Y-03",
                "fail",
                self.selector(e.i),
                format!("{}: focus indicator {}:1 ({} on {}), needs 3:1 against what is around it (WCAG 1.4.11){more}", quote(self.control_name(e.i)), crate::audit::ratio_text(e.ratio, 3.0), hex(e.fg), hex(e.bg)),
            ));
        }
        out
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    /// A page of one text under a wrapper with `wrap` styles, inside a white body.
    fn faded(wrap: Value, text: Value) -> Vec<String> {
        let r = serde_json::json!([0, 0, 300, 40]);
        let input = serde_json::json!({
            "vw": 320, "vh": 844, "scrollWidth": 320, "scrollingElement": 0,
            "styles": [{"color": "rgb(0, 0, 0)"}, {"backgroundColor": "rgb(255, 255, 255)", "color": "rgb(0, 0, 0)"}, wrap, text],
            "els": [{"t": "HTML", "s": 0, "r": r}, {"t": "BODY", "p": 0, "s": 1, "r": r}, {"t": "DIV", "p": 1, "s": 2, "r": r}, {"t": "P", "p": 2, "s": 3, "r": r}],
            "texts": [{"e": 3, "x": "Bayar sekarang", "r": r}],
            "answers": {}
        });
        probe(&input)["findings"].as_array().unwrap().iter().filter(|f| f["rule"] == "RX-A11Y-01").map(|f| f["message"].as_str().unwrap().to_string()).collect()
    }

    #[test]
    fn contrast_counts_the_opacity_of_the_text_and_its_ancestors() {
        let black = serde_json::json!({"color": "rgb(0, 0, 0)"});
        assert!(faded(serde_json::json!({}), black.clone()).is_empty());
        assert_eq!(faded(serde_json::json!({}), serde_json::json!({"color": "rgb(187, 187, 187)"})).len(), 1);
        // black text in a wrapper at 25% shows as light grey on white
        let m = faded(serde_json::json!({"opacity": "0.25"}), black.clone());
        assert_eq!(m.len(), 1, "{m:?}");
        assert!(m[0].contains("on #ffffff"), "{m:?}");
        // the text's own opacity too
        assert_eq!(faded(serde_json::json!({}), serde_json::json!({"color": "rgb(0, 0, 0)", "opacity": "0.3"})).len(), 1);
        // a faded card fades its own background with the text: dark card at 40% over white, white text
        let m = faded(serde_json::json!({"opacity": "0.4", "backgroundColor": "rgb(0, 0, 0)"}), serde_json::json!({"color": "rgb(255, 255, 255)"}));
        assert_eq!(m.len(), 1, "{m:?}");
        assert!(!m[0].contains("on #000000"), "{m:?}");
        // opacity 0.9 keeps black readable
        assert!(faded(serde_json::json!({"opacity": "0.9"}), black).is_empty());
    }

    #[test]
    fn colour_filters_tint_as_chromium_paints_them() {
        // #3366cc under each filter, as Chromium 1.64 (Playwright) rendered it, 2026-11-23
        let cases = [
            ("grayscale(1)", [99, 99, 99]),
            ("grayscale(0.5)", [75, 100, 151]),
            ("sepia(1)", [137, 122, 95]),
            ("saturate(2)", [4, 106, 255]),
            ("saturate(0.3)", [84, 100, 130]),
            ("hue-rotate(90deg)", [204, 62, 146]),
            ("invert(1)", [204, 153, 51]),
            ("invert(0.3)", [97, 117, 158]),
            ("brightness(1.5)", [76, 153, 255]),
            ("brightness(0.6)", [31, 61, 122]),
            ("contrast(2)", [0, 77, 255]),
            ("contrast(0.5)", [89, 115, 166]),
            ("grayscale(1) brightness(0.8)", [79, 79, 79]),
            ("grayscale(1) opacity(0.85)", [122, 122, 122]),
        ];
        for (filter, want) in cases {
            let r = serde_json::json!([0, 0, 300, 40]);
            let input = serde_json::json!({
                "vw": 320, "vh": 844, "scrollWidth": 320, "scrollingElement": 0,
                "styles": [{"color": "rgb(0, 0, 0)"}, {"backgroundColor": "rgb(255, 255, 255)", "color": "rgb(0, 0, 0)"}, {"backgroundColor": "rgb(51, 102, 204)", "filter": filter, "color": "rgb(0, 0, 0)"}],
                "els": [{"t": "HTML", "s": 0, "r": r}, {"t": "BODY", "p": 0, "s": 1, "r": r}, {"t": "DIV", "p": 1, "s": 2, "r": r}],
                "texts": [],
            });
            let page = Page::read(&input).unwrap();
            let got = page.background(2).unwrap();
            for c in 0..3 {
                assert!((got[c] - want[c] as f64).abs() <= 1.0, "{filter}: {got:?} against Chromium {want:?}");
            }
        }
    }

    #[test]
    fn a_filter_that_is_not_a_colour_function_is_not_measured() {
        let m = faded(serde_json::json!({"filter": "blur(2px)"}), serde_json::json!({"color": "rgb(187, 187, 187)"}));
        assert_eq!(m.len(), 1, "{m:?}");
        assert!(m[0].starts_with("1 text not measured"), "{m:?}");
        // grey text that passes on white fails once the wrapper fades it with opacity() and grayscale()
        let grey = serde_json::json!({"color": "rgb(110, 110, 110)"});
        assert!(faded(serde_json::json!({}), grey.clone()).is_empty());
        let m = faded(serde_json::json!({"filter": "grayscale(1) opacity(0.6)"}), grey);
        assert_eq!(m.len(), 1, "{m:?}");
        assert!(m[0].contains("contrast"), "{m:?}");
        // a greyed text may be a logotype, which WCAG exempts: the fail says how to leave it out
        assert!(m[0].ends_with("; if this is a logotype (WCAG 1.4.3 exempts them), mark its row data-ryux-ignore"), "{m:?}");
        // a drop shadow on a card does not change the colours inside it, nested parentheses and all
        let shadow = serde_json::json!({"filter": "drop-shadow(rgba(26, 23, 20, 0.08) 0px 1px 0px) drop-shadow(rgba(26, 23, 20, 0.1) 0px 8px 24px)"});
        assert!(faded(shadow.clone(), serde_json::json!({"color": "rgb(0, 0, 0)"})).is_empty());
        let m = faded(shadow, serde_json::json!({"color": "rgb(187, 187, 187)"}));
        assert_eq!(m.len(), 1);
        assert!(!m[0].contains("logotype"), "a drop shadow does not grey a text: {m:?}");
        // a url filter is not measured
        assert!(faded(serde_json::json!({"filter": "url(\"#duotone\")"}), serde_json::json!({"color": "rgb(0, 0, 0)"}))[0].starts_with("1 text not measured"));
    }

    /// A page from styles and elements after <html> and <body> (parents by index), with the texts given.
    fn page(extra: Value, styles: Value, els: Value, texts: Value) -> Value {
        let mut st = vec![serde_json::json!({"color": "rgb(0, 0, 0)"}), serde_json::json!({"backgroundColor": "rgb(255, 255, 255)", "color": "rgb(0, 0, 0)"})];
        st.extend(styles.as_array().unwrap().iter().cloned());
        let r = serde_json::json!([0, 0, 320, 844]);
        let mut all = vec![serde_json::json!({"t": "HTML", "s": 0, "r": r}), serde_json::json!({"t": "BODY", "p": 0, "s": 1, "r": r})];
        all.extend(els.as_array().unwrap().iter().cloned());
        let mut input = serde_json::json!({"vw": 320, "vh": 844, "scrollWidth": 320, "scrollingElement": 0, "styles": st, "els": all, "texts": texts, "answers": {}});
        for (k, v) in extra.as_object().unwrap() {
            input[k] = v.clone();
        }
        probe(&input)
    }
    fn rules_of(out: &Value, rule: &str) -> Vec<String> {
        out["findings"].as_array().unwrap().iter().filter(|f| f["rule"] == rule).map(|f| f["message"].as_str().unwrap().to_string()).collect()
    }

    #[test]
    fn a_bar_repeats_whole_words_not_letters() {
        assert!(repeated_words("Platform fee", "Bayar for now").is_empty());
        assert_eq!(repeated_words("Total Rp1.250.000", "Bayar Rp1.250.000"), vec!["Rp1.250.000"]);
        assert_eq!(repeated_words("TOTAL bayar", "Total"), vec!["TOTAL"]);
    }

    #[test]
    fn the_page_colour_is_not_a_fixed_header_over_it() {
        let dark = serde_json::json!({"position": "fixed", "backgroundColor": "rgb(10, 10, 10)"});
        let out = page(serde_json::json!({"top": 2}), serde_json::json!([dark]), serde_json::json!([{"t": "HEADER", "p": 1, "s": 2, "r": [0, 0, 320, 60]}]), serde_json::json!([]));
        let input = serde_json::json!({"vw": 320, "vh": 844, "styles": [{}, {"backgroundColor": "rgb(255, 255, 255)"}, {"position": "fixed", "backgroundColor": "rgb(10, 10, 10)"}],
            "els": [{"t": "HTML", "s": 0, "r": [0, 0, 320, 844]}, {"t": "BODY", "p": 0, "s": 1, "r": [0, 0, 320, 844]}, {"t": "HEADER", "p": 1, "s": 2, "r": [0, 0, 320, 60]}], "top": 2});
        let p = Page::read(&input).unwrap();
        assert_eq!(p.page_background().map(hex), Some("#ffffff".to_string()));
        assert!(out.get("error").is_none());
    }

    #[test]
    fn a_dark_canvas_is_the_colour_behind_a_page_with_no_background() {
        let mk = |canvas: Option<&str>| {
            let mut input = serde_json::json!({"vw": 320, "vh": 844, "scrollWidth": 320, "styles": [{"color": "rgb(255, 255, 255)"}],
                "els": [{"t": "HTML", "s": 0, "r": [0, 0, 320, 844]}, {"t": "BODY", "p": 0, "s": 0, "r": [0, 0, 320, 844]}, {"t": "P", "p": 1, "s": 0, "r": [0, 0, 300, 40]}],
                "texts": [{"e": 2, "x": "Bayar sekarang", "r": [0, 0, 300, 40]}], "answers": {}});
            if let Some(c) = canvas {
                input["canvas"] = c.into();
            }
            rules_of(&probe(&input), "RX-A11Y-01")
        };
        assert_eq!(mk(None).len(), 1, "white text on the default white canvas");
        assert!(mk(Some("rgb(18, 18, 18)")).is_empty());
    }

    #[test]
    fn an_index_past_the_elements_is_ignored_not_a_crash() {
        let out = page(serde_json::json!({"chains": {"open": {"999": {"position": "fixed", "op": 999}}}}), serde_json::json!([{"color": "rgb(187, 187, 187)"}]),
            serde_json::json!([{"t": "P", "p": 1, "s": 2, "r": [0, 0, 300, 40]}]), serde_json::json!([{"e": 2, "x": "Bayar", "r": [0, 0, 300, 40], "open": [999, 5000, null]}]));
        assert!(out.get("error").is_none());
        let out = page(serde_json::json!({"answers": {"under": {"0": 999}}}), serde_json::json!([{"color": "rgb(187, 187, 187)"}]),
            serde_json::json!([{"t": "P", "p": 1, "s": 2, "r": [0, 0, 300, 40]}]), serde_json::json!([{"e": 2, "x": "Bayar", "r": [0, 0, 300, 40]}]));
        assert_eq!(rules_of(&out, "RX-A11Y-01").len(), 1);
    }

    #[test]
    fn sideways_scroll_names_what_overflows_the_page_not_what_a_scroller_holds() {
        let out = page(serde_json::json!({"scrollWidth": 700}), serde_json::json!([{"overflow": "auto hidden"}, {}, {}]),
            serde_json::json!([
                {"t": "DIV", "p": 1, "s": 2, "c": "carousel", "r": [0, 0, 320, 100]},
                {"t": "DIV", "p": 2, "s": 3, "c": "slide", "r": [0, 0, 900, 100]},
                {"t": "TABLE", "p": 1, "s": 4, "c": "wide", "r": [0, 200, 700, 100]}
            ]), serde_json::json!([]));
        let m = rules_of(&out, "RX-RD-01");
        assert_eq!(m.len(), 1);
        assert!(m[0].contains("wide") && !m[0].contains("slide"), "{m:?}");
    }

    #[test]
    fn a_pay_link_or_submit_input_is_the_action_too() {
        let wide = |action: Value| {
            let out = page(serde_json::json!({"vw": 1280, "vh": 900, "scrollWidth": 1280}), serde_json::json!([{}]),
                serde_json::json!([
                    {"t": "INPUT", "p": 1, "s": 2, "rg": "pay", "ol": "QRIS", "r": [0, 1200, 20, 20]},
                    {"t": "INPUT", "p": 1, "s": 2, "rg": "pay", "ol": "BCA", "r": [0, 1240, 20, 20]},
                    action
                ]), serde_json::json!([]));
            rules_of(&out, "RX-UX-15").len()
        };
        assert_eq!(wide(serde_json::json!({"t": "BUTTON", "p": 1, "s": 2, "ctl": 1, "nm": "Bayar Rp1.250.000", "r": [900, 700, 200, 48]})), 1);
        assert_eq!(wide(serde_json::json!({"t": "A", "p": 1, "s": 2, "ctl": 1, "nm": "Bayar Rp1.250.000", "r": [900, 700, 200, 48]})), 1);
        assert_eq!(wide(serde_json::json!({"t": "INPUT", "p": 1, "s": 2, "ctl": 1, "ty": "submit", "nm": "Bayar Rp1.250.000", "r": [900, 700, 200, 48]})), 1);
    }

    #[test]
    fn text_in_sizes_one_pixel_apart_has_no_scale() {
        let run = |sizes: &[f64]| {
            let styles: Vec<Value> = sizes.iter().map(|s| serde_json::json!({"fontSize": s})).collect();
            let els: Vec<Value> = (0..sizes.len()).map(|i| serde_json::json!({"t": "P", "p": 1, "s": i + 2, "r": [16, 40 * i + 20, 300, 20]})).collect();
            let texts: Vec<Value> = (0..sizes.len()).map(|i| serde_json::json!({"e": i + 2, "x": "Teks contoh yang cukup panjang di sini", "r": [16, 40 * i + 20, 300, 20]})).collect();
            rules_of(&page(serde_json::json!({}), Value::Array(styles), Value::Array(els), Value::Array(texts)), "RX-UI-03")
        };
        let messy = run(&[13.0, 14.0, 15.0, 16.0, 17.0, 24.0]);
        assert_eq!(messy.len(), 1);
        assert!(messy[0].starts_with("text in 6 sizes (13, 14, 15, 16, 17, 24 px), 4 of them 1 px from the next"));
        assert!(run(&[12.0, 14.0, 16.0, 20.0, 28.0]).is_empty());
        assert!(run(&[14.0, 15.0, 16.0, 20.0]).is_empty());
        // a sample tag does not count
        let tagged = {
            let sizes = [14.0, 15.0, 16.0, 24.0];
            let mut styles: Vec<Value> = sizes.iter().map(|s| serde_json::json!({"fontSize": s})).collect();
            styles.push(serde_json::json!({"fontSize": 13}));
            let mut els: Vec<Value> = (0..sizes.len()).map(|i| serde_json::json!({"t": "P", "p": 1, "s": i + 2, "r": [16, 40 * i + 20, 300, 20]})).collect();
            els.push(serde_json::json!({"t": "SPAN", "p": 1, "s": 6, "c": "sample-tag", "r": [16, 400, 300, 20]}));
            let mut texts: Vec<Value> = (0..sizes.len()).map(|i| serde_json::json!({"e": i + 2, "x": "Teks contoh yang cukup panjang di sini", "r": [16, 40 * i + 20, 300, 20]})).collect();
            texts.push(serde_json::json!({"e": 6, "x": "Sample content: set the real offer", "r": [16, 400, 300, 20]}));
            rules_of(&page(serde_json::json!({}), Value::Array(styles), Value::Array(els), Value::Array(texts)), "RX-UI-03")
        };
        assert!(tagged.is_empty(), "{tagged:?}");
    }

    #[test]
    fn javascript_numbers_and_shadows() {
        let re = Res::new();
        assert_eq!(js_number(&re, "0.5"), 0.5);
        assert_eq!(js_number(&re, ".5"), 0.5);
        assert!(js_number(&re, "50%").is_nan());
        assert!(js_number(&re, "inf").is_nan());
        assert_eq!(split_shadows("rgba(1, 2, 3, 0.5) 0px 0px 24px 0px, rgb(0, 0, 0) 0px 2px 4px 0px"), vec!["rgba(1, 2, 3, 0.5) 0px 0px 24px 0px", " rgb(0, 0, 0) 0px 2px 4px 0px"]);
        assert_eq!(hypot(3.0, 4.0), 5.0);
        assert_eq!(hex([187.0, 187.0, 187.0, 1.0]), "#bbbbbb");
    }

    #[test]
    fn cream_is_warm_light_and_a_little_coloured() {
        for c in ["fff7e8", "fff8ec", "f6eedf", "f7f1e6", "f6f0e6"] {
            let v: Vec<f64> = (0..3).map(|i| u8::from_str_radix(&c[i * 2..i * 2 + 2], 16).unwrap() as f64).collect();
            assert!(super::cream([v[0], v[1], v[2], 1.0]), "{c}");
        }
        for c in [[255.0, 255.0, 255.0, 1.0], [255.0, 249.0, 196.0, 1.0], [240.0, 244.0, 250.0, 1.0], [30.0, 30.0, 30.0, 1.0]] {
            assert!(!super::cream(c), "{c:?}");
        }
    }
}
