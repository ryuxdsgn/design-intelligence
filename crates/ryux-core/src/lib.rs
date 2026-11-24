//! RYUX's deterministic checks, without I/O: JSON in, JSON out. The CLI in `packages/cli` runs them as
//! WebAssembly (crates/ryux-wasm); they answer to `fixtures/checks/*.json`, which `cargo test` replays here.

pub mod audit;
pub mod js;
pub mod probe;
pub mod report;

pub use audit::audit;
pub use probe::probe;
pub use report::report_check;

pub use serde_json::Value as Json;

/// Parse a JSON string, for callers (the WASM entry) that do not depend on serde_json themselves.
pub fn parse(s: &str) -> Result<Json, String> {
    serde_json::from_str(s).map_err(|e| e.to_string())
}

pub mod jsre;
pub mod directions;
pub mod drift;
pub mod scan;
pub mod jsx;
pub mod markup;
