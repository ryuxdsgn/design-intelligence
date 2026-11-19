//! Source scan: the detectors behind `ryux scan` and `scan_sources`. Offsets, lines, and columns are
//! UTF-16 code units, as JavaScript counts them. Findings come back ordered by source, then
//! line and column; ordering files by name (`localeCompare`) is left to the JavaScript caller.

use crate::drift::{self, Direction};
use crate::js::{len16, num_str, round, slice16, trim};
use crate::jsre::{byte_at, js, JsRe};
use crate::markup::{self, Markup};
use serde_json::{json, Value};
use std::collections::{HashMap, HashSet};
use std::sync::{Mutex, OnceLock};

/// A compiled JavaScript regex, kept for the life of the process.
fn re(pattern: &str, flags: &str) -> &'static JsRe {
    static CACHE: OnceLock<Mutex<HashMap<String, &'static JsRe>>> = OnceLock::new();
    let key = format!("{flags}/{pattern}");
    let mut cache = CACHE.get_or_init(|| Mutex::new(HashMap::new())).lock().unwrap();
    if let Some(r) = cache.get(&key) {
        return r;
    }
    let r: &'static JsRe = Box::leak(Box::new(js(pattern, flags)));
    cache.insert(key, r);
    r
}

pub struct Source {
    pub path: String,
    pub ext: String,
    pub raw: String,
    /// The raw text with comments blanked (same UTF-16 length and line breaks).
    pub text: String,
    /// The file read as structure, for the markup detectors (crate::markup), once.
    markup: std::cell::OnceCell<Option<Markup>>,
}

/// JSX, TSX, and HTML read as structure; None keeps a detector on its pattern over the text.
fn structure(s: &Source) -> Option<&Markup> {
    s.markup.get_or_init(|| markup::read(&s.raw, &s.ext)).as_ref()
}

#[derive(Default)]
pub struct Ctx {
    pub reduced_motion: Option<bool>,
    pub indonesian: Option<bool>,
    pub reduced_transparency: Option<bool>,
    pub growing_textarea: Option<bool>,
    pub design: Option<Direction>,
}

struct Hit {
    index: usize,
    message: String,
}

fn hit(index: usize, message: impl Into<String>) -> Hit {
    Hit { index, message: message.into() }
}

const MARKUP: &[&str] = &["html", "htm", "jsx", "tsx", "vue", "svelte", "astro"];
const STYLE: &[&str] = &["css", "scss", "sass", "less"];
const SCRIPT: &[&str] = &["js", "mjs", "cjs", "ts"];

fn is(ext: &str, sets: &[&[&str]]) -> bool {
    sets.iter().any(|s| s.contains(&ext))
}

const LOADER: &str = r"spin|load|skeleton|shimmer|progress|pulse|busy|pending";
const LAYOUT_PROPS: &str = r"^(?:width|height|top|left|right|bottom|margin(?:-\w+)?|padding(?:-\w+)?|max-height|max-width)$";
const GROWS: &str = r"field-sizing\s*:\s*content|fieldSizing|\bscrollHeight\b|[Aa]utosize|autoResize|auto-resize|\bminRows\b|\bmaxRows\b";
const INDONESIAN: &str = r#"\blang=["']id\b|\bid-ID\b|\blocale\s*[:=]\s*["'`]id\b|\bRp\.?\s?\d|\b(?:yang|untuk|tidak|silakan|pesanan|belum)\b"#;
const TEST_FILE: &str = r"(?:^|\/)(?:tests?|__tests__)\/|\.(?:test|spec)\.[cm]?[jt]sx?$";
const RUNTIME_LABEL: &str = r#"<[\w-]+(?![^>]*\baria-hidden\s*=\s*["']?true)[^>]*\s(?:id|data-bind|data-text|data-i18n|x-text|v-text)\s*=[^>]*>\s*<\/"#;
const SCRIM: &str = r#"^\s*<[\w.-]+(?=[\s/>])[^>]*\brole\s*=\s*["'{]?\s*["']?(?:alertdialog|dialog)\b"#;
const RUPIAH_FIX: &str = "write Rp1.250.000 (Rp right before the number, dots for thousands, no decimals)";

fn short(s: &str) -> String {
    let t = re(r"\s+", "g").replace(s, " ");
    let t = trim(&t);
    if len16(t) > 48 { format!("{}...", slice16(t, 0, Some(45))) } else { t.to_string() }
}

/// `Number.parseFloat` for the number forms the detectors capture.
fn parse_float(v: &str) -> f64 {
    let m = re(r"^[\s]*[+-]?(?:\d+\.?\d*(?:e[+-]?\d+)?|\.\d+(?:e[+-]?\d+)?)", "i").exec(v);
    m.map_or(f64::NAN, |h| trim(h.g(0)).parse::<f64>().unwrap_or(f64::NAN))
}

type Msg = fn(&crate::jsre::Hit) -> Option<String>;

fn matches(text: &str, patterns: &[(&str, &str, Msg)]) -> Vec<Hit> {
    let mut hits = Vec::new();
    for (p, flags, message) in patterns {
        let flags = if flags.contains('g') { flags.to_string() } else { format!("{flags}g") };
        for m in re(p, &flags).match_all(text) {
            if let Some(msg) = message(&m) {
                hits.push(hit(m.index, msg));
            }
        }
    }
    hits
}

/// UTF-16 units of `text`, for the scanners that walk it the way JavaScript indexes a string.
fn units(text: &str) -> Vec<u16> {
    text.encode_utf16().collect()
}

/// The end of the tag that opens at `start` (index of "<"), skipping ">" inside quotes and {...}.
fn tag_end(u: &[u16], start: usize) -> Option<usize> {
    let mut quote: u16 = 0;
    let mut depth: i64 = 0;
    for (i, &c) in u.iter().enumerate().skip(start + 1) {
        if quote != 0 {
            if c == quote {
                quote = 0;
            }
        } else if c == b'"' as u16 || c == b'\'' as u16 || c == b'`' as u16 {
            quote = c;
        } else if c == b'{' as u16 {
            depth += 1;
        } else if c == b'}' as u16 {
            depth = (depth - 1).max(0);
        } else if c == b'>' as u16 && depth == 0 {
            return Some(i);
        }
    }
    None
}

struct Tag {
    index: usize,
    length: usize,
    name: String,
    attrs: String,
}

fn tags(text: &str, names: &str) -> Vec<Tag> {
    let u = units(text);
    let mut out = Vec::new();
    for m in re(&format!(r"<({names})(?=[\s/>])"), "g").match_all(text) {
        let Some(end) = tag_end(&u, m.index) else { continue };
        out.push(Tag { index: m.index, length: end - m.index + 1, name: m.g(1).to_string(), attrs: String::from_utf16_lossy(&u[m.index + len16(m.g(0))..end]) });
    }
    out
}

fn rule_cd02(s: &Source, _: &Ctx) -> Vec<Hit> {
    matches(&s.text, &[
        (r"\bRp\.?[  ]*\d[\d.,]*", "", |m| {
            let v = re(r"[.,]$", "").replace(m.g(0), "");
            if re(r"^Rp\d{1,3}(?:(?:\.\d{3})*|,\d{1,2})$", "").test(&v) && !re(r",00$", "").test(m.g(0)) { None } else { Some(format!("\"{}\": {RUPIAH_FIX}", short(m.g(0)))) }
        }),
        (r"\bRp[  ]+(?:\{|\$\{)", "", |m| Some(format!("\"{}...\": Rupiah with a space before the value; {RUPIAH_FIX}", short(m.g(0))))),
        (r#"["'`]Rp\.?[  ]["'`]"#, "", |m| Some(format!("{}: a Rupiah prefix with a space; {RUPIAH_FIX}", short(m.g(0))))),
        (r"\bIDR[  ]?\d[\d.,]*", "", |m| Some(format!("\"{}\": {RUPIAH_FIX}", short(m.g(0))))),
    ])
}

fn rule_fe12(s: &Source, _: &Ctx) -> Vec<Hit> {
    matches(&s.text, &[(r#"currency\s*:\s*["'`]IDR["'`]"#, "", |_| Some("Intl currency style writes a space after Rp (and ,00 unless maximumFractionDigits is 0): format with id-ID grouping and prepend Rp".into()))])
}

fn rule_cd09(s: &Source, c: &Ctx) -> Vec<Hit> {
    if re(TEST_FILE, "").test(&s.path) || !c.indonesian.unwrap_or_else(|| re(INDONESIAN, "").test(&s.text)) {
        return Vec::new();
    }
    matches(&s.text, &[
        (r"(?<![\d/])\d{1,2}\/\d{1,2}\/\d{4}(?![\d/])", "", |m| Some(format!("\"{}\": in Indonesian copy write 2 Okt 2026 (other markets follow their locale)", m.g(0)))),
        (r"\b\d{1,2}[:.]\d{2}\s?(?:AM|PM|am|pm)\b", "", |m| Some(format!("\"{}\": in Indonesian copy write 14.30 in 24-hour form (other markets follow their locale)", m.g(0)))),
    ])
}

fn rule_cd12_label(s: &Source, _: &Ctx) -> Vec<Hit> {
    matches(&s.text, &[(r">\s*((?:baca |lihat )?selengkapnya|klik di ?sini|learn more|read more|click here|submit)\s*<\/(?:a|button|Link|NavLink|Button)\s*>", "i", |m| {
        Some(format!("\"{}\": a label that does not say where it leads or what it does; name the destination or the result (\"Lihat syarat promo\", \"Kirim laporan\")", m.g(1)))
    })])
}

fn rule_cd12_heading(s: &Source, _: &Ctx) -> Vec<Hit> {
    matches(&s.text, &[(r"<h[1-6]\b[^>]*>\s*(selamat datang di|yuk|ayo|welcome to|introducing)(?![\p{L}\d])", "iu", |m| {
        Some(format!("\"{}\": the first two words of a heading are what a scanning eye reads; start with what the section is about", m.g(1)))
    })])
}

fn rule_cd18(s: &Source, _: &Ctx) -> Vec<Hit> {
    matches(&s.text, &[(r">[^<>{}]*?(memungkinkan (?:anda|kamu)|kami memahami bahwa|perlu diketahui bahwa|allows you to|enables you to|we understand that)(?![\p{L}\d])[^<>{}]*<", "iu", |m| {
        Some(format!("\"{}\": filler that adds words, not meaning; say what the user can do (\"Bayar dengan QRIS\", not \"memungkinkan Anda membayar dengan QRIS\")", m.g(1)))
    })])
}

fn rule_cd19(s: &Source, _: &Ctx) -> Vec<Hit> {
    matches(&s.text, &[(r">[^<>{}]*?(?<![\p{L}\d#-])(terbaik|tercepat|termurah|nomor 1|#1|the best|fastest|cheapest|world[- ]class|best[- ]in[- ]class)(?![\p{L}\d])[^<>{}]*<", "iu", |m| {
        Some(format!("\"{}\": a superlative needs a source from the brief; otherwise write the fact that would earn it", m.g(1)))
    })])
}

fn rule_as03_lorem(s: &Source, _: &Ctx) -> Vec<Hit> {
    matches(&s.text, &[(r"\blorem ipsum\b", "i", |_| Some("lorem ipsum: use realistic sample content from the brief, labeled as sample data".into()))])
}

fn rule_as03_placeholder(s: &Source, _: &Ctx) -> Vec<Hit> {
    matches(&s.text, &[
        (r"\b(?:John|Jane) Doe\b", "", |m| Some(format!("\"{}\": a placeholder person; use realistic sample data and label it, or the real name", m.g(0)))),
        (r"\[(?:REAL DATA|DATA|TBD|TODO|PLACEHOLDER)\]", "i", |m| Some(format!("\"{}\": a placeholder where sample data would do; keep a visible placeholder only for an asset that does not exist yet", m.g(0)))),
        (r"(?<![A-Za-z])X{4,}(?![A-Za-z])", "", |m| Some(format!("\"{}\": placeholder characters; use realistic sample data, labeled", m.g(0)))),
    ])
}

fn rule_as04(s: &Source, _: &Ctx) -> Vec<Hit> {
    matches(&s.text, &[(
        r"\bonly \d+ (?:left|remaining)\b|\b(?:offer|sale|deal|promo) ends (?:tonight|today|soon)\b|\bhurry\b|\blimited time only\b|\bdon'?t miss out\b|\bhanya tersisa \d+|\btinggal \d+ lagi\b|\bburuan\b|\b(?:promo|diskon|penawaran) berakhir (?:malam ini|hari ini|segera)\b|\bjangan sampai kehabisan\b|\bstok terbatas\b",
        "i",
        |m| Some(format!("\"{}\": urgency copy; keep it only when the deadline or quota is real, stated as a plain fact", m.g(0))),
    )])
}

fn rule_a11y02_zoom(s: &Source, _: &Ctx) -> Vec<Hit> {
    matches(&s.text, &[(r#"user-scalable\s*=\s*["']?(?:no|0)\b|maximum-scale\s*=\s*["']?1(?:\.0+)?(?![\d.])|userScalable\s*:\s*false|maximumScale\s*:\s*1(?![\d.])"#, "i", |m| {
        Some(format!("\"{}\": people must be able to zoom; remove it", m.g(0)))
    })])
}

fn rule_a11y02_small(s: &Source, _: &Ctx) -> Vec<Hit> {
    matches(&s.text, &[(r#"font-size\s*:\s*(\d+(?:\.\d+)?)px|\btext-\[(\d+(?:\.\d+)?)px\]|fontSize\s*:\s*["'`]?(\d+(?:\.\d+)?)(?:px)?["'`]?(?=\s*[,}])"#, "", |m| {
        let raw = if m.has(1) { m.g(1) } else if m.has(2) { m.g(2) } else { m.g(3) };
        let v = parse_float(raw);
        if v < 12.0 { Some(format!("{}px text: body text is 14 to 16px on mobile; below 12px is hard to read", num_str(v))) } else { None }
    })])
}

fn rule_a11y03_tabindex(s: &Source, _: &Ctx) -> Vec<Hit> {
    let message = |v: &str| format!("tabindex {v}: keep focus order the same as the visual order; use 0 or the DOM order");
    if let Some(m) = structure(s) {
        return m.tabindex.iter().map(|(i, v)| hit(*i, message(v))).collect();
    }
    matches(&s.text, &[(r#"\btab[iI]ndex\s*=\s*(?:["']|\{\s*)?([1-9]\d*)"#, "", |m| {
        Some(format!("tabindex {}: keep focus order the same as the visual order; use 0 or the DOM order", m.g(1)))
    })])
}

fn rule_a11y03_outline(s: &Source, _: &Ctx) -> Vec<Hit> {
    let removed = re(r#"outline\s*:\s*["']?(?:none|0)\b|\boutline-none\b"#, "");
    let replaced = re(r"focus-visible|focus:(?:ring|border|shadow|bg|underline|outline-(?!none))", "");
    let message = "focus outline removed on a control with no focus-visible style: show a visible focus indicator";
    let text = &s.text;
    if STYLE.contains(&s.ext.as_str()) {
        if replaced.test(text) {
            return Vec::new();
        }
        let mut hits = Vec::new();
        let target = re(r"(?:^|[\s,>+~])(?:button|a|input|select|textarea|summary)\b|:focus(?!-visible|-within)|\[role|\.btn|\*", "");
        for m in re(r"([^{}]+)\{([^}]*)\}", "g").match_all(text) {
            if let Some(r) = removed.exec(m.g(2)) {
                if target.test(m.g(1)) {
                    hits.push(hit(m.index + len16(m.g(1)) + 1 + r.index, message));
                }
            }
        }
        return hits;
    }
    let tabout = re(r#"\btab[iI]ndex\s*=\s*(?:["']|\{\s*)?-1"#, "");
    let plain = re(r"^(?:div|span|li)$", "");
    let acts = re(r#"\brole\s*=\s*["']?(?:button|link|tab|menuitem|option|checkbox|switch)|(?:^|\s)(?:onClick|onclick|@click|on:click)\s*="#, "");
    tags(text, "button|a|input|select|textarea|summary|div|span|li")
        .into_iter()
        .filter(|t| {
            if !removed.test(&t.attrs) || replaced.test(&t.attrs) || tabout.test(&t.attrs) {
                return false;
            }
            !plain.test(&t.name) || acts.test(&t.attrs)
        })
        .map(|t| hit(t.index, message))
        .collect()
}

fn rule_a11y04_img(s: &Source, _: &Ctx) -> Vec<Hit> {
    const MESSAGE: &str = "an <img> with no alt: describe meaningful images, use alt=\"\" for decorative ones";
    if let Some(m) = structure(s) {
        return m.img.iter().map(|&i| hit(i, MESSAGE)).collect();
    }
    tags(&s.text, "img")
        .into_iter()
        .filter(|t| !re(r"\balt\s*=", "").test(&t.attrs) && !re(r"\{\s*\.\.\.", "").test(&t.attrs))
        .map(|t| hit(t.index, MESSAGE))
        .collect()
}

fn rule_a11y04_click(s: &Source, _: &Ctx) -> Vec<Hit> {
    let message = |tag: &str| format!("a clickable <{tag}>: use a <button> or <a> so it works from the keyboard and has a role");
    if let Some(m) = structure(s) {
        return m.click.iter().map(|(i, tag)| hit(*i, message(tag))).collect();
    }
    tags(&s.text, "div|span")
        .into_iter()
        .filter(|t| {
            re(r"(?:^|\s)(?:onClick|onclick|@click|v-on:click|on:click)\s*=", "").test(&t.attrs) && !re(r"\brole\s*=", "").test(&t.attrs) && !re(SCRIM, "").test(&s.text[byte_at(&s.text, t.index + t.length)..])
        })
        .map(|t| hit(t.index, message(&t.name)))
        .collect()
}

/// `text.indexOf(needle, from)` in UTF-16 units.
fn index_of(u: &[u16], needle: &str, from: usize) -> Option<usize> {
    let n: Vec<u16> = needle.encode_utf16().collect();
    if from > u.len() {
        return None;
    }
    (from..=u.len().saturating_sub(n.len())).find(|&i| u[i..].starts_with(&n))
}

fn rule_a11y04_icon(s: &Source, _: &Ctx) -> Vec<Hit> {
    const MESSAGE: &str = "an icon-only <button> with no name: add aria-label or visually hidden text";
    if let Some(m) = structure(s) {
        return m.icon.iter().map(|&i| hit(i, MESSAGE)).collect();
    }
    let u = units(&s.text);
    let mut out = Vec::new();
    for t in tags(&s.text, "button") {
        if re(r"\baria-label(?:ledby)?\s*=|\btitle\s*=|\{\s*\.\.\.", "").test(&t.attrs) {
            continue;
        }
        let Some(close) = index_of(&u, "</button>", t.index + t.length) else { continue };
        let inner = String::from_utf16_lossy(&u[t.index + t.length..close]);
        let icon = re(r"<svg\b|<i\b|<[A-Z]\w*", "").test(&inner);
        let named = re(r#"\balt\s*=\s*["'][^"']+["']|\baria-label\s*="#, "").test(&inner) || re(RUNTIME_LABEL, "").test(&inner);
        let words = re(r"<[^>]*>", "g").replace(&inner, "");
        if icon && !named && trim(&words).is_empty() {
            out.push(hit(t.index, MESSAGE));
        }
    }
    out
}

fn rule_a11y04_heading(s: &Source, _: &Ctx) -> Vec<Hit> {
    // One finding per skip per file, at its first place, with how often it repeats.
    let mut skips: Vec<((i64, i64), usize, usize)> = Vec::new();
    let mut prev = 0;
    let headings: Vec<(usize, i64)> = match structure(s) {
        Some(m) => m.headings.clone(),
        None => re(r"<h([1-6])(?=[\s>])", "g").match_all(&s.text).iter().map(|m| (m.index, m.g(1).parse().unwrap())).collect(),
    };
    for (index, level) in headings {
        if prev != 0 && level > prev + 1 {
            match skips.iter_mut().find(|k| k.0 == (prev, level)) {
                Some(k) => k.2 += 1,
                None => skips.push(((prev, level), index, 1)),
            }
        }
        prev = level;
    }
    skips
        .into_iter()
        .map(|((from, to), index, count)| {
            let more = if count > 1 { format!(" ({count} times in this file: fix it once where it repeats)") } else { String::new() };
            hit(index, format!("h{from} then h{to}: headings skip a level; use h{}{more}", from + 1))
        })
        .collect()
}

fn first(s: &Source, pattern: &str, message: impl Fn(&str) -> String) -> Vec<Hit> {
    re(pattern, "").exec(&s.text).map_or(Vec::new(), |m| vec![hit(m.index, message(m.g(0)))])
}

fn rule_fm05(s: &Source, c: &Ctx) -> Vec<Hit> {
    if c.growing_textarea != Some(false) {
        return Vec::new();
    }
    first(s, r"<(?:textarea|Textarea|TextArea)\b", |_| "a textarea, and nothing in the scanned folder makes one grow with its text: a fixed box hides what the person wrote past its edge; use field-sizing: content, with a script that sets the height from scrollHeight where it is not supported".into())
}

fn rule_a11y08_motion(s: &Source, c: &Ctx) -> Vec<Hit> {
    if c.reduced_motion != Some(false) {
        return Vec::new();
    }
    first(s, r"@keyframes\b|\banimation\s*:|\banimate-[a-z]|<motion\.\w+", |m| format!("\"{m}\" and nothing in the scanned folder handles prefers-reduced-motion: replace large movement with a fade or a cut when it is set"))
}

fn rule_a11y08_loop(s: &Source, _: &Ctx) -> Vec<Hit> {
    let mut hits = Vec::new();
    for m in re(r"\banimation(?:-iteration-count)?\s*:[^;}\n]*\binfinite\b|\brepeat\s*:\s*Infinity\b|\banimate-(?:bounce|ping)\b", "g").match_all(&s.text) {
        let around = &s.text[crate::js::back16(&s.text, m.start, 160)..crate::js::fwd16(&s.text, m.end, 40)];
        if re(LOADER, "i").test(around) {
            continue;
        }
        hits.push(hit(m.index, format!("\"{}\" repeats forever: give it a pause or stop control, stop it after a few cycles, or keep looping only for a loading indicator", trim(m.g(0)))));
    }
    hits
}

fn rule_ui11_props(s: &Source, _: &Ctx) -> Vec<Hit> {
    let mut hits = Vec::new();
    for m in re(r#"\btransition(?:-property)?\s*:\s*([^;}"'`\n]+)|\btransition-all\b"#, "g").match_all(&s.text) {
        if m.g(0) == "transition-all" {
            hits.push(hit(m.index, "transition-all animates every property: name the ones that move, transform and opacity where you can"));
            continue;
        }
        let props: Vec<String> = m.g(1).split(',').map(|part| re(r"\s+", "").split(trim(part))[0].clone()).collect();
        let bad: Vec<&String> = props.iter().filter(|p| p.as_str() == "all" || re(LAYOUT_PROPS, "").test(p)).collect();
        if bad.is_empty() {
            continue;
        }
        let msg = if bad.iter().any(|p| p.as_str() == "all") {
            "a transition on all properties: name the ones that move, transform and opacity where you can".to_string()
        } else {
            format!("a transition on {}: animate transform or opacity instead, so the page is not laid out again every frame", bad.iter().map(|p| p.as_str()).collect::<Vec<_>>().join(", "))
        };
        hits.push(hit(m.index, msg));
    }
    hits
}

fn rule_ui11_long(s: &Source, _: &Ctx) -> Vec<Hit> {
    let mut hits = Vec::new();
    let ms = |v: &str, unit: &str| { let n: f64 = v.parse().unwrap_or(f64::NAN); if unit == "s" { n * 1000.0 } else { n } };
    for m in re(r#"\btransition(?:-duration)?\s*:\s*([^;}"'`\n]+)"#, "g").match_all(&s.text) {
        let longest = m.g(1).split(',').map(|part| re(r"(?<![\w.-])(\d*\.?\d+)(ms|s)\b", "").exec(part).map_or(0.0, |t| ms(t.g(1), t.g(2)))).fold(0.0, |a: f64, b| if b.is_nan() || a.is_nan() { f64::NAN } else { a.max(b) });
        if longest > 500.0 {
            hits.push(hit(m.index, format!("a {} ms transition: task UI reads anything near 500 ms as waiting; about 100 to 300 ms, 400 ms for a large move", num_str(round(longest)))));
        }
    }
    for m in re(r"\bduration-(\d{3,4})\b", "g").match_all(&s.text) {
        if m.g(1).parse::<f64>().unwrap() > 500.0 {
            hits.push(hit(m.index, format!("{}: task UI reads anything near 500 ms as waiting; about 100 to 300 ms, 400 ms for a large move", m.g(0))));
        }
    }
    hits
}

fn rule_ui35(s: &Source, c: &Ctx) -> Vec<Hit> {
    if c.reduced_transparency != Some(false) {
        return Vec::new();
    }
    first(s, r"\bbackdrop-filter\s*:|\bbackdrop-blur\b|\bbackdropFilter\s*:", |m| format!("\"{m}\" and nothing in the scanned folder handles prefers-reduced-transparency or prefers-contrast: fall back to a solid surface when either is set, and check text contrast over the busiest background"))
}

/// The JavaScript pattern `(?<=[:(,[]\s*|["'`])(?<!(?:fill|stroke|stop-color)=["'])` before a hex: JavaScript has
/// variable-length lookbehind, fancy-regex does not, so it is checked here on the text before the "#".
fn hex_lookbehind_ok(before: &str) -> bool {
    let quoted_attr = ["fill=\"", "fill='", "stroke=\"", "stroke='", "stop-color=\"", "stop-color='"].iter().any(|p| before.ends_with(p));
    if quoted_attr {
        return false;
    }
    if before.ends_with(['"', '\'', '`']) {
        return true;
    }
    re(r"[:(,[]\s*$", "").test(before)
}

fn rule_ds03_oneoff(s: &Source, _: &Ctx) -> Vec<Hit> {
    if re(r"token|theme|colou?r|palette|tailwind\.config", "i").test(&s.path) {
        return Vec::new();
    }
    let mut offset = 0;
    let mut found: Vec<(usize, String)> = Vec::new();
    let hex = re(r"#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b", "g");
    for line in s.text.split('\n') {
        if !re(r"--[\w-]+\s*:", "").test(line) {
            for m in hex.match_all(line) {
                if hex_lookbehind_ok(&line[..m.start]) {
                    found.push((offset + m.index, m.g(0).to_lowercase()));
                }
            }
        }
        offset += len16(line) + 1;
    }
    let mut distinct: Vec<String> = Vec::new();
    for (_, v) in &found {
        if !distinct.contains(v) {
            distinct.push(v.clone());
        }
    }
    if distinct.len() < 3 {
        return Vec::new();
    }
    vec![hit(found[0].0, format!("{} one-off colors ({}{}): use the color tokens, or define them by role", distinct.len(), distinct[..3].join(", "), if distinct.len() > 3 { ", ..." } else { "" }))]
}

fn rule_ui19_viewbox(s: &Source, _: &Ctx) -> Vec<Hit> {
    match tags(&s.text, "svg").into_iter().next() {
        Some(root) if !re(r"\bviewBox\s*=", "").test(&root.attrs) => vec![hit(root.index, "<svg> with no viewBox: add one (viewBox=\"0 0 w h\") so the art scales with its container")],
        _ => Vec::new(),
    }
}

fn rule_ui19_art(s: &Source, _: &Ctx) -> Vec<Hit> {
    let Some(root) = tags(&s.text, "svg").into_iter().next() else { return Vec::new() };
    let fixed: Vec<(String, String)> = re(r#"(?<![\w:-])(width|height)\s*=\s*["']([^"']+)["']"#, "g")
        .match_all(&root.attrs)
        .into_iter()
        .filter(|m| !re(r"%$", "").test(trim(m.g(2))))
        .map(|m| (m.g(1).to_string(), m.g(2).to_string()))
        .collect();
    let mut out = Vec::new();
    if !fixed.is_empty() {
        let list: Vec<String> = fixed.iter().map(|(k, v)| format!("{k}=\"{v}\"")).collect();
        out.push(hit(root.index, format!("fixed {} on the root: leave the size to CSS so the art fits its container", list.join(" "))));
    }
    for (p, message) in [
        (r"<(?:image|feImage)\b|data:image\/(?:png|jpe?g|gif|webp)", "an embedded raster inside the SVG: draw it as vector, or ship the raster on its own at 2x"),
        (r"<text\b", "<text> inside the art: keep words in the HTML so they can be translated, read, and zoomed"),
        (r"\b(?:sodipodi|inkscape):|xmlns:sketch|data-figma|<metadata\b", "editor metadata: export without it"),
    ] {
        if let Some(m) = re(p, "").exec(&s.text) {
            out.push(hit(m.index, message));
        }
    }
    out
}

fn rule_ds03_drift(s: &Source, c: &Ctx) -> Vec<Hit> {
    let Some(d) = &c.design else { return Vec::new() };
    let all = [drift::drift_colours(&s.text, &s.ext, d), drift::drift_fonts(&s.text, d), drift::drift_radius(&s.text, d), drift::drift_durations(&s.text, d)];
    all.into_iter().flatten().map(|h| hit(h.index, h.message)).collect()
}

struct Detector {
    rule: &'static str,
    level: &'static str,
    exts: fn(&str) -> bool,
    folder: bool,
    find: fn(&Source, &Ctx) -> Vec<Hit>,
}

fn all(e: &str) -> bool {
    is(e, &[MARKUP, STYLE, SCRIPT]) || e == "svg"
}
fn code(e: &str) -> bool {
    is(e, &[MARKUP, SCRIPT])
}
fn markup(e: &str) -> bool {
    is(e, &[MARKUP])
}
fn visual(e: &str) -> bool {
    is(e, &[MARKUP, STYLE, SCRIPT])
}
fn markup_style(e: &str) -> bool {
    is(e, &[MARKUP, STYLE])
}
fn markup_script(e: &str) -> bool {
    is(e, &[MARKUP, SCRIPT])
}
fn svg(e: &str) -> bool {
    e == "svg"
}

/// The detectors, in the catalogue's order (findings on one line and column keep this order).
fn detectors() -> &'static [Detector] {
    const D: &[Detector] = &[
        Detector { rule: "RX-DS-03", level: "warn", exts: all, folder: false, find: rule_ds03_drift },
        Detector { rule: "RX-CD-02", level: "fail", exts: all, folder: false, find: rule_cd02 },
        Detector { rule: "RX-FE-12", level: "warn", exts: code, folder: false, find: rule_fe12 },
        Detector { rule: "RX-CD-09", level: "warn", exts: code, folder: false, find: rule_cd09 },
        Detector { rule: "RX-CD-12", level: "warn", exts: markup, folder: false, find: rule_cd12_label },
        Detector { rule: "RX-CD-12", level: "warn", exts: markup, folder: false, find: rule_cd12_heading },
        Detector { rule: "RX-CD-18", level: "warn", exts: markup, folder: false, find: rule_cd18 },
        Detector { rule: "RX-CD-19", level: "warn", exts: markup, folder: false, find: rule_cd19 },
        Detector { rule: "RX-AS-03", level: "fail", exts: code, folder: false, find: rule_as03_lorem },
        Detector { rule: "RX-AS-03", level: "warn", exts: code, folder: false, find: rule_as03_placeholder },
        Detector { rule: "RX-AS-04", level: "warn", exts: code, folder: false, find: rule_as04 },
        Detector { rule: "RX-A11Y-02", level: "fail", exts: code, folder: false, find: rule_a11y02_zoom },
        Detector { rule: "RX-A11Y-02", level: "warn", exts: visual, folder: false, find: rule_a11y02_small },
        Detector { rule: "RX-A11Y-03", level: "fail", exts: markup, folder: false, find: rule_a11y03_tabindex },
        Detector { rule: "RX-A11Y-03", level: "warn", exts: markup_style, folder: false, find: rule_a11y03_outline },
        Detector { rule: "RX-A11Y-04", level: "fail", exts: markup, folder: false, find: rule_a11y04_img },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_click },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_icon },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_heading },
        Detector { rule: "RX-FM-05", level: "warn", exts: markup_script, folder: true, find: rule_fm05 },
        Detector { rule: "RX-A11Y-08", level: "warn", exts: visual, folder: true, find: rule_a11y08_motion },
        Detector { rule: "RX-A11Y-08", level: "warn", exts: visual, folder: false, find: rule_a11y08_loop },
        Detector { rule: "RX-UI-11", level: "warn", exts: visual, folder: false, find: rule_ui11_props },
        Detector { rule: "RX-UI-11", level: "warn", exts: visual, folder: false, find: rule_ui11_long },
        Detector { rule: "RX-UI-35", level: "warn", exts: visual, folder: true, find: rule_ui35 },
        Detector { rule: "RX-DS-03", level: "warn", exts: visual, folder: false, find: rule_ds03_oneoff },
        Detector { rule: "RX-UI-19", level: "fail", exts: svg, folder: false, find: rule_ui19_viewbox },
        Detector { rule: "RX-UI-19", level: "warn", exts: svg, folder: false, find: rule_ui19_art },
    ];
    D
}

/// Blank out comments (keeping UTF-16 length and line breaks) so commented-out code is not scanned.
pub fn strip_comments(raw: &str, ext: &str) -> String {
    let blank = |s: &str| -> String { s.chars().map(|c| if c == '\n' { "\n".to_string() } else { " ".repeat(c.len_utf16()) }).collect() };
    let mut text = raw.to_string();
    for p in [r"\/\*[\s\S]*?\*\/", r"<!--[\s\S]*?-->"] {
        text = replace_with(re(p, "g"), &text, |h| blank(h.g(0)));
    }
    if ext != "css" {
        text = replace_with(re(r#"(^|[^:\\"'`])(\/\/[^\n]*)"#, "g"), &text, |h| format!("{}{}", h.g(1), blank(h.g(2))));
    }
    text
}

fn replace_with(r: &JsRe, s: &str, f: impl Fn(&crate::jsre::Hit) -> String) -> String {
    let mut out = String::new();
    let mut last = 0;
    for h in r.match_all(s) {
        out.push_str(&s[last..h.start]);
        out.push_str(&f(&h));
        last = h.end;
    }
    out.push_str(&s[last..]);
    out
}

pub fn to_source(path: &str, raw: &str) -> Source {
    let u: Vec<u16> = path.encode_utf16().collect();
    let dot = u.iter().rposition(|&c| c == b'.' as u16).map_or(0, |i| i + 1);
    let ext = String::from_utf16_lossy(&u[dot..]).to_lowercase();
    Source { path: path.to_string(), text: strip_comments(raw, &ext), ext, raw: raw.to_string(), markup: Default::default() }
}

struct Ignores {
    file: HashSet<String>,
    lines: HashMap<usize, HashSet<String>>,
}

fn ignores(raw: &str) -> Ignores {
    let mut file = HashSet::new();
    let mut lines: HashMap<usize, HashSet<String>> = HashMap::new();
    for (i, line) in raw.split('\n').enumerate() {
        let Some(m) = re(r"ryux-ignore(-file)?((?:[\s,]+RX-[A-Z0-9]+-\d+)*)", "").exec(line) else { continue };
        let mut ids = re(r"RX-[A-Z0-9]+-\d+", "g").matches(m.g(2));
        if ids.is_empty() {
            ids = vec!["*".into()];
        }
        if m.has(1) {
            file.extend(ids);
        } else {
            for n in [i + 1, i + 2] {
                lines.entry(n).or_default().extend(ids.iter().cloned());
            }
        }
    }
    Ignores { file, lines }
}

/// Line and column (UTF-16) of a UTF-16 offset in `raw`.
fn line_col(raw: &str, index: usize) -> (usize, usize) {
    let before = &raw[..byte_at(raw, index)];
    let line = before.matches('\n').count() + 1;
    let last = before.rfind('\n').map_or(-1, |b| len16(&before[..b]) as isize);
    (line, (index as isize - last) as usize)
}

pub struct ScanOptions {
    pub folder: bool,
    pub skip: HashSet<String>,
    pub design: Option<Direction>,
}

/// Run every detector over the sources: findings by source, then line and column.
pub fn scan_sources(sources: &[Source], opts: ScanOptions) -> Vec<Value> {
    run(sources, opts, detectors())
}

fn rule_a11y03_drag(s: &Source, _: &Ctx) -> Vec<Hit> {
    crate::jsx::drag_without_keyboard(&s.raw, &s.ext)
        .into_iter()
        .map(|d| hit(d.index, format!("a <{}> that starts a drag ({}) with no keyboard way: give it a role such as slider, with tabIndex and arrow keys, or add controls that do the same without dragging (WCAG 2.1.1, 2.5.7)", d.tag, d.via)))
        .collect()
}

fn jsx(e: &str) -> bool {
    e == "jsx" || e == "tsx"
}

/// The checks that read JSX and TSX as a syntax tree, run apart from `scan_sources` (whose output
/// fixtures/checks/scan.json records) with the same options and ignores.
fn syntax_detectors() -> &'static [Detector] {
    const D: &[Detector] = &[Detector { rule: "RX-A11Y-03", level: "warn", exts: jsx, folder: false, find: rule_a11y03_drag }];
    D
}

pub fn scan_syntax(sources: &[Source], opts: ScanOptions) -> Vec<Value> {
    run(sources, opts, syntax_detectors())
}

fn run(sources: &[Source], opts: ScanOptions, detectors: &[Detector]) -> Vec<Value> {
    let mut ctx = if opts.folder {
        Ctx {
            reduced_motion: Some(sources.iter().any(|s| re(r"prefers-reduced-motion|motion-(?:reduce|safe):|useReducedMotion|reducedMotion", "").test(&s.text))),
            indonesian: Some(sources.iter().any(|s| !re(TEST_FILE, "").test(&s.path) && re(INDONESIAN, "").test(&s.text))),
            reduced_transparency: Some(sources.iter().any(|s| re(r"prefers-reduced-transparency|prefers-contrast|contrast-more:|useReducedTransparency", "").test(&s.text))),
            growing_textarea: Some(sources.iter().any(|s| re(GROWS, "").test(&s.text))),
            design: None,
        }
    } else {
        Ctx::default()
    };
    ctx.design = opts.design;
    let mut out: Vec<(usize, usize, usize, Value)> = Vec::new();
    for (si, src) in sources.iter().enumerate() {
        let ign = ignores(&src.raw);
        for d in detectors {
            if !(d.exts)(&src.ext) || opts.skip.contains(d.rule) || ign.file.contains(d.rule) || ign.file.contains("*") {
                continue;
            }
            if d.folder && !opts.folder {
                continue;
            }
            let mut seen = HashSet::new();
            for h in (d.find)(src, &ctx) {
                let (line, column) = line_col(&src.raw, h.index);
                let off = ign.lines.get(&line);
                if seen.contains(&h.index) || off.map_or(false, |o| o.contains(d.rule) || o.contains("*")) {
                    continue;
                }
                seen.insert(h.index);
                out.push((si, line, column, json!({ "level": d.level, "rule": d.rule, "file": src.path, "line": line, "column": column, "message": h.message })));
            }
        }
    }
    out.sort_by(|a, b| (a.0, a.1, a.2).cmp(&(b.0, b.1, b.2)));
    out.into_iter().map(|x| x.3).collect()
}

/// The detectors as data, in order: `[{rule, level, folder}]`; `syntax` picks the JSX and TSX syntax checks.
/// The CLI's catalogue (packages/cli/src/checks.ts, printed by `ryux scan --list-rules` and the rule text) is
/// tested against it, so the two lists cannot drift apart.
pub fn catalogue(syntax: bool) -> Value {
    let list = if syntax { syntax_detectors() } else { detectors() };
    Value::Array(list.iter().map(|d| json!({ "rule": d.rule, "level": d.level, "folder": d.folder })).collect())
}
