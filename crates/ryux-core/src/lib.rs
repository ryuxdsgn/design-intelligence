//! RYUX's deterministic checks, without I/O: JSON in, JSON out. The TypeScript in `packages/cli/src` and
//! this crate answer to one contract, `fixtures/checks/*.json`; `cargo test` replays it here.

pub mod audit;
pub mod js;

pub use audit::audit;

pub use serde_json::Value as Json;

/// Parse a JSON string, for callers (the WASM entry) that do not depend on serde_json themselves.
pub fn parse(s: &str) -> Result<Json, String> {
    serde_json::from_str(s).map_err(|e| e.to_string())
}

pub mod jsre;
pub mod drift;
pub mod scan;
pub mod jsx;
