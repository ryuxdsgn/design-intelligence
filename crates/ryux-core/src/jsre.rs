//! JavaScript regular expressions, as the TypeScript checks write them, run with JavaScript's meaning.
//! The pattern is translated to fancy-regex syntax (which has lookahead and lookbehind): `\d` and `\w` are
//! ASCII, `\s` is JavaScript's whitespace (with U+FEFF, without U+0085), `\b` is an ASCII word boundary,
//! `.` stops at every JavaScript line terminator, and with the `m` flag `^` and `$` do too.
//! Offsets go back to the caller in UTF-16 code units, as `match.index` does.



const WORD: &str = "0-9A-Za-z_";
const SPACE: &str = r"\t\n\x0B\x0C\r \x{A0}\x{1680}\x{2000}-\x{200A}\x{2028}\x{2029}\x{202F}\x{205F}\x{3000}\x{FEFF}";
const LINE_END: &str = r"\n\r\x{2028}\x{2029}";

/// Most patterns have no lookaround and run on the regex crate (a linear-time engine, with ASCII `\b`);
/// the rest run on fancy-regex, with `\b` spelled as lookarounds since its parser has no `(?-u:...)`.
enum Engine {
    Fast(regex::Regex),
    /// `skeleton` is the pattern with its lookarounds removed: every real match is also a skeleton match
    /// at the same start, so no real match starts before the skeleton's first one. The backtracking engine
    /// searches from there and returns the next real match; a search never revisits text, so a whole
    /// matchAll stays linear. (An anchored check per candidate does not: fancy-regex wraps every pattern
    /// in a lazy `.*?`, so even `\G` walks to the end of the text on each call.)
    Fancy { full: fancy_regex::Regex, skeleton: regex::Regex },
}

/// The pattern without its lookaround groups: `(?=..)`, `(?!..)`, `(?<=..)`, `(?<!..)`.
fn drop_lookarounds(src: &str) -> String {
    let c: Vec<char> = src.chars().collect();
    let mut out = String::new();
    let mut i = 0;
    let mut class = false;
    while i < c.len() {
        let rest: String = c[i..c.len().min(i + 4)].iter().collect();
        if !class && (rest.starts_with("(?=") || rest.starts_with("(?!") || rest.starts_with("(?<=") || rest.starts_with("(?<!")) {
            let (mut depth, mut j, mut cls) = (0, i, false);
            while j < c.len() {
                match c[j] {
                    '\\' => j += 1,
                    '[' if !cls => cls = true,
                    ']' if cls => cls = false,
                    '(' if !cls => depth += 1,
                    ')' if !cls => {
                        depth -= 1;
                        if depth == 0 {
                            break;
                        }
                    }
                    _ => {}
                }
                j += 1;
            }
            i = j + 1;
            continue;
        }
        match c[i] {
            '\\' => {
                out.push(c[i]);
                i += 1;
                if i < c.len() {
                    out.push(c[i]);
                }
            }
            '[' if !class => {
                class = true;
                out.push('[');
            }
            ']' if class => {
                class = false;
                out.push(']');
            }
            ch => out.push(ch),
        }
        i += 1;
    }
    out
}

pub struct JsRe {
    re: Engine,
    pub global: bool,
}

/// Compile a JavaScript regex source with its flags (`g`, `i`, `m`, `s`, `u`, `y` is not used).
pub fn js(pattern: &str, flags: &str) -> JsRe {
    // Without `u`, JavaScript's `i` folds ASCII letters only (`/s/i` does not match "ſ", nor `/k/i` the
    // Kelvin sign), so each letter is spelled out in both cases; with `u` it folds Unicode, as Rust does.
    let ascii_fold = flags.contains('i') && !flags.contains('u');
    let prefix = if flags.contains('i') && !ascii_fold { "(?i)" } else { "" };
    let (m, d) = (flags.contains('m'), flags.contains('s'));
    let fast = format!("{prefix}{}", translate(pattern, m, d, ascii_fold, true));
    let fancy = ["(?=", "(?!", "(?<=", "(?<!"].iter().any(|l| fast.contains(l));
    let re = if fancy {
        let src = format!("{prefix}{}", translate(pattern, m, d, ascii_fold, false));
        // JavaScript has no backtracking limit; fancy-regex stops at a million steps by default.
        // JavaScript has no backtracking limit; fancy-regex stops at a million steps by default.
        let full = fancy_regex::RegexBuilder::new(&src).backtrack_limit(usize::MAX).build().unwrap_or_else(|e| panic!("regex /{pattern}/{flags}: {e}\n{src}"));
        let skel = drop_lookarounds(&fast);
        let skeleton = regex::Regex::new(&skel).unwrap_or_else(|e| panic!("skeleton of /{pattern}/{flags}: {e}\n{skel}"));
        Engine::Fancy { full, skeleton }
    } else {
        Engine::Fast(regex::Regex::new(&fast).unwrap_or_else(|e| panic!("regex /{pattern}/{flags}: {e}\n{fast}")))
    };
    JsRe { re, global: flags.contains('g') }
}

fn translate(p: &str, multiline: bool, dotall: bool, fold: bool, ascii_b: bool) -> String {
    let chars: Vec<char> = p.chars().collect();
    let mut out = String::new();
    let mut i = 0;
    let mut class = false;
    let mut class_start = false;
    while i < chars.len() {
        let c = chars[i];
        if class {
            let was_start = class_start;
            class_start = false;
            match c {
                ']' => {
                    class = false;
                    out.push(']');
                }
                '^' if was_start => out.push('^'),
                '\\' => {
                    i += 1;
                    match chars[i] {
                        'd' => out.push_str("0-9"),
                        'w' => out.push_str(WORD),
                        's' => out.push_str(SPACE),
                        // a nested class: the regex crate unions it into the outer one
                        'D' => out.push_str("[^0-9]"),
                        'W' => out.push_str(&format!("[^{WORD}]")),
                        'S' => out.push_str(&format!("[^{SPACE}]")),
                        'b' => out.push_str(r"\x08"),
                        'u' => {
                            out.push_str(&format!("\\x{{{}}}", chars[i + 1..i + 5].iter().collect::<String>()));
                            i += 4;
                        }
                        e if e.is_ascii_punctuation() => out.push_str(&format!("\\x{{{:02X}}}", e as u32)),
                        e => {
                            out.push('\\');
                            out.push(e);
                        }
                    }
                }
                '[' | '&' | '~' => {
                    out.push('\\');
                    out.push(c);
                }
                c if fold && c.is_ascii_alphabetic() => {
                    // a range of letters (a-z) gets its other case too; a single letter gets both
                    let range = chars.get(i + 1) == Some(&'-') && chars.get(i + 2).map_or(false, |e| e.is_ascii_alphabetic() && e.is_ascii_lowercase() == c.is_ascii_lowercase());
                    if range {
                        let e = chars[i + 2];
                        out.push_str(&format!("{c}-{e}{}-{}", swap(c), swap(e)));
                        i += 2;
                    } else {
                        out.push(c);
                        out.push(swap(c));
                    }
                }
                _ => out.push(c),
            }
            i += 1;
            continue;
        }
        match c {
            '[' => {
                class = true;
                class_start = true;
                out.push('[');
            }
            '\\' => {
                i += 1;
                let e = chars[i];
                match e {
                    'd' => out.push_str("[0-9]"),
                    'D' => out.push_str("[^0-9]"),
                    'w' => out.push_str(&format!("[{WORD}]")),
                    'W' => out.push_str(&format!("[^{WORD}]")),
                    's' => out.push_str(&format!("[{SPACE}]")),
                    'S' => out.push_str(&format!("[^{SPACE}]")),
                    // the regex crate's ASCII word boundary: JavaScript's \b, without falling back to backtracking
                    'b' if ascii_b => out.push_str(r"(?-u:\b)"),
                    'B' if ascii_b => out.push_str(r"(?-u:\B)"),
                    'b' => out.push_str(&format!("(?:(?<=[{WORD}])(?![{WORD}])|(?<![{WORD}])(?=[{WORD}]))")),
                    'B' => out.push_str(&format!("(?:(?<=[{WORD}])(?=[{WORD}])|(?<![{WORD}])(?![{WORD}]))")),
                    'u' => {
                        out.push_str(&format!("\\x{{{}}}", chars[i + 1..i + 5].iter().collect::<String>()));
                        i += 4;
                    }
                    e if e.is_ascii_punctuation() => out.push_str(&format!("\\x{{{:02X}}}", e as u32)),
                    e => {
                        out.push('\\');
                        out.push(e);
                    }
                }
            }
            '.' if !dotall => out.push_str(&format!("[^{LINE_END}]")),
            '^' if multiline => out.push_str(&format!("(?<![^{LINE_END}])")),
            '$' if multiline => out.push_str(&format!("(?![^{LINE_END}])")),
            '$' => out.push_str(r"\z"),
            c if fold && c.is_ascii_alphabetic() => out.push_str(&format!("[{c}{}]", swap(c))),
            _ => out.push(c),
        }
        i += 1;
    }
    out
}

fn swap(c: char) -> char {
    if c.is_ascii_lowercase() { c.to_ascii_uppercase() } else { c.to_ascii_lowercase() }
}

/// UTF-16 offset of a byte offset in `s`.
pub fn u16_at(s: &str, byte: usize) -> usize {
    s[..byte].encode_utf16().count()
}

/// Byte offset of a UTF-16 offset in `s` (clamped; inside a surrogate pair it rounds down).
pub fn byte_at(s: &str, u16: usize) -> usize {
    let mut n = 0;
    for (b, ch) in s.char_indices() {
        if n >= u16 {
            return b;
        }
        n += ch.len_utf16();
        if n > u16 {
            return b;
        }
    }
    s.len()
}

/// One match: its captures as strings (None for a group that did not take part), and where it starts.
pub struct Hit {
    pub groups: Vec<Option<String>>,
    /// UTF-16 offset of the match.
    pub index: usize,
    /// Byte offsets of the match and of each group.
    pub start: usize,
    pub end: usize,
    pub spans: Vec<Option<(usize, usize)>>,
}

impl Hit {
    /// `base` is a known (byte, UTF-16) position at or before the match, so a scan counts each unit once.
    fn from(spans: Vec<Option<(usize, usize)>>, s: &str, base: (usize, usize)) -> Hit {
        let (start, end) = spans[0].unwrap();
        let index = base.1 + u16_at(&s[base.0..], start - base.0);
        Hit { groups: spans.iter().map(|g| g.map(|(a, b)| s[a..b].to_string())).collect(), index, start, end, spans }
    }
    pub fn g(&self, i: usize) -> &str {
        self.groups.get(i).and_then(|g| g.as_deref()).unwrap_or("")
    }
    pub fn has(&self, i: usize) -> bool {
        self.groups.get(i).map_or(false, |g| g.is_some())
    }
}

impl JsRe {
    /// `re.test(s)` (for a non-global regex; the checks never test with a global one).
    pub fn test(&self, s: &str) -> bool {
        match &self.re {
            Engine::Fast(r) => r.is_match(s),
            Engine::Fancy { .. } => self.at(s, 0).is_some(),
        }
    }
    /// The first match at or after byte `at`, looking behind it for context as JavaScript's lastIndex does.
    fn at(&self, s: &str, at: usize) -> Option<Hit> {
        self.at_from(s, at, (0, 0))
    }
    fn at_from(&self, s: &str, at: usize, base: (usize, usize)) -> Option<Hit> {
        let spans: Vec<Option<(usize, usize)>> = match &self.re {
            Engine::Fast(r) => r.captures_at(s, at).map(|c| c.iter().map(|g| g.map(|g| (g.start(), g.end()))).collect())?,
            Engine::Fancy { full, skeleton } => {
                let p = skeleton.find_at(s, at)?.start();
                full.captures_from_pos(s, p).expect("regex")?.iter().map(|g| g.map(|g| (g.start(), g.end()))).collect()
            }
        };
        Some(Hit::from(spans, s, base))
    }
    /// `re.exec(s)` from the start.
    pub fn exec(&self, s: &str) -> Option<Hit> {
        self.at(s, 0)
    }
    /// `s.matchAll(re)`: every match, an empty one advancing by one character.
    pub fn match_all(&self, s: &str) -> Vec<Hit> {
        let mut out = Vec::new();
        let mut at = 0;
        let mut base = (0, 0);
        while at <= s.len() {
            let Some(h) = self.at_from(s, at, base) else { break };
            base = (h.start, h.index);
            at = if h.end == h.start { h.end + s[h.end..].chars().next().map_or(1, char::len_utf8) } else { h.end };
            out.push(h);
        }
        out
    }
    /// `s.match(re)` for a global regex: every whole match.
    pub fn matches(&self, s: &str) -> Vec<String> {
        self.match_all(s).into_iter().map(|h| h.groups[0].clone().unwrap_or_default()).collect()
    }
    /// `s.search(re)`: the UTF-16 offset of the first match, or -1.
    pub fn search(&self, s: &str) -> isize {
        self.at(s, 0).map_or(-1, |h| h.index as isize)
    }
    /// `s.replace(re, with)`, with a literal replacement; a global regex replaces every match.
    pub fn replace(&self, s: &str, with: &str) -> String {
        let hits = if self.global { self.match_all(s) } else { self.exec(s).into_iter().collect() };
        let mut out = String::new();
        let mut last = 0;
        for h in hits {
            out.push_str(&s[last..h.start]);
            out.push_str(with);
            last = h.end;
        }
        out.push_str(&s[last..]);
        out
    }
    /// `s.split(re)` (no captures in the patterns the checks split by).
    pub fn split(&self, s: &str) -> Vec<String> {
        let mut out = Vec::new();
        let mut last = 0;
        for h in self.match_all(s) {
            if h.end == h.start && (h.start == 0 || h.start == s.len()) {
                continue;
            }
            out.push(s[last..h.start].to_string());
            last = h.end;
        }
        out.push(s[last..].to_string());
        out
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn javascript_meanings() {
        assert!(js(r"\bfoo\b", "").test("a foo."));
        assert!(js(r"\bfoo\b", "").test("éfooé")); // é is not an ASCII word character, so this is a boundary
        assert!(!js(r"\d", "").test("٣"));
        assert!(js(r"^b", "m").test("a\rb"));
        assert!(!js(r"a.b", "").test("a\rb"));
        assert!(js(r#"["'`[]"#, "").test("["));
        assert_eq!(js(r"\s+", "g").split("a  b\u{feff}c"), vec!["a", "b", "c"]);
        assert_eq!(js(r"(\d+)(px)?\b(?!\s*%)", "g").match_all("12.5 %").iter().map(|h| h.g(1).to_string()).collect::<Vec<_>>(), vec!["12"]);
        assert_eq!(js(r"x", "g").match_all("😀x")[0].index, 2);
        assert_eq!(js(r"^[\w-]+:", "").exec("a-b: c").unwrap().g(0), "a-b:");
        assert!(js(r"<\/a[ \u00a0]\]", "").test("</a\u{a0}]"));
        assert!(js(r"[\/\-]x", "").test("/x"));
        assert!(js(r"skeleton", "i").test("SKELETON") && !js(r"s", "i").test("\u{17f}") && !js(r"[a-z]", "i").test("\u{212a}"));
        assert!(js(r"[a-f]x", "i").test("Dx") && js(r"é", "iu").test("É"));
        assert_eq!(drop_lookarounds(r"a(?<![x(])b(?=c\))d[(?=]"), r"abd[(?=]");
        assert_eq!(js(r"(?<![\d/])\d{1,2}/\d{4}", "g").matches("1/2026 x/12/2026 112/2026 a 12/2026"), vec!["1/2026", "12/2026"]);
        assert_eq!(js(r"/\*[\s\S]*?\*/", "g").replace("a/*x\ny*/b", ""), "ab");
    }
}
