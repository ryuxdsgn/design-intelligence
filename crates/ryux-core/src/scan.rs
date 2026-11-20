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
    /// The file read as a module (what it defines and re-exports), once.
    module: std::cell::OnceCell<Option<markup::Module>>,
}

fn module_of(s: &Source) -> Option<&markup::Module> {
    s.module.get_or_init(|| if is(&s.ext, &[SCRIPT, &["jsx", "tsx", "mts", "cts"]]) { markup::module(&s.text, &s.ext) } else { None }).as_ref()
}

/// JSX, TSX, and HTML read as structure; None keeps a detector on its pattern over the text.
fn structure(s: &Source) -> Option<&Markup> {
    s.markup.get_or_init(|| markup::read(&s.raw, &s.ext)).as_ref()
}

#[derive(Default)]
pub struct Ctx<'a> {
    pub reduced_motion: Option<bool>,
    pub indonesian: Option<bool>,
    pub reduced_transparency: Option<bool>,
    pub growing_textarea: Option<bool>,
    pub design: Option<Direction>,
    /// Every file the scan was given, scanned or context only, by its normalized path.
    files: HashMap<String, &'a Source>,
}

/// A path with forward slashes, and "." and ".." resolved where they can be.
pub fn norm(p: &str) -> String {
    let p = p.replace('\\', "/");
    let mut out: Vec<&str> = Vec::new();
    for seg in p.split('/') {
        match seg {
            "" | "." => {}
            ".." if out.last().is_some_and(|l| *l != "..") => {
                out.pop();
            }
            s => out.push(s),
        }
    }
    let joined = out.join("/");
    if p.starts_with('/') { format!("/{joined}") } else { joined }
}

fn dir_of(path: &str) -> String {
    let p = path.replace('\\', "/");
    p.rfind('/').map_or(String::new(), |i| p[..i].to_string())
}

fn join(dir: &str, rel: &str) -> String {
    norm(&if dir.is_empty() { rel.to_string() } else { format!("{dir}/{rel}") })
}

/// The file a page's `<script src>` names, when it is in the project: not another site, not the site root (which
/// the scan cannot place), not a data: URL.
fn local_script(dir: &str, src: &str) -> Option<String> {
    let src = src.trim();
    let src = src.split(['?', '#']).next().unwrap_or("");
    if src.is_empty() || src.starts_with('/') || src.starts_with('\\') || re(r"^[A-Za-z][\w+.-]*:", "").test(src) {
        return None;
    }
    Some(join(dir, src))
}

/// The files a relative import may name, in the order a bundler tries them.
fn candidates(dir: &str, spec: &str) -> Vec<String> {
    let base = join(dir, spec);
    let mut out = vec![base.clone()];
    out.extend(["tsx", "ts", "jsx", "js", "mjs"].iter().map(|e| format!("{base}.{e}")));
    out.extend(["tsx", "ts", "jsx", "js"].iter().map(|e| format!("{base}/index.{e}")));
    out
}

/// The files the scan would read to judge these sources fully: the scripts a page loads, the modules its loading
/// components come from, and, with `reexports` (for files read because another named them), what those modules
/// re-export. The caller reads the ones that exist and passes them as context; one it cannot read leaves the check
/// quiet.
pub fn references(sources: &[Source], reexports: bool) -> Vec<String> {
    let mut out: Vec<String> = Vec::new();
    for s in sources {
        let dir = dir_of(&s.path);
        if let Some(m) = structure(s) {
            out.extend(m.scripts.iter().filter_map(|src| local_script(&dir, src)));
            for (_, _, from) in &m.loaders_from {
                if from.starts_with('.') {
                    out.extend(candidates(&dir, from));
                }
            }
        }
        if let Some(m) = module_of(s).filter(|_| reexports) {
            for (from, _) in &m.reexports {
                if from.starts_with('.') {
                    out.extend(candidates(&dir, from));
                }
            }
        }
    }
    let mut seen = HashSet::new();
    out.retain(|p| seen.insert(p.clone()));
    out
}

/// The page's text with the text of every script it loads, or None when one of them is not in the scan (another
/// site, the site root, or a file the caller did not pass): then what the page does at run time is out of sight.
fn with_scripts(s: &Source, m: &Markup, ctx: &Ctx) -> Option<String> {
    let dir = dir_of(&s.path);
    let mut text = s.text.clone();
    for src in &m.scripts {
        let file = ctx.files.get(&local_script(&dir, src)?)?;
        text.push('\n');
        text.push_str(&file.text);
    }
    Some(text)
}

/// Whether the component `name` that `from_file` imports from `spec` announces a wait in its own markup, following
/// re-exports; None when the scan does not have the module that defines it.
fn announces(ctx: &Ctx, from_file: &str, spec: &str, name: &str, depth: usize) -> Option<bool> {
    if depth > 4 || !spec.starts_with('.') {
        return None;
    }
    let file = candidates(&dir_of(from_file), spec).into_iter().find_map(|c| ctx.files.get(&c).copied())?;
    let m = module_of(file)?;
    if let Some((_, a, b)) = m.defs.iter().find(|d| d.0 == name) {
        return Some(re(ANNOUNCED, "").test(&file.text[*a..*b]));
    }
    for (from, names) in &m.reexports {
        let there = match names {
            None if name != "default" => name.to_string(),
            None => continue,
            Some(list) => match list.iter().find(|(_, exported)| exported == name) {
                Some((imported, _)) => imported.clone(),
                None => continue,
            },
        };
        if let Some(found) = announces(ctx, &file.path, from, &there, depth + 1) {
            return Some(found);
        }
    }
    None
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

fn rule_a11y04_untyped(s: &Source, _: &Ctx) -> Vec<Hit> {
    // Vue, Svelte, and Astro have no tree here, and no pattern stands in for one.
    let Some(m) = structure(s) else { return Vec::new() };
    m.untyped.iter().map(|&i| hit(i, "a <button> with no type inside a <form> submits the form when pressed: add type=\"button\", or type=\"submit\" if it sends the form")).collect()
}

/// Anything in the file that tells assistive technology about a wait. Read broadly, over the text: a mention
/// anywhere keeps the file quiet, since a false alarm costs more here than a miss.
const ANNOUNCED: &str = r#"aria-busy|ariaBusy|aria-live|ariaLive|\brole\s*[=:]\s*\{?\s*["'`](?:status|alert|progressbar)\b|setAttribute\(\s*["']role["']\s*,\s*["'](?:status|alert|progressbar)\b|<output\b|<progress\b"#;

fn rule_ix02_loading(s: &Source, c: &Ctx) -> Vec<Hit> {
    let Some(m) = structure(s) else { return Vec::new() };
    // a component from another module counts when that module has it and it announces nothing itself
    let from = m.loaders_from.iter().filter(|(_, name, spec)| announces(c, &s.path, spec, name, 0) == Some(false)).map(|l| l.0);
    let Some(at) = m.loading.into_iter().chain(from).min() else { return Vec::new() };
    match with_scripts(s, m, c) {
        Some(text) if !re(ANNOUNCED, "").test(&text) => {}
        _ => return Vec::new(),
    }
    vec![hit(at, "a loading indicator that only shows: nothing in this file tells a screen reader about the wait; put aria-busy on the region that is loading, or the in-progress text in a role=\"status\" element")]
}

/// Dialog and focus libraries that close on Esc and keep focus inside.
const DIALOG_LIBRARY: &str = r#"["'](?:focus-trap|focus-trap-react|react-focus-lock|@radix-ui/react-dialog|@radix-ui/react-alert-dialog|@headlessui/react|react-aria|react-aria-components|@reach/dialog|@ark-ui/[\w-]+|vaul|react-modal)(?:/[\w./-]*)?["']"#;

/// What a modal dialog's file (with the scripts a page loads) shows of a keyboard way out.
#[derive(PartialEq)]
enum WayOut {
    None,
    Esc,
    Tab,
    Both,
}

/// Esc and Tab, as the text shows them. Both: showModal() on a native <dialog>, or a known dialog or focus library.
/// Esc: an Esc key check (key "Escape", keyCode 27), or a word that names Esc in an identifier (useEscape,
/// closeOnEsc, onEscapeKeyDown). A cancel handler is not one: on a native <dialog> it is Esc, but that is not judged
/// here, and on anything else `onCancel` is a button's handler. Tab kept inside: a Tab key check (key "Tab", keyCode 9), inert on the
/// page behind, or a word for a focus trap (trapFocus, FocusTrap, FocusScope, FocusLock).
fn way_out(text: &str) -> WayOut {
    if re(r"\.showModal\s*\(", "").test(text) || re(DIALOG_LIBRARY, "").test(text) {
        return WayOut::Both;
    }
    let mut esc = re(r#"\b(?:keyCode|which)\s*===?\s*27\b|\b27\s*===?\s*[\w.]*\b(?:keyCode|which)\b"#, "").test(text);
    let mut tab = re(r#"\b(?:keyCode|which)\s*===?\s*9\b|\b9\s*===?\s*[\w.]*\b(?:keyCode|which)\b|["'`]Tab["'`]"#, "").test(text);
    let mut prev: Option<String> = None;
    for token in re(r"[A-Za-z_$][\w$]*", "g").matches(text) {
        for w in markup::words(&token) {
            let pair = prev.as_deref().map(|p| (p, w.as_str()));
            esc |= matches!(w.as_str(), "esc" | "escape");
            tab |= w == "inert" || w == "trap" || matches!(pair, Some(("focus", "lock" | "scope" | "guard")));
            prev = Some(w);
        }
        prev = None;
    }
    match (esc, tab) {
        (true, true) => WayOut::Both,
        (true, false) => WayOut::Esc,
        (false, true) => WayOut::Tab,
        (false, false) => WayOut::None,
    }
}

fn rule_a11y03_dialog(s: &Source, c: &Ctx) -> Vec<Hit> {
    let Some(m) = structure(s) else { return Vec::new() };
    let Some(at) = m.dialog else { return Vec::new() };
    let Some(text) = with_scripts(s, m, c) else { return Vec::new() };
    let message = match way_out(&text) {
        WayOut::Both => return Vec::new(),
        WayOut::None => "a modal dialog that does not close on Esc and does not keep Tab inside it: close it on Esc and keep focus inside it while it is open (showModal() on a <dialog> does both), or use a dialog component that does",
        WayOut::Esc => "a modal dialog that closes on Esc but lets Tab move to the page behind it: keep focus inside it while it is open (showModal() on a <dialog> does both), or use a dialog component that does",
        WayOut::Tab => "a modal dialog that keeps Tab inside but does not close on Esc: close it on Esc too (showModal() on a <dialog> does both), or use a dialog component that does",
    };
    vec![hit(at, message)]
}

/// An inline confirmation (an alertdialog that is not modal) that nothing moves focus into: no autofocus in its own
/// markup, and no .focus() call in its file or the scripts a page loads. Quiet when a page loads a script the scan
/// cannot read. Whether alertdialog is the right role for it is not judged.
fn rule_a11y03_alert(s: &Source, c: &Ctx) -> Vec<Hit> {
    let Some(m) = structure(s) else { return Vec::new() };
    let Some(at) = m.alert else { return Vec::new() };
    let Some(text) = with_scripts(s, m, c) else { return Vec::new() };
    if re(r"\.focus\s*\(", "").test(&text) {
        return Vec::new();
    }
    vec![hit(at, "an inline confirmation (role=\"alertdialog\") that nothing moves focus into: a screen reader announces it only when focus moves inside, and its key handlers hear keys only then; when it opens, put focus on one of its buttons (autoFocus, or .focus() from a script)")]
}

fn rule_fm01_label(s: &Source, _: &Ctx) -> Vec<Hit> {
    structure(s).map_or(Vec::new(), |m| m.unlabeled.iter().map(|&at| hit(at, "a form field with no label tied to it (a placeholder or text beside it is not one): give it a <label> with htmlFor, or put it inside the <label>; where the context already names it, such as a lone search box, an aria-label")).collect())
}

fn rule_ix12_dead(s: &Source, _: &Ctx) -> Vec<Hit> {
    // a directions preview (the page `ryux pick` opens) shows what a call to action would look like; it is not one
    if s.path.rsplit(['/', '\\']).next().is_some_and(|n| n.eq_ignore_ascii_case("directions.html")) {
        return Vec::new();
    }
    structure(s).and_then(|m| m.dead).map_or(Vec::new(), |at| vec![hit(at, "a control that goes nowhere (a link to \"#\" with no click handler, or an empty click handler): link it to a page or section that exists, give it the action it names, or remove it, or show it disabled with the reason, until that exists")])
}

fn rule_fm05_keyboard(s: &Source, _: &Ctx) -> Vec<Hit> {
    structure(s).and_then(|m| m.keyboard).map_or(Vec::new(), |at| vec![hit(at, "a phone, OTP, or amount field that opens the text keyboard: use type=\"tel\" for a phone number, and inputMode=\"numeric\" for a one-time code or an amount")])
}

fn rule_a11y07_invalid(s: &Source, _: &Ctx) -> Vec<Hit> {
    structure(s).and_then(|m| m.invalid).map_or(Vec::new(), |at| vec![hit(at, "a field marked aria-invalid with no aria-describedby or aria-errormessage: point it at the error text's id, so a screen reader reads the error with the field")])
}

fn rule_a11y04_radios(s: &Source, _: &Ctx) -> Vec<Hit> {
    let Some((at, n)) = structure(s).and_then(|m| m.ungrouped) else { return Vec::new() };
    let what = if n > 1 { format!("{n} groups of radio buttons, each for one question,") } else { "radio buttons for one question".to_string() };
    vec![hit(at, format!("{what} with nothing naming the question: each option is read with its own label, but not what it answers; put them in a <fieldset> with a <legend>, or a role=\"radiogroup\" or \"group\" with aria-labelledby"))]
}

fn rule_a11y04_checks(s: &Source, _: &Ctx) -> Vec<Hit> {
    let Some((at, n)) = structure(s).and_then(|m| m.ungrouped_checks) else { return Vec::new() };
    let what = if n > 1 { format!("{n} groups of checkboxes, each for one question,") } else { "checkboxes for one question".to_string() };
    vec![hit(at, format!("{what} with nothing naming the question: each option is read with its own label, but not what it answers; put them in a <fieldset> with a <legend>, or a role=\"group\" with aria-labelledby"))]
}

fn rule_a11y04_lone_radio(s: &Source, _: &Ctx) -> Vec<Hit> {
    structure(s).and_then(|m| m.lone_radio).map_or(Vec::new(), |at| vec![hit(at, "a single radio button with no other option of its name: once picked it cannot be unpicked; use a checkbox for a yes or no, or show the one option as text")])
}

fn rule_a11y04_lang(s: &Source, _: &Ctx) -> Vec<Hit> {
    // a run's working folder for generated assets (contact sheets) is not a page anyone ships
    if norm(&s.path).split('/').any(|p| p == "assets-src") {
        return Vec::new();
    }
    structure(s).and_then(|m| m.no_lang).map_or(Vec::new(), |at| vec![hit(at, "<html> with no lang: a screen reader reads the page in its own default language and may mispronounce it; set lang to the page's language (lang=\"id\" for Indonesian)")])
}

fn rule_ix12_disabled(s: &Source, _: &Ctx) -> Vec<Hit> {
    structure(s).and_then(|m| m.disabled).map_or(Vec::new(), |at| vec![hit(at, "a button shown disabled for good, with no reason given: say why and when it opens up (aria-describedby to that text, or a title), or remove it until it works")])
}

fn rule_a11y04_anchor(s: &Source, _: &Ctx) -> Vec<Hit> {
    structure(s).and_then(|m| m.anchor).map_or(Vec::new(), |at| vec![hit(at, "a link with a click handler and no href: Tab does not reach it and Enter does not run it; use a <button> for an action, or give it the href it goes to")])
}

fn rule_fm05_autofill(s: &Source, _: &Ctx) -> Vec<Hit> {
    structure(s).and_then(|m| m.autofill_off).map_or(Vec::new(), |at| vec![hit(at, "autocomplete=\"off\" on a field for the person's own email, phone, name, or address: it stops the browser filling it; use the matching autocomplete value (email, tel, name, street-address)")])
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
        Detector { rule: "RX-A11Y-03", level: "warn", exts: markup, folder: false, find: rule_a11y03_dialog },
        Detector { rule: "RX-A11Y-03", level: "warn", exts: markup, folder: false, find: rule_a11y03_alert },
        Detector { rule: "RX-FM-01", level: "warn", exts: markup, folder: false, find: rule_fm01_label },
        Detector { rule: "RX-IX-12", level: "warn", exts: markup, folder: false, find: rule_ix12_dead },
        Detector { rule: "RX-FM-05", level: "warn", exts: markup, folder: false, find: rule_fm05_keyboard },
        Detector { rule: "RX-A11Y-07", level: "warn", exts: markup, folder: false, find: rule_a11y07_invalid },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_radios },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_anchor },
        Detector { rule: "RX-FM-05", level: "warn", exts: markup, folder: false, find: rule_fm05_autofill },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_checks },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_lone_radio },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_lang },
        Detector { rule: "RX-IX-12", level: "warn", exts: markup, folder: false, find: rule_ix12_disabled },
        Detector { rule: "RX-A11Y-04", level: "fail", exts: markup, folder: false, find: rule_a11y04_img },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_click },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_icon },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_heading },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_untyped },
        Detector { rule: "RX-IX-02", level: "warn", exts: markup, folder: false, find: rule_ix02_loading },
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
    Source { path: path.to_string(), text: strip_comments(raw, &ext), ext, raw: raw.to_string(), markup: Default::default(), module: Default::default() }
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
    /// Files the checks may consult but do not report on: the scripts a page loads, the modules a component
    /// comes from (see `references`).
    pub context: Vec<Source>,
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
    let files: HashMap<String, &Source> = sources.iter().chain(opts.context.iter()).map(|s| (norm(&s.path), s)).collect();
    let mut ctx = if opts.folder {
        Ctx {
            reduced_motion: Some(sources.iter().any(|s| re(r"prefers-reduced-motion|motion-(?:reduce|safe):|useReducedMotion|reducedMotion", "").test(&s.text))),
            indonesian: Some(sources.iter().any(|s| !re(TEST_FILE, "").test(&s.path) && re(INDONESIAN, "").test(&s.text))),
            reduced_transparency: Some(sources.iter().any(|s| re(r"prefers-reduced-transparency|prefers-contrast|contrast-more:|useReducedTransparency", "").test(&s.text))),
            growing_textarea: Some(sources.iter().any(|s| re(GROWS, "").test(&s.text))),
            design: None,
            files: HashMap::new(),
        }
    } else {
        Ctx::default()
    };
    ctx.design = opts.design;
    ctx.files = files;
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

#[cfg(test)]
mod tests {
    use super::*;

    /// The findings of one rule in one file whose message says `says`, as "line:column".
    fn found(path: &str, raw: &str, rule: &str, says: &str) -> Vec<String> {
        let opts = ScanOptions { folder: false, skip: HashSet::new(), design: None, context: Vec::new() };
        scan_sources(&[to_source(path, raw)], opts)
            .into_iter()
            .filter(|f| f["rule"] == rule && f["message"].as_str().unwrap().contains(says))
            .map(|f| format!("{}:{}", f["line"], f["column"]))
            .collect()
    }

    fn button(path: &str, raw: &str) -> Vec<String> {
        found(path, raw, "RX-A11Y-04", "with no type inside a <form>")
    }

    #[test]
    fn a_typeless_button_in_a_form_warns_at_its_tag() {
        let show = "<form>\n  <input type=\"password\" />\n  <button onClick={toggle}>Show</button>\n  <button>Sign in</button>\n</form>";
        assert_eq!(button("a.tsx", show), vec!["3:3"]);
        let html = "<form>\n<input type=password>\n<button onclick=\"t()\">Show</button>\n<button>Sign in</button>\n</form>";
        assert_eq!(button("a.html", html), vec!["3:1"]);
        // with an explicit submit, no typeless button is the submit: each one warns, once
        assert_eq!(button("a.tsx", "<form><button>Add item</button><button>Remove</button><button type=\"submit\">Save</button></form>"), vec!["1:7", "1:32"]);
        assert_eq!(button("a.html", "<form><button>Add item</button><input type=submit value=Save></form>"), vec!["1:7"]);
        // a button deep inside the form's JSX tree still belongs to it
        assert_eq!(button("a.jsx", "<form><Field><div><button onClick={add}>Add</button></div></Field><Button type=\"submit\">Save</Button></form>"), vec!["1:19"]);
    }

    #[test]
    fn a_button_with_a_type_a_spread_or_no_form_is_left_alone() {
        for ok in [
            "<form><button type=\"button\" onClick={t}>Show</button><button type={kind}>Go</button><button type=\"submit\">Sign in</button></form>",
            "<form><button {...props}>Show</button><button type=\"submit\">Go</button></form>",
            // the form's only button, or its last with no click handler, is taken as its submit
            "<form><input /><button>Sign in</button></form>",
            "<form><button type=\"button\">Cancel</button><button>Save</button></form>",
            // no literal <form> in this JSX tree
            "<Form><button onClick={t}>Show</button></Form>",
            "<div><button onClick={t}>Show</button></div>",
            // a form with method="dialog" closes its dialog on purpose; form= points elsewhere
            "<form method=\"dialog\"><button>Close</button><button>OK</button></form>",
            "<form><button form=\"other\" onClick={t}>x</button><button type=\"submit\">Go</button></form>",
        ] {
            assert!(button("a.tsx", ok).is_empty(), "{ok}");
        }
        assert!(button("a.html", "<form><button type=button onclick=t()>Show</button><button>Sign in</button></form>").is_empty());
        assert!(button("a.html", "<form><button {...attrs}>Show</button><button type=submit>Go</button></form>").is_empty());
        assert!(button("a.html", "<button onclick=t()>Show</button>").is_empty());
        // inside a string it is text
        assert!(button("a.tsx", "const s = '<form><button>a</button><button>b</button></form>';").is_empty());
    }

    fn loading(path: &str, raw: &str) -> Vec<String> {
        found(path, raw, "RX-IX-02", "loading indicator")
    }

    #[test]
    fn a_loading_indicator_nothing_announces_warns_once_at_the_first() {
        assert_eq!(loading("a.tsx", "<div>\n  <div className=\"card-skeleton\" />\n  <Spinner />\n</div>"), vec!["2:3"]);
        assert_eq!(loading("a.tsx", "<button disabled={busy}>{busy ? \"Memproses…\" : \"Bayar\"}</button>"), vec!["1:33"]);
        assert_eq!(loading("a.tsx", "const A = () => <p>\n  Loading...\n</p>;"), vec!["2:3"]);
        assert_eq!(loading("a.tsx", "<div className={cn(\"h-4\", busy && \"loading\")} />"), vec!["1:1"]);
        assert_eq!(loading("a.tsx", "import { Loader2 } from \"lucide-react\";\nconst A = () => <Loader2 className=\"animate-spin\" />;"), vec!["2:17"]);
        assert_eq!(loading("a.tsx", "function Spinner() { return null; }\nconst A = () => <Spinner />;"), vec!["2:17"]);
        assert_eq!(loading("a.html", "<p>x</p>\n<div class=\"spinner\"></div><p>Memuat data…</p>"), vec!["2:1"]);
        assert_eq!(loading("a.html", "<loading-dots></loading-dots>"), vec!["1:1"]);
    }

    #[test]
    fn a_loading_indicator_that_is_announced_or_is_not_one_is_left_alone() {
        for ok in [
            "<div aria-busy={busy}><Spinner /></div>",
            "<div className=\"spinner\" role=\"status\" />",
            "<div className=\"spinner\" /><p role=\"alert\">{e}</p>",
            "<div role=\"progressbar\" className=\"loader\" />",
            "<p aria-live=\"polite\">Loading…</p>",
            "<div className=\"skeleton\" /><output>{n}</output>",
            "<progress value={p} />",
            // a kit's Spinner, or this project's own, may announce itself where it is defined
            "import { Spinner } from \"@chakra-ui/react\";\nconst A = () => <Spinner />;",
            "import { SkeletonList } from \"../components\";\nconst A = () => <SkeletonList rows={4} />;",
            "import * as UI from \"@/components/ui\";\nconst A = () => <UI.Spinner />;",
            // words that only contain the letters, attributes, and plain text
            "<img loading=\"lazy\" src={s} alt=\"\" /><div className=\"uploader\" /><p>Loading times vary</p><p aria-label=\"Loading…\">x</p>",
            "const s = '<div className=\"spinner\">';",
        ] {
            assert!(loading("a.tsx", ok).is_empty(), "{ok}");
        }
        assert!(loading("a.html", "<div class=\"spinner\"></div><script>el.setAttribute('aria-busy', 'true')</script>").is_empty());
        assert!(loading("a.html", "<script>const t = 'Loading…'</script><style>.spinner{}</style>").is_empty());
        assert!(loading("a.html", "<div class=spinner></div><script type=module src=./main.js></script>").is_empty());
        // Vue, Svelte, and Astro get no tree checks
        for ext in ["vue", "svelte", "astro"] {
            assert!(loading(&format!("a.{ext}"), "<div class=\"spinner\"></div>").is_empty());
        }
    }

    /// The findings of one rule in one file, with other files the scan may consult but does not report.
    fn found_with(path: &str, raw: &str, context: &[(&str, &str)], rule: &str, says: &str) -> Vec<String> {
        let opts = ScanOptions { folder: false, skip: HashSet::new(), design: None, context: context.iter().map(|(p, r)| to_source(p, r)).collect() };
        scan_sources(&[to_source(path, raw)], opts)
            .into_iter()
            .filter(|f| f["rule"] == rule && f["message"].as_str().unwrap().contains(says))
            .map(|f| format!("{}:{}", f["line"], f["column"]))
            .collect()
    }

    fn dialog(path: &str, raw: &str) -> Vec<String> {
        found(path, raw, "RX-A11Y-03", "modal dialog")
    }

    fn dialog_says(path: &str, raw: &str, context: &[(&str, &str)]) -> Vec<String> {
        let opts = ScanOptions { folder: false, skip: HashSet::new(), design: None, context: context.iter().map(|(p, r)| to_source(p, r)).collect() };
        scan_sources(&[to_source(path, raw)], opts)
            .into_iter()
            .filter(|f| f["rule"] == "RX-A11Y-03" && f["message"].as_str().unwrap().contains("modal dialog"))
            .map(|f| f["message"].as_str().unwrap().to_string())
            .collect()
    }

    const ESC: &str = "onKeyDown={(e) => e.key === \"Escape\" && close()}";
    const TAB: &str = "onKeyDown={(e) => e.key === \"Tab\" && keep(e)}";

    #[test]
    fn only_a_modal_dialog_is_judged() {
        // aria-modal, or a scrim around it or just before it; an alert dialog the same way
        assert_eq!(dialog("a.tsx", "<div>\n  <div role=\"dialog\" aria-modal=\"true\">x</div>\n  <div role=\"alertdialog\" aria-modal=\"true\">y</div>\n</div>"), vec!["2:3"]);
        assert_eq!(dialog("a.tsx", "<div role=\"alertdialog\" aria-modal=\"true\">y</div>"), vec!["1:1"]);
        assert_eq!(dialog("a.tsx", "<>\n<div className=\"scrim\" />\n<div role=\"alertdialog\">y</div></>"), vec!["3:1"]);
        assert_eq!(dialog("a.tsx", "<div role=\"dialog\" aria-modal={true}>x</div>"), vec!["1:1"]);
        assert_eq!(dialog("a.tsx", "<div className=\"scrim\" onClick={close}>\n  <div className=\"sheet\" role=\"dialog\">x</div></div>"), vec!["2:3"]);
        assert_eq!(dialog("a.tsx", "<>\n<div className=\"backdrop\" />\n<section role=\"dialog\">x</section></>"), vec!["3:1"]);
        assert_eq!(dialog("a.html", "<div class=\"modal-overlay\" hidden></div>\n<div role=dialog>x</div>"), vec!["2:1"]);
        assert_eq!(dialog("a.html", "<div id=\"backdrop\"><div role=dialog>x</div></div>"), vec!["1:20"]);
        // a panel with no aria-modal and no scrim is not modal: Tab may leave it, and its Close button is the way out
        for ok in [
            "<div role=\"dialog\" aria-label=\"Help\"><button onClick={close}>Close</button></div>",
            "<motion.div role=\"dialog\" onClick={close}>x</motion.div>",
            "<div role=\"dialog\" aria-modal=\"false\">x</div>",
            "<div className=\"card\" /><div role=\"dialog\">x</div>",
            // an inline confirmation in a row or a bar: the page behind stays usable, so Tab may go there
            "<div role=\"alertdialog\" aria-labelledby=\"c\" onKeyDown={(e) => e.key === \"Escape\" && no()} className=\"flex gap-3 rounded-xl p-3\">x</div>",
            "<div role=\"alertdialog\" className=\"fixed inset-x-3 bottom-20 z-30 shadow-2xl\">x</div>",
        ] {
            assert!(dialog("a.tsx", ok).is_empty(), "{ok}");
        }
        assert!(dialog("a.html", "<div id=\"chat\" role=\"dialog\" aria-label=\"Checkout assistant\"><button id=\"chat-close\">x</button></div>").is_empty());
        // a native <dialog>: show() and open are not modal, and showModal() gives Esc and the inert page itself
        assert!(dialog("a.html", "<p>x</p><dialog open>Saved</dialog><script>d.show()</script>").is_empty());
        assert!(dialog("a.html", "<dialog id=d>x</dialog><script>d.showModal()</script>").is_empty());
    }

    #[test]
    fn a_field_has_a_label_tied_to_it() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-FM-01", "no label tied to it");
        // a placeholder is not a label, and text beside a field is not tied to it
        assert_eq!(says("a.tsx", "<form>\n  <input name=\"email\" placeholder=\"Email\" />\n</form>"), vec!["2:3"]);
        assert_eq!(says("a.tsx", "<div><p>Kota</p><select name=\"city\"><option>A</option></select></div>"), vec!["1:17"]);
        assert_eq!(says("a.html", "<label>Catatan</label>\n<textarea name=n></textarea>"), vec!["2:1"]);
        assert_eq!(says("a.html", "<label for=\"a\">A</label><input id=\"b\">"), vec!["1:25"]);
        // one finding per field, so fixing one does not hide the next
        assert_eq!(says("a.tsx", "<>\n<input />\n<input /></>"), vec!["2:1", "3:1"]);
        assert_eq!(says("a.html", "<input name=a>\n<input name=b>"), vec!["1:1", "2:1"]);
        for ok in [
            "<label>Email <input name=\"email\" /></label>",
            "<><label htmlFor=\"e\">Email</label><input id=\"e\" /></>",
            "<input aria-label=\"Cari\" type=\"search\" />",
            "<><span id=\"l\">Nominal</span><input aria-labelledby=\"l\" /></>",
            "<input title=\"Kode\" />",
            "<input {...field} />",
            // ids the parser cannot read: a label may well match
            "<><label htmlFor={id}>Email</label><input id={id} /></>",
            "<input id={`${name}-input`} />",
            // not a field a person types into or picks
            "<input type=\"hidden\" name=\"t\" /><input type=\"submit\" value=\"Kirim\" /><input type=\"button\" value=\"x\" />",
            // a component names its own label
            "<Input label=\"Email\" />",
            // a wrapper component that renders the label for the id
            "<Field label=\"Pemilik\" htmlFor=\"owner\"><input id=\"owner\" /></Field>",
            // not on screen
            "<input type=\"file\" id=\"f\" hidden /><input type=\"file\" aria-hidden=\"true\" tabIndex={-1} />",
            "<input aria-hidden=\"true\" disabled /><input style={{ display: \"none\" }} />",
            // a utility class that sets display none (Tailwind's hidden)
            "<input ref={fileRef} type=\"file\" className=\"hidden\" /><input type=\"file\" className={cn(\"hidden\", x)} />",
            // visibility hidden is off screen too
            "<input className=\"invisible\" />",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
        assert!(says("a.html", "<label for=e>E</label><input id=e>").is_empty());
        assert!(says("a.html", "<label>E <input></label>").is_empty());
        assert!(says("a.html", "<input type=file hidden><input type=file aria-hidden=true tabindex=-1>").is_empty());
        assert!(says("a.html", "<input style=\"display: none\">").is_empty());
        assert!(says("a.html", "<input type=file class=\"hidden\">").is_empty());
        // a class that only contains the word is not it, and sr-only is on the page for a screen reader
        assert_eq!(says("a.tsx", "<input className=\"overflow-hidden\" />"), vec!["1:1"]);
        assert_eq!(says("a.tsx", "<input className=\"sr-only\" />"), vec!["1:1"]);
        // hidden until a breakpoint or state shows it, or hidden only from one size up: on screen at some size
        assert_eq!(says("a.tsx", "<input className=\"hidden md:block\" />"), vec!["1:1"]);
        assert_eq!(says("a.tsx", "<input className=\"hidden peer-checked:flex\" />"), vec!["1:1"]);
        assert_eq!(says("a.tsx", "<input className=\"md:hidden\" />"), vec!["1:1"]);
        assert_eq!(says("a.html", "<input class=\"hidden lg:inline-block\">"), vec!["1:1"]);
        // opacity 0 is still read by a screen reader
        assert_eq!(says("a.tsx", "<input className=\"opacity-0\" />"), vec!["1:1"]);
        // aria-hidden alone hides it from a screen reader, not from the keyboard: still a field with no name
        assert_eq!(says("a.tsx", "<input aria-hidden=\"true\" />"), vec!["1:1"]);
        assert_eq!(says("a.html", "<input aria-hidden=true>"), vec!["1:1"]);
        // a field's id must be the one a label or wrapper names
        assert_eq!(says("a.tsx", "<><Field htmlFor=\"name\"><input id=\"name\" /></Field><input id=\"phone\" /></>"), vec!["1:52"]);
    }

    #[test]
    fn a_link_goes_somewhere() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-IX-12", "goes nowhere");
        assert_eq!(says("a.tsx", "<nav>\n  <a href=\"#\">Promo</a>\n</nav>"), vec!["2:3"]);
        assert_eq!(says("a.tsx", "<a href=\"javascript:void(0)\">x</a>"), vec!["1:1"]);
        assert_eq!(says("a.tsx", "<button onClick={() => {}}>Simpan</button>"), vec!["1:1"]);
        assert_eq!(says("a.html", "<footer><a href=\"#\">Syarat</a></footer>"), vec!["1:9"]);
        for ok in [
            "<a href=\"#\" onClick={open}>Promo</a>",
            "<a href=\"#harga\">Harga</a>",
            "<a href=\"/promo\">Promo</a>",
            "<a {...props} href=\"#\">x</a>",
            "<button onClick={() => setOpen(true)}>Buka</button>",
            "<Link href=\"#\">x</Link>",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
        // a page with a script may give the link its handler
        assert!(says("a.html", "<a href=\"#\" id=\"more\">Lagi</a><script>more.onclick = load</script>").is_empty());
        assert!(says("a.html", "<a href=\"#\">x</a><script src=\"app.js\"></script>").is_empty());
        // a directions preview shows what a call to action would look like; it is not one
        assert!(says("directions.html", "<a class=\"btn\" href=\"#\">Jadwalkan demo</a>").is_empty());
        assert!(says("out/run/directions.html", "<a class=\"btn\" href=\"#\">Download</a>").is_empty());
    }

    #[test]
    fn a_number_field_opens_the_number_keyboard() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-FM-05", "the text keyboard");
        assert_eq!(says("a.tsx", "<label>No. HP <input name=\"phone\" /></label>"), vec!["1:15"]);
        assert_eq!(says("a.tsx", "<label>OTP <input type=\"text\" autoComplete=\"one-time-code\" /></label>"), vec!["1:12"]);
        assert_eq!(says("a.html", "<label>Nominal <input id=\"nominal\" name=\"nominal\"></label>"), vec!["1:16"]);
        assert_eq!(says("a.tsx", "<label>WA <input id=\"whatsappNumber\" /></label>"), vec!["1:11"]);
        for ok in [
            "<input type=\"tel\" name=\"phone\" />",
            "<input inputMode=\"numeric\" name=\"otp\" />",
            "<input type=\"number\" name=\"amount\" />",
            "<input name=\"email\" />",
            "<input name=\"phone\" {...rest} />",
            // a word inside another word is not one
            "<input name=\"telegram\" /><input name=\"description\" />",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
        assert!(says("a.html", "<input name=otp inputmode=numeric>").is_empty());
    }

    #[test]
    fn radio_buttons_for_one_question_have_a_group_name() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-A11Y-04", "radio buttons");
        // each option has its label, but nothing names the question they answer
        assert_eq!(says("a.tsx", "<div>\n  <p>Metode bayar</p>\n  <label><input type=\"radio\" name=\"pay\" /> QRIS</label>\n  <label><input type=\"radio\" name=\"pay\" /> VA</label>\n</div>"), vec!["3:10"]);
        assert_eq!(says("a.html", "<label><input type=radio name=s value=1>1</label><label><input type=radio name=s value=2>2</label>"), vec!["1:8"]);
        for ok in [
            "<fieldset><legend>Metode bayar</legend><label><input type=\"radio\" name=\"pay\" /> QRIS</label><label><input type=\"radio\" name=\"pay\" /> VA</label></fieldset>",
            "<div role=\"radiogroup\" aria-labelledby=\"q\"><label><input type=\"radio\" name=\"pay\" /> QRIS</label><label><input type=\"radio\" name=\"pay\" /> VA</label></div>",
            // one radio of a name, or names the parser cannot read
            "<label><input type=\"radio\" name=\"agree\" /> Ya</label>",
            "<>{opts.map((o) => <label key={o}><input type=\"radio\" name={q.id} /> {o}</label>)}</>",
            // a named group, a named form, or a named landmark that holds only this group
            "<div role=\"group\" aria-label=\"Metode bayar\"><label><input type=\"radio\" name=\"pay\" /> QRIS</label><label><input type=\"radio\" name=\"pay\" /> VA</label></div>",
            "<form aria-label=\"Metode bayar\"><label><input type=\"radio\" name=\"pay\" /> QRIS</label><label><input type=\"radio\" name=\"pay\" /> VA</label></form>",
            "<aside aria-label=\"Status demo\"><h2>Status</h2><form><label><input type=\"radio\" name=\"st\" /> Normal</label><label><input type=\"radio\" name=\"st\" /> Offline</label></form><button>Reset</button></aside>",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
        assert!(says("a.html", "<aside aria-label=\"Status demo\"><label><input type=radio name=st> A</label><label><input type=radio name=st> B</label></aside>").is_empty());
        // a named landmark that holds other fields does not name this group
        assert_eq!(says("a.tsx", "<section aria-label=\"Checkout\"><input aria-label=\"Nama\" /><label><input type=\"radio\" name=\"pay\" /> QRIS</label><label><input type=\"radio\" name=\"pay\" /> VA</label></section>"), vec!["1:66"]);
        assert_eq!(says("a.html", "<main aria-label=\"Checkout\"><input aria-label=\"Nama\"><label><input type=radio name=pay> QRIS</label><label><input type=radio name=pay> VA</label></main>"), vec!["1:61"]);
        // one line per file, saying how many groups it has
        let opts = ScanOptions { folder: false, skip: HashSet::new(), design: None, context: Vec::new() };
        let two = "<><label><input type=\"radio\" name=\"a\" />1</label><label><input type=\"radio\" name=\"a\" />2</label><label><input type=\"radio\" name=\"b\" />1</label><label><input type=\"radio\" name=\"b\" />2</label></>";
        let m: Vec<String> = scan_sources(&[to_source("a.tsx", two)], opts).into_iter().filter(|f| f["rule"] == "RX-A11Y-04").map(|f| f["message"].as_str().unwrap().to_string()).collect();
        assert_eq!(m.len(), 1);
        assert!(m[0].starts_with("2 groups of radio buttons"), "{}", m[0]);
    }

    #[test]
    fn checkboxes_for_one_question_have_a_group_name() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-A11Y-04", "checkboxes");
        assert_eq!(says("a.tsx", "<div>\n  <p>Minat</p>\n  <label><input type=\"checkbox\" name=\"topic\" /> UI</label>\n  <label><input type=\"checkbox\" name=\"topic\" /> UX</label>\n</div>"), vec!["3:10"]);
        assert_eq!(says("a.html", "<label><input type=checkbox name=t[]>A</label><label><input type=checkbox name=t[]>B</label>"), vec!["1:8"]);
        for ok in [
            "<fieldset><legend>Minat</legend><label><input type=\"checkbox\" name=\"topic\" /> UI</label><label><input type=\"checkbox\" name=\"topic\" /> UX</label></fieldset>",
            // separate yes/no choices each name themselves
            "<label><input type=\"checkbox\" name=\"agree\" /> Setuju</label><label><input type=\"checkbox\" name=\"news\" /> Kabar</label>",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
        // radio buttons are still told apart from checkboxes
        assert!(found("a.tsx", "<><label><input type=\"radio\" name=\"x\" />A</label><label><input type=\"checkbox\" name=\"x\" />B</label></>", "RX-A11Y-04", "radio buttons").is_empty());
    }

    #[test]
    fn a_page_says_its_language() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-A11Y-04", "no lang");
        assert_eq!(says("a.html", "<!doctype html>\n<html>\n<head><title>Bayar</title></head><body>x</body></html>"), vec!["2:1"]);
        assert!(says("a.html", "<!doctype html><html lang=\"id\"><body>x</body></html>").is_empty());
        // a fragment with no <html> is not a page
        assert!(says("a.html", "<div>x</div>").is_empty());
        // a root layout in JSX renders the page's <html>
        assert_eq!(says("app/layout.tsx", "export default function L({ children }) {\n  return <html><body>{children}</body></html>;\n}"), vec!["2:10"]);
        assert!(says("app/layout.tsx", "export default function L({ children }) { return <html lang={locale}><body>{children}</body></html>; }").is_empty());
        // a run's working folder for generated assets is not a page anyone ships
        assert!(says("run/assets-src/sheet.html", "<html><body><img src=a.svg></body></html>").is_empty());
    }

    #[test]
    fn a_button_shown_disabled_says_why() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-IX-12", "disabled");
        assert_eq!(says("a.tsx", "<div>\n  <button disabled>Ekspor PDF</button>\n</div>"), vec!["2:3"]);
        assert_eq!(says("a.html", "<button disabled>Ekspor</button>"), vec!["1:1"]);
        for ok in [
            // a state that changes is not a control shown disabled for good
            "<button disabled={busy}>Simpan</button>",
            "<button disabled title=\"Tersedia setelah verifikasi\">Ekspor</button>",
            "<><button disabled aria-describedby=\"why\">Ekspor</button><p id=\"why\">Tersedia setelah verifikasi</p></>",
            "<button {...rest} disabled>x</button>",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
    }

    #[test]
    fn a_lone_radio_button_has_another_option() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-A11Y-04", "single radio button");
        assert_eq!(says("a.tsx", "<form>\n  <label><input type=\"radio\" name=\"ship\" defaultChecked /> Reguler</label>\n</form>"), vec!["2:10"]);
        assert_eq!(says("a.html", "<label><input type=radio name=ship checked> Reguler</label>"), vec!["1:8"]);
        for ok in [
            "<label><input type=\"radio\" name=\"ship\" /> A</label><label><input type=\"radio\" name=\"ship\" /> B</label>",
            // one radio written once and rendered for each option
            "<>{opts.map((o) => <label key={o}><input type=\"radio\" name=\"ship\" /> {o}</label>)}</>",
            "<input type=\"radio\" name={n} />",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
        // a page with a script may add the other options
        assert!(says("a.html", "<label><input type=radio name=ship> A</label><script>add()</script>").is_empty());
    }

    #[test]
    fn a_link_that_runs_an_action_is_reachable_by_keyboard() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-A11Y-04", "no href");
        assert_eq!(says("a.tsx", "<nav>\n  <a onClick={logout}>Keluar</a>\n</nav>"), vec!["2:3"]);
        assert_eq!(says("a.html", "<a onclick=\"load()\">Muat lagi</a>"), vec!["1:1"]);
        for ok in [
            "<a href=\"/keluar\" onClick={track}>Keluar</a>",
            "<a role=\"button\" tabIndex={0} onClick={logout} onKeyDown={key}>Keluar</a>",
            "<a {...props} onClick={go}>x</a>",
            "<button onClick={logout}>Keluar</button>",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
    }

    #[test]
    fn a_personal_field_lets_the_browser_fill_it() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-FM-05", "stops the browser filling");
        assert_eq!(says("a.tsx", "<label>Email <input type=\"email\" name=\"email\" autoComplete=\"off\" /></label>"), vec!["1:14"]);
        assert_eq!(says("a.tsx", "<label>Alamat <textarea name=\"alamat\" autoComplete=\"off\" /></label>"), vec!["1:15"]);
        assert_eq!(says("a.html", "<label>Nama <input name=\"fullName\" autocomplete=\"off\"></label>"), vec!["1:13"]);
        assert!(says("a.html", "<form action=\"/invite\"><input name=\"email\" autocomplete=\"off\"></form>").is_empty());
        for ok in [
            "<input name=\"email\" autoComplete=\"email\" />",
            "<input name=\"email\" />",
            // not the person's own data
            "<input id=\"key-owner\" autoComplete=\"off\" /><input name=\"productName\" autoComplete=\"off\" /><input name=\"search\" autoComplete=\"off\" />",
            "<input name=\"otp\" autoComplete=\"off\" />",
            // someone else's address: an invite, a recipient, a member
            "<input id=\"invite-email\" name=\"email\" type=\"email\" autoComplete=\"off\" />",
            "<form onSubmit={invite}><label>Email <input name=\"email\" type=\"email\" autoComplete=\"off\" /></label></form>",
            "<input name=\"recipientPhone\" autoComplete=\"off\" />",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
    }

    #[test]
    fn an_invalid_field_is_tied_to_its_error() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-A11Y-07", "aria-invalid");
        assert_eq!(says("a.tsx", "<label>Email\n  <input aria-invalid={!!error} />\n</label>"), vec!["2:3"]);
        assert_eq!(says("a.html", "<label>E <input aria-invalid=\"true\"></label>"), vec!["1:10"]);
        for ok in [
            "<input aria-invalid={!!error} aria-describedby=\"email-error\" />",
            "<input aria-invalid=\"true\" aria-errormessage=\"e\" />",
            "<input aria-invalid=\"false\" />",
            "<input aria-invalid={bad} {...field} />",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
    }

    #[test]
    fn an_inline_confirmation_moves_focus_into_it() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-A11Y-03", "inline confirmation");
        // nothing moves focus in: a screen reader says nothing of it, and a key handler on it never hears a key
        assert_eq!(says("a.tsx", "<div>\n  <div role=\"alertdialog\" aria-labelledby=\"c\"><p id=\"c\">Delete?</p><button onClick={no}>Cancel</button></div>\n</div>"), vec!["2:3"]);
        assert_eq!(says("a.html", "<div role=alertdialog><p>Delete?</p><button>Cancel</button></div>"), vec!["1:1"]);
        // once per file
        assert_eq!(says("a.tsx", "<>\n<div role=\"alertdialog\">a</div>\n<div role=\"alertdialog\">b</div></>"), vec!["2:1"]);
        for ok in [
            // focus moves to one of its buttons, or a script moves it
            "<div role=\"alertdialog\"><button onClick={no}>Cancel</button><Button autoFocus onClick={yes}>Delete</Button></div>",
            "<div role=\"alertdialog\" ref={box} tabIndex={-1}>x</div>; useEffect(() => box.current?.focus(), []);",
            // a modal one is the modal dialog check's, and a dialog that is not an alert is a panel
            "<div role=\"alertdialog\" aria-modal=\"true\">x</div>",
            "<div role=\"dialog\">x</div>",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
        assert!(says("a.html", "<div role=alertdialog><button autofocus>Cancel</button></div>").is_empty());
        assert!(says("a.html", "<div id=c role=alertdialog>x</div><script>c.querySelector('button').focus()</script>").is_empty());
        // a script the scan cannot read may move it
        assert!(says("a.html", "<div role=alertdialog>x</div><script src=\"https://cdn.example.com/a.js\"></script>").is_empty());
        let opts = ScanOptions { folder: false, skip: HashSet::new(), design: None, context: Vec::new() };
        let messages: Vec<String> = scan_sources(&[to_source("a.tsx", "<div role=\"alertdialog\">x</div>")], opts)
            .into_iter()
            .filter(|f| f["rule"] == "RX-A11Y-03")
            .map(|f| f["message"].as_str().unwrap().to_string())
            .collect();
        assert_eq!(messages, vec!["an inline confirmation (role=\"alertdialog\") that nothing moves focus into: a screen reader announces it only when focus moves inside, and its key handlers hear keys only then; when it opens, put focus on one of its buttons (autoFocus, or .focus() from a script)"]);
    }

    #[test]
    fn a_modal_dialog_needs_both_esc_and_tab_kept_inside() {
        let m = |attrs: &str| format!("<div role=\"dialog\" aria-modal=\"true\" {attrs}>x</div>");
        assert_eq!(dialog_says("a.tsx", &m(""), &[]), vec!["a modal dialog that does not close on Esc and does not keep Tab inside it: close it on Esc and keep focus inside it while it is open (showModal() on a <dialog> does both), or use a dialog component that does"]);
        assert_eq!(dialog_says("a.tsx", &m(ESC), &[]), vec!["a modal dialog that closes on Esc but lets Tab move to the page behind it: keep focus inside it while it is open (showModal() on a <dialog> does both), or use a dialog component that does"]);
        assert_eq!(dialog_says("a.tsx", &m(TAB), &[]), vec!["a modal dialog that keeps Tab inside but does not close on Esc: close it on Esc too (showModal() on a <dialog> does both), or use a dialog component that does"]);
        // a key handler for another key is neither, and a cancel prop is a button's handler, not Esc
        assert_eq!(dialog("a.tsx", &m("onKeyDown={(e) => e.key === \"Enter\" && go()}")).len(), 1);
        assert!(dialog_says("a.tsx", &format!("<div className=\"sheet-scrim\" onClick={{onCancel}}>{}</div>", m("onCancel={onCancel}")), &[])[0].contains("does not close on Esc and does not keep Tab"));
        // "desc" and "escrow" are not Esc
        assert_eq!(dialog("a.tsx", &format!("const desc = escrow; const a = {};", m(TAB))).len(), 1);
        for esc in [
            ESC.to_string(),
            "onKeyDown={(e) => { if (e.keyCode === 27) close(); }}".into(),
            "onKeyDown={(e) => e.which == 27 && close()}".into(),
        ] {
            for tab in [TAB, "onKeyUp={(e) => e.keyCode === 9 && keep(e)}", "data-x={trapFocus}", "data-x={useFocusTrap}"] {
                let ok = format!("<div role=\"dialog\" aria-modal=\"true\" {esc} {tab}>x</div>");
                assert!(dialog("a.tsx", &ok).is_empty(), "{ok}");
            }
        }
        for ok in [
            format!("useHotkeys('esc', close); const t = useFocusTrap(); const a = {};", m("")),
            format!("useEscapeKey(close); const a = <><main inert={{open}} />{}</>;", m("")),
            format!("import FocusTrap from \"focus-trap-react\";\nconst a = <FocusTrap>{}</FocusTrap>;", m("")),
            format!("import * as Dialog from \"@radix-ui/react-dialog\";\nconst a = {};", m("")),
            format!("import {{ Dialog }} from \"@headlessui/react\";\nconst a = {};", m("")),
            format!("import {{ Drawer }} from \"vaul\";\nconst a = {};", m("")),
            format!("import {{ Modal }} from \"react-aria-components\";\nconst a = {};", m("")),
            // a component with a dialog role is the component's business
            "<Sheet role=\"dialog\" aria-modal=\"true\">x</Sheet>".into(),
            "<Dialog open={o}>x</Dialog>".into(),
            // a dialog in a string is text
            "const s = '<div role=\"dialog\" aria-modal=\"true\">';".into(),
        ] {
            assert!(dialog("a.tsx", &ok).is_empty(), "{ok}");
        }
        assert_eq!(dialog("a.html", "<div role=dialog aria-modal=true>x</div><script>open()</script>").len(), 1);
        assert_eq!(dialog("a.html", "<div role=dialog aria-modal=true>x</div><script>addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })</script>").len(), 1);
        assert!(dialog("a.html", "<div role=dialog aria-modal=true>x</div><script>addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); if (e.key === 'Tab') keep(e) })</script>").is_empty());
        for ext in ["vue", "svelte", "astro"] {
            assert!(dialog(&format!("a.{ext}"), "<div role=\"dialog\" aria-modal=\"true\">x</div>").is_empty());
        }
    }

    const PAGE: &str = "<div class=\"scrim\" hidden></div>\n<section role=\"dialog\" aria-modal=\"true\" hidden></section>\n<script src=\"js/app.js\"></script>";

    #[test]
    fn a_page_is_judged_with_the_scripts_it_loads_from_the_project() {
        let both = "document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); if (e.key === 'Tab') trap(e); });";
        let esc = "document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.modal) closeModal(); });";
        assert!(dialog_says("site/index.html", PAGE, &[("site/js/app.js", both)]).is_empty());
        assert_eq!(dialog_says("site/index.html", PAGE, &[("site/js/app.js", esc)]).len(), 1);
        assert!(dialog_says("site/index.html", PAGE, &[("site/js/app.js", esc)])[0].contains("lets Tab move"));
        assert_eq!(dialog_says("site/index.html", PAGE, &[("site/js/app.js", "open();")]).len(), 1);
        // paths: ./, ../, a query string, and a path written with backslashes
        let at = |src: &str, file: &str| dialog_says("site/pages/a.html", &PAGE.replace("js/app.js", src), &[(file, esc)]).len();
        assert_eq!(at("./app.js?v=2", "site/pages/app.js"), 1);
        assert_eq!(at("../js/app.js", "site/js/app.js"), 1);
        assert_eq!(dialog_says("site\\pages\\a.html", &PAGE.replace("js/app.js", "../js/app.js"), &[("site\\js\\app.js", esc)]).len(), 1);
        // a script the scan cannot read keeps the page quiet: not given, from another site, or from the site root
        assert!(dialog_says("site/index.html", PAGE, &[]).is_empty());
        assert!(dialog_says("site/index.html", PAGE, &[("site/js/other.js", esc)]).is_empty());
        for src in ["https://cdn.example.com/app.js", "//cdn.example.com/app.js", "/js/app.js"] {
            assert!(dialog_says("site/index.html", &PAGE.replace("js/app.js", src), &[("site/js/app.js", esc)]).is_empty(), "{src}");
        }
        // every script it loads is read, and one it cannot read keeps it quiet
        let two = PAGE.replace("<script src=\"js/app.js\"></script>", "<script src=\"js/a.js\"></script><script src=\"js/b.js\"></script>");
        assert!(dialog_says("site/index.html", &two, &[("site/js/a.js", "esc();"), ("site/js/b.js", "if (e.key === 'Tab') trap(e);")]).is_empty());
        assert!(dialog_says("site/index.html", &two, &[("site/js/a.js", esc)]).is_empty());
        // the scripts also settle the wait
        let wait = "<div class=\"spinner\"></div><script type=module src=\"./main.js\"></script>";
        assert_eq!(found_with("a.html", wait, &[("main.js", "render();")], "RX-IX-02", "loading indicator"), vec!["1:1"]);
        assert!(found_with("a.html", wait, &[("main.js", "el.setAttribute('aria-busy', 'true')")], "RX-IX-02", "loading indicator").is_empty());
        assert!(found_with("a.html", wait, &[], "RX-IX-02", "loading indicator").is_empty());
    }

    const SKELETON: &str = "export function Skeleton({ width }: { width?: string }) {\n  return <span className=\"skeleton\" style={{ width }} aria-hidden=\"true\" />;\n}\n\nexport function SkeletonList({ rows = 3 }) {\n  return (\n    <div aria-busy=\"true\" aria-label=\"Memuat\">\n      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} />)}\n    </div>\n  );\n}\n";

    #[test]
    fn an_imported_loading_component_is_judged_by_its_own_markup() {
        let home = |name: &str, from: &str| format!("import {{ Card, {name} }} from \"{from}\";\nexport const Home = () => <Card>{{b === null ? <{name} /> : b}}</Card>;");
        let kit = [("src/components/index.ts", "export * from \"./Card\";\nexport { Skeleton, SkeletonList } from \"./Skeleton\";\n"), ("src/components/Skeleton.tsx", SKELETON), ("src/components/Card.tsx", "export const Card = (p) => <div {...p} />;")];
        let ix = |raw: &str, ctx: &[(&str, &str)]| found_with("src/screens/Home.tsx", raw, ctx, "RX-IX-02", "loading indicator");
        // the Skeleton itself is aria-hidden with nothing announcing the wait; SkeletonList carries aria-busy
        assert_eq!(ix(&home("Skeleton", "../components"), &kit), vec!["2:47"]);
        assert!(ix(&home("SkeletonList", "../components"), &kit).is_empty());
        // straight from its file, under another name, and through `export *`
        assert_eq!(ix(&home("Skeleton", "../components/Skeleton"), &kit), vec!["2:47"]);
        assert_eq!(ix("import { Skeleton as BalanceSkeleton } from \"../components\";\nexport const A = () => <BalanceSkeleton />;", &kit), vec!["2:24"]);
        let star = [("src/components/index.ts", "export * from \"./Skeleton\";"), ("src/components/Skeleton.tsx", SKELETON)];
        assert_eq!(ix(&home("Skeleton", "../components"), &star), vec!["2:47"]);
        // the screen announcing the wait itself keeps it quiet
        assert!(ix("import { Skeleton } from \"../components\";\nexport const A = () => <div aria-busy={busy}><Skeleton /></div>;", &kit).is_empty());
        // a component the scan cannot find stays uncounted: not given, a package, or an alias
        assert!(ix(&home("Skeleton", "../components"), &[]).is_empty());
        assert!(ix(&home("Skeleton", "@/components"), &kit).is_empty());
        assert!(ix("import { Spinner } from \"@chakra-ui/react\";\nconst A = () => <Spinner />;", &kit).is_empty());
        let gone = [("src/components/index.ts", "export { Skeleton } from \"./Missing\";")];
        assert!(ix(&home("Skeleton", "../components"), &gone).is_empty());
    }

    #[test]
    fn the_scan_names_the_files_it_would_read() {
        let page = to_source("site/pages/a.html", "<script src=\"../js/app.js?v=1\"></script><script src=\"https://x.io/a.js\"></script><script src=\"/root.js\"></script>");
        assert_eq!(references(&[page], false), vec!["site/js/app.js"]);
        let home = to_source("src/screens/Home.tsx", "import { Card, Skeleton } from \"../components\";\nimport { Spinner } from \"@chakra-ui/react\";\nimport { go } from \"./nav\";\nconst A = () => <Card><Skeleton /><Spinner /></Card>;");
        let want = references(&[home], false);
        assert!(want.contains(&"src/components.tsx".to_string()) && want.contains(&"src/components/index.ts".to_string()), "{want:?}");
        assert!(!want.iter().any(|p| p.contains("nav") || p.contains("chakra")), "{want:?}");
        // a module that re-exports names the files it re-exports from
        let index = to_source("src/components/index.ts", "export * from \"./Card\";\nexport { Skeleton } from \"./Skeleton\";\nexport { x } from \"pkg\";");
        assert!(references(std::slice::from_ref(&index), false).is_empty());
        let want = references(&[index], true);
        assert!(want.contains(&"src/components/Skeleton.tsx".to_string()) && want.contains(&"src/components/Card.tsx".to_string()), "{want:?}");
        assert!(!want.iter().any(|p| p.contains("pkg")), "{want:?}");
    }

    #[test]
    fn words_split_at_case_digits_and_punctuation() {
        assert_eq!(
            markup::words("LoadingSkeleton Loader2 KEY_ESCAPE onEscapeKeyDown HTMLDialog"),
            vec!["loading", "skeleton", "loader", "key", "escape", "on", "escape", "key", "down", "html", "dialog"]
        );
    }
}
