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
