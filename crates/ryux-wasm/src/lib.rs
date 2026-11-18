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
