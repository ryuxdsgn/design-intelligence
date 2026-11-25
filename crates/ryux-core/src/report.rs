//! The report check: does the one-line gate in a RYUX report count the same areas as the detail block?
//! Input `{ text, areas }` (the reply and the gate area names); output `{ ok, gate, detail, message }`.
//! A reply without a gate line, or without area lines, has nothing to compare and passes.

use regex::Regex;
use serde_json::{json, Value};
use std::sync::OnceLock;

const STATUSES: [&str; 4] = ["PASS", "FAIL", "NOT VERIFIED", "N/A"];

fn gate_line() -> &'static Regex {
    static R: OnceLock<Regex> = OnceLock::new();
    R.get_or_init(|| Regex::new(r"^\s*(?:\*\*)?(?:Gate|GATE)(?:\*\*)?\s*:").unwrap())
}

fn count() -> &'static Regex {
    static R: OnceLock<Regex> = OnceLock::new();
    R.get_or_init(|| Regex::new(r"(\d+)\s+(?:areas?\s+)?(NOT VERIFIED|PASS|FAIL|N/A)\b").unwrap())
}

fn area_line() -> &'static Regex {
    static R: OnceLock<Regex> = OnceLock::new();
    R.get_or_init(|| Regex::new(r"^\s*([A-Z][A-Z /&-]*[A-Z])\s*(?::\s*|\s+)(NOT VERIFIED|PASS|FAIL|N/A)\b").unwrap())
}

fn index(status: &str) -> usize {
    STATUSES.iter().position(|s| *s == status).unwrap()
}

fn as_json(c: &[u64; 4]) -> Value {
    json!({ "PASS": c[0], "FAIL": c[1], "NOT VERIFIED": c[2], "N/A": c[3] })
}

pub fn report_check(input: &Value) -> Value {
    // the area was named ANTI-SLOP until the Unslop rename (owner 2026-11-25); a report written before it still checks
    let text = input["text"].as_str().unwrap_or("").replace("ANTI-SLOP", "UNSLOP");
    let text = text.as_str();
    let areas: Vec<&str> = input["areas"].as_array().map(|a| a.iter().filter_map(|v| v.as_str()).collect()).unwrap_or_default();

    let mut gate: Option<[u64; 4]> = None;
    let mut named = [false; 4];
    let mut detail = [0u64; 4];
    let mut seen: Vec<String> = Vec::new();
    for line in text.lines() {
        if gate.is_none() && gate_line().is_match(line) {
            let mut c = [0u64; 4];
            for m in count().captures_iter(line) {
                c[index(&m[2])] += m[1].parse::<u64>().unwrap_or(0);
                named[index(&m[2])] = true;
            }
            gate = Some(c);
            continue;
        }
        if let Some(m) = area_line().captures(line) {
            let name = m[1].trim().to_string();
            if areas.contains(&name.as_str()) && !seen.contains(&name) {
                detail[index(&m[2])] += 1;
                seen.push(name);
            }
        }
    }
    let detail = if seen.is_empty() { None } else { Some(detail) };

    let mut message = Value::Null;
    if let (Some(g), Some(d)) = (gate, detail) {
        let diffs: Vec<String> = (0..4)
            .filter(|&i| g[i] != d[i])
            .map(|i| {
                if named[i] {
                    format!("{} is {} in the gate line and {} in the detail", STATUSES[i], g[i], d[i])
                } else {
                    format!("{} has no number in the gate line and {} in the detail", STATUSES[i], d[i])
                }
            })
            .collect();
        if !diffs.is_empty() {
            message = Value::String(format!(
                "The gate line does not match the detail: {}. Count the gate line again from the detail, each area once, and rewrite that line.",
                diffs.join("; ")
            ));
        }
    }
    json!({
        "ok": message.is_null(),
        "gate": gate.map(|g| as_json(&g)).unwrap_or(Value::Null),
        "detail": detail.map(|d| as_json(&d)).unwrap_or(Value::Null),
        "message": message,
    })
}
