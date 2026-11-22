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
pub const CATALOGUE: [(&str, &str); 12] = [
    ("RX-RD-01", "fail"),
    ("RX-A11Y-01", "fail"),
    ("RX-A11Y-01", "warn"),
    ("RX-A11Y-02", "fail"),
    ("RX-QA-03", "warn"),
    ("RX-QA-03", "fail"),
    ("RX-AS-05", "warn"),
    ("RX-UI-10", "warn"),
    ("RX-UI-26", "warn"),
    ("RX-UI-01", "warn"),
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
    /// A blend mode or a filter on the way up: it changes the text and what is behind it alike.
    Mixed,
    /// An image or a gradient ("image" or "gradient"): only the page's pixels show it.
    Picture(&'static str),
}

/// Texts over an image or a gradient whose pixels the page is asked for, per width; the rest are not measured.
const MAX_BEHIND: usize = 40;

/// A text under its contrast: the colours at its weakest point, and what was behind it when that was a picture.
struct Fail {
    k: usize,
    ratio: f64,
    fg: Colour,
    bg: Colour,
    need: f64,
    over: Option<&'static str>,
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
        let mut page = Page {
            canvas: canvas.unwrap_or([255.0, 255.0, 255.0, 1.0]),
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
            els,
        };
        // What holds for an element and every ancestor, worked out once in document order (parents come first).
        let n = page.els.len();
        let (mut hidden, mut ignored) = (vec![false; n], vec![false; n]);
        let (mut dis, mut svg, mut code, mut pin) = (vec![false; n], vec![false; n], vec![false; n], vec![false; n]);
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
        }
        page.shown = (0..n).map(|i| !hidden[i] && page.els[i].r.w > 1.0 && page.els[i].r.h > 1.0).collect();
        page.outside = ignored.iter().map(|x| !x).collect();
        page.disabled = dis;
        page.in_svg = svg;
        page.in_code = code;
        page.pinned = pin;
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
        let bg = |x: usize| self.rgba(self.s(x, "backgroundColor")).filter(|c| c[3] > 0.0);
        // from the outermost layer in: what the element at `k` and all it holds paint over `behind`
        fn paint(chain: &[usize], k: usize, behind: Colour, fg: Option<Colour>, op: &dyn Fn(usize) -> f64, bg: &dyn Fn(usize) -> Option<Colour>) -> Colour {
            let x = chain[k];
            let mut c = bg(x).map_or(behind, |b| blend(b, behind));
            c = if k > 0 { paint(chain, k - 1, c, fg, op, bg) } else { fg.map_or(c, |f| blend(f, c)) };
            let o = op(x);
            if o >= 1.0 { c } else { [c[0] * o + behind[0] * (1.0 - o), c[1] * o + behind[1] * (1.0 - o), c[2] * o + behind[2] * (1.0 - o), 1.0] }
        }
        let top = chain.len() - 1;
        Some((paint(&chain, top, self.canvas, None, &op, &bg), paint(&chain, top, self.canvas, fg, &op, &bg)))
    }
    fn opacity(&self, x: usize) -> f64 {
        let o = js_number(&self.re, self.s(x, "opacity"));
        if o.is_finite() { o.clamp(0.0, 1.0) } else { 1.0 }
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
            let filter = self.s(x, "filter");
            if self.s(x, "mixBlendMode") != "normal" || (!filter.is_empty() && filter != "none") {
                return Some(Unknown::Mixed);
            }
            let image = self.s(x, "backgroundImage");
            if image != "none" && picture.is_none() {
                picture = Some(if image.contains("url(") { "image" } else { "gradient" });
            }
        }
        picture.map(Unknown::Picture)
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
    over: Option<&'static str>,
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

        // Text: every visible element with its own text, outside the ignored regions.
        let texts: Vec<&Text> = self.texts.iter().filter(|t| self.outside[t.e] && self.shown[t.e]).collect();

        // Contrast (RX-A11Y-01) and size (RX-A11Y-02), grouped so one style used 40 times is one finding.
        let mut small: Vec<(f64, usize, usize)> = Vec::new();
        let mut failing: Vec<Fail> = Vec::new();
        // texts over an image or a gradient, judged on the pixels the page sends back, and texts not measured
        let mut behind: Vec<(usize, Colour, f64, &'static str)> = Vec::new();
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
                    Some(Unknown::Picture(over)) if behind.len() < MAX_BEHIND => behind.push((k, fg_raw, need, over)),
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
        let Some(answers) = answers else {
            if !failing.is_empty() || !textareas.is_empty() || !behind.is_empty() {
                return json!({ "ask": {
                    "under": failing.iter().map(|f| texts[f.k].i).collect::<Vec<_>>(),
                    "grow": textareas,
                    "behind": behind.iter().map(|b| texts[b.0].i).collect::<Vec<_>>(),
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
            let mut seen: Vec<(f64, Colour, Colour)> = pixels
                .iter()
                .map(|&p| {
                    let shown = blend([fg_raw[0], fg_raw[1], fg_raw[2], fade], p);
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
        self.rest(out, texts, failing, &answers["grow"], small, unmeasured)
    }
}

impl<'a> Page<'a> {
    fn rest(&self, mut out: Vec<Value>, texts: Vec<&Text>, failing: Vec<Fail>, grow: &Value, small: Vec<(f64, usize, usize)>, unmeasured: Vec<usize>) -> Value {
        let (vw, vh) = (self.vw, self.vh);
        let n = self.els.len();
        let mut groups: Vec<(String, Group)> = Vec::new();
        for Fail { k, ratio, fg, bg, need, over } in failing {
            let key = format!("{}|{}|{}|{}", hex(fg), hex(bg), num_str(need), over.unwrap_or(""));
            match groups.iter_mut().find(|g| g.0 == key) {
                Some(g) => g.1.count += 1,
                None => groups.push((key, Group { t: k, count: 1, ratio, fg, bg, need, over })),
            }
        }
        for (_, g) in &groups {
            let t = texts[g.t];
            let more = if g.count > 1 { format!("; {} more with the same colors", g.count - 1) } else { String::new() };
            let colours = match g.over {
                None => format!("{} on {}", hex(g.fg), hex(g.bg)),
                Some(over) => format!("{} on {}, the weakest tenth of the {over} behind it", hex(g.fg), hex(g.bg)),
            };
            out.push(finding("RX-A11Y-01", "fail", self.selector(t.e), format!("{}: contrast {}:1 ({colours}), needs {}:1{more}", quote(t.x), crate::audit::ratio_text(g.ratio, g.need), num_str(g.need))));
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
                format!("{count} not measured for contrast (under a blend mode or a filter, over a picture the page could not photograph (out of view, or redrawn by the page), or past the {MAX_BEHIND} measured), first {}: check them by eye over the busiest part of what is behind", quote(t.x)),
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
}
