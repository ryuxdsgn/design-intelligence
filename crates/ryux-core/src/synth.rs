//! The synthesis check: does a research synthesis (synthesis.md) stand on its raw data?
//! Input `{ synthesis, files: { path: text } }`: the synthesis and the raw files its Data table names (paths as the
//! table writes them). Output `{ ok, participants, themes, findings: [{ level, rule, at, message }] }`.
//!
//! It checks what can be counted, never what a theme means (owner 2026-11-25; NN/g thematic analysis and affinity
//! diagramming; Chan & Banawa 2026: a researcher decides the findings and recommendations):
//! - every participant named in the synthesis is in its Data table, and every file there was given;
//! - every quote is in that participant's raw data, word for word (spacing, quote marks, and an ellipsis for a cut aside);
//! - a support line "4 of 6 (P1, P2, P4, P6)" lists as many IDs as it counts, out of the right total;
//! - every theme has a support line and at least one quote; a finding or implication names what it rests on;
//! - "all users" or "most" claims that the count does not reach warn.

use regex::Regex;
use serde_json::{json, Map, Value};
use std::collections::{BTreeMap, BTreeSet};
use std::sync::OnceLock;

fn re(cell: &'static OnceLock<Regex>, pattern: &str) -> &'static Regex {
    cell.get_or_init(|| Regex::new(pattern).unwrap())
}

fn pid() -> &'static Regex {
    static R: OnceLock<Regex> = OnceLock::new();
    re(&R, r"\b([A-Z]{1,3}\d{1,3})\b")
}

/// `> "text" — P3`, `"text" (P3)`, or `“text” – P3`: a quote and who said it.
fn quote() -> &'static Regex {
    static R: OnceLock<Regex> = OnceLock::new();
    re(&R, r#"["“]([^"”]{3,}?)["”]\s*(?:[—–-]\s*|\(\s*)([A-Z]{1,3}\d{1,3})\b"#)
}

/// `4 of 6 (P1, P2, P4, P6)` or `4 dari 6 (P1, ...)`.
fn support() -> &'static Regex {
    static R: OnceLock<Regex> = OnceLock::new();
    re(&R, r"(?i)\b(\d+)\s+(?:of|dari)\s+(\d+)\s*\(([^)]*)\)")
}

fn all_claim() -> &'static Regex {
    static R: OnceLock<Regex> = OnceLock::new();
    re(&R, r"(?i)\b(all users|every user|all participants|everyone|semua (?:pengguna|partisipan|peserta|responden)|seluruh (?:pengguna|partisipan|peserta|responden))\b")
}

fn most_claim() -> &'static Regex {
    static R: OnceLock<Regex> = OnceLock::new();
    re(&R, r"(?i)\b(most users|most participants|the majority|sebagian besar|mayoritas|kebanyakan)\b")
}

/// Lowercase, one kind of quote mark and dash, spacing collapsed: a quote differs from its source only by typing.
fn norm(s: &str) -> String {
    let s = s.replace(['“', '”', '„', '«', '»'], "\"").replace(['‘', '’'], "'").replace(['—', '–'], "-");
    s.split_whitespace().collect::<Vec<_>>().join(" ").to_lowercase()
}

/// The quote's parts, split at an ellipsis ("..." or "…"), each in the source and in order.
fn found(q: &str, source: &str) -> bool {
    let src = norm(source);
    let mut from = 0;
    for part in q.split("...").flat_map(|p| p.split('…')) {
        let p = norm(part.trim_matches(|c: char| c == '[' || c == ']'));
        if p.is_empty() {
            continue;
        }
        match src[from..].find(&p) {
            Some(i) => from += i + p.len(),
            None => return false,
        }
    }
    true
}

enum Part {
    Data,
    Themes,
    Findings,
    Implications,
    Other,
}

fn part_of(heading: &str) -> Part {
    let h = heading.to_lowercase();
    if h.starts_with("data") || h.contains("inventor") || h.contains("sumber") {
        Part::Data
    } else if h.starts_with("theme") || h.starts_with("tema") {
        Part::Themes
    } else if h.starts_with("finding") || h.starts_with("temuan") {
        Part::Findings
    } else if h.contains("implication") || h.contains("implikasi") || h.contains("recommend") || h.contains("rekomendasi") {
        Part::Implications
    } else {
        Part::Other
    }
}

struct Block {
    part: &'static str,
    id: String,
    title: String,
    line: usize,
    text: String,
}

pub fn synth_check(input: &Value) -> Value {
    let text = input["synthesis"].as_str().unwrap_or("");
    let files: Map<String, Value> = input["files"].as_object().cloned().unwrap_or_default();
    let mut out: Vec<Value> = Vec::new();
    let mut add = |level: &str, at: String, message: String| out.push(json!({ "level": level, "rule": "RX-UX-21", "at": at, "message": message }));

    // The Data table: a row per participant (ID, ..., file). The file cell is the one that names a given file or
    // looks like a path.
    let mut part = Part::Other;
    let mut who: BTreeMap<String, Vec<String>> = BTreeMap::new();
    let mut blocks: Vec<Block> = Vec::new();
    for (n, line) in text.lines().enumerate() {
        let t = line.trim();
        if let Some(h) = t.strip_prefix("## ") {
            part = part_of(h);
            continue;
        }
        if let Some(h) = t.strip_prefix("### ") {
            let name = match part {
                Part::Themes => "theme",
                Part::Findings => "finding",
                Part::Implications => "implication",
                _ => "",
            };
            if !name.is_empty() {
                let id = h.split_whitespace().next().unwrap_or("").trim_end_matches([':', '.']).to_string();
                blocks.push(Block { part: name, id, title: h.to_string(), line: n + 1, text: String::new() });
                continue;
            }
        }
        if matches!(part, Part::Themes | Part::Findings | Part::Implications) {
            if let Some(b) = blocks.last_mut() {
                b.text.push_str(line);
                b.text.push('\n');
            }
        }
        if matches!(part, Part::Data) && t.starts_with('|') && !t.contains("---") {
            let cells: Vec<&str> = t.trim_matches('|').split('|').map(str::trim).collect();
            let Some(first) = cells.first() else { continue };
            if !pid().is_match(first) || pid().find(first).map(|m| m.as_str()) != Some(first) {
                continue;
            }
            let file = cells.iter().skip(1).find(|c| files.contains_key(**c) || c.contains('/') || c.contains('.')).map(|c| c.trim_matches('`').to_string());
            let entry = who.entry(first.to_string()).or_default();
            if let Some(f) = file {
                if !files.contains_key(&f) {
                    add("fail", format!("Data: {first}"), format!("{first}'s file {f} was not given or cannot be read: the synthesis cannot be checked against it"));
                }
                entry.push(f);
            }
        }
    }
    let total = who.len();
    if total == 0 {
        add("fail", "Data".into(), "no Data table with one row per participant (ID such as P1, then the file of their raw data): list the data before the themes".into());
    }

    // Participants named anywhere outside the Data table must be in it.
    let mut named: BTreeSet<String> = BTreeSet::new();
    for b in &blocks {
        for m in pid().captures_iter(&b.text) {
            let id = m[1].to_string();
            if !id.starts_with('T') && !id.starts_with('F') && !id.starts_with('I') {
                named.insert(id);
            }
        }
    }
    for id in named.iter().filter(|id| !who.contains_key(*id)) {
        add("fail", id.clone(), format!("{id} is named in the synthesis but not in the Data table: no one may be quoted or counted who is not in the data"));
    }

    let theme_ids: BTreeSet<String> = blocks.iter().filter(|b| b.part == "theme").map(|b| b.id.clone()).collect();
    let finding_ids: BTreeSet<String> = blocks.iter().filter(|b| b.part == "finding").map(|b| b.id.clone()).collect();
    let mut themes = 0;
    for b in &blocks {
        let at = format!("{} (line {})", b.title, b.line);
        let mut quotes = 0;
        for c in quote().captures_iter(&b.text) {
            quotes += 1;
            let (q, id) = (&c[1], c[2].to_string());
            let Some(paths) = who.get(&id) else { continue };
            let sources: Vec<&str> = paths.iter().filter_map(|p| files.get(p).and_then(Value::as_str)).collect();
            if !sources.is_empty() && !sources.iter().any(|s| found(q, s)) {
                add("fail", at.clone(), format!("the quote \"{}\" is not in {id}'s data word for word: quote what they said, or mark it as a paraphrase without quote marks", q.chars().take(80).collect::<String>()));
            }
        }
        let counts: Vec<_> = support().captures_iter(&b.text).collect();
        for c in &counts {
            let (n, of): (usize, usize) = (c[1].parse().unwrap_or(0), c[2].parse().unwrap_or(0));
            let ids: BTreeSet<String> = pid().captures_iter(&c[3]).map(|m| m[1].to_string()).collect();
            if ids.len() != n {
                add("fail", at.clone(), format!("\"{n} of {of}\" lists {} participant IDs: the count is the IDs listed", ids.len()));
            }
            if of != total && total > 0 {
                add("fail", at.clone(), format!("\"{n} of {of}\" counts out of {of}, and the Data table holds {total} participants"));
            }
            if n > of {
                add("fail", at.clone(), format!("\"{n} of {of}\" counts more than the total"));
            }
        }
        let share = counts.first().map(|c| (c[1].parse::<f64>().unwrap_or(0.0), c[2].parse::<f64>().unwrap_or(1.0)));
        if let Some((n, of)) = share {
            if all_claim().is_match(&b.title) || all_claim().is_match(&b.text) {
                if n < of {
                    add("warn", at.clone(), format!("an \"all\" claim on {} of {}: say how many", n as usize, of as usize));
                }
            }
            if (most_claim().is_match(&b.title) || most_claim().is_match(&b.text)) && n * 2.0 <= of {
                add("warn", at.clone(), format!("a \"most\" claim on {} of {}: that is not most", n as usize, of as usize));
            }
        }
        if b.part == "theme" {
            themes += 1;
            if counts.is_empty() {
                add("fail", at.clone(), "a theme with no support line: write how many participants back it, as \"n of N (IDs)\"".into());
            }
            if quotes == 0 {
                add("warn", at.clone(), "a theme with no quote: give at least one, word for word, with who said it".into());
            }
        }
        // a finding names the theme it rests on, an implication the finding
        let wants = if b.part == "finding" { Some(&theme_ids) } else if b.part == "implication" { Some(&finding_ids) } else { None };
        if let Some(ids) = wants.filter(|ids| !ids.is_empty()) {
            let rests = ids.iter().any(|id| Regex::new(&format!(r"\b{}\b", regex::escape(id))).unwrap().is_match(&format!("{}\n{}", b.title, b.text)));
            if !rests {
                let what = if b.part == "finding" { "theme" } else { "finding" };
                add("warn", at.clone(), format!("this {} does not name the {what} it rests on (for example {})", b.part, ids.iter().next().unwrap()));
            }
        }
    }
    let ok = !out.iter().any(|f| f["level"] == "fail");
    json!({ "ok": ok, "participants": total, "themes": themes, "findings": out })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn check(synthesis: &str) -> Value {
        synth_check(&json!({
            "synthesis": synthesis,
            "files": {
                "data/p1.md": "P1: Saya jarang ke laundry karena harus antre.\nP1: Kalau dijemput, saya mau bayar lebih.",
                "data/p2.md": "P2: Antrenya lama sekali, apalagi hari Sabtu.",
                "data/p3.md": "P3: Saya cuci sendiri, tidak masalah."
            }
        }))
    }

    const DATA: &str = "# Synthesis\n\n## Data\n\n| ID | Kind | File |\n| --- | --- | --- |\n| P1 | interview | data/p1.md |\n| P2 | interview | data/p2.md |\n| P3 | interview | data/p3.md |\n";

    fn rules(v: &Value) -> Vec<String> {
        v["findings"].as_array().unwrap().iter().map(|f| format!("{} {}", f["level"].as_str().unwrap(), f["message"].as_str().unwrap().split(':').next().unwrap())).collect()
    }

    #[test]
    fn a_synthesis_that_stands_on_its_data_passes() {
        let s = format!("{DATA}\n## Themes\n\n### T1 Antre membuat orang menunda\n\n- Support: 2 of 3 (P1, P2)\n> \"jarang ke laundry karena harus antre\" — P1\n> \"Antrenya lama sekali ... hari Sabtu\" — P2\n\n## Findings\n\n### F1 Penjemputan menghapus alasan menunda (T1)\n\n## Design implications\n\n### I1 Jadwal jemput di layar pertama (F1)\n");
        let r = check(&s);
        assert_eq!(r["ok"], true, "{r}");
        assert_eq!(rules(&r), Vec::<String>::new());
        assert_eq!(r["participants"], 3);
        assert_eq!(r["themes"], 1);
    }

    #[test]
    fn an_invented_quote_participant_or_count_fails() {
        let s = format!("{DATA}\n## Themes\n\n### T1 Semua pengguna benci antre\n\n- Support: 3 of 4 (P1, P2)\n> \"saya benci antre\" — P1\n> \"tidak pernah ke laundry\" — P9\n");
        let r = check(&s);
        assert_eq!(r["ok"], false);
        let got = rules(&r);
        assert!(got.iter().any(|x| x.starts_with("fail P9 is named")), "{got:?}");
        assert!(got.iter().any(|x| x.starts_with("fail the quote \"saya benci antre\"")), "{got:?}");
        assert!(got.iter().any(|x| x.contains("lists 2 participant IDs")), "{got:?}");
        assert!(got.iter().any(|x| x.contains("counts out of 4")), "{got:?}");
        assert!(got.iter().any(|x| x.starts_with("warn an \"all\" claim")), "{got:?}");
    }

    #[test]
    fn a_theme_without_support_and_a_finding_without_its_theme_are_flagged() {
        let s = format!("{DATA}\n## Themes\n\n### T1 Antre\n\nOrang tidak suka antre.\n\n## Temuan\n\n### F1 Sebagian besar ingin dijemput\n\n- 1 dari 3 (P1)\n");
        let got = rules(&check(&s));
        assert!(got.iter().any(|x| x.starts_with("fail a theme with no support line")), "{got:?}");
        assert!(got.iter().any(|x| x.starts_with("warn a theme with no quote")), "{got:?}");
        assert!(got.iter().any(|x| x.starts_with("warn this finding does not name the theme")), "{got:?}");
        assert!(got.iter().any(|x| x.starts_with("warn a \"most\" claim on 1 of 3")), "{got:?}");
    }

    #[test]
    fn a_missing_file_or_no_data_table_fails() {
        let r = synth_check(&json!({ "synthesis": "## Data\n\n| P1 | interview | data/p1.md |\n", "files": {} }));
        assert!(rules(&r).iter().any(|x| x.starts_with("fail P1's file data/p1.md was not given")));
        let r = synth_check(&json!({ "synthesis": "## Themes\n\n### T1 x\n", "files": {} }));
        assert!(rules(&r).iter().any(|x| x.starts_with("fail no Data table")));
    }
}
