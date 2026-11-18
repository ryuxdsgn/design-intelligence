//! Design drift: the port of `packages/cli/src/drift.ts`. The direction block in DESIGN.md (colours,
//! type families, corner radius, motion durations) against the values the code uses. Offsets and lengths
//! are UTF-16 code units, as in the TypeScript.

use crate::js::{len16, num_str, round, slice16, trim};
use crate::jsre::{js, JsRe};
use serde_json::{json, Value};
use std::sync::OnceLock;

/// The measurable part of a direction. `radius` and `durations` are None when the block does not say.
pub struct Direction {
    pub colours: Vec<String>,
    pub fonts: Vec<String>,
    pub radius: Option<Vec<f64>>,
    pub durations: Option<Vec<f64>>,
    pub unread: Vec<String>,
}

/// A number as JSON, an integer when it is one (so 8 is 8, not 8.0).
pub fn num_json(x: f64) -> Value {
    if x == x.trunc() && x.abs() < 9e15 { json!(x as i64) } else { json!(x) }
}

impl Direction {
    pub fn to_json(&self) -> Value {
        let list = |xs: &Option<Vec<f64>>| xs.as_ref().map_or(Value::Null, |v| Value::Array(v.iter().map(|x| num_json(*x)).collect()));
        json!({ "colours": self.colours, "fonts": self.fonts, "radius": list(&self.radius), "durations": list(&self.durations), "unread": self.unread })
    }
    pub fn from_json(v: &Value) -> Option<Direction> {
        let strs = |k: &str| v.get(k).and_then(Value::as_array).map(|a| a.iter().filter_map(|x| x.as_str().map(String::from)).collect()).unwrap_or_default();
        let nums = |k: &str| v.get(k).and_then(Value::as_array).map(|a| a.iter().filter_map(Value::as_f64).collect());
        v.as_object()?;
        Some(Direction { colours: strs("colours"), fonts: strs("fonts"), radius: nums("radius"), durations: nums("durations"), unread: strs("unread") })
    }
}

struct Res {
    hex: JsRe,
    weight: JsRe,
    norm_font: JsRe,
    quotes: JsRe,
    split_space: JsRe,
    lead: JsRe,
    weight_tail: JsRe,
    comma_end: JsRe,
    upper: JsRe,
    number: JsRe,
    section: JsRe,
    next: JsRe,
    direction: JsRe,
    fence: JsRe,
    comment: JsRe,
    non_space: JsRe,
    kv: JsRe,
    brackets: JsRe,
    role: JsRe,
    radius_line: JsRe,
    dur_line: JsRe,
    ms: JsRe,
    decl: JsRe,
    css_hex: JsRe,
    code_hex: JsRe,
    link_before: JsRe,
    font: JsRe,
    generic: JsRe,
    font_var: JsRe,
    radius: JsRe,
    radius_num: JsRe,
    motion: JsRe,
    delay: JsRe,
    duration_key: JsRe,
    time_all: JsRe,
    time_one: JsRe,
}

fn res() -> &'static Res {
    static R: OnceLock<Res> = OnceLock::new();
    R.get_or_init(|| Res {
        hex: js(r"#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3})\b", "gi"),
        weight: js(r"^(?:thin|hairline|extralight|ultralight|light|regular|normal|book|medium|semibold|demibold|bold|extrabold|ultrabold|black|heavy|italic|variable)$", "i"),
        norm_font: js(r"[\s_-]+", "g"),
        quotes: js(r#"^["']|["']$"#, "g"),
        split_space: js(r"\s+", ""),
        lead: js(r"^[\d(,/]", ""),
        weight_tail: js(r"[,/].*$", ""),
        comma_end: js(r",$", ""),
        upper: js(r"^[A-Z]", ""),
        number: js(r"\d+(?:\.\d+)?", "g"),
        section: js(r"^## Visual and motion language\b", "m"),
        next: js(r"^## ", "m"),
        direction: js(r"^\s*direction:\s*$", "m"),
        fence: js(r"^```", "m"),
        comment: js(r"\s+#(?=\s|$).*$", ""),
        non_space: js(r"\S", ""),
        kv: js(r"^\s*([\w-]+):\s*(.+)$", ""),
        brackets: js(r"^[[{]|[\]}]$", "g"),
        role: js(r"^\s*[\w-]+:\s*", ""),
        radius_line: js(r"^\s*radius:", ""),
        dur_line: js(r"^\s*durations:", ""),
        ms: js(r"(\d+)\s?ms\b", "g"),
        decl: js(r":([^;{}]+)(?=[;}])", "g"),
        css_hex: js(r"(^|[^\w&-])(#[0-9a-f]{3,8})\b", "gi"),
        code_hex: js(r#"(["'`[]|[:(,]\s*)(#[0-9a-f]{3,8})\b(?=\s*["'`;,)\]])"#, "gi"),
        link_before: js(r#"(?:href|to|id|src|url|path|for|target|key)\s*=\s*["'`]?$"#, "i"),
        font: js(r#"(font-family\s*:\s*|fontFamily\s*:\s*["'`])([^;}\n"'`]+|"[^"\n]+"|'[^'\n]+')"#, "g"),
        generic: js(r"^(?:serif|sans-serif|monospace|cursive|fantasy|system-ui|ui-\w+|-apple-system|blinkmacsystemfont|emoji|math|inherit|initial|unset|revert|var\(.*)$", "i"),
        font_var: js(r"^\$|^\{|^@", ""),
        radius: js(r"(border(?:-(?:top|bottom)-(?:left|right))?-radius\s*:\s*|borderRadius\s*:\s*)([^;}\n,]+)", "g"),
        radius_num: js(r"(?<![\d.])(\d+(?:\.\d+)?)(?![\d.])(px)?\b(?!\s*%)", "g"),
        motion: js(r"((?:transition|animation)(?:-duration|-delay)?\s*:\s*)([^;}\n]+)", "g"),
        delay: js(r"-delay", ""),
        duration_key: js(r"-duration", ""),
        time_all: js(r"(\d*\.?\d+)(ms|s)\b", "g"),
        time_one: js(r"(\d*\.?\d+)(ms|s)\b", ""),
    })
}

const NOT_FONT_KEYS: [&str; 9] = ["figures", "scale", "max_measure", "measure", "sizes", "size", "tracking", "leading", "notes"];
const NEUTRAL: [&str; 2] = ["#ffffff", "#000000"];
const STYLE_EXTS: [&str; 4] = ["css", "scss", "sass", "less"];

/// #abc → #aabbcc; alpha is dropped.
pub fn norm_hex(hex: &str) -> String {
    let h = slice16(hex, 1, None).to_lowercase();
    if len16(&h) == 3 {
        format!("#{}", h.chars().map(|c| format!("{c}{c}")).collect::<String>())
    } else {
        format!("#{}", slice16(&h, 0, Some(6)))
    }
}

fn norm_font(f: &str) -> String {
    res().norm_font.replace(&f.to_lowercase(), "")
}

fn family(value: &str) -> Option<String> {
    let r = res();
    let mut words: Vec<String> = Vec::new();
    for w in r.split_space.split(&r.quotes.replace(value, "")) {
        if w.is_empty() || r.lead.test(&w) || r.weight.test(&r.weight_tail.replace(&w, "")) {
            break;
        }
        words.push(r.comma_end.replace(&w, ""));
        if r.comma_end.test(&w) {
            break;
        }
    }
    let name = words.join(" ");
    if r.upper.test(&name) { Some(name) } else { None }
}

fn numbers(s: &str) -> Vec<f64> {
    res().number.matches(s).iter().map(|n| n.parse::<f64>().unwrap()).collect()
}

/// `s.search(re)` as a byte offset, or None.
fn search_byte(re: &JsRe, s: &str) -> Option<usize> {
    let at = re.search(s);
    if at < 0 { None } else { Some(crate::jsre::byte_at(s, at as usize)) }
}

fn direction_block(md: &str) -> Option<String> {
    let r = res();
    let at = search_byte(&r.section, md)?;
    let rest = &md[at..];
    let next = search_byte(&r.next, &rest[3..]);
    let section = match next {
        None => rest,
        Some(n) => &rest[..n + 3],
    };
    let start = search_byte(&r.direction, section)?;
    let tail = &section[start..];
    Some(match search_byte(&r.fence, tail) {
        None => tail.to_string(),
        Some(f) => tail[..f].to_string(),
    })
}

/// `s.search(/\S/)`: the UTF-16 column of the first non-space, or -1.
fn indent(s: &str) -> isize {
    res().non_space.search(s)
}

fn under(lines: &[String], index: usize) -> Vec<String> {
    let ind = indent(&lines[index]);
    let mut out = Vec::new();
    for l in &lines[index + 1..] {
        if !trim(l).is_empty() && indent(l) <= ind {
            break;
        }
        out.push(l.clone());
    }
    out
}

fn unique<T: PartialEq + Clone>(xs: Vec<T>) -> Vec<T> {
    let mut out: Vec<T> = Vec::new();
    for x in xs {
        if !out.contains(&x) {
            out.push(x);
        }
    }
    out
}

pub fn read_direction(md: &str) -> Option<Direction> {
    let r = res();
    let raw = direction_block(md)?;
    let lines: Vec<String> = raw.split('\n').map(|l| r.comment.replace(l, "")).collect();
    let block = lines.join("\n");
    let mut unread: Vec<String> = Vec::new();
    let top = lines.iter().skip(1).find(|l| !trim(l).is_empty()).map_or(2, |l| indent(l));
    let key = |name: &str, empty: bool| -> Option<usize> {
        let re = js(&format!(r"^\s*{name}:{}", if empty { r"\s*$" } else { "" }), "");
        lines.iter().position(|l| indent(l) == top && re.test(l))
    };

    let colours = unique(r.hex.matches(&block).iter().map(|h| norm_hex(h)).collect());
    if colours.is_empty() {
        unread.push("colour (no hex values)".into());
    }

    let mut fonts: Vec<String> = Vec::new();
    if let Some(type_at) = key("type", true) {
        for l in under(&lines, type_at) {
            let Some(m) = r.kv.exec(&l) else { continue };
            if NOT_FONT_KEYS.contains(&m.g(1)) {
                continue;
            }
            let values: Vec<String> = if m.g(1) == "families" {
                r.brackets.replace(m.g(2), "").split(',').map(|v| r.role.replace(v, "")).collect()
            } else {
                vec![m.g(2).to_string()]
            };
            for v in values {
                if let Some(f) = family(trim(&v)) {
                    if !fonts.contains(&f) {
                        fonts.push(f);
                    }
                }
            }
        }
    }
    if fonts.is_empty() {
        unread.push("type (no family names under type:)".into());
    }

    let radius = lines.iter().find(|l| r.radius_line.test(l)).map(|l| numbers(&r.radius_line.replace(l, "")));
    if radius.is_none() {
        unread.push("shape.radius (add radius: [..] in px to check it)".into());
    }

    let mut durations = lines.iter().find(|l| r.dur_line.test(l)).map(|l| numbers(&r.dur_line.replace(l, "")));
    if durations.is_none() {
        let text = match key("motion", false) {
            Some(at) => std::iter::once(lines[at].clone()).chain(under(&lines, at)).collect::<Vec<_>>().join(" "),
            None => String::new(),
        };
        let ms: Vec<f64> = r.ms.match_all(&text).iter().map(|h| h.g(1).parse::<f64>().unwrap()).collect();
        durations = if ms.is_empty() { None } else { Some(unique(ms)) };
    }
    if durations.is_none() {
        unread.push("motion.durations (add durations: [..] in ms, or write them as 240ms)".into());
    }
    Some(Direction { colours, fonts, radius, durations, unread })
}

/// A drift hit: UTF-16 offset and length into the source text, and the message.
pub struct Hit {
    pub index: usize,
    pub length: usize,
    pub message: String,
}

impl Hit {
    pub fn to_json(&self) -> Value {
        json!({ "index": self.index, "length": self.length, "message": self.message })
    }
}

fn fix(what: &str) -> String {
    format!("use the token, or add it to DESIGN.md's direction ({what}) if the direction changed on purpose")
}

fn join_nums(xs: &[f64]) -> String {
    xs.iter().map(|x| num_str(*x)).collect::<Vec<_>>().join(", ")
}

pub fn drift_colours(text: &str, ext: &str, dir: &Direction) -> Vec<Hit> {
    let r = res();
    if dir.colours.is_empty() {
        return Vec::new();
    }
    let mut out = Vec::new();
    let mut check = |hex: &str, index: usize| {
        if ![4, 7, 9].contains(&len16(hex)) {
            return;
        }
        let n = norm_hex(hex);
        if dir.colours.contains(&n) || NEUTRAL.contains(&n.as_str()) {
            return;
        }
        out.push(Hit { index, length: len16(hex), message: format!("{hex} is not a direction colour in DESIGN.md: {}", fix("colour")) });
    };
    if STYLE_EXTS.contains(&ext) {
        for d in r.decl.match_all(text) {
            for m in r.css_hex.match_all(d.g(1)) {
                check(m.g(2), d.index + 1 + m.index + len16(m.g(1)));
            }
        }
        return out;
    }
    for m in r.code_hex.match_all(text) {
        let end = m.start + m.g(1).len();
        let before = &text[crate::js::back16(text, m.start, 16)..end];
        if r.link_before.test(before) {
            continue;
        }
        check(m.g(2), m.index + len16(m.g(1)));
    }
    out
}

pub fn drift_fonts(text: &str, dir: &Direction) -> Vec<Hit> {
    let r = res();
    if dir.fonts.is_empty() {
        return Vec::new();
    }
    let known: Vec<String> = dir.fonts.iter().map(|f| norm_font(f)).collect();
    let mut out = Vec::new();
    for m in r.font.match_all(text) {
        let first = r.quotes.replace(trim(m.g(2).split(',').next().unwrap_or("")), "");
        if first.is_empty() || r.generic.test(&first) || r.font_var.test(&first) {
            continue;
        }
        if known.contains(&norm_font(&first)) {
            continue;
        }
        out.push(Hit {
            index: m.index + len16(m.g(1)),
            length: len16(m.g(2)),
            message: format!("font \"{first}\" is not in DESIGN.md's type families ({}): {}", dir.fonts.join(", "), fix("type")),
        });
    }
    out
}

pub fn drift_radius(text: &str, dir: &Direction) -> Vec<Hit> {
    let r = res();
    let Some(known) = &dir.radius else { return Vec::new() };
    let mut out = Vec::new();
    for m in r.radius.match_all(text) {
        let values: Vec<f64> = r.radius_num.match_all(m.g(2)).iter().map(|v| v.g(1).parse::<f64>().unwrap()).collect();
        let bad: Vec<f64> = values.into_iter().filter(|v| *v != 0.0 && *v < 999.0 && !known.contains(v)).collect();
        if bad.is_empty() {
            continue;
        }
        out.push(Hit {
            index: m.index + len16(m.g(1)),
            length: len16(trim(m.g(2))),
            message: format!("radius {}px is not in DESIGN.md's shape.radius ({}): {}", join_nums(&bad), join_nums(known), fix("shape.radius")),
        });
    }
    out
}

fn ms_of(n: &str, unit: &str) -> f64 {
    round(n.parse::<f64>().unwrap() * if unit == "s" { 1000.0 } else { 1.0 })
}

pub fn drift_durations(text: &str, dir: &Direction) -> Vec<Hit> {
    let r = res();
    let Some(known) = &dir.durations else { return Vec::new() };
    let mut out = Vec::new();
    for m in r.motion.match_all(text) {
        if r.delay.test(m.g(1)) {
            continue;
        }
        let durs: Vec<f64> = if r.duration_key.test(m.g(1)) {
            r.time_all.match_all(m.g(2)).iter().map(|v| ms_of(v.g(1), v.g(2))).collect()
        } else {
            m.g(2).split(',').filter_map(|part| r.time_one.exec(part).map(|t| ms_of(t.g(1), t.g(2)))).collect()
        };
        let bad: Vec<f64> = durs.into_iter().filter(|v| *v > 0.0 && !known.contains(v)).collect();
        if bad.is_empty() {
            continue;
        }
        out.push(Hit {
            index: m.index + len16(m.g(1)),
            length: len16(trim(m.g(2))),
            message: format!("duration {}ms is not in DESIGN.md's motion durations ({}): {}", join_nums(&bad), join_nums(known), fix("motion.durations")),
        });
    }
    out
}

/// Direction values no scanned text uses.
pub fn unused_tokens(texts: &[String], dir: &Direction) -> Value {
    let all = texts.join("\n");
    let used: Vec<String> = res().hex.matches(&all).iter().map(|h| norm_hex(h)).collect();
    let flat = norm_font(&all);
    json!({
        "colours": dir.colours.iter().filter(|c| !used.contains(c)).collect::<Vec<_>>(),
        "fonts": dir.fonts.iter().filter(|f| !flat.contains(&norm_font(f))).collect::<Vec<_>>(),
    })
}
