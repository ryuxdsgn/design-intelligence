//! The canvas audit: the port of `packages/cli/src/figma-audit.ts`, over a canvas stored as plain JSON
//! (`fixtures/checks/audit.json` shows the shape). It returns the same counts, findings, and gate line;
//! comments here name only what differs from the TypeScript in form, not in result.

use crate::js::{len16, mixed, num, num_or, num_str, round, slice16, string, to_fixed, trim, truthy};
use regex::Regex;
use serde_json::{json, Map, Value};
use std::collections::{HashMap, HashSet};
use std::sync::OnceLock;

/// A JavaScript regex as the TypeScript writes it: `\b` is an ASCII word boundary, `i` ignores case.
fn re(pattern: &str) -> Regex {
    Regex::new(&format!("(?i){}", pattern.replace(r"\b", r"(?-u:\b)"))).expect("audit regex")
}

struct Res {
    busy: Regex,
    quiet: Regex,
    overlay: Regex,
    bar: Regex,
    target: Regex,
    pinned: Regex,
    chrome: Regex,
    scrim: Regex,
    row: Regex,
    link: Regex,
    button: Regex,
    button_loose: Regex,
    choice: Regex,
    icon: Regex,
    heavy: Regex,
    letters: Regex,
    ellipsis: Regex,
}

impl Res {
    fn new() -> Self {
        Res {
            busy: re(r"\b(processing|paying|confirming|loading|sending|saving|booking|submitting|verifying|memproses|membayar|memuat|menyimpan|mengirim|memverifikasi)\b"),
            quiet: re(r"^(cancel|batal|back|kembali|close|tutup|done|selesai)$"),
            overlay: re(r"\b(sheet|dialog|modal|toast|snackbar|popover|alert|popup|pop-up|tooltip|menu)\b"),
            bar: re(r"\b(bar|footer|toolbar|tabbar|header|sticky)\b"),
            target: re(r"\b(button|btn|cta|chip|tab|toggle|switch|checkbox|radio|seat|link|stepper|icon ?button|back|close)\b"),
            pinned: re(r"\b(bar|footer|toolbar|tabbar|header|sticky|sheet|dialog|modal|toast|snackbar|popover|scrim|backdrop|dim|keyboard|status ?bar|home ?indicator|background|bg)\b"),
            chrome: re(r"\b(keyboard|status ?bar|home ?indicator)\b"),
            scrim: re(r"\b(scrim|backdrop|dim)\b"),
            row: re(r"\b(row|item|option|cell|card|method|list ?item)\b"),
            link: re(r"^(remove|change|edit|delete|cancel|see all|view all|view bag|hapus|ubah|ganti|batal|lihat semua)$"),
            button: re(r"\b(button|btn|cta)\b"),
            button_loose: re(r"button|btn|cta"),
            choice: re(r"\b(option|method|choice|radio|input|field|search)\b"),
            icon: re(r"\bicon\b"),
            heavy: re(r"bold|black|heavy|semi"),
            letters: Regex::new(r"\p{L}{2}").unwrap(),
            ellipsis: Regex::new(r"(…|\.\.\.)$").unwrap(),
        }
    }
}

#[derive(Clone, Copy)]
struct Rect {
    x: f64,
    y: f64,
    w: f64,
    h: f64,
}

/// Every node of the canvas in one arena, so a node has an identity (its index) the way an object does.
struct Tree<'a> {
    v: Vec<&'a Value>,
    kids: Vec<Option<Vec<usize>>>,
}

impl<'a> Tree<'a> {
    fn add(&mut self, n: &'a Value) -> usize {
        let i = self.v.len();
        self.v.push(n);
        self.kids.push(None);
        if let Some(Value::Array(cs)) = n.get("children") {
            let ids = cs.iter().map(|c| self.add(c)).collect();
            self.kids[i] = Some(ids);
        }
        i
    }
    fn get(&self, i: usize, k: &str) -> Option<&'a Value> {
        self.v[i].get(k)
    }
    fn has(&self, i: usize, k: &str) -> bool {
        self.v[i].as_object().map_or(false, |o| o.contains_key(k))
    }
    fn ty(&self, i: usize) -> &'a str {
        self.get(i, "type").and_then(Value::as_str).unwrap_or("")
    }
    fn name(&self, i: usize) -> String {
        string(self.get(i, "name"))
    }
    fn visible(&self, i: usize) -> bool {
        self.get(i, "visible") != Some(&Value::Bool(false))
    }
    fn chars(&self, i: usize) -> String {
        match self.get(i, "characters") {
            Some(Value::String(s)) => s.clone(),
            _ => String::new(),
        }
    }
    fn bx(&self, i: usize) -> Rect {
        let b = self.get(i, "absoluteBoundingBox");
        let src = if truthy(b) { b.unwrap() } else { self.v[i] };
        Rect { x: num(src.get("x")), y: num(src.get("y")), w: num(src.get("width")), h: num(src.get("height")) }
    }
    /// `findAll`: every descendant, hidden ones too, in pre-order.
    fn find_all(&self, i: usize, f: &mut dyn FnMut(usize) -> bool) -> Vec<usize> {
        let mut out = Vec::new();
        let mut stack: Vec<usize> = self.kids[i].iter().flatten().rev().copied().collect();
        while let Some(c) = stack.pop() {
            if f(c) {
                out.push(c);
            }
            if let Some(ks) = &self.kids[c] {
                stack.extend(ks.iter().rev());
            }
        }
        out
    }
    /// The descendants on screen: like `find_all`, but a hidden layer and all it holds are left out.
    fn find_shown(&self, i: usize, f: &mut dyn FnMut(usize) -> bool) -> Vec<usize> {
        let mut out = Vec::new();
        let mut stack: Vec<usize> = self.kids[i].iter().flatten().rev().copied().collect();
        while let Some(c) = stack.pop() {
            if !self.visible(c) {
                continue;
            }
            if f(c) {
                out.push(c);
            }
            if let Some(ks) = &self.kids[c] {
                stack.extend(ks.iter().rev());
            }
        }
        out
    }
    fn has_components(&self, i: usize) -> bool {
        self.kids[i].is_some() && !self.find_all(i, &mut |n| matches!(self.ty(n), "COMPONENT" | "COMPONENT_SET")).is_empty()
    }
}

fn visible_paints(v: Option<&Value>) -> Vec<&Value> {
    match v {
        Some(Value::Array(ps)) => ps.iter().filter(|p| p.get("visible") != Some(&Value::Bool(false))).collect(),
        _ => Vec::new(),
    }
}

fn short(s: &str, n: usize) -> String {
    if len16(s) > n { format!("{}…", slice16(s, 0, Some(n - 1))) } else { s.to_string() }
}

fn contains(b: Rect, x: f64, y: f64) -> bool {
    x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h
}

fn overlap(a: Rect, b: Rect) -> f64 {
    jsmax0(min_js(a.x + a.w, b.x + b.w) - max_js(a.x, b.x)) * jsmax0(min_js(a.y + a.h, b.y + b.h) - max_js(a.y, b.y))
}

// Math.min/max return NaN when either side is NaN; f64::min/max do not.
pub(crate) fn min_js(a: f64, b: f64) -> f64 {
    if a.is_nan() || b.is_nan() { f64::NAN } else { a.min(b) }
}
pub(crate) fn max_js(a: f64, b: f64) -> f64 {
    if a.is_nan() || b.is_nan() { f64::NAN } else { a.max(b) }
}
fn jsmax0(a: f64) -> f64 {
    max_js(0.0, a)
}

fn inside(a: Rect, b: Rect) -> bool {
    a.x >= b.x && a.y >= b.y && a.x + a.w <= b.x + b.w && a.y + a.h <= b.y + b.h
}

/// A colour: channels from 0 to 1 here; the rendered checks (probe.rs) keep 0 to 255, which `over` does not mind.
#[derive(Clone, Copy)]
pub(crate) struct Rgb {
    pub r: f64,
    pub g: f64,
    pub b: f64,
}

fn rgb(v: Option<&Value>) -> Rgb {
    let v = v.unwrap_or(&Value::Null);
    Rgb { r: num(v.get("r")), g: num(v.get("g")), b: num(v.get("b")) }
}
/// Relative luminance of channels from 0 to 1. `knee` is where the sRGB curve turns linear: 0.03928 in WCAG 2.0,
/// as the canvas audit was written; the rendered checks use sRGB's own 0.04045.
pub(crate) fn luminance(k: Rgb, knee: f64) -> f64 {
    let lin = |v: f64| if v <= knee { v / 12.92 } else { ((v + 0.055) / 1.055).powf(2.4) };
    0.2126 * lin(k.r) + 0.7152 * lin(k.g) + 0.0722 * lin(k.b)
}
/// The contrast ratio of two luminances, the lighter one on top.
pub(crate) fn contrast(p: f64, q: f64) -> f64 {
    // [p, q].sort((p, q) => q - p): a NaN comparison leaves the order as it is.
    let (x, y) = if q - p > 0.0 { (q, p) } else { (p, q) };
    (x + 0.05) / (y + 0.05)
}
fn ratio(a: Rgb, b: Rgb) -> f64 {
    contrast(luminance(a, 0.03928), luminance(b, 0.03928))
}
/// `top` with opacity `a` over `under`.
pub(crate) fn over(top: Rgb, a: f64, under: Rgb) -> Rgb {
    Rgb { r: top.r * a + under.r * (1.0 - a), g: top.g * a + under.g * (1.0 - a), b: top.b * a + under.b * (1.0 - a) }
}

struct Entry {
    n: usize,
    a: f64,
    inst: bool,
    anc: Vec<usize>,
}

const COUNTS: [&str; 25] = [
    "screens", "imageFills", "distinctImages", "reusedImages", "contrastFails", "contrastUnknown", "targetsUnder24", "targetsUnder44", "cutText", "clippedText",
    "flatOverlays", "idleBusyButtons", "unstyledText", "unboundFills", "unboundSpacing", "layoutScreens", "looseLayers", "strayLayers", "rawEffects", "emptyBands",
    "capsLabels", "cards", "smallText", "texts", "unevenRows",
];

struct Out {
    findings: Vec<Value>,
    c: HashMap<&'static str, i64>,
}

impl Out {
    fn add(&mut self, rule: &str, level: &str, frame: &str, node: &str, message: String) {
        self.findings.push(json!({ "rule": rule, "level": level, "frame": frame, "node": node, "message": message }));
    }
    fn inc(&mut self, k: &'static str, by: i64) {
        *self.c.get_mut(k).unwrap() += by;
    }
}

/// Audit one page of a recorded canvas: `{ pages: [{ name, children }], current, page, annotationCategories }`.
pub fn audit(input: &Value) -> Value {
    let mut t = Tree { v: Vec::new(), kids: Vec::new() };
    let empty = Vec::new();
    let pages_v = input.get("pages").and_then(Value::as_array).unwrap_or(&empty);
    let pages: Vec<(String, Vec<usize>)> = pages_v
        .iter()
        .map(|p| (string(p.get("name")), p.get("children").and_then(Value::as_array).map_or(Vec::new(), |cs| cs.iter().map(|c| t.add(c)).collect())))
        .collect();
    let page_name = input.get("page").and_then(Value::as_str).unwrap_or("");
    let current = input.get("current").and_then(Value::as_str).unwrap_or("");
    let page = if !page_name.is_empty() {
        pages.iter().find(|p| p.0 == page_name)
    } else {
        pages.iter().find(|p| p.0 == current).or(pages.first())
    };
    let Some((pname, proots)) = page else {
        let all: Vec<&str> = pages.iter().map(|p| p.0.as_str()).collect();
        return json!({ "error": format!("no page named \"{}\"; pages: {}", page_name, all.join(", ")) });
    };
    static RES: OnceLock<Res> = OnceLock::new();
    let r = RES.get_or_init(Res::new);
    // the page's layers, with sections (and sections in sections) opened
    fn open(t: &Tree, n: usize, out: &mut Vec<usize>) {
        if t.ty(n) == "SECTION" {
            for &k in t.kids[n].iter().flatten() {
                open(t, k, out);
            }
        } else {
            out.push(n);
        }
    }
    let mut flat: Vec<usize> = Vec::new();
    for &n in proots.iter() {
        open(&t, n, &mut flat);
    }
    let screens: Vec<usize> = flat.iter().copied().filter(|&n| t.ty(n) == "FRAME" && t.visible(n) && !t.has_components(n)).collect();

    let mut o = Out { findings: Vec::new(), c: COUNTS.iter().map(|k| (*k, 0)).collect() };
    o.c.insert("screens", screens.len() as i64);
    let mut images: Vec<(String, Vec<String>)> = Vec::new();

    for &frame in &screens {
        let fname = t.name(frame);
        let mut nodes: Vec<Entry> = Vec::new();
        fn walk(t: &Tree, n: usize, alpha: f64, inst: bool, anc: Vec<usize>, out: &mut Vec<Entry>) {
            if !t.visible(n) {
                return;
            }
            let a = alpha * match t.get(n, "opacity") { Some(Value::Number(x)) => x.as_f64().unwrap(), _ => 1.0 };
            out.push(Entry { n, a, inst, anc: anc.clone() });
            if let Some(ks) = &t.kids[n] {
                let mut next = anc;
                next.push(n);
                for &k in ks {
                    walk(t, k, a, inst || t.ty(n) == "INSTANCE", next.clone(), out);
                }
            }
        }
        walk(&t, frame, 1.0, false, Vec::new(), &mut nodes);
        let order: HashMap<usize, usize> = nodes.iter().enumerate().map(|(i, e)| (e.n, i)).rev().collect();
        let mut names: HashMap<usize, String> = HashMap::new();
        for e in &nodes {
            if t.ty(e.n) != "INSTANCE" || !t.has(e.n, "mainComponent") {
                continue;
            }
            if let Some(mc) = t.get(e.n, "mainComponent").filter(|m| truthy(Some(m))) {
                let p = mc.get("parent").filter(|p| truthy(Some(p)));
                let label = match p {
                    Some(p) if p.get("type").and_then(Value::as_str) == Some("COMPONENT_SET") => string(p.get("name")),
                    _ => string(mc.get("name")),
                };
                names.insert(e.n, format!("{} {}", t.name(e.n), label));
            }
        }
        let nm = |n: usize| names.get(&n).cloned().unwrap_or_else(|| t.name(n));
        let layout_none = |n: usize| !truthy(t.get(n, "layoutMode")) || t.get(n, "layoutMode").and_then(Value::as_str) == Some("NONE");

        // Construction (RX-DS-12).
        let fbox = t.bx(frame);
        let loose: Vec<usize> = nodes
            .iter()
            .filter(|e| {
                if e.n == frame || e.inst {
                    return false;
                }
                let Some(&parent) = e.anc.last() else { return false };
                let free = t.ty(parent) == "GROUP" || (t.has(parent, "layoutMode") && layout_none(parent));
                if !free || r.pinned.is_match(&nm(e.n)) || e.anc.iter().any(|&a| a != frame && r.chrome.is_match(&nm(a))) {
                    return false;
                }
                if !layout_none(e.n) {
                    return false;
                }
                let b = t.bx(e.n);
                !(b.w >= fbox.w * 0.9 && b.h >= fbox.h * 0.9)
            })
            .map(|e| e.n)
            .collect();
        o.inc("looseLayers", loose.len() as i64);
        if loose.len() <= 2 {
            o.inc("layoutScreens", 1);
        } else {
            let level = if loose.len() > 5 { "fail" } else { "warn" };
            o.add("RX-DS-12", level, &fname, &t.name(loose[0]), format!("{} layers placed by x and y outside auto layout (e.g. \"{}\"); build the screen from auto layout sections", loose.len(), short(&t.name(loose[0]), 30)));
        }
        for e in &nodes {
            if e.n == frame || e.inst {
                continue;
            }
            if let Some(Value::Array(fx)) = t.get(e.n, "effects") {
                if fx.iter().any(|x| x.get("visible") != Some(&Value::Bool(false))) && !truthy(t.get(e.n, "effectStyleId")) {
                    o.inc("rawEffects", 1);
                }
            }
        }
        let text_of = |n: usize| -> String {
            if t.kids[n].is_some() {
                let parts: Vec<String> = t.find_shown(n, &mut |x| t.ty(x) == "TEXT" && t.visible(x)).iter().map(|&x| string(t.get(x, "characters"))).collect();
                trim(&parts.join(" ")).to_string()
            } else {
                let c = t.get(n, "characters");
                trim(&if truthy(c) { string(c) } else { String::new() }).to_string()
            }
        };
        let opaque = |e: &Entry| e.a >= 0.9 && visible_paints(t.get(e.n, "fills")).iter().any(|p| p.get("type").and_then(Value::as_str) != Some("SOLID") || num_or(p.get("opacity"), 1.0) >= 0.9);

        for e in &nodes {
            let n = e.n;
            for p in visible_paints(t.get(n, "fills")) {
                if p.get("type").and_then(Value::as_str) == Some("IMAGE") && truthy(p.get("imageHash")) {
                    o.inc("imageFills", 1);
                    let h = string(p.get("imageHash"));
                    let pos = match images.iter().position(|x| x.0 == h) {
                        Some(i) => i,
                        None => {
                            images.push((h, Vec::new()));
                            images.len() - 1
                        }
                    };
                    if !images[pos].1.contains(&fname) {
                        images[pos].1.push(fname.clone());
                    }
                }
            }
            if !e.inst && n != frame {
                if t.ty(n) == "TEXT" && t.get(n, "textStyleId") == Some(&Value::String(String::new())) {
                    o.inc("unstyledText", 1);
                }
                if visible_paints(t.get(n, "fills")).iter().any(|p| p.get("type").and_then(Value::as_str) == Some("SOLID") && !(truthy(p.get("boundVariables")) && truthy(p.get("boundVariables").unwrap().get("color")))) {
                    o.inc("unboundFills", 1);
                }
                if !layout_none(n) && (num(t.get(n, "itemSpacing")) > 0.0 || num(t.get(n, "paddingLeft")) > 0.0 || num(t.get(n, "paddingTop")) > 0.0) {
                    let bv = t.get(n, "boundVariables").filter(|b| truthy(Some(b)));
                    let has = |k: &str| bv.map_or(false, |b| truthy(b.get(k)));
                    if !has("itemSpacing") && !has("paddingLeft") && !has("paddingTop") {
                        o.inc("unboundSpacing", 1);
                    }
                }
            }
        }

        // Contrast (RX-A11Y-01).
        for e in &nodes {
            let n = e.n;
            if t.ty(n) != "TEXT" || trim(&t.chars(n)).is_empty() || mixed(t.get(n, "fills")) || mixed(t.get(n, "fontSize")) {
                continue;
            }
            let ps = visible_paints(t.get(n, "fills"));
            let solid: Vec<&&Value> = ps.iter().filter(|p| p.get("type").and_then(Value::as_str) == Some("SOLID")).collect();
            if solid.is_empty() {
                continue;
            }
            let b = t.bx(n);
            let (cx, cy) = (b.x + b.w / 2.0, b.y + b.h / 2.0);
            let mut bg = Rgb { r: 1.0, g: 1.0, b: 1.0 };
            let mut unknown = false;
            for u in &nodes[..order[&n]] {
                if t.ty(u.n) == "TEXT" || !contains(t.bx(u.n), cx, cy) {
                    continue;
                }
                for p in visible_paints(t.get(u.n, "fills")) {
                    let a = num_or(p.get("opacity"), 1.0) * u.a;
                    if p.get("type").and_then(Value::as_str) == Some("SOLID") {
                        bg = over(rgb(p.get("color")), a, bg);
                        if a >= 0.99 {
                            unknown = false;
                        }
                    } else if a >= 0.5 {
                        unknown = true;
                    }
                }
            }
            if unknown {
                o.inc("contrastUnknown", 1);
                continue;
            }
            // the fills bottom to top, so the top one shows; the layer's opacity fades them together
            let fg = if solid.len() == 1 {
                over(rgb(solid[0].get("color")), num_or(solid[0].get("opacity"), 1.0) * e.a, bg)
            } else {
                let paint = solid.iter().fold(bg, |c, p| over(rgb(p.get("color")), num_or(p.get("opacity"), 1.0), c));
                over(paint, e.a, bg)
            };
            let style = if mixed(t.get(n, "fontName")) { String::new() } else { string(t.get(n, "fontName").and_then(|f| f.get("style"))) };
            let fs = num(t.get(n, "fontSize"));
            let large = fs >= 24.0 || (fs >= 18.66 && r.heavy.is_match(&style));
            let rt = ratio(fg, bg);
            let need = if large { 3.0 } else { 4.5 };
            if rt < need {
                o.inc("contrastFails", 1);
                o.add("RX-A11Y-01", "fail", &fname, &t.name(n), format!("\"{}\" {}:1, needs {}:1", short(&t.chars(n), 40), to_fixed(rt, 2), num_str(need)));
            }
        }

        // Text cut by a bar, or clipped (RX-QA-03).
        let bars: Vec<&Entry> = nodes.iter().filter(|e| e.n != frame && t.ty(e.n) != "TEXT" && r.bar.is_match(&nm(e.n)) && opaque(e)).collect();
        for e in &nodes {
            let n = e.n;
            if t.ty(n) != "TEXT" || trim(&t.chars(n)).is_empty() {
                continue;
            }
            let b = t.bx(n);
            let area = { let x = b.w * b.h; if x == 0.0 || x.is_nan() { 1.0 } else { x } };
            for bar in &bars {
                if order[&bar.n] <= order[&n] || e.anc.contains(&bar.n) {
                    continue;
                }
                let f = overlap(b, t.bx(bar.n)) / area;
                if f > 0.02 && f < 0.98 {
                    o.inc("cutText", 1);
                    o.add("RX-QA-03", "fail", &fname, &t.name(n), format!("\"{}\" is cut by \"{}\" ({}% covered)", short(&t.chars(n), 40), t.name(bar.n), num_str(round(f * 100.0))));
                    break;
                }
            }
            if let Some(&clip) = e.anc.iter().skip(1).rev().find(|&&a| truthy(t.get(a, "clipsContent"))) {
                let f = overlap(b, t.bx(clip)) / area;
                if f > 0.02 && f < 0.98 {
                    o.inc("clippedText", 1);
                    o.add("RX-QA-03", "warn", &fname, &t.name(n), format!("\"{}\" is clipped by \"{}\"", short(&t.chars(n), 40), t.name(clip)));
                }
            }
        }

        // Overlays (RX-UI-15).
        let outermost = |rx: &Regex| -> Vec<usize> {
            (0..nodes.len()).filter(|&i| {
                let e = &nodes[i];
                e.n != frame && t.ty(e.n) != "TEXT" && rx.is_match(&nm(e.n)) && !e.anc.iter().any(|&a| a != frame && rx.is_match(&nm(a)))
            }).collect()
        };
        let scrims: Vec<usize> = (0..nodes.len()).filter(|&i| {
            let e = &nodes[i];
            let b = t.bx(e.n);
            e.n != frame && r.scrim.is_match(&nm(e.n)) && b.w >= fbox.w * 0.9 && b.h >= fbox.h * 0.9
        }).collect();
        let mut after: Vec<usize> = Vec::new();
        for &si in &scrims {
            let sc = &nodes[si];
            let sibs = sc.anc.last().and_then(|&p| t.kids[p].clone()).unwrap_or_default();
            if let Some(pos) = sibs.iter().position(|&x| x == sc.n) {
                for &s in &sibs[pos + 1..] {
                    if let Some(i) = nodes.iter().position(|x| x.n == s) {
                        after.push(i);
                    }
                }
            }
        }
        let mut seen = HashSet::new();
        let overlays: Vec<usize> = outermost(&r.overlay).into_iter().chain(after).filter(|i| seen.insert(*i)).filter(|&i| t.ty(nodes[i].n) != "TEXT" && !scrims.contains(&i)).collect();
        let lifted = |m: usize| {
            matches!(t.get(m, "effects"), Some(Value::Array(fx)) if fx.iter().any(|x| x.get("type").and_then(Value::as_str) == Some("DROP_SHADOW") && x.get("visible") != Some(&Value::Bool(false))))
                || !visible_paints(t.get(m, "strokes")).is_empty()
        };
        for &i in &overlays {
            let n = nodes[i].n;
            let b = t.bx(n);
            if b.w >= fbox.w * 0.98 && b.h >= fbox.h * 0.95 {
                continue;
            }
            let first = t.kids[n].as_ref().and_then(|k| k.first().copied());
            if !lifted(n) && !first.map_or(false, |f| t.ty(f) == "RECTANGLE" && lifted(f)) {
                o.inc("flatOverlays", 1);
                o.add("RX-UI-15", "warn", &fname, &t.name(n), format!("overlay \"{}\" has no shadow or border to lift it from what is under it", t.name(n)));
            }
        }

        // Targets and text links (RX-A11Y-02).
        let is_target = |m: usize| r.target.is_match(&nm(m)) && !r.row.is_match(&nm(m));
        let candidates: Vec<usize> = (0..nodes.len()).filter(|&i| nodes[i].n != frame && t.ty(nodes[i].n) != "TEXT" && is_target(nodes[i].n)).collect();
        let group = |n: usize| candidates.iter().filter(|&&k| nodes[k].anc.contains(&n)).count() >= 2;
        let is_one = |n: usize| is_target(n) && !group(n);
        let named: Vec<usize> = candidates.iter().copied().filter(|&i| !group(nodes[i].n) && !nodes[i].anc.iter().any(|&a| a != frame && is_one(a))).collect();
        let targets: Vec<usize> = named.iter().copied().filter(|&i| {
            !named.iter().any(|&j| j != i && inside(t.bx(nodes[i].n), t.bx(nodes[j].n)) && !inside(t.bx(nodes[j].n), t.bx(nodes[i].n)))
        }).collect();
        let held = |i: usize| {
            nodes[i].anc.iter().any(|&a| {
                let b = t.bx(a);
                a != frame && r.row.is_match(&nm(a)) && min_js(b.w, b.h) >= 44.0 && targets.iter().filter(|&&k| nodes[k].anc.contains(&a)).count() == 1
            })
        };
        let mut hits: Vec<usize> = targets.iter().copied().filter(|&i| !held(i)).map(|i| nodes[i].n).collect();
        for e in &nodes {
            if t.ty(e.n) != "TEXT" || !r.link.is_match(trim(&{ let c = t.get(e.n, "characters"); if truthy(c) { string(c) } else { String::new() } })) || e.anc.iter().any(|&a| a != frame && is_target(a)) {
                continue;
            }
            let mut hit = e.n;
            let mut i = e.anc.len() as isize - 1;
            while i >= 0 {
                let a = e.anc[i as usize];
                if a == frame || t.kids[a].as_ref().map_or(true, |k| k.len() != 1) {
                    break;
                }
                hit = a;
                i -= 1;
            }
            hits.push(hit);
        }
        struct Small {
            n: usize,
            size: String,
            m: f64,
            count: i64,
            kind: String,
        }
        let mut small: Vec<(String, Small)> = Vec::new();
        for n in hits {
            let b = t.bx(n);
            let m = min_js(b.w, b.h);
            if m >= 44.0 {
                continue;
            }
            if m < 24.0 { o.inc("targetsUnder24", 1) } else { o.inc("targetsUnder44", 1) }
            let kind = if names.contains_key(&n) { slice16(&nm(n), len16(&t.name(n)) + 1, None) } else { t.name(n) };
            let size = format!("{}x{}", num_str(round(b.w)), num_str(round(b.h)));
            let key = format!("{kind}|{size}");
            match small.iter_mut().find(|s| s.0 == key) {
                Some(s) => s.1.count += 1,
                None => small.push((key, Small { n, size, m, count: 1, kind })),
            }
        }
        for (_, g) in &small {
            let who = if g.count > 1 { format!("\"{}\" and {} more ({})", t.name(g.n), g.count - 1, g.kind) } else { format!("\"{}\"", t.name(g.n)) };
            let lim = if g.m < 24.0 { 24 } else { 44 };
            o.add("RX-A11Y-02", if g.m < 24.0 { "fail" } else { "warn" }, &fname, &t.name(g.n), format!("{} {}, under {}x{}", who, g.size, lim, lim));
        }

        // Visual tells.
        let own: Vec<&Entry> = nodes.iter().filter(|e| e.n != frame && !e.inst).collect();
        let texts: Vec<usize> = own.iter().filter(|e| t.ty(e.n) == "TEXT" && !trim(&t.chars(e.n)).is_empty() && !mixed(t.get(e.n, "fontSize"))).map(|e| e.n).collect();
        let caps: Vec<usize> = texts.iter().copied().filter(|&n| {
            let s = trim(&t.chars(n)).to_string();
            num(t.get(n, "fontSize")) <= 13.0 && len16(&s) <= 32 && r.letters.is_match(&s) && (t.get(n, "textCase").and_then(Value::as_str) == Some("UPPER") || s == s.to_uppercase())
        }).collect();
        o.inc("capsLabels", caps.len() as i64);
        if caps.len() > 3 {
            let shown: Vec<String> = caps.iter().take(3).map(|&n| format!("\"{}\"", short(trim(&t.chars(n)), 16))).collect();
            o.add("RX-UI-01", "warn", &fname, &t.name(caps[0]), format!("{} small uppercase labels ({}…); label a section only when its content does not say what it is", caps.len(), shown.join(", ")));
        }
        let raised = |n: usize| {
            !visible_paints(t.get(n, "strokes")).is_empty()
                || matches!(t.get(n, "effects"), Some(Value::Array(fx)) if fx.iter().any(|x| x.get("type").and_then(Value::as_str) == Some("DROP_SHADOW") && x.get("visible") != Some(&Value::Bool(false))))
        };
        let cards: Vec<usize> = own.iter().map(|e| e.n).filter(|&n| {
            let b = t.bx(n);
            let name = nm(n);
            t.ty(n) != "TEXT" && t.has(n, "cornerRadius") && !mixed(t.get(n, "cornerRadius")) && num(t.get(n, "cornerRadius")) > 0.0 && raised(n)
                && b.w >= fbox.w * 0.6 && b.h >= 40.0 && !r.pinned.is_match(&name) && !r.target.is_match(&name) && !r.overlay.is_match(&name) && !r.choice.is_match(&name)
        }).collect();
        o.inc("cards", cards.len() as i64);
        if cards.len() > 3 {
            o.add("RX-UI-01", "warn", &fname, &t.name(cards[0]), format!("{} sections in a bordered or shadowed card (\"{}\" and {} more); group with space, a heading, or one divider first", cards.len(), short(&t.name(cards[0]), 24), cards.len() - 1));
        }
        let tiny: Vec<usize> = texts.iter().copied().filter(|&n| num(t.get(n, "fontSize")) < 12.0).collect();
        o.inc("smallText", tiny.len() as i64);
        o.inc("texts", texts.len() as i64);
        if let Some(&n0) = tiny.first() {
            o.add("RX-A11Y-02", "warn", &fname, &t.name(n0), format!("{} of {} text layers under 12 px (e.g. \"{}\" {} px)", tiny.len(), texts.len(), short(trim(&t.chars(n0)), 24), num_str(num(t.get(n0, "fontSize")))));
        }
        // Empty band (RX-UI-05).
        let mut painted: Vec<(f64, f64)> = nodes.iter().filter(|e| {
            let n = e.n;
            let b = t.bx(n);
            if n == frame || e.anc.iter().any(|&a| t.ty(a) == "INSTANCE") {
                return false;
            }
            if b.w >= fbox.w * 0.9 && b.h >= fbox.h * 0.9 {
                return false;
            }
            t.ty(n) == "TEXT" || t.ty(n) == "INSTANCE" || !visible_paints(t.get(n, "fills")).is_empty() || !visible_paints(t.get(n, "strokes")).is_empty()
        }).map(|e| { let b = t.bx(e.n); (b.y - fbox.y, b.y - fbox.y + b.h) }).filter(|&(a, b)| b > 0.0 && a < fbox.h).collect();
        // A stable sort by the top edge, as Array.prototype.sort is.
        painted.sort_by(|p, q| p.0.partial_cmp(&q.0).unwrap_or(std::cmp::Ordering::Equal));
        let mut reach = painted.first().map_or(0.0, |p| p.1);
        let (mut band_h, mut band_at) = (0.0f64, 0.0f64);
        for &(a, b) in painted.iter().skip(1) {
            if a - reach > band_h {
                band_h = a - reach;
                band_at = reach;
            }
            reach = max_js(reach, b);
        }
        if band_h >= 96.0 {
            o.inc("emptyBands", 1);
            o.add("RX-UI-05", "warn", &fname, "", format!("an empty band {} pt tall from y {}; move the blocks together, give the space a job, or let the content fill it", num_str(round(band_h)), num_str(round(band_at))));
        }
        // Buttons in one row (RX-UI-15).
        let buttons = outermost(&r.button);
        let mut rows: Vec<(Option<usize>, Vec<usize>)> = Vec::new();
        for &i in &buttons {
            let parent = nodes[i].anc.last().copied();
            match rows.iter_mut().find(|x| x.0 == parent) {
                Some(x) => x.1.push(nodes[i].n),
                None => rows.push((parent, vec![nodes[i].n])),
            }
        }
        let cy = |n: usize| { let b = t.bx(n); b.y + b.h / 2.0 };
        let label = |n: usize| -> Option<usize> {
            if t.kids[n].is_none() { return None; }
            t.find_shown(n, &mut |x| t.ty(x) == "TEXT" && t.visible(x) && !trim(&string(t.get(x, "characters"))).is_empty()).first().copied()
        };
        let icon = |n: usize| t.kids[n].is_some() && !t.find_shown(n, &mut |x| t.visible(x) && (matches!(t.ty(x), "VECTOR" | "BOOLEAN_OPERATION") || r.icon.is_match(&t.name(x)))).is_empty();
        let spread = |xs: &[f64]| xs.iter().copied().fold(f64::NEG_INFINITY, max_js) - xs.iter().copied().fold(f64::INFINITY, min_js);
        for (_, row) in &rows {
            let line: Vec<usize> = row.iter().copied().filter(|&n| row.iter().any(|&o2| o2 != n && (cy(o2) - cy(n)).abs() < 8.0)).collect();
            if line.len() < 2 {
                continue;
            }
            let hs: Vec<f64> = line.iter().map(|&n| t.bx(n).h).collect();
            let ms: Vec<f64> = line.iter().filter_map(|&n| label(n)).map(cy).collect();
            let is: Vec<bool> = line.iter().map(|&n| icon(n)).collect();
            let mut why: Vec<String> = Vec::new();
            if spread(&hs) > 2.0 { why.push("heights differ".into()); }
            if ms.len() > 1 && spread(&ms) > 2.0 { why.push(format!("labels {} px apart", num_str(round(spread(&ms))))); }
            if is.iter().any(|&b| b) && !is.iter().all(|&b| b) { why.push("an icon in some, not all".into()); }
            if !why.is_empty() {
                o.inc("unevenRows", 1);
                let names_v: Vec<String> = line.iter().map(|&n| format!("\"{}\"", short(&label(n).map_or_else(|| t.name(n), |l| trim(&t.chars(l)).to_string()), 14))).collect();
                o.add("RX-UI-15", "warn", &fname, &t.name(line[0]), format!("buttons in one row ({}): {}", names_v.join(", "), why.join(", ")));
            }
        }
        // A busy screen whose button keeps its idle label (RX-IX-02).
        let busy = nodes.iter().any(|e| t.ty(e.n) == "TEXT" && r.busy.is_match(&string(t.get(e.n, "characters"))) && !e.anc.iter().any(|&a| r.button_loose.is_match(&nm(a))));
        if busy {
            for &i in &buttons {
                let n = nodes[i].n;
                let l = text_of(n);
                if !l.is_empty() && !r.quiet.is_match(&l) && !r.busy.is_match(&l) && !r.ellipsis.is_match(&l) {
                    o.inc("idleBusyButtons", 1);
                    o.add("RX-IX-02", "warn", &fname, &t.name(n), format!("the screen says it is busy but \"{}\" keeps its idle label", short(&l, 40)));
                }
            }
        }
    }

    // Layers on the page outside the screens.
    for &n in &flat {
        if screens.contains(&n) || matches!(t.ty(n), "COMPONENT" | "COMPONENT_SET") || t.has_components(n) || !t.visible(n) {
            continue;
        }
        o.inc("strayLayers", 1);
        o.add("RX-DS-12", "warn", pname, &t.name(n), format!("\"{}\" sits on the page outside the screens; delete it or move it into the parts frame", short(&t.name(n), 30)));
    }
    o.c.insert("distinctImages", images.len() as i64);
    o.c.insert("reusedImages", images.iter().filter(|x| x.1.len() > 1).count() as i64);

    let mut annotations: Map<String, Value> = Map::new();
    match input.get("annotationCategories") {
        Some(Value::Array(cats)) => {
            let label = |id: Option<&Value>| cats.iter().rfind(|k| k.get("id") == id && id.is_some()).map(|k| k.get("label"));
            for &f in &screens {
                let mut all = vec![f];
                if t.kids[f].is_some() {
                    all.extend(t.find_all(f, &mut |_| true));
                }
                for n in all {
                    if let Some(Value::Array(ans)) = t.get(n, "annotations") {
                        for a in ans {
                            let l = label(a.get("categoryId")).flatten();
                            let k = if truthy(l) { string(l) } else { "uncategorised".to_string() };
                            let v = annotations.get(&k).and_then(Value::as_i64).unwrap_or(0) + 1;
                            annotations.insert(k, json!(v));
                        }
                    }
                }
            }
        }
        _ => {
            annotations.insert("unreadable".into(), json!(1));
        }
    }

    let fails = o.findings.iter().filter(|f| f["level"] == "fail").count();
    let c = &o.c;
    let ann = if annotations.is_empty() { "none".to_string() } else { annotations.iter().map(|(k, v)| format!("{k} {v}")).collect::<Vec<_>>().join(", ") };
    let gate = format!(
        "figma audit ({}): screens {} · images {} distinct, {} fills, {} reused across screens · contrast fails {} ({} over images, not measured) · text cut {}, clipped {} · targets under 24 {}, under 44 {} · overlays with no lift {} · busy buttons with idle label {} · unstyled text {}, unbound fills {}, unbound spacing {} · built in auto layout {}/{} screens, loose layers {}, layers outside the screens {}, effects without a style {} · empty bands {}, small uppercase labels {}, section cards {}, text under 12 px {}/{}, uneven button rows {} · annotations {} · {} fail, {} warn",
        pname, c["screens"], c["distinctImages"], c["imageFills"], c["reusedImages"], c["contrastFails"], c["contrastUnknown"], c["cutText"], c["clippedText"],
        c["targetsUnder24"], c["targetsUnder44"], c["flatOverlays"], c["idleBusyButtons"], c["unstyledText"], c["unboundFills"], c["unboundSpacing"],
        c["layoutScreens"], c["screens"], c["looseLayers"], c["strayLayers"], c["rawEffects"], c["emptyBands"], c["capsLabels"], c["cards"], c["smallText"], c["texts"], c["unevenRows"],
        ann, fails, o.findings.len() - fails
    );
    let mut counts = Map::new();
    for k in COUNTS {
        counts.insert(k.to_string(), json!(c[k]));
    }
    let more = o.findings.len().saturating_sub(80);
    json!({
        "page": pname,
        "screens": screens.iter().map(|&s| t.name(s)).collect::<Vec<_>>(),
        "counts": counts,
        "images": images.iter().map(|(h, s)| json!({ "image": slice16(h, 0, Some(8)), "screens": s })).collect::<Vec<_>>(),
        "annotations": annotations,
        "findings": o.findings.iter().take(80).cloned().collect::<Vec<_>>(),
        "more": more,
        "gate": gate,
    })
}
