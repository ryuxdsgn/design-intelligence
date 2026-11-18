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

/// scanSources: `{ sources: [{ path, raw }], folder, skip, design }` → findings, in source order then
/// line and column. The caller sorts by file name (`localeCompare`), as the TypeScript does.
#[wasm_bindgen]
pub fn scan(input: &str) -> String {
    use ryux_core::{drift::Direction, scan as s};
    let v = match ryux_core::parse(input) {
        Ok(v) => v,
        Err(e) => return format!("{{\"error\":{}}}", ryux_core::js::quote(&format!("invalid input: {e}"))),
    };
    let sources: Vec<s::Source> = v["sources"].as_array().map_or(Vec::new(), |a| a.iter().map(|x| s::to_source(x["path"].as_str().unwrap_or(""), x["raw"].as_str().unwrap_or(""))).collect());
    let skip = v["skip"].as_array().map(|a| a.iter().filter_map(|x| x.as_str().map(String::from)).collect()).unwrap_or_default();
    let opts = s::ScanOptions { folder: v["folder"].as_bool().unwrap_or(false), skip, design: Direction::from_json(&v["design"]) };
    ryux_core::Json::Array(s::scan_sources(&sources, opts)).to_string()
}

/// unusedTokens over raw sources: `{ sources: [{ path, raw }], design }` → `{ colours, fonts }`. Comments
/// are blanked first, as the scan reads the files.
#[wasm_bindgen]
pub fn unused(input: &str) -> String {
    use ryux_core::{drift, scan::to_source};
    let v = match ryux_core::parse(input) {
        Ok(v) => v,
        Err(e) => return format!("{{\"error\":{}}}", ryux_core::js::quote(&format!("invalid input: {e}"))),
    };
    let Some(dir) = drift::Direction::from_json(&v["design"]) else { return "{\"error\":\"no design\"}".into() };
    let texts: Vec<String> = v["sources"].as_array().map_or(Vec::new(), |a| a.iter().map(|x| to_source(x["path"].as_str().unwrap_or(""), x["raw"].as_str().unwrap_or("")).text).collect());
    drift::unused_tokens(&texts, &dir).to_string()
}

/// The JSX and TSX syntax checks (oxc), with the input of `scan`. They have no TypeScript twin.
#[wasm_bindgen(js_name = syntaxScan)]
pub fn syntax_scan(input: &str) -> String {
    use ryux_core::{drift::Direction, scan as s};
    let v = match ryux_core::parse(input) {
        Ok(v) => v,
        Err(e) => return format!("{{\"error\":{}}}", ryux_core::js::quote(&format!("invalid input: {e}"))),
    };
    let sources: Vec<s::Source> = v["sources"].as_array().map_or(Vec::new(), |a| a.iter().map(|x| s::to_source(x["path"].as_str().unwrap_or(""), x["raw"].as_str().unwrap_or(""))).collect());
    let skip = v["skip"].as_array().map(|a| a.iter().filter_map(|x| x.as_str().map(String::from)).collect()).unwrap_or_default();
    let opts = s::ScanOptions { folder: v["folder"].as_bool().unwrap_or(false), skip, design: Direction::from_json(&v["design"]) };
    ryux_core::Json::Array(s::scan_syntax(&sources, opts)).to_string()
}
