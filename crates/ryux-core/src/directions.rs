//! Direction draws (RX-UI-26): three visual directions drawn from a curated catalog (data/directions.json), filtered
//! by the product's context tags, seeded by the project name so one project always gets the same draw and two
//! projects get different ones. The agent builds each direction from its draw; the draw only sets the frame.
//!
//! Why code and not more text: five rounds of written rules (diversity bench arms B to F, 2026-11-21 and 22) still
//! left the pages in one group, and RYUX runs settled on a second default of their own (Open Sauce Sans with a rust
//! accent, 6 of 16 FigCraft runs, 2026-11-25). A draw is the same on every model and agent and costs no tokens.
//!
//! Input: `{ project, tags?: [..], lock?: { dimension: id }, allow?: [default ids], redraw?: n }`.
//! A lock is what a named reference fixes ("like app X": its layout, density, type, surface); the rest is drawn.

use serde_json::{json, Value};

const CATALOG: &str = include_str!("../data/directions.json");
const DIMS: [&str; 7] = ["surface", "accent", "type", "layout", "carrier", "material", "idea"];

fn catalog() -> Value {
    serde_json::from_str(CATALOG).expect("directions catalog")
}

/// FNV-1a over the bytes: a stable seed across platforms and builds.
fn fnv(s: &str) -> u64 {
    let mut h: u64 = 0xcbf29ce484222325;
    for b in s.bytes() {
        h ^= b as u64;
        h = h.wrapping_mul(0x100000001b3);
    }
    h
}

struct Rng(u64);
impl Rng {
    /// splitmix64
    fn next(&mut self) -> u64 {
        self.0 = self.0.wrapping_add(0x9e3779b97f4a7c15);
        let mut z = self.0;
        z = (z ^ (z >> 30)).wrapping_mul(0xbf58476d1ce4e5b9);
        z = (z ^ (z >> 27)).wrapping_mul(0x94d049bb133111eb);
        z ^ (z >> 31)
    }
    fn unit(&mut self) -> f64 {
        (self.next() >> 11) as f64 / (1u64 << 53) as f64
    }
}

fn strs(v: Option<&Value>) -> Vec<String> {
    v.and_then(Value::as_array).map(|a| a.iter().filter_map(|x| x.as_str().map(str::to_lowercase)).collect()).unwrap_or_default()
}

/// The hue range an accent family may use: its centre ±15°, less the ranges of defaults not allowed.
fn hue_range(centre: f64, cut: &[(f64, f64)]) -> Option<(f64, f64)> {
    let (mut lo, mut hi) = (centre - 15.0, centre + 15.0);
    for &(a, b) in cut {
        // compare on the same turn of the circle as the family
        for shift in [-360.0, 0.0, 360.0] {
            let (a, b) = (a + shift, b + shift);
            if a <= lo && b >= hi {
                return None;
            }
            if a <= lo && b > lo {
                lo = b;
            } else if b >= hi && a < hi {
                hi = a;
            } else if a > lo && b < hi {
                // a cut inside the range keeps the wider side
                if a - lo >= hi - b { hi = a } else { lo = b }
            }
        }
    }
    (hi - lo >= 8.0).then_some((lo.rem_euclid(360.0), hi.rem_euclid(360.0)))
}

pub fn directions(input: &Value) -> Value {
    let cat = catalog();
    let project = input.get("project").and_then(Value::as_str).unwrap_or("").trim().to_lowercase();
    let tags = strs(input.get("tags"));
    let allow = strs(input.get("allow"));
    let redraw = input.get("redraw").and_then(Value::as_u64).unwrap_or(0);
    let lock = input.get("lock").and_then(Value::as_object).cloned().unwrap_or_default();
    let known: Vec<String> = ["product", "audience", "use"].iter().flat_map(|k| strs(cat["tags"].get(*k))).collect();
    let unknown_tags: Vec<&String> = tags.iter().filter(|t| !known.contains(t)).collect();
    let seed = fnv(&format!("{project}#{redraw}"));
    let mut rng = Rng(seed);

    let defaults: Vec<&Value> = cat["defaults"].as_array().map(|a| a.iter().filter(|d| !allow.contains(&d["id"].as_str().unwrap_or("").to_string())).collect()).unwrap_or_default();
    let cut: Vec<(f64, f64)> = defaults.iter().filter(|d| d.get("surface").is_none()).flat_map(|d| d["hues"].as_array().cloned().unwrap_or_default())
        .filter_map(|r| Some((r.get(0)?.as_f64()?, r.get(1)?.as_f64()?))).collect();

    // candidates per dimension, with weights: 4 when a fit tag matches, 1.5 with no fit list, 0.5 otherwise; avoided tags drop out
    let mut pools: Vec<Vec<(Value, f64)>> = Vec::new();
    let mut unknown_lock: Vec<String> = Vec::new();
    for d in DIMS {
        let all = cat["dimensions"][d].as_array().cloned().unwrap_or_default();
        if let Some(id) = lock.get(d).and_then(Value::as_str) {
            match all.iter().find(|e| e["id"] == id) {
                Some(e) => { pools.push(vec![(e.clone(), 1.0)]); continue; }
                None => unknown_lock.push(format!("{d}={id}")),
            }
        }
        let mut pool = Vec::new();
        for mut e in all {
            let fit = strs(e.get("fit"));
            let avoid = strs(e.get("avoid"));
            if avoid.iter().any(|t| tags.contains(t)) {
                continue;
            }
            if d == "accent" {
                let Some((lo, hi)) = e["hue"].as_f64().and_then(|c| hue_range(c, &cut)) else { continue };
                e["hues"] = json!([lo.round(), hi.round()]);
            }
            let w = if fit.iter().any(|t| tags.contains(t)) { 4.0 } else if fit.is_empty() { 1.5 } else { 0.5 };
            pool.push((e, w));
        }
        pools.push(pool);
    }

    let pick = |rng: &mut Rng, pool: &[(Value, f64)]| -> Value {
        let total: f64 = pool.iter().map(|p| p.1).sum();
        let mut x = rng.unit() * total;
        for (e, w) in pool {
            if x < *w {
                return e.clone();
            }
            x -= w;
        }
        pool.last().map(|p| p.0.clone()).unwrap_or(Value::Null)
    };
    let id = |v: &Value| v["id"].as_str().unwrap_or("").to_string();
    let combo_default = |dir: &[Value]| -> bool {
        defaults.iter().any(|d| {
            let Some(s) = d.get("surface").and_then(Value::as_str) else { return false };
            if id(&dir[0]) != s {
                return false;
            }
            let layout_hit = d.get("layout").and_then(Value::as_str).is_none_or(|l| id(&dir[3]) == l);
            let hue_hit = d.get("hues").and_then(Value::as_array).is_none_or(|rs| {
                let c = dir[1]["hue"].as_f64().unwrap_or(-1.0);
                rs.iter().any(|r| (r[0].as_f64().unwrap_or(0.0)..=r[1].as_f64().unwrap_or(0.0)).contains(&c))
            });
            layout_hit && hue_hit
        })
    };

    let mut chosen: Vec<Vec<Value>> = Vec::new();
    for slot in 0..3 {
        let mut best: Option<Vec<Value>> = None;
        for _ in 0..400 {
            let dir: Vec<Value> = pools.iter().map(|p| pick(&mut rng, p)).collect();
            if dir.iter().any(Value::is_null) || combo_default(&dir) {
                continue;
            }
            let locked = |i: usize| lock.contains_key(DIMS[i]);
            let clash = chosen.iter().any(|o| {
                let same = (0..7).filter(|&i| id(&o[i]) == id(&dir[i])).count();
                let free_same = (0..7).filter(|&i| !locked(i) && id(&o[i]) == id(&dir[i])).count();
                let free = (0..7).filter(|&i| !locked(i)).count();
                // at least three free dimensions differ (or all of them when fewer are free), and never the same surface unless locked
                (free - free_same) < 3.min(free) || (!locked(0) && id(&o[0]) == id(&dir[0])) || same == 7
            });
            let once = |dim: usize, v: &str| id(&dir[dim]) == v && chosen.iter().any(|o| id(&o[dim]) == v);
            // surface, accent, type, and layout differ in every direction unless a reference locks them; an idea source twice at most
            let repeats = [0, 1, 2, 3].iter().any(|&i| !locked(i) && chosen.iter().any(|o| id(&o[i]) == id(&dir[i])))
                || chosen.iter().filter(|o| id(&o[6]) == id(&dir[6])).count() >= 2;
            if clash || repeats || once(5, "flat-vector") || once(6, "mechanic") {
                continue;
            }
            best = Some(dir);
            break;
        }
        match best {
            Some(d) => chosen.push(d),
            None => break,
        }
        // the third direction comes from culture and place when neither earlier one does, unless the idea is locked
        if slot == 1 && !lock.contains_key("idea") && !chosen.iter().any(|d| id(&d[6]) == "place") {
            if let Some(p) = pools[6].iter().find(|p| id(&p.0) == "place") {
                pools[6] = vec![p.clone()];
            }
        }
    }

    let out: Vec<Value> = chosen.iter().enumerate().map(|(i, d)| {
        let mut m = serde_json::Map::new();
        m.insert("n".into(), json!(i + 1));
        for (k, v) in DIMS.iter().zip(d) {
            let mut e = v.clone();
            if let Some(o) = e.as_object_mut() {
                o.remove("fit");
                o.remove("avoid");
            }
            m.insert((*k).into(), e);
        }
        Value::Object(m)
    }).collect();
    json!({
        "seed": format!("{seed:016x}"),
        "project": project,
        "redraw": redraw,
        "tags": tags,
        "locked": lock,
        "unknownLocks": unknown_lock,
        "unknownTags": unknown_tags,
        "knownTags": cat["tags"],
        "notDefault": defaults.iter().map(|d| json!({ "id": d["id"], "note": d["note"] })).collect::<Vec<_>>(),
        "directions": out,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    fn draw(v: Value) -> Value {
        directions(&v)
    }
    fn ids(r: &Value, dim: &str) -> Vec<String> {
        r["directions"].as_array().unwrap().iter().map(|d| d[dim]["id"].as_str().unwrap().to_string()).collect()
    }

    #[test]
    fn one_project_one_draw_two_projects_two() {
        let a = draw(json!({ "project": "Klipin", "tags": ["creative-tool", "umkm"] }));
        let b = draw(json!({ "project": "klipin ", "tags": ["creative-tool", "umkm"] }));
        let c = draw(json!({ "project": "Rawat", "tags": ["health", "booking"] }));
        assert_eq!(a["directions"], b["directions"]);
        assert_ne!(a["seed"], c["seed"]);
        let r = draw(json!({ "project": "Klipin", "tags": ["creative-tool"], "redraw": 1 }));
        assert_ne!(a["seed"], r["seed"]);
    }

    #[test]
    fn three_directions_that_differ() {
        for p in ["Klipin", "Rawat", "Lipatan", "Ladang", "Kantong", "Rak", "Sejuk", "Kilau"] {
            let r = draw(json!({ "project": p, "tags": ["consumer"] }));
            let d = r["directions"].as_array().unwrap();
            assert_eq!(d.len(), 3, "{p}");
            let s = ids(&r, "surface");
            assert!(s[0] != s[1] && s[1] != s[2] && s[0] != s[2], "{p}: surfaces {s:?}");
            assert!(ids(&r, "idea").contains(&"place".to_string()), "{p}: no culture and place");
            assert!(ids(&r, "idea").iter().filter(|x| *x == "mechanic").count() <= 1, "{p}");
            assert!(ids(&r, "material").iter().filter(|x| *x == "flat-vector").count() <= 1, "{p}");
            for i in 0..3 {
                for j in i + 1..3 {
                    let diff = DIMS.iter().filter(|k| d[i][**k]["id"] != d[j][**k]["id"]).count();
                    assert!(diff >= 3, "{p}: {i} and {j} differ in {diff}");
                }
            }
        }
    }

    #[test]
    fn avoided_tags_and_defaults_stay_out() {
        for p in ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j"] {
            let r = draw(json!({ "project": p, "tags": ["health", "senior"] }));
            for a in ids(&r, "accent") {
                assert!(a != "red" && a != "yellow" && a != "lime" && a != "magenta", "{p}: {a}");
            }
            assert!(!ids(&r, "surface").iter().any(|s| s.starts_with("dark")), "{p}");
            // the rust accent (10–20°) is never inside a drawn hue range
            for d in r["directions"].as_array().unwrap() {
                let h = &d["accent"]["hues"];
                let (lo, hi) = (h[0].as_f64().unwrap(), h[1].as_f64().unwrap());
                if lo <= hi {
                    assert!(hi <= 10.0 || lo >= 20.0, "{p}: {lo}-{hi}");
                }
            }
        }
        // violet sits wholly inside the no-skill default: out unless allowed
        let mut seen = false;
        for p in 0..40 {
            let r = draw(json!({ "project": format!("p{p}"), "allow": ["inter-violet-teal"] }));
            seen |= ids(&r, "accent").contains(&"violet".to_string());
            let r = draw(json!({ "project": format!("p{p}") }));
            assert!(!ids(&r, "accent").contains(&"violet".to_string()));
        }
        assert!(seen, "an allowed default can be drawn again");
    }

    #[test]
    fn a_named_reference_locks_its_dimensions() {
        let r = draw(json!({ "project": "Kasir", "tags": ["commerce"], "lock": { "layout": "split-pane", "type": "grotesk", "surface": "light-neutral" } }));
        assert_eq!(ids(&r, "layout"), vec!["split-pane"; 3]);
        assert_eq!(ids(&r, "surface"), vec!["light-neutral"; 3]);
        let d = r["directions"].as_array().unwrap();
        assert_eq!(d.len(), 3);
        for i in 0..3 {
            for j in i + 1..3 {
                let diff = ["accent", "carrier", "material", "idea"].iter().filter(|k| d[i][**k]["id"] != d[j][**k]["id"]).count();
                assert!(diff >= 3, "{i} {j}");
            }
        }
        let bad = draw(json!({ "project": "Kasir", "lock": { "layout": "nope" } }));
        assert_eq!(bad["unknownLocks"], json!(["layout=nope"]));
    }
}
