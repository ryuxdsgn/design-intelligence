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
    /// A component sheet: more than half of its direct children are components. A screen that holds one main component
    /// (the title bar it was drawn first in) is still a screen: in a FigCraft run (Klipin, 2026-11-24) the agent built its
    /// title bar and card components inside screens 01, 04, and 06, and the audit skipped those three screens.
    fn has_components(&self, i: usize) -> bool {
        let Some(kids) = &self.kids[i] else { return false };
        let comps = kids.iter().filter(|&&n| matches!(self.ty(n), "COMPONENT" | "COMPONENT_SET")).count();
        comps > 0 && comps * 2 > kids.len()
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
/// A failing ratio to two places, cut rather than rounded when rounding would reach the need (4.495 is "4.49", not "4.50").
pub(crate) fn ratio_text(r: f64, need: f64) -> String {
    let shown = to_fixed(r, 2);
    if shown.parse::<f64>().is_ok_and(|v| v >= need) { to_fixed((r * 100.0).floor() / 100.0, 2) } else { shown }
}
pub(crate) fn over(top: Rgb, a: f64, under: Rgb) -> Rgb {
    Rgb { r: top.r * a + under.r * (1.0 - a), g: top.g * a + under.g * (1.0 - a), b: top.b * a + under.b * (1.0 - a) }
}

struct Entry {
    n: usize,
    a: f64,
    inst: bool,
    anc: Vec<usize>,
}

const COUNTS: [&str; 28] = [
    "screens", "imageFills", "distinctImages", "reusedImages", "contrastFails", "contrastUnknown", "targetsUnder24", "targetsUnder44", "cutText", "clippedText",
    "flatOverlays", "idleBusyButtons", "unstyledText", "unboundFills", "unboundSpacing", "layoutScreens", "looseLayers", "strayLayers", "rawEffects", "emptyBands",
    "capsLabels", "cards", "smallText", "texts", "closeSizes", "unevenRows", "flowBreaks", "listCounts",
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

/// The first visible solid fill that is nearly opaque, with the layer's own opacity.
fn solid(t: &Tree, n: usize) -> Option<Rgb> {
    let ps = visible_paints(t.get(n, "fills"));
    let p = ps.iter().find(|p| p.get("type").and_then(Value::as_str) == Some("SOLID"))?;
    let a = num_or(p.get("opacity"), 1.0) * num_or(t.get(n, "opacity"), 1.0);
    if a < 0.9 || ps.iter().any(|q| q.get("type").and_then(Value::as_str) != Some("SOLID")) {
        return None;
    }
    Some(rgb(p.get("color")))
}

fn hex(c: Rgb) -> String {
    let b = |v: f64| (v.clamp(0.0, 1.0) * 255.0).round() as u8;
    format!("#{:02x}{:02x}{:02x}", b(c.r), b(c.g), b(c.b))
}

/// Every shown layer of a screen with the layers above it (the screen first).
fn shown_with_ancestors(t: &Tree, frame: usize) -> Vec<(usize, Vec<usize>)> {
    fn go(t: &Tree, n: usize, anc: &mut Vec<usize>, out: &mut Vec<(usize, Vec<usize>)>) {
        if !t.visible(n) {
            return;
        }
        out.push((n, anc.clone()));
        if let Some(ks) = &t.kids[n] {
            anc.push(n);
            for &k in ks {
                go(t, k, anc, out);
            }
            anc.pop();
        }
    }
    let mut out = Vec::new();
    let mut anc = vec![frame];
    for &k in t.kids[frame].iter().flatten() {
        go(t, k, &mut anc, &mut out);
    }
    out
}

/// What one screen says that the next screen must agree with: checks across the screens of a flow (owner request
/// 2026-11-23, after a three-screen FigCraft benchmark where a dark band opened only the last screen, the main
/// button changed colour between screens, "Kembali ke beranda" led to a tab the bar did not have, and a list card
/// promised a visit hour the therapist's own hours did not have).
fn flow_checks(t: &Tree, screens: &[usize], r: &Res, o: &mut Out) {
    if screens.len() < 2 {
        return;
    }
    let white = Rgb { r: 1.0, g: 1.0, b: 1.0 };
    let time = Regex::new(r"(?:^|[^\d.:])((?:[01]?\d|2[0-3])[.:][0-5]\d)(?:$|[^\d])").unwrap();
    let only_time = Regex::new(r"^\s*(?:[01]?\d|2[0-3])[.:][0-5]\d\s*$").unwrap();
    let back = re(r"^\s*(?:kembali ke|back to|ke)\s+(.{2,30}?)\s*$");
    let navbar = re(r"tab ?bar|bottom ?nav|nav ?bar|navigation|navigasi");
    let button = re(r"\b(button|btn|cta)\b");
    struct Screen {
        name: String,
        band: Option<(String, Rgb)>,
        primary: Option<(String, Rgb)>,
        layers: Vec<(usize, Vec<usize>)>,
    }
    let mut info: Vec<Screen> = Vec::new();
    for &f in screens {
        let fb = t.bx(f);
        let bg = solid(t, f).unwrap_or(white);
        let layers = shown_with_ancestors(t, f);
        // a full-width band of its own colour that opens the screen (a header or hero), not an image
        let band = layers.iter().map(|(n, _)| *n).find(|&n| {
            let b = t.bx(n);
            t.ty(n) != "TEXT" && b.x <= fb.x + 2.0 && b.w >= fb.w * 0.9 && b.y <= fb.y + 60.0 && b.h >= 140.0 && b.h <= fb.h * 0.8
                && solid(t, n).is_some_and(|c| ratio(c, bg) >= 2.0)
        }).map(|n| (t.name(n), solid(t, n).unwrap()));
        // the main button: the widest filled control 40 to 64 tall with a label, set apart from the page
        let mut primary: Option<(usize, f64)> = None;
        for (n, anc) in &layers {
            let b = t.bx(*n);
            if t.ty(*n) == "TEXT" || b.h < 40.0 || b.h > 64.0 || b.w < fb.w * 0.35 || b.y < fb.y + 60.0 {
                continue;
            }
            // not the status bar, a toast or a sheet, or a button in its busy state
            if std::iter::once(n).chain(anc.iter()).any(|&a| a != f && (r.chrome.is_match(&t.name(a)) || r.overlay.is_match(&t.name(a)))) {
                continue;
            }
            let label = t.find_shown(*n, &mut |k| t.ty(k) == "TEXT" && !t.chars(k).trim().is_empty()).first().map(|&k| t.chars(k)).unwrap_or_default();
            if r.busy.is_match(&label) || r.ellipsis.is_match(label.trim()) {
                continue;
            }
            let Some(c) = solid(t, *n) else { continue };
            let labelled = t.kids[*n].is_some() && !t.find_shown(*n, &mut |k| t.ty(k) == "TEXT" && !t.chars(k).trim().is_empty()).is_empty();
            if !labelled || ratio(c, bg) < 3.0 || !(button.is_match(&t.name(*n)) || b.w >= fb.w * 0.4) {
                continue;
            }
            if primary.map_or(true, |(_, w)| b.w > w + 0.5) {
                primary = Some((*n, b.w));
            }
        }
        let primary = primary.map(|(n, _)| {
            let label = t.find_shown(n, &mut |k| t.ty(k) == "TEXT" && !t.chars(k).trim().is_empty()).first().map(|&k| t.chars(k)).unwrap_or_default();
            (label, solid(t, n).unwrap())
        });
        info.push(Screen { name: t.name(f), band, primary, layers });
    }

    // a band on one screen only, when three or more screens make the pattern clear
    let banded: Vec<&Screen> = info.iter().filter(|s| s.band.is_some()).collect();
    if info.len() >= 3 && banded.len() == 1 {
        let s = banded[0];
        let (name, c) = s.band.as_ref().unwrap();
        o.inc("flowBreaks", 1);
        o.add("RX-DS-02", "warn", &s.name, name, format!("only \"{}\" opens with a full-width {} band (\"{}\"); the other {} screens start on the page colour: carry the treatment to every screen of the flow, or drop it", s.name, hex(*c), short(name, 30), info.len() - 1));
    }

    // the main button in another colour on another screen
    let filled: Vec<&Screen> = info.iter().filter(|s| s.primary.is_some()).collect();
    let differs = |a: Rgb, b: Rgb| (a.r - b.r).abs().max((a.g - b.g).abs()).max((a.b - b.b).abs()) > 0.08;
    if filled.len() >= 2 && filled.iter().any(|s| differs(s.primary.as_ref().unwrap().1, filled[0].primary.as_ref().unwrap().1)) {
        let list: Vec<String> = filled.iter().map(|s| { let (l, c) = s.primary.as_ref().unwrap(); format!("{} \"{}\" {}", s.name, short(l.trim(), 24), hex(*c)) }).collect();
        let first = filled.iter().find(|s| differs(s.primary.as_ref().unwrap().1, filled[0].primary.as_ref().unwrap().1)).unwrap();
        o.inc("flowBreaks", 1);
        o.add("RX-DS-02", "warn", &first.name, &first.primary.as_ref().unwrap().0, format!("the main button changes colour between screens ({}): one action colour for the main action on every screen", list.join("; ")));
    }

    // "Kembali ke beranda" when no tab and no screen is called that
    let mut tabs: Vec<String> = Vec::new();
    let mut have_bar = false;
    for s in &info {
        for (n, anc) in &s.layers {
            if t.ty(*n) == "TEXT" && anc.iter().any(|&a| navbar.is_match(&t.name(a))) {
                have_bar = true;
                tabs.push(t.chars(*n).trim().to_lowercase());
            }
        }
    }
    tabs.sort();
    tabs.dedup();
    let frames: Vec<String> = info.iter().map(|s| Regex::new(r"^[\d\s._-]+").unwrap().replace(&s.name.to_lowercase(), "").to_string()).collect();
    if have_bar {
        for s in &info {
            for (n, _) in &s.layers {
                if t.ty(*n) != "TEXT" {
                    continue;
                }
                let text = t.chars(*n);
                let Some(m) = back.captures(&text) else { continue };
                let to = m[1].to_lowercase();
                // a place is a short name; "Ke Jl. Dipatiukur No. 35" is an address, not a way back (Rawat r4 D3)
                if to.chars().any(|c| c.is_ascii_digit()) || to.split_whitespace().count() > 3 {
                    continue;
                }
                let known = |x: &String| !x.is_empty() && (x.contains(&to) || to.contains(x.as_str()));
                if !tabs.iter().any(known) && !frames.iter().any(known) {
                    o.inc("flowBreaks", 1);
                    let shown: Vec<&str> = tabs.iter().map(|s| s.as_str()).filter(|s| !s.is_empty()).collect();
                    o.add("RX-CD-12", "warn", &s.name, &t.name(*n), format!("\"{}\" leads to a place the flow does not have: the tab bar holds {}; name the tab or screen it opens", short(text.trim(), 40), shown.join(", ")));
                }
            }
        }
    }

    // a list card that promises an hour the same person's own screen does not offer
    for (i, a) in info.iter().enumerate() {
        let fa = t.bx(screens[i]);
        for (n, anc) in &a.layers {
            let name = t.chars(*n).trim().to_string();
            if t.ty(*n) != "TEXT" || name.chars().count() < 6 || !name.contains(' ') || !name.chars().next().is_some_and(char::is_uppercase) || time.is_match(&name) {
                continue;
            }
            // a name is said once on its screen: "STR terverifikasi KKI" on every card is a badge, not a person (Rawat r4 D3)
            if a.layers.iter().filter(|(m, _)| t.ty(*m) == "TEXT" && t.chars(*m).trim() == name).count() > 1 {
                continue;
            }
            // the card: the nearest container well under the screen's height
            let Some(&card) = anc.iter().rev().find(|&&c| c != screens[i] && t.bx(c).h <= fa.h * 0.4 && t.bx(c).w >= fa.w * 0.6 && !r.chrome.is_match(&t.name(c))) else { continue };
            let promised: Vec<String> = t.find_shown(card, &mut |k| t.ty(k) == "TEXT").iter()
                .flat_map(|&k| time.captures_iter(&t.chars(k)).map(|m| m[1].replace(':', ".")).collect::<Vec<_>>()).collect();
            if promised.is_empty() {
                continue;
            }
            for (j, b) in info.iter().enumerate() {
                if j == i {
                    continue;
                }
                // the person's own screen: the same name, on a screen that lists visit hours
                let own = b.layers.iter().any(|(m, _)| t.ty(*m) == "TEXT" && t.chars(*m).trim() == name);
                if !own {
                    continue;
                }
                let mut hours: Vec<String> = b.layers.iter().filter(|(m, anc2)| t.ty(*m) == "TEXT" && only_time.is_match(&t.chars(*m)) && !anc2.iter().any(|&a| r.chrome.is_match(&t.name(a)))).map(|(m, _)| t.chars(*m).trim().replace(':', ".")).collect();
                hours.dedup();
                let pad = |h: &str| if h.len() == 4 { format!("0{h}") } else { h.to_string() };
                let hours: Vec<String> = hours.iter().map(|h| pad(h)).collect();
                if hours.len() < 3 {
                    continue;
                }
                for p in &promised {
                    if !hours.contains(&pad(p)) {
                        o.inc("flowBreaks", 1);
                        o.add("RX-AS-03", "warn", &a.name, &t.name(card), format!("\"{}\": {} promises {}, but {} offers {}: sample data must agree across screens", short(&name, 30), a.name, pad(p), b.name, hours.iter().take(6).cloned().collect::<Vec<_>>().join(", ")));
                    }
                }
            }
        }
    }

    // A list card that says "today" (or "tomorrow") while the person's own screen opens its date row on a later day
    // (RX-AS-03): today is the earliest date a row can offer, tomorrow the first or second. Owner blind rating
    // 2026-11-23: the list said "Tersedia hari ini" and the profile opened on the next day in three no-skill runs.
    let day = re(r"\b(sen|sel|rab|kam|jum|sab|min|mon|tue|wed|thu|fri|sat|sun)[a-z]*\b|hari ini|besok|today|tomorrow");
    let picked_re = re(r"dipilih|terpilih|selected|aktif|active|current");
    let today_re = re(r"hari ini|today");
    let tomorrow_re = re(r"besok|tomorrow");
    let digit = Regex::new(r"\d").unwrap();
    for (i, a) in info.iter().enumerate() {
        let fa = t.bx(screens[i]);
        let mut seen: Vec<String> = Vec::new();
        for (n, anc) in &a.layers {
            let name = t.chars(*n).trim().to_string();
            if t.ty(*n) != "TEXT" || name.chars().count() < 6 || !name.contains(' ') || !name.chars().next().is_some_and(char::is_uppercase) || seen.contains(&name) {
                continue;
            }
            let Some(&card) = anc.iter().rev().find(|&&c| c != screens[i] && t.bx(c).h <= fa.h * 0.4 && t.bx(c).w >= fa.w * 0.6 && !r.chrome.is_match(&t.name(c))) else { continue };
            let words: Vec<String> = t.find_shown(card, &mut |k| t.ty(k) == "TEXT").iter().map(|&k| t.chars(k)).collect();
            let joined = words.join(" · ");
            let (today, tomorrow) = (today_re.is_match(&joined), tomorrow_re.is_match(&joined));
            if today == tomorrow {
                continue;
            }
            let which = if today { &today_re } else { &tomorrow_re };
            let said = joined.split(" · ").find(|w| which.is_match(w)).unwrap_or("").trim().to_string();
            for (j, b) in info.iter().enumerate() {
                if j == i || !b.layers.iter().any(|(m, _)| t.ty(*m) == "TEXT" && t.chars(*m).trim() == name) {
                    continue;
                }
                let label = |k: usize| t.find_shown(k, &mut |x| t.ty(x) == "TEXT").iter().map(|&x| t.chars(x).trim().to_string()).collect::<Vec<_>>().join(" ");
                for (row, _) in &b.layers {
                    let chips: Vec<usize> = t.kids[*row].iter().flatten().copied().filter(|&k| t.visible(k) && t.ty(k) != "TEXT").collect();
                    if chips.len() < 4 || !chips.iter().all(|&k| { let l = label(k); day.is_match(&l) && digit.is_match(&l) }) {
                        continue;
                    }
                    let picked: Vec<usize> = chips.iter().copied().filter(|&k| picked_re.is_match(&t.name(k))).collect();
                    if picked.len() == 1 {
                        let at = chips.iter().position(|&k| k == picked[0]).unwrap();
                        if at > if today { 0 } else { 1 } {
                            seen.push(name.clone());
                            o.inc("flowBreaks", 1);
                            o.add("RX-AS-03", "warn", &a.name, &t.name(card), format!("\"{}\": {} says \"{}\", but {} opens on {}, date {} of the row: open on the day the list promised, or say that day in the list", short(&name, 30), a.name, short(&said, 30), b.name, label(picked[0]), at + 1));
                        }
                    }
                    break;
                }
            }
        }
    }

    // A cost first shown after the commitment (RX-UX-15): on the flow's last screen, an amount labelled as a fee (its
    // own words, or the text beside it on its row) that no earlier screen shows. Owner blind rating 2026-11-23: a visit
    // fee of Rp15.000 that appeared only on the confirmation, in two of three runs without RYUX.
    let money = Regex::new(r"(?i)Rp\s?(\d{1,3}(?:\.\d{3})+|\d{4,})").unwrap();
    let fee = Regex::new(r"(?i)biaya|ongkos|ongkir|transport|admin|\bfee|layanan|kunjungan|pajak|ppn|asuransi|service|delivery|\btax|surcharge|penanganan|platform").unwrap();
    let total = Regex::new(r"(?i)total|jumlah|subtotal|tagihan|grand").unwrap();
    let mut order: Vec<usize> = (0..info.len()).collect();
    order.sort_by(|&a, &b| { let (p, q) = (t.bx(screens[a]), t.bx(screens[b])); p.x.total_cmp(&q.x).then(p.y.total_cmp(&q.y)) });
    let amounts = |s: &Screen| -> Vec<(usize, i64, String)> {
        s.layers.iter().filter(|(n, _)| t.ty(*n) == "TEXT").flat_map(|(n, _)| {
            let text = t.chars(*n);
            money.captures_iter(&text).map(|m| (*n, m[1].replace('.', "").parse::<i64>().unwrap_or(0), m[0].to_string())).collect::<Vec<_>>()
        }).collect()
    };
    let last = &info[*order.last().unwrap()];
    let earlier: Vec<i64> = order[..order.len() - 1].iter().flat_map(|&k| amounts(&info[k]).into_iter().map(|a| a.1)).collect();
    let mut flagged: Vec<i64> = Vec::new();
    for (n, value, shown) in amounts(last) {
        if earlier.contains(&value) || flagged.contains(&value) {
            continue;
        }
        let own = money.replace_all(&t.chars(n), "").trim().to_string();
        let label = if own.chars().filter(|c| c.is_alphabetic()).count() >= 3 {
            own
        } else {
            let b = t.bx(n);
            let cy = b.y + b.h / 2.0;
            last.layers.iter().map(|(m, _)| *m).filter(|&m| m != n && t.ty(m) == "TEXT" && money.find(&t.chars(m)).is_none()).filter(|&m| {
                let c = t.bx(m);
                (c.y + c.h / 2.0 - cy).abs() <= c.h.max(b.h) / 2.0 && c.x + c.w <= b.x + 2.0
            }).max_by(|&a, &b2| (t.bx(a).x + t.bx(a).w).total_cmp(&(t.bx(b2).x + t.bx(b2).w))).map(|m| t.chars(m).trim().to_string()).unwrap_or_default()
        };
        if fee.is_match(&label) && !total.is_match(&label) {
            flagged.push(value);
            o.inc("flowBreaks", 1);
            o.add("RX-UX-15", "warn", &last.name, &t.name(n), format!("\"{}\" {} first shows on \"{}\": no earlier screen shows it, so the person meets the cost after committing; show every cost with the price before the action", short(&label, 30), shown, last.name));
        }
    }

    // The chosen hour missing from the bar that commits (RX-IX-17): a screen with three or more hour chips, one named as
    // picked, and a full-width bar pinned to the bottom that holds the price or the button but not that hour. Owner blind
    // rating 2026-11-24 (Rawat r4): "footer tidak menampilkan jam terpilih" on three of nine runs, praised where it did.
    let starts_time = Regex::new(r"^\s*(?:[01]?\d|2[0-3])[.:][0-5]\d\b").unwrap();
    for (i, a) in info.iter().enumerate() {
        let fa = t.bx(screens[i]);
        let shown_text = |k: usize| t.find_shown(k, &mut |x| t.ty(x) == "TEXT").iter().map(|&x| t.chars(x).trim().to_string()).filter(|x| !x.is_empty()).collect::<Vec<_>>();
        let chips: Vec<usize> = a.layers.iter().map(|(n, _)| *n).filter(|&n| {
            let b = t.bx(n);
            let words = shown_text(n);
            t.ty(n) != "TEXT" && b.w <= fa.w * 0.5 && !words.is_empty() && words.len() <= 3 && starts_time.is_match(&words[0]) && !r.chrome.is_match(&t.name(n))
        }).collect();
        let picked: Vec<usize> = chips.iter().copied().filter(|&k| picked_re.is_match(&t.name(k))).collect();
        if chips.len() < 3 || picked.len() != 1 {
            continue;
        }
        let Some(hour) = time.captures(&format!(" {}", shown_text(picked[0])[0])).map(|m| m[1].replace(':', ".")) else { continue };
        let bar = a.layers.iter().map(|(n, _)| *n).find(|&n| {
            let b = t.bx(n);
            t.ty(n) != "TEXT" && n != screens[i] && b.w >= fa.w * 0.9 && (b.y + b.h - (fa.y + fa.h)).abs() <= 40.0 && b.h <= 220.0 && !navbar.is_match(&t.name(n))
                && (shown_text(n).iter().any(|x| money.is_match(x)) || !t.find_shown(n, &mut |x| button.is_match(&t.name(x))).is_empty())
        });
        let Some(bar) = bar else { continue };
        let pad = |h: &str| if h.len() == 4 { format!("0{h}") } else { h.to_string() };
        let held = shown_text(bar).iter().any(|x| time.captures_iter(&format!(" {x} ")).any(|m| pad(&m[1].replace(':', ".")) == pad(&hour)));
        if !held {
            o.inc("flowBreaks", 1);
            o.add("RX-IX-17", "warn", &a.name, &t.name(bar), format!("\"{}\" holds the action but not the chosen hour {}: put the date and hour with the price and the button, so the person sees what they book as they commit", short(&t.name(bar), 30), pad(&hour)));
        }
    }

    // A confirmation that never says how the person pays (RX-IX-05): the flow shows a price, and its last screen confirms
    // the order but names no payment method. Owner blind rating 2026-11-24 (Rawat r4): "konfirmasi tanpa metode bayar"
    // on two runs; "Lunas via GoPay" and "Bayar setelah sesi" praised.
    let pay = Regex::new(r"(?i)gopay|\bovo\b|\bdana\b|shopeepay|qris|virtual account|\bva\b|transfer|kartu (?:kredit|debit)|tunai|\bcash\b|paylater|metode (?:bayar|pembayaran)|payment method|bayar\b.{0,40}\b(?:setelah|di tempat|saat|nanti|langsung|via|ke terapis)|pay (?:after|on|at|later)").unwrap();
    let confirmed = Regex::new(r"(?i)terkonfirmasi|dikonfirmasi|berhasil|sukses|lunas|terjadwal|dipesan|confirmed|success|booked|order placed").unwrap();
    let texts = |s: &Screen| s.layers.iter().filter(|(n, _)| t.ty(*n) == "TEXT").map(|(n, _)| t.chars(*n)).collect::<Vec<_>>();
    let priced = info.iter().any(|s| texts(s).iter().any(|x| money.is_match(x)));
    let last_texts = texts(last);
    if priced && (confirmed.is_match(&last.name) || last_texts.iter().any(|x| confirmed.is_match(x))) && !last_texts.iter().any(|x| pay.is_match(x)) {
        o.inc("flowBreaks", 1);
        o.add("RX-IX-05", "warn", &last.name, &last.name, format!("\"{}\" confirms the order but never says how it is paid: name the method with the total (\"Bayar ke terapis setelah sesi\"); if the business has not chosen one, show a neutral sample method with the file\'s sample-data marker", last.name));
    }

    // Two words for one state across the flow (RX-CD-05): a taken slot called "Penuh" on one chip and "Terisi" on
    // another. Owner blind rating 2026-11-24 (Rawat r4): "istilah campur Terisi vs Penuh".
    let taken = Regex::new(r"(?i)\b(penuh|terisi|habis|sold out|full|booked)\b").unwrap();
    let mut words: Vec<(String, String, usize)> = Vec::new();
    for &k in &order {
        for (n, anc) in &info[k].layers {
            let x = t.chars(*n);
            if t.ty(*n) != "TEXT" || x.trim().chars().count() > 25 || anc.iter().any(|&c| r.chrome.is_match(&t.name(c))) {
                continue;
            }
            if let Some(m) = taken.captures(&x) {
                let w = m[1].to_lowercase();
                if !words.iter().any(|(v, _, _)| *v == w) {
                    words.push((w, info[k].name.clone(), *n));
                }
            }
        }
    }
    if words.len() >= 2 {
        let (w2, s2, n2) = &words[1];
        o.inc("flowBreaks", 1);
        o.add("RX-CD-05", "warn", s2, &t.name(*n2), format!("\"{}\" and \"{}\" name the same state: pick one word for a taken slot and use it on every screen", words[0].0, w2));
    }

}

/// The error colour on the action accent's hue (RX-UI-04): the main buttons share one chromatic fill, and a layer named or
/// labelled as an error, a failure, or a destructive action is drawn in another colour of nearly the same hue, so the
/// colour that says "go" also says "failed". Owner blind ratings 2026-11-24 and 2026-11-25 (Klipin R3 and R5): a
/// red-orange accent on the CTA, the selected state, and the active step, beside a red for errors and cancel.
/// Screens on cream (RX-UI-26): the paper look generated pages fall back to. Five of five H2 diversity runs
/// (2026-11-25) put the page on cream, two against a draw that said a saturated colour field.
fn cream_check(t: &Tree, screens: &[usize], o: &mut Out) {
    let on: Vec<(usize, Rgb)> = screens.iter().filter_map(|&f| solid(t, f).filter(|&c| is_cream(c)).map(|c| (f, c))).collect();
    if on.is_empty() || on.len() * 2 < screens.len() {
        return;
    }
    let (f, c) = on[0];
    let name = t.name(f);
    o.add("RX-UI-26", "warn", &name, &name, format!("{} of {} screens sit on cream ({}): the paper look generated designs fall back to; use the surface the direction drew, and keep cream only when the direction chose paper for a reason", on.len(), screens.len(), hex(c)));
}

/// Light, warm (hue 25–70°), and only a little coloured (an RGB spread of 3% to 15%): cream, ivory, warm off-white.
fn is_cream(c: Rgb) -> bool {
    let (mx, mn) = (c.r.max(c.g).max(c.b), c.r.min(c.g).min(c.b));
    let d = mx - mn;
    if (mx + mn) / 2.0 < 0.88 || !(0.03..=0.15).contains(&d) {
        return false;
    }
    let h = if mx == c.r { ((c.g - c.b) / d).rem_euclid(6.0) } else if mx == c.g { (c.b - c.r) / d + 2.0 } else { (c.r - c.g) / d + 4.0 } * 60.0;
    (25.0..=70.0).contains(&h)
}

fn accent_error_check(t: &Tree, screens: &[usize], o: &mut Out) {
    let chroma = |c: Rgb| c.r.max(c.g).max(c.b) - c.r.min(c.g).min(c.b);
    let hue = |c: Rgb| {
        let (mx, mn) = (c.r.max(c.g).max(c.b), c.r.min(c.g).min(c.b));
        let d = mx - mn;
        if d == 0.0 { return 0.0; }
        let h = if mx == c.r { ((c.g - c.b) / d).rem_euclid(6.0) } else if mx == c.g { (c.b - c.r) / d + 2.0 } else { (c.r - c.g) / d + 4.0 };
        h * 60.0
    };
    let stroke = |n: usize| -> Option<Rgb> {
        let ps = visible_paints(t.get(n, "strokes"));
        let p = ps.iter().find(|p| p.get("type").and_then(Value::as_str) == Some("SOLID"))?;
        if num_or(p.get("opacity"), 1.0) < 0.9 { return None; }
        Some(rgb(p.get("color")))
    };
    let err = re(r"\b(error|gagal|galat|danger|destructive|hapus|batal|buang|cancel|delete|kesalahan|tidak berhasil|ditolak)\b");
    // the accent: the most common chromatic fill on button-shaped layers (28 to 60 tall, 72 wide or more, one or two labels)
    let mut accents: Vec<(String, Rgb, usize)> = Vec::new();
    let mut errors: Vec<(String, Rgb, usize, usize)> = Vec::new();
    for &f in screens {
        for (n, _) in shown_with_ancestors(t, f) {
            let b = t.bx(n);
            if matches!(t.ty(n), "FRAME" | "INSTANCE" | "COMPONENT") && (28.0..=60.0).contains(&b.h) && b.w >= 72.0 {
                if let Some(c) = solid(t, n).filter(|&c| chroma(c) >= 0.25) {
                    let labels = t.find_shown(n, &mut |k| t.ty(k) == "TEXT").len();
                    if (1..=2).contains(&labels) {
                        let h = hex(c);
                        match accents.iter_mut().find(|a| a.0 == h) { Some(a) => a.2 += 1, None => accents.push((h, c, 1)) }
                    }
                }
            }
            if err.is_match(&t.name(n)) || (t.ty(n) == "TEXT" && err.is_match(&t.chars(n))) {
                let mut own = vec![n];
                own.extend(t.find_shown(n, &mut |k| t.ty(k) == "TEXT").into_iter().take(3));
                for k in own {
                    for c in [solid(t, k), stroke(k)].into_iter().flatten() {
                        if chroma(c) >= 0.25 { errors.push((hex(c), c, n, f)); }
                    }
                }
            }
        }
    }
    let Some((ah, ac, _)) = accents.iter().fold(None::<&(String, Rgb, usize)>, |m, a| if m.is_none_or(|m| a.2 > m.2) { Some(a) } else { m }).cloned() else { return };
    let d = |x: f64, y: f64| { let z = (x - y).rem_euclid(360.0); z.min(360.0 - z) };
    if let Some((eh, _, n, f)) = errors.iter().find(|(eh, ec, _, _)| *eh != ah && d(hue(*ec), hue(ac)) <= 15.0) {
        o.add("RX-UI-04", "warn", &t.name(*f), &t.name(*n), format!("the error colour {} is the hue of the action accent {}: give errors and destructive actions their own colour role, apart from the primary action", eh, ah));
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
                o.add("RX-A11Y-01", "fail", &fname, &t.name(n), format!("\"{}\" {}:1, needs {}:1", short(&t.chars(n), 40), ratio_text(rt, need), num_str(need)));
            }
        }

        // Text cut by a bar, or clipped (RX-QA-03).
        let bars: Vec<&Entry> = nodes.iter().filter(|e| e.n != frame && t.ty(e.n) != "TEXT" && r.bar.is_match(&nm(e.n)) && opaque(e)).collect();
        // A screen-wide scrim painted above a text puts it behind a modal: covered on purpose, not cut (Klipin R4 and R5, 2026-11-24).
        let backdrop: Vec<usize> = nodes.iter().filter(|e| {
            let b = t.bx(e.n);
            e.n != frame && r.scrim.is_match(&nm(e.n)) && b.w >= fbox.w * 0.9 && b.h >= fbox.h * 0.9
        }).map(|e| order[&e.n]).collect();
        for e in &nodes {
            let n = e.n;
            if t.ty(n) != "TEXT" || trim(&t.chars(n)).is_empty() || backdrop.iter().any(|&s| s > order[&n]) {
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
            // the size as it is, to a tenth (23.6 is under 24, not "24"), and grouped by the limit it misses
            let size = format!("{}x{}", num_str(round(b.w * 10.0) / 10.0), num_str(round(b.h * 10.0) / 10.0));
            let key = format!("{kind}|{}|{size}", if m < 24.0 { 24 } else { 44 });
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
        // A type scale with steps (RX-UI-03): three or more sizes, 11 to 40 px, each with another 1 px above it.
        let mut sizes: Vec<i64> = texts.iter().map(|&n| num(t.get(n, "fontSize")).round() as i64).filter(|s| (11..=40).contains(s)).collect();
        sizes.sort_unstable();
        sizes.dedup();
        let close = sizes.iter().filter(|s| sizes.contains(&(**s + 1))).count();
        if close >= 3 {
            o.inc("closeSizes", 1);
            let list: Vec<String> = sizes.iter().map(|s| s.to_string()).collect();
            o.add("RX-UI-03", "warn", &fname, &fname, format!("text in {} sizes ({} px), {} of them 1 px from the next: steps that close read as mistakes, not levels; give each role one step of a scale and one text style", sizes.len(), list.join(", "), close));
        } else {
            // More steps than roles, or neighbours too close to read as two levels (13, 14, 15): no-skill runs and RYUX's
            // desktop runs did this on most screens of a 27-file FigCraft corpus (2026-11-25); 1 px apart was not enough to catch it.
            let near: Vec<String> = sizes.windows(2).filter(|w| (w[1] as f64) / (w[0] as f64) < 1.12).map(|w| format!("{}/{}", w[0], w[1])).collect();
            if sizes.len() > 6 || near.len() >= 2 {
                o.inc("closeSizes", 1);
                let list: Vec<String> = sizes.iter().map(|s| s.to_string()).collect();
                let pairs = if near.is_empty() { String::new() } else { format!(", {} read as one level (under 12% apart)", near.join(", ")) };
                o.add("RX-UI-03", "warn", &fname, &fname, format!("text in {} sizes ({} px){}: a screen holds at most six steps of one scale, one per role (caption, label, body, heading, title, display), each 1.2x or more above the one below; merge the close ones and let weight or a muted colour add a level", sizes.len(), list.join(", "), pairs));
            }
        }
        // A count over a list that the list does not bear out (RX-AS-03): "8 terapis" over a list of 2 cards that ends
        // with room for the next, or over more cards than it says. Owner blind rating 2026-11-23 (FigCraft r3 C3).
        {
            let count = re(r"^\s*(\d{1,3})\s+(\p{L}+)");
            let unit = re(r"^(menit|jam|hari|minggu|bulan|tahun|detik|km|m|kg|gr?|langkah|step|steps|min|mins|hours?|days?|weeks?|months?|years?|x|kali|persen|bintang|ulasan|reviews?)$");
            let partial = re(r"\d+\s*(?:dari|of|/)\s*\d+|\d\+|(?:lebih dari|more than|over|hingga|up to)\s*\d|menampilkan|showing");
            for &n in &texts {
                let text = t.chars(n);
                let Some(m) = count.captures(&text) else { continue };
                let said: usize = m[1].parse().unwrap_or(0);
                if said < 2 || unit.is_match(&m[2]) || partial.is_match(&text) {
                    continue;
                }
                let tb = t.bx(n);
                // the list: two or more siblings of one width that start under the count, the nearest set
                let mut best: Option<Vec<usize>> = None;
                for e in &nodes {
                    let Some(kids) = &t.kids[e.n] else { continue };
                    let rows: Vec<usize> = kids.iter().copied().filter(|&k| {
                        let b = t.bx(k);
                        t.visible(k) && t.ty(k) != "TEXT" && b.w >= fbox.w * 0.6 && b.h >= 48.0 && b.h <= fbox.h * 0.4 && b.y >= tb.y + tb.h - 2.0
                    }).collect();
                    let same: Vec<usize> = rows.iter().copied().filter(|&k| rows.first().is_some_and(|&f| (t.bx(k).w - t.bx(f).w).abs() <= 2.0)).collect();
                    if same.len() < 2 || t.bx(same[0]).y - (tb.y + tb.h) > 80.0 {
                        continue;
                    }
                    if best.as_ref().map_or(true, |b| t.bx(same[0]).y < t.bx(b[0]).y) {
                        best = Some(same);
                    }
                }
                let Some(rows) = best else { continue };
                let shown = rows.len();
                let last = rows.iter().map(|&k| t.bx(k)).max_by(|a, b| (a.y + a.h).total_cmp(&(b.y + b.h))).unwrap();
                let gap = if shown >= 2 { (t.bx(rows[1]).y - (t.bx(rows[0]).y + t.bx(rows[0]).h)).max(0.0) } else { 12.0 };
                // where the list stops being seen: the frame's bottom, or a full-width bar pinned there
                let bottom = nodes.iter().map(|e| t.bx(e.n)).filter(|b| b.w >= fbox.w * 0.9 && b.y + b.h >= fbox.y + fbox.h - 4.0 && b.y > last.y && b.y < fbox.y + fbox.h)
                    .map(|b| b.y).fold(fbox.y + fbox.h, f64::min);
                let room = last.y + last.h + gap + (last.h * 0.3).min(40.0) < bottom;
                if shown > said || (shown < said && room) {
                    o.inc("listCounts", 1);
                    let why = if shown > said { format!("the list under it shows {}", shown) } else { format!("the list under it shows {} and ends with room for the next", shown) };
                    o.add("RX-AS-03", "warn", &fname, &t.name(n), format!("\"{}\" counts {}, but {}: show what the count says, or count what is shown", short(trim(&text), 30), said, why));
                }
            }
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

    flow_checks(&t, &screens, r, &mut o);
    accent_error_check(&t, &screens, &mut o);
    cream_check(&t, &screens, &mut o);

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
        "figma audit ({}): screens {} · images {} distinct, {} fills, {} reused across screens · contrast fails {} ({} over images, not measured) · text cut {}, clipped {} · targets under 24 {}, under 44 {} · overlays with no lift {} · busy buttons with idle label {} · unstyled text {}, unbound fills {}, unbound spacing {} · built in auto layout {}/{} screens, loose layers {}, layers outside the screens {}, effects without a style {} · empty bands {}, small uppercase labels {}, section cards {}, text under 12 px {}/{}, screens with text sizes off a scale {}, uneven button rows {}, list counts that disagree {} · breaks across screens {} · annotations {} · {} fail, {} warn",
        pname, c["screens"], c["distinctImages"], c["imageFills"], c["reusedImages"], c["contrastFails"], c["contrastUnknown"], c["cutText"], c["clippedText"],
        c["targetsUnder24"], c["targetsUnder44"], c["flatOverlays"], c["idleBusyButtons"], c["unstyledText"], c["unboundFills"], c["unboundSpacing"],
        c["layoutScreens"], c["screens"], c["looseLayers"], c["strayLayers"], c["rawEffects"], c["emptyBands"], c["capsLabels"], c["cards"], c["smallText"], c["texts"], c["closeSizes"], c["unevenRows"], c["listCounts"], c["flowBreaks"],
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
