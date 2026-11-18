//! Replays fixtures/checks/*.json, the cases the TypeScript tests recorded, against this crate.

use serde_json::Value;
use std::path::PathBuf;

fn load(check: &str) -> Vec<Value> {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../fixtures/checks").join(format!("{check}.json"));
    let text = std::fs::read_to_string(&path).unwrap_or_else(|e| panic!("{}: {e}", path.display()));
    serde_json::from_str::<Vec<Value>>(&text).unwrap()
}

#[test]
fn golden_audit() {
    let cases = load("audit");
    assert!(!cases.is_empty());
    let mut failed = Vec::new();
    for (i, case) in cases.iter().enumerate() {
        let got = ryux_core::audit(&case["input"]);
        if got != case["output"] {
            failed.push(format!("case {i}:\n  want {}\n  got  {}", case["output"], got));
        }
    }
    assert!(failed.is_empty(), "{} of {} cases differ:\n{}", failed.len(), cases.len(), failed.join("\n"));
}

#[test]
fn every_rule_the_audit_names_exists() {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../fixtures/rules.json");
    let rules: Vec<Value> = serde_json::from_str(&std::fs::read_to_string(path).unwrap()).unwrap();
    let ids: Vec<&str> = rules.iter().filter_map(|r| r["id"].as_str()).collect();
    let src = include_str!("../src/audit.rs");
    let re = regex::Regex::new(r"RX-[A-Z0-9]+-\d{2}").unwrap();
    for m in re.find_iter(src) {
        assert!(ids.contains(&m.as_str()), "{} is not in fixtures/rules.json", m.as_str());
    }
}
