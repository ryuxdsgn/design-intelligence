//! The read gate: before a RYUX run writes to a design canvas, has it read each required file whole?
//! Input `{ skillLoaded, write, required: [path], reads: [{ path, lines, ranges: [[start, end]] }] }`, with 1-based
//! inclusive line ranges taken from the run's Read calls. Output `{ ok, missing, message }`.
//! A session that never loaded RYUX, or a call that does not write, passes. Why: in the design-system trial
//! (Figma, 2026-11-27) two of four runs with the same prompt read no knowledge module, and wording in the router
//! did not change that; the reads have to happen before the canvas changes.

use serde_json::{json, Value};

/// Lines of a file covered by the ranges, counting each line once.
fn covered(lines: u64, ranges: &[(u64, u64)]) -> u64 {
    let mut r: Vec<(u64, u64)> = ranges.iter().map(|&(a, b)| (a.max(1), b.min(lines))).filter(|(a, b)| a <= b).collect();
    r.sort();
    let (mut total, mut end) = (0u64, 0u64);
    for (a, b) in r {
        let a = a.max(end + 1);
        if a <= b {
            total += b - a + 1;
            end = b;
        }
    }
    total
}

pub fn read_gate(input: &Value) -> Value {
    let loaded = input["skillLoaded"].as_bool().unwrap_or(false);
    let write = input["write"].as_bool().unwrap_or(true);
    if !loaded || !write {
        return json!({ "ok": true, "missing": [], "message": Value::Null });
    }
    let reads = input["reads"].as_array().cloned().unwrap_or_default();
    let mut missing: Vec<String> = Vec::new();
    for req in input["required"].as_array().into_iter().flatten().filter_map(Value::as_str) {
        let entries: Vec<&Value> = reads.iter().filter(|r| r["path"].as_str() == Some(req)).collect();
        let lines = entries.iter().filter_map(|r| r["lines"].as_u64()).max().unwrap_or(0);
        let ranges: Vec<(u64, u64)> = entries
            .iter()
            .flat_map(|r| r["ranges"].as_array().cloned().unwrap_or_default())
            .filter_map(|p| Some((p.get(0)?.as_u64()?, p.get(1)?.as_u64()?)))
            .collect();
        let whole = lines > 0 && covered(lines, &ranges) >= lines;
        if !whole {
            let seen = if lines > 0 { covered(lines, &ranges) } else { 0 };
            missing.push(if seen > 0 { format!("{req} ({seen} of {lines} lines read)") } else { req.to_string() });
        }
    }
    let message = if missing.is_empty() {
        Value::Null
    } else {
        Value::String(format!(
            "RYUX: read these files whole before changing the canvas, then try again: {}. They hold the rules this canvas work is checked against (property names, states as properties, bindings, the component sheet, contrast, copy). Read each one in full with the Read tool; a search of its headings or a slice of it does not count.",
            missing.join(", ")
        ))
    };
    json!({ "ok": missing.is_empty(), "missing": missing, "message": message })
}

#[cfg(test)]
mod tests {
    use super::covered;

    #[test]
    fn overlapping_ranges_count_once() {
        assert_eq!(covered(100, &[(1, 60), (40, 100)]), 100);
        assert_eq!(covered(100, &[(30, 200)]), 71);
        assert_eq!(covered(10, &[]), 0);
    }
}
