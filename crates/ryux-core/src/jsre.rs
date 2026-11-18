//! JavaScript regular expressions, as the TypeScript checks write them, run with JavaScript's meaning.
//! The pattern is translated to fancy-regex syntax (which has lookahead and lookbehind): `\d` and `\w` are
//! ASCII, `\s` is JavaScript's whitespace (with U+FEFF, without U+0085), `\b` is an ASCII word boundary,
//! `.` stops at every JavaScript line terminator, and with the `m` flag `^` and `$` do too.
//! Offsets go back to the caller in UTF-16 code units, as `match.index` does.

use fancy_regex::{Captures, Regex};

const WORD: &str = "0-9A-Za-z_";
const SPACE: &str = r"\t\n\x0B\x0C\r \x{A0}\x{1680}\x{2000}-\x{200A}\x{2028}\x{2029}\x{202F}\x{205F}\x{3000}\x{FEFF}";
const LINE_END: &str = r"\n\r\x{2028}\x{2029}";

pub struct JsRe {
    re: Regex,
    pub global: bool,
}

/// Compile a JavaScript regex source with its flags (`g`, `i`, `m`, `s`, `u`, `y` is not used).
pub fn js(pattern: &str, flags: &str) -> JsRe {
    let src = translate(pattern, flags.contains('m'), flags.contains('s'));
    let src = if flags.contains('i') { format!("(?i){src}") } else { src };
    let re = Regex::new(&src).unwrap_or_else(|e| panic!("regex /{pattern}/{flags}: {e}\n{src}"));
    JsRe { re, global: flags.contains('g') }
}

fn translate(p: &str, multiline: bool, dotall: bool) -> String {
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
                        'D' | 'W' | 'S' => panic!("negated class escape inside a class: {p}"),
                        'b' => out.push_str(r"\x08"),
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
                    'b' => out.push_str(&format!("(?:(?<=[{WORD}])(?![{WORD}])|(?<![{WORD}])(?=[{WORD}]))")),
                    'B' => out.push_str(&format!("(?:(?<=[{WORD}])(?=[{WORD}])|(?<![{WORD}])(?![{WORD}]))")),
                    '/' => out.push('/'),
                    e if e.is_ascii_digit() => {
                        out.push('\\');
                        out.push(e);
                    }
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
            _ => out.push(c),
        }
        i += 1;
    }
    out
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
    fn from(c: &Captures, s: &str) -> Hit {
        let m = c.get(0).unwrap();
        Hit {
            groups: (0..c.len()).map(|i| c.get(i).map(|g| g.as_str().to_string())).collect(),
            index: u16_at(s, m.start()),
            start: m.start(),
            end: m.end(),
            spans: (0..c.len()).map(|i| c.get(i).map(|g| (g.start(), g.end()))).collect(),
        }
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
        self.re.is_match(s).expect("regex")
    }
    /// `re.exec(s)` from the start.
    pub fn exec(&self, s: &str) -> Option<Hit> {
        self.re.captures(s).expect("regex").map(|c| Hit::from(&c, s))
    }
    /// `s.matchAll(re)`: every match, an empty one advancing by one character.
    pub fn match_all(&self, s: &str) -> Vec<Hit> {
        let mut out = Vec::new();
        let mut at = 0;
        while at <= s.len() {
            let Some(c) = self.re.captures_from_pos(s, at).expect("regex") else { break };
            let h = Hit::from(&c, s);
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
        self.re.find(s).expect("regex").map_or(-1, |m| u16_at(s, m.start()) as isize)
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
    }
}
