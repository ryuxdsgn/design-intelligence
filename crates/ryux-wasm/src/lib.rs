//! The CLI's entry to ryux-core: each check takes a JSON string and returns one.

use wasm_bindgen::prelude::*;

/// The canvas audit over a recorded canvas (see fixtures/checks/audit.json for the shape).
#[wasm_bindgen]
pub fn audit(input: &str) -> String {
    match serde_json_parse(input) {
        Ok(v) => ryux_core::audit(&v).to_string(),
        Err(e) => format!("{{\"error\":{}}}", ryux_core::js::quote(&format!("invalid input: {e}"))),
    }
}

/// The rendered checks over the in-page extract (packages/cli/src/cli/page-probe.ts): `{ findings, ignored }`, or
/// `{ ask }` when the page must act first (fixtures/checks/probe.json).
#[wasm_bindgen]
pub fn probe(input: &str) -> String {
    match serde_json_parse(input) {
        Ok(v) => ryux_core::probe(&v).to_string(),
        Err(e) => format!("{{\"error\":{}}}", ryux_core::js::quote(&format!("invalid input: {e}"))),
    }
}

/// What the rendered checks look for, as data: `[{rule, level}]`, the rows of RENDER_CHECKS in packages/cli/src/checks.ts
/// that ryux-core reports.
#[wasm_bindgen(js_name = renderChecks)]
pub fn render_checks() -> String {
    ryux_core::probe::catalogue().to_string()
}

fn serde_json_parse(s: &str) -> Result<ryux_core::Json, String> {
    ryux_core::parse(s)
}

/// readDirection: the direction block of a DESIGN.md, or null.
#[wasm_bindgen(js_name = readDirection)]
pub fn read_direction(md: &str) -> String {
    ryux_core::drift::read_direction(md).map_or("null".to_string(), |d| d.to_json().to_string())
}

/// Drift hits for one source: `{ text, ext, design }` → `{ colours, fonts, radius, durations }`.
#[wasm_bindgen]
pub fn drift(input: &str) -> String {
    use ryux_core::drift::{self as d, Direction};
    let v = match ryux_core::parse(input) {
        Ok(v) => v,
        Err(e) => return format!("{{\"error\":{}}}", ryux_core::js::quote(&format!("invalid input: {e}"))),
    };
    let Some(dir) = Direction::from_json(&v["design"]) else { return "{\"error\":\"no design\"}".into() };
    let (text, ext) = (v["text"].as_str().unwrap_or(""), v["ext"].as_str().unwrap_or(""));
    let hits = |h: Vec<d::Hit>| ryux_core::Json::Array(h.iter().map(|x| x.to_json()).collect());
    let out = ryux_core::Json::Object(
        [
            ("colours".to_string(), hits(d::drift_colours(text, ext, &dir))),
            ("fonts".to_string(), hits(d::drift_fonts(text, &dir))),
            ("radius".to_string(), hits(d::drift_radius(text, &dir))),
            ("durations".to_string(), hits(d::drift_durations(text, &dir))),
        ]
        .into_iter()
        .collect(),
    );
    out.to_string()
}

/// scanSources: `{ sources: [{ path, raw }], folder, skip, design, context, wants }` → findings, in source order
/// then line and column. The caller sorts by file name (`localeCompare`). `context` holds files the checks may consult
/// but do not report on. With `wants: true` the answer is `{ findings, wants }`, `wants` being the files not yet
/// given that would judge the sources more fully (scan::references); the caller reads the ones that exist and asks
/// again.
#[wasm_bindgen]
pub fn scan(input: &str) -> String {
    use ryux_core::{drift::Direction, scan as s};
    let v = match ryux_core::parse(input) {
        Ok(v) => v,
        Err(e) => return format!("{{\"error\":{}}}", ryux_core::js::quote(&format!("invalid input: {e}"))),
    };
    let read = |k: &str| -> Vec<s::Source> { v[k].as_array().map_or(Vec::new(), |a| a.iter().map(|x| s::to_source(x["path"].as_str().unwrap_or(""), x["raw"].as_str().unwrap_or(""))).collect()) };
    let sources = read("sources");
    let skip = v["skip"].as_array().map(|a| a.iter().filter_map(|x| x.as_str().map(String::from)).collect()).unwrap_or_default();
    let context = read("context");
    let wants = v["wants"].as_bool().unwrap_or(false).then(|| {
        let known: std::collections::HashSet<String> = sources.iter().chain(context.iter()).map(|x| s::norm(&x.path)).collect();
        let mut w = s::references(&sources, false);
        w.extend(s::references(&context, true));
        w.retain(|p| !known.contains(p));
        w
    });
    let opts = s::ScanOptions { folder: v["folder"].as_bool().unwrap_or(false), skip, design: Direction::from_json(&v["design"]), context };
    let findings = ryux_core::Json::Array(s::scan_sources(&sources, opts));
    match wants {
        None => findings.to_string(),
        Some(w) => format!("{{\"findings\":{findings},\"wants\":{}}}", ryux_core::Json::Array(w.into_iter().map(ryux_core::Json::String).collect())),
    }
}

/// unusedTokens over raw sources: `{ sources: [{ path, raw }], design }` → `{ colours, fonts }`. Comments
/// are blanked first, as the scan reads the files. `{ texts, design }` reads texts already blanked (the form
/// fixtures/checks/unused.json records).
#[wasm_bindgen]
pub fn unused(input: &str) -> String {
    use ryux_core::{drift, scan::to_source};
    let v = match ryux_core::parse(input) {
        Ok(v) => v,
        Err(e) => return format!("{{\"error\":{}}}", ryux_core::js::quote(&format!("invalid input: {e}"))),
    };
    let Some(dir) = drift::Direction::from_json(&v["design"]) else { return "{\"error\":\"no design\"}".into() };
    let texts: Vec<String> = match v["texts"].as_array() {
        Some(t) => t.iter().map(|x| x.as_str().unwrap_or("").to_string()).collect(),
        None => v["sources"].as_array().map_or(Vec::new(), |a| a.iter().map(|x| to_source(x["path"].as_str().unwrap_or(""), x["raw"].as_str().unwrap_or("")).text).collect()),
    };
    drift::unused_tokens(&texts, &dir).to_string()
}

/// The detectors behind `scan` as data, in order: `[{rule, level, folder}]`. The CLI tests its catalogue
/// (packages/cli/src/checks.ts) against this list.
#[wasm_bindgen]
pub fn detectors() -> String {
    ryux_core::scan::catalogue(false).to_string()
}

/// The detectors behind `syntaxScan`, in the form of `detectors`.
#[wasm_bindgen(js_name = syntaxDetectors)]
pub fn syntax_detectors() -> String {
    ryux_core::scan::catalogue(true).to_string()
}

/// One source as the checks read it: `{ ext, text }`, the text with comments blanked. The fixture recorder
/// (packages/cli/test/golden.mjs) stores drift cases over this text.
#[wasm_bindgen]
pub fn source(path: &str, raw: &str) -> String {
    let s = ryux_core::scan::to_source(path, raw);
    ryux_core::Json::Object([("ext".to_string(), ryux_core::Json::from(s.ext)), ("text".to_string(), ryux_core::Json::from(s.text))].into_iter().collect()).to_string()
}

/// The JSX and TSX syntax checks (oxc), with the input of `scan`.
#[wasm_bindgen(js_name = syntaxScan)]
pub fn syntax_scan(input: &str) -> String {
    use ryux_core::{drift::Direction, scan as s};
    let v = match ryux_core::parse(input) {
        Ok(v) => v,
        Err(e) => return format!("{{\"error\":{}}}", ryux_core::js::quote(&format!("invalid input: {e}"))),
    };
    let sources: Vec<s::Source> = v["sources"].as_array().map_or(Vec::new(), |a| a.iter().map(|x| s::to_source(x["path"].as_str().unwrap_or(""), x["raw"].as_str().unwrap_or(""))).collect());
    let skip = v["skip"].as_array().map(|a| a.iter().filter_map(|x| x.as_str().map(String::from)).collect()).unwrap_or_default();
    let opts = s::ScanOptions { folder: v["folder"].as_bool().unwrap_or(false), skip, design: Direction::from_json(&v["design"]), context: Vec::new() };
    ryux_core::Json::Array(s::scan_syntax(&sources, opts)).to_string()
}

/// The report check: does a RYUX report's one-line gate count the same areas as its detail block?
/// `{ text, areas }` in, `{ ok, gate, detail, message }` out (fixtures/checks/report.json).
#[wasm_bindgen(js_name = reportCheck)]
pub fn report_check(input: &str) -> String {
    match serde_json_parse(input) {
        Ok(v) => ryux_core::report_check(&v).to_string(),
        Err(e) => format!("{{\"error\":{}}}", ryux_core::js::quote(&format!("invalid input: {e}"))),
    }
}
