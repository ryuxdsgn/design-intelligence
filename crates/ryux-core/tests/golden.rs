//! Replays fixtures/checks/*.json, the cases the CLI tests record (pnpm --filter @ryuxdsgn/design-intelligence record:fixtures), against this crate.

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
fn golden_probe() {
    let cases = load("probe");
    assert!(!cases.is_empty());
    let mut failed = Vec::new();
    for (i, case) in cases.iter().enumerate() {
        let got = ryux_core::probe(&case["input"]);
        if got != case["output"] {
            failed.push(format!("case {i}:
  want {}
  got  {}", case["output"], got));
        }
    }
    assert!(failed.is_empty(), "{} of {} cases differ:
{}", failed.len(), cases.len(), failed.join("
"));
}

#[test]
fn the_probe_asks_before_it_judges_what_the_page_must_do() {
    // A recorded extract without its answers: ryux-core asks for exactly the hit tests and fills it was given.
    for case in load("probe") {
        let Some(answers) = case["input"].get("answers") else { continue };
        let mut bare = case["input"].clone();
        bare.as_object_mut().unwrap().remove("answers");
        let ask = ryux_core::probe(&bare)["ask"].clone();
        let keys = |v: &Value| v.as_object().unwrap().keys().map(|k| k.parse::<u64>().unwrap()).collect::<Vec<_>>();
        assert_eq!(ask["under"], serde_json::json!(keys(&answers["under"])));
        assert_eq!(ask["grow"], serde_json::json!(keys(&answers["grow"])));
    }
}

#[test]
fn every_rule_the_audit_names_exists() {
    let path = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../../fixtures/rules.json");
    let rules: Vec<Value> = serde_json::from_str(&std::fs::read_to_string(path).unwrap()).unwrap();
    let ids: Vec<&str> = rules.iter().filter_map(|r| r["id"].as_str()).collect();
    let src = [include_str!("../src/audit.rs"), include_str!("../src/probe.rs"), include_str!("../src/drift.rs"), include_str!("../src/scan.rs"), include_str!("../src/jsx.rs")].concat();
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

/// The scan entry the WebAssembly build exposes: `{ sources: [{path, raw}], folder, skip, design }`.
pub fn run_scan(input: &Value) -> Value {
    use ryux_core::scan::{scan_sources, to_source, ScanOptions};
    let sources: Vec<_> = input["sources"].as_array().unwrap().iter().map(|s| to_source(s["path"].as_str().unwrap(), s["raw"].as_str().unwrap())).collect();
    let skip = input["skip"].as_array().map(|a| a.iter().filter_map(|x| x.as_str().map(String::from)).collect()).unwrap_or_default();
    let opts = ScanOptions { folder: input["folder"].as_bool().unwrap_or(false), skip, design: Direction::from_json(&input["design"]), context: input["context"].as_array().map_or(Vec::new(), |a| a.iter().map(|x| to_source(x["path"].as_str().unwrap_or(""), x["raw"].as_str().unwrap_or(""))).collect()) };
    Value::Array(scan_sources(&sources, opts))
}

#[test]
fn golden_scan() {
    let cases = load("scan");
    assert!(cases.len() > 100);
    let mut bad = 0;
    for case in &cases {
        let got = run_scan(&case["input"]);
        if got != case["output"] {
            bad += 1;
            if bad <= 3 {
                eprintln!("MISMATCH input={}\n got={}\nwant={}", case["input"]["sources"], got, case["output"]);
            }
        }
    }
    assert_eq!(bad, 0, "{bad} of {} scan cases differ", cases.len());
}
