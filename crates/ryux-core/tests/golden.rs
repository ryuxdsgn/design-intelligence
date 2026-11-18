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
    let src = [include_str!("../src/audit.rs"), include_str!("../src/drift.rs")].concat();
    let re = regex::Regex::new(r"RX-[A-Z0-9]+-\d{2}").unwrap();
    for m in re.find_iter(&src) {
        assert!(ids.contains(&m.as_str()), "{} is not in fixtures/rules.json", m.as_str());
    }
}

use ryux_core::drift::{self, Direction};

#[test]
fn golden_direction() {
    for case in load("direction") {
        let got = drift::read_direction(case["input"]["md"].as_str().unwrap()).map_or(Value::Null, |d| d.to_json());
        assert_eq!(got, case["output"], "{}", case["input"]["md"]);
    }
}

#[test]
fn golden_drift() {
    let cases = load("drift");
    assert!(!cases.is_empty());
    for case in cases {
        let i = &case["input"];
        let d = Direction::from_json(&i["design"]).unwrap();
        let (text, ext) = (i["text"].as_str().unwrap(), i["ext"].as_str().unwrap());
        let hits = |h: Vec<drift::Hit>| Value::Array(h.iter().map(|x| x.to_json()).collect());
        let got = serde_json::json!({
            "colours": hits(drift::drift_colours(text, ext, &d)),
            "fonts": hits(drift::drift_fonts(text, &d)),
            "radius": hits(drift::drift_radius(text, &d)),
            "durations": hits(drift::drift_durations(text, &d)),
        });
        assert_eq!(got, case["output"], "{text}");
    }
}

#[test]
fn golden_unused() {
    for case in load("unused") {
        let i = &case["input"];
        let texts: Vec<String> = i["texts"].as_array().unwrap().iter().map(|t| t.as_str().unwrap().to_string()).collect();
        assert_eq!(drift::unused_tokens(&texts, &Direction::from_json(&i["design"]).unwrap()), case["output"]);
    }
}
