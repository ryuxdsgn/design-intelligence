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
const DIMS: [&str; 9] = ["surface", "accent", "type", "layout", "carrier", "material", "idea", "treatment", "model"];

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

/// OKLCH to sRGB hex, with the chroma lowered until the colour fits the sRGB gamut.
fn oklch(l: f64, c: f64, h: f64) -> String {
    let mut c = c;
    loop {
        let (a, b) = (c * h.to_radians().cos(), c * h.to_radians().sin());
        let l_ = (l + 0.3963377774 * a + 0.2158037573 * b).powi(3);
        let m_ = (l - 0.1055613458 * a - 0.0638541728 * b).powi(3);
        let s_ = (l - 0.0894841775 * a - 1.2914855480 * b).powi(3);
        let lin = [
            4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
            -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
            -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_,
        ];
        if lin.iter().all(|v| (-0.0001..=1.0001).contains(v)) || c <= 0.0 {
            let g = |v: f64| { let v = v.clamp(0.0, 1.0); if v <= 0.0031308 { 12.92 * v } else { 1.055 * v.powf(1.0 / 2.4) - 0.055 } };
            return format!("#{:02x}{:02x}{:02x}", (g(lin[0]) * 255.0).round() as u8, (g(lin[1]) * 255.0).round() as u8, (g(lin[2]) * 255.0).round() as u8);
        }
        c = (c - 0.005).max(0.0);
    }
}

/// Concrete colours for a direction, so the page cannot fall back to the model's light default (cream on five of five
/// H2 pages, 2026-11-25): the page, an alternate section, ink, muted text, the accent, text on the accent, and for a
/// colour field the field that covers at least a third of the page. Neutrals lean to the accent hue (RX-UI-31).
/// The catalog's hues are HSL degrees (yellow is 35–65°); OKLCH puts the same colour elsewhere (yellow near 95°).
/// This takes an HSL hue to the OKLCH hue of the same pure colour, so a drawn yellow comes out yellow.
fn oklch_hue(hsl: f64) -> f64 {
    let f = |n: f64| { let k = (n + hsl / 30.0).rem_euclid(12.0); 0.5 - 0.5 * (k - 3.0).min(9.0 - k).clamp(-1.0, 1.0) };
    let lin = |v: f64| if v <= 0.04045 { v / 12.92 } else { ((v + 0.055) / 1.055).powf(2.4) };
    let (r, g, b) = (lin(f(0.0)), lin(f(8.0)), lin(f(4.0)));
    let l = (0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b).cbrt();
    let m = (0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b).cbrt();
    let s = (0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b).cbrt();
    let a = 1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s;
    let bb = 0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s;
    bb.atan2(a).to_degrees().rem_euclid(360.0)
}

fn luminance(h: &str) -> f64 {
    let c: Vec<f64> = (0..3).map(|j| u8::from_str_radix(&h[1 + j * 2..3 + j * 2], 16).unwrap_or(0) as f64 / 255.0).collect();
    let l = |v: f64| if v <= 0.04045 { v / 12.92 } else { ((v + 0.055) / 1.055).powf(2.4) };
    0.2126 * l(c[0]) + 0.7152 * l(c[1]) + 0.0722 * l(c[2])
}

fn ratio(a: &str, b: &str) -> f64 {
    let (x, y) = (luminance(a), luminance(b));
    (x.max(y) + 0.05) / (x.min(y) + 0.05)
}

/// The OKLCH colour at lightness `l`, stepped darker (or lighter with `up`) until `against` reads on it at `min`.
fn readable(l: f64, c: f64, h: f64, against: &str, min: f64, up: bool) -> String {
    let mut l = l;
    loop {
        let x = oklch(l, c, h);
        if ratio(&x, against) >= min || !(0.05..=0.97).contains(&l) {
            return x;
        }
        l += if up { 0.01 } else { -0.01 };
    }
}

pub fn colours(surface: &str, accent: &Value) -> Value {
    let hsl_h = match (accent["hues"][0].as_f64(), accent["hues"][1].as_f64()) {
        (Some(a), Some(b)) => { let w = if b < a { b + 360.0 } else { b }; ((a + w) / 2.0).rem_euclid(360.0) }
        _ => accent["hue"].as_f64().unwrap_or(250.0),
    };
    // a warm field takes brick to turmeric: the accent's hue when it is warm, else one of four warm hues
    // (brick 8, terracotta 18, orange 30, turmeric 45), picked from the accent's hue so each project draws its own
    let hsl_h = if surface == "warm-field" && !(0.0..=55.0).contains(&hsl_h) { [8.0, 18.0, 30.0, 45.0][((hsl_h / 45.0) as usize) % 4] } else { hsl_h };
    let h = oklch_hue(hsl_h);
    let dark = surface.starts_with("dark");
    let (page, section, ink, muted) = match surface {
        "light-cool" => (oklch(0.985, 0.008, 250.0), oklch(0.955, 0.014, 250.0), oklch(0.24, 0.025, 250.0), oklch(0.50, 0.02, 250.0)),
        "warm-paper" => (oklch(0.972, 0.018, 85.0), oklch(0.94, 0.026, 80.0), oklch(0.26, 0.025, 60.0), oklch(0.50, 0.025, 60.0)),
        // muted text on a dark page stays light: small grey on dark green read weak to the owner though it passed (H4)
        "dark-neutral" => (oklch(0.19, 0.004, 260.0), oklch(0.24, 0.006, 260.0), oklch(0.95, 0.004, 260.0), oklch(0.82, 0.006, 260.0)),
        "dark-tinted" => (oklch(0.21, 0.045, h), oklch(0.27, 0.055, h), oklch(0.96, 0.012, h), oklch(0.84, 0.025, h)),
        // warm without cream: coffee and dark brick, whatever the accent (owner 2026-11-26: warm need not be cream)
        "dark-warm" => (oklch(0.22, 0.035, 50.0), oklch(0.28, 0.045, 45.0), oklch(0.96, 0.012, 75.0), oklch(0.84, 0.025, 70.0)),
        // a faint tint of the accent's hue; a warm hue would make it cream, so those stay grey
        "light-tinted" if (20.0..=110.0).contains(&hsl_h) => (oklch(0.99, 0.0, 0.0), oklch(0.962, 0.0, 0.0), oklch(0.22, 0.02, h), oklch(0.48, 0.015, h)),
        "light-tinted" => (oklch(0.982, 0.012, h), oklch(0.955, 0.024, h), oklch(0.22, 0.025, h), oklch(0.48, 0.025, h)),
        "warm-field" => (oklch(0.99, 0.0, 0.0), oklch(0.96, 0.0, 0.0), oklch(0.22, 0.02, h), oklch(0.48, 0.015, h)),
        // a warm hue (orange to yellow) tinting a light page is cream: keep those neutrals grey and let the field carry it
        "colour-field" if (20.0..=110.0).contains(&hsl_h) => (oklch(0.985, 0.0, 0.0), oklch(0.955, 0.0, 0.0), oklch(0.22, 0.02, h), oklch(0.48, 0.015, h)),
        "colour-field" => (oklch(0.985, 0.01, h), oklch(0.95, 0.03, h), oklch(0.22, 0.03, h), oklch(0.48, 0.03, h)),
        _ => (oklch(0.992, 0.0, 0.0), oklch(0.965, 0.0, 0.0), oklch(0.22, 0.0, 0.0), oklch(0.50, 0.0, 0.0)),
    };
    // yellow and lime only read as themselves light, with dark text on them
    let bright = (40.0..=100.0).contains(&hsl_h);
    let (al, ac) = if dark || bright { (0.80, 0.15) } else { (0.58, 0.16) };
    // every pair is made to pass, not hoped to: white on a light-page accent (darkened until 4.5:1), dark text on a
    // light accent (lightened until it does)
    let light_accent = al > 0.68;
    let on_light = oklch(0.2, 0.02, h);
    let accent_c = if light_accent { readable(al, ac, h, &on_light, 4.5, true) } else { readable(al, ac, h, "#ffffff", 4.5, false) };
    let mut out = json!({
        "page": page, "section": section, "ink": ink, "muted": muted,
        "accent": accent_c,
        "onAccent": if light_accent { on_light } else { "#ffffff".to_string() },
    });
    if surface == "colour-field" || surface == "warm-field" {
        let on_field = oklch(0.18, 0.03, h);
        out["field"] = json!(readable(if bright { 0.82 } else { 0.62 }, 0.16, h, &on_field, 4.5, true));
        out["onField"] = json!(on_field);
        out["accent"] = json!(readable(0.30, 0.09, h, "#ffffff", 4.5, false));
        out["onAccent"] = json!("#ffffff");
    }
    // seniors, families, and health: helper text reads at 7:1, not only 4.5 (owner H5 and H6: small grey read weak
    // on four of five pages that passed contrast)
    // helper text reads at 7:1 on the section colour, the harder of the two backgrounds, for every audience: small grey
    // that passed 4.5:1 read weak to the owner in H5, H6, and H7, for students and freelancers as well as seniors
    let section = out["section"].as_str().unwrap_or("#ffffff").to_string();
    out["muted"] = json!(readable(if dark { 0.84 } else { 0.50 }, 0.02, h, &section, 7.0, dark));
    out
}

/// A type ramp for a direction (RX-UI-03): five sizes, one per role, each about one ratio above the one below, so no
/// two read as one level. A dense working screen starts at 14 px, a glance screen at 16, both stepping by 1.25; a
/// display face (serif display, expressive grotesk) by 1.333. A label takes the body or caption size with weight.
pub fn ramp(type_id: &str, session: bool, senior: bool) -> Value {
    let display = type_id == "serif-display" || type_id == "expressive-grotesk";
    // 1.25 keeps a dense screen's subheading in NN/g's 18–22 px web band (14 x 1.2 gives 17)
    // the body follows how the product is used; a display face only widens the steps above it
    // a senior audience reads body text at 18 (owner H6: body copy too small and grey for seniors)
    let base: f64 = if senior { 18.0 } else if session { 14.0 } else { 16.0 };
    let ratio: f64 = if display { 1.333 } else { 1.25 };
    let step = |k: i32| (base * ratio.powi(k)).round();
    json!({
        "ratio": ratio,
        // a caption on a glance screen stays at 14: small grey steps read weak to the owner (H6, H7)
        "caption": step(-1).max(if session { 12.0 } else { 14.0 }),
        "body": base,
        "heading": step(1),
        "title": step(2),
        "display": step(3),
        "label": "the body or caption size, one weight up (or caps with tracking): not a size of its own",
    })
}

pub fn directions(input: &Value) -> Value {
    let mut cat = catalog();
    // the user's own entries (`extra: { dimension: [entry] }`): added, or replacing a catalog entry with the same id
    let mut added: Vec<String> = Vec::new();
    if let Some(extra) = input.get("extra").and_then(Value::as_object) {
        for (d, es) in extra {
            let Some(list) = cat["dimensions"].get_mut(d.as_str()).and_then(Value::as_array_mut) else { continue };
            for e in es.as_array().into_iter().flatten() {
                let Some(id) = e.get("id").and_then(Value::as_str) else { continue };
                if e.get("name").and_then(Value::as_str).is_none() {
                    continue;
                }
                list.retain(|x| x["id"] != id);
                list.push(e.clone());
                added.push(format!("{d}={id}"));
            }
        }
    }
    let project = input.get("project").and_then(Value::as_str).unwrap_or("").trim().to_lowercase();
    let given = strs(input.get("tags"));
    let allow = strs(input.get("allow"));
    let redraw = input.get("redraw").and_then(Value::as_u64).unwrap_or(0);
    let lock = input.get("lock").and_then(Value::as_object).cloned().unwrap_or_default();
    let known: Vec<String> = ["product", "audience", "use"].iter().flat_map(|k| strs(cat["tags"].get(*k))).collect();
    // an agent writes tags in its own words ("grocery", "smallbusiness"): the catalog's synonyms map them to its tags
    let syn = cat["synonyms"].clone();
    let mut tags: Vec<String> = Vec::new();
    let mut unknown_tags: Vec<String> = Vec::new();
    for t in &given {
        let mut mapped: Vec<String> = if known.contains(t) { vec![t.clone()] } else { strs(syn.get(t.as_str())) };
        // an age in the tag ("adults-60plus", "55+", "over-65"): 55 and over reads as senior; a younger age maps to nothing
        if mapped.is_empty() {
            let age: Option<u32> = t.split(|c: char| !c.is_ascii_digit()).filter_map(|n| n.parse().ok()).find(|n| (10..=110).contains(n));
            if age.is_some_and(|a| a >= 55) { mapped.push("senior".into()) }
        }
        if mapped.is_empty() { unknown_tags.push(t.clone()) }
        for m in mapped { if !tags.contains(&m) { tags.push(m) } }
    }
    // the seed is who this is for, not only the name: two owners of a product called "Ladang" (another city, another
    // audience) draw apart, and one project draws the same every time. Words only, in order of appearance, lowercased.
    let words = |s: &str| s.to_lowercase().split(|c: char| !c.is_alphanumeric()).filter(|w| !w.is_empty()).collect::<Vec<_>>().join(" ");
    let context = words(input.get("context").and_then(Value::as_str).unwrap_or(""));
    let mut sorted_tags = given.clone();
    sorted_tags.sort();
    sorted_tags.dedup();
    let seed = fnv(&format!("{}#{}#{}#{redraw}", words(&project), sorted_tags.join(","), context));
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
        // layout follows the user's task: drawn only from patterns whose fit names a tag of this product
        let layout_fits = d == "layout" && all.iter().any(|e| strs(e.get("fit")).iter().any(|t| tags.contains(t)));
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
            let hit = fit.iter().any(|t| tags.contains(t));
            // layout follows the task, and paper only comes with a reason from the context (H2, 2026-11-25: cream on 5 of 5 pages)
            // paper comes with a paper-shaped model (a report) even when no tag fits it; the draw keeps the pair together
            // only when that model itself fits this product: no paper for food through a report nobody asked for
            let with_model = strs(e.get("with_model")).iter().any(|m| {
                cat["dimensions"]["model"].as_array().into_iter().flatten().any(|x| x["id"] == m.as_str() && strs(x.get("fit")).iter().any(|t| tags.contains(t)))
            });
            if (d == "layout" || e.get("only_fit").and_then(Value::as_bool) == Some(true)) && !hit && !with_model {
                continue;
            }
            // an accent leans on its fit lightly, so fitting hues do not become the new default
            let w = match (d, hit, fit.is_empty()) {
                ("accent", true, _) => 2.5,
                ("accent", false, _) => 1.5,
                // a fitting conceptual model leans lightly too: at 2.5 one fitting skeleton (a timeline for education) was in all
                // five draws and built on 4 of 5 pages (owner H8, 2026-11-25)
                ("model", true, _) => 1.8,
                // fit helps without taking over: at 4.0 the one fitting type (rounded) was 36% of first directions for food (H3)
                (_, true, _) => 2.5,
                (_, false, true) => 1.5,
                _ => 0.5,
            };
            // a weak tag lowers an entry without dropping it (indigo for fresh food read as fintech, owner H3 note, one page)
            let w = if strs(e.get("weak")).iter().any(|t| tags.contains(t)) { w * 0.4 } else { w };
            // a light weight: paper was in 40 of 40 tutoring draws at the fit weight
            let w = if with_model && !hit { 0.2 } else { w };
            pool.push((e, w));
        }
        // fewer than three fitting patterns: the rest is the agent's call from the task, so five users do not share one layout
        if d == "layout" && (!layout_fits || pool.len() < 3) {
            pool.push((json!({ "id": "from-task", "name": "Dari tugas pengguna", "note": "no layout pattern fits these tags: choose it from the user's main task" }), 1.0));
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
        // strict first; when the tags leave too few entries, the accent spacing and material rule give way, then repeats
        for attempt in 0..1200 {
            let level = attempt / 400;
            let mut dir: Vec<Value> = pools.iter().map(|p| pick(&mut rng, p)).collect();
            // a surface tied to a model (paper to a report) brings that model into its direction, unless the model is locked
            let need = strs(dir[0].get("with_model"));
            if !need.is_empty() && !strs(dir[0].get("fit")).iter().any(|t| tags.contains(t)) && !need.contains(&id(&dir[8])) && !lock.contains_key("model") {
                if let Some(m) = pools[8].iter().find(|p| need.contains(&id(&p.0))) {
                    dir[8] = m.0.clone();
                }
            }
            if dir.iter().any(Value::is_null) || combo_default(&dir) {
                continue;
            }
            let locked = |i: usize| lock.contains_key(DIMS[i]);
            let clash = chosen.iter().any(|o| {
                let n = DIMS.len();
                let same = (0..n).filter(|&i| id(&o[i]) == id(&dir[i])).count();
                let free_same = (0..n).filter(|&i| !locked(i) && id(&o[i]) == id(&dir[i])).count();
                let free = (0..n).filter(|&i| !locked(i)).count();
                // at least three free dimensions differ (or all of them when fewer are free), and never the same surface unless locked
                (free - free_same) < 3.min(free) || (!locked(0) && pools[0].len() >= 3 && id(&o[0]) == id(&dir[0])) || same == n
            });
            let once = |dim: usize, v: &str| id(&dir[dim]) == v && chosen.iter().any(|o| id(&o[dim]) == v);
            // surface, accent, type, and layout differ in every direction unless a reference locks them; an idea source twice at most
            // a dimension repeats only when its pool has fewer than three entries (a layout fitting few patterns)
            let repeats = level < 2 && [0, 1, 2, 3].iter().any(|&i| !locked(i) && (pools[i].len() >= 3 || (i == 3 && id(&dir[3]) != "from-task")) && chosen.iter().any(|o| id(&o[i]) == id(&dir[i])))
                || chosen.iter().filter(|o| id(&o[6]) == id(&dir[6])).count() >= 2;
            // accents at least 60° apart (sky, blue, and indigo are three ids and one colour), and three materials
            let near = level == 0 && !locked(1) && chosen.iter().any(|o| {
                let (a, b) = (o[1]["hue"].as_f64().unwrap_or(-999.0), dir[1]["hue"].as_f64().unwrap_or(999.0));
                let d = (a - b).abs() % 360.0;
                d.min(360.0 - d) < 60.0
            });
            let same_material = level == 0 && !locked(5) && pools[5].len() >= 3 && chosen.iter().any(|o| id(&o[5]) == id(&dir[5]))
                || level == 0 && !locked(7) && pools[7].len() >= 3 && chosen.iter().any(|o| id(&o[7]) == id(&dir[7]))
                // three conceptual models: three directions on one hero-and-card skeleton read as one idea (owner H6, 2026-11-25),
                // and the model is what shapes the page, so three models give three structures (H8, 2026-11-25)
                || level < 2 && !locked(8) && pools[8].len() >= 3 && chosen.iter().any(|o| id(&o[8]) == id(&dir[8]));
            // a light page, a flat treatment, and space as the carrier is the generic template (H3, 2026-11-25: the three light,
            // flat pages formed one group); a light flat direction carries its weight with colour, type, image, or shape
            let plain = level < 2 && !locked(0) && !locked(4) && id(&dir[0]).starts_with("light")
                && matches!(id(&dir[7]).as_str(), "flat" | "flat2" | "minimal") && id(&dir[4]) == "space";
            // a surface tied to a model (paper to a report) comes only with it, unless a tag of this product fits it: warm
            // paper was in 40 of 40 tutoring draws through the education tag, and built on 4 of 5 H10 pages (2026-11-26)
            let unpaired = {
                let s = &dir[0];
                let need = strs(s.get("with_model"));
                !need.is_empty() && !strs(s.get("fit")).iter().any(|t| tags.contains(t)) && !need.contains(&id(&dir[8]))
            };
            if (clash && level < 2) || repeats || near || same_material || plain || unpaired || once(5, "flat-vector") || once(6, "mechanic") {
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

    // the first direction is drawn with the freest choice, so it holds the strongest fits; a run that builds direction 1
    // without asking then builds the same fits for every product of a kind (H8: one timeline on 4 of 5 pages). The order is
    // shuffled from the seed, so direction 1 is any of the three, and one project still draws the same every time.
    for i in (1..chosen.len()).rev() {
        let j = (rng.next() % (i as u64 + 1)) as usize;
        chosen.swap(i, j);
    }
    let session = tags.iter().any(|t| t == "session" || t == "pro");
    let out: Vec<Value> = chosen.iter().enumerate().map(|(i, d)| {
        let mut m = serde_json::Map::new();
        m.insert("n".into(), json!(i + 1));
        m.insert("ramp".into(), ramp(&id(&d[2]), session, tags.iter().any(|t| t == "senior")));
        m.insert("colours".into(), colours(&id(&d[0]), &d[1]));
        // why this direction, and what it costs: the owner wants the choice explained, pros and cons (2026-11-25).
        // "why" names the product tags an entry fits; an entry drawn with no fit says so, so it is never dressed up.
        let mut why = Vec::new();
        let mut pros = Vec::new();
        let mut cons = Vec::new();
        for k in [0usize, 1, 2, 3, 8, 7, 5] {
            let e = &d[k];
            let name = e["name"].as_str().unwrap_or("");
            let hit: Vec<String> = strs(e.get("fit")).into_iter().filter(|t| tags.contains(t)).collect();
            if !hit.is_empty() {
                why.push(format!("{name}: cocok untuk {}", hit.join(", ")));
            }
            if let Some(p) = e["pro"].as_str() { pros.push(format!("{name}: {p}")) }
            if let Some(c) = e["con"].as_str() { cons.push(format!("{name}: {c}")) }
        }
        if why.is_empty() {
            why.push("tidak ada entri yang khusus cocok dengan tag ini; diundi dari yang tidak dilarang untuk produk ini".into());
        }
        m.insert("why".into(), json!(why));
        m.insert("pros".into(), json!(pros));
        m.insert("cons".into(), json!(cons));
        // one button spec per direction, from its treatment, so every call to action on the page shares one shape (RX-DS-02)
        let mut b = d[7]["buttons"].clone();
        if b.is_object() {
            b["height"] = json!(if session { 40 } else { 48 });
            b["store"] = json!("App Store and Google Play: both stores' own badge images, the same height, side by side; never one badge and one text button");
            m.insert("buttons".into(), b);
        }
        if id(&d[0]).starts_with("light") && matches!(id(&d[7]).as_str(), "flat" | "flat2" | "minimal") {
            m.insert("signature".into(), json!("a light, flat direction needs one large signature its carrier makes: a band of the accent across a section, a made image, or display type; small cards on a pale page are the generic template"));
        }
        for (k, v) in DIMS.iter().zip(d) {
            let mut e = v.clone();
            if let Some(o) = e.as_object_mut() {
                o.remove("fit");
                o.remove("avoid");
                o.remove("with_model");
            }
            m.insert((*k).into(), e);
        }
        Value::Object(m)
    }).collect();
    json!({
        "seed": format!("{seed:016x}"),
        "project": project,
        "context": context,
        "redraw": redraw,
        "tags": tags,
        "givenTags": given,
        "locked": lock,
        "unknownLocks": unknown_lock,
        "userEntries": added,
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
    fn the_same_name_for_other_people_draws_apart() {
        let base = json!({ "project": "Ladang", "tags": ["food", "commerce"] });
        let mut seen = std::collections::HashSet::new();
        for c in ["Bu Ratna, Medan, ibu rumah tangga", "Dimas, Yogyakarta, anak kos", "Sari dan Andre, Bandung, keluarga muda", "Pak Rahman, Makassar, warung makan", "Mbak Wulan, Surabaya, pekerja kantoran"] {
            let mut v = base.clone();
            v["context"] = json!(c);
            let r = draw(v);
            seen.insert(r["directions"].to_string());
        }
        assert_eq!(seen.len(), 5);
        // the same people, written another way, draw the same
        let a = draw(json!({ "project": "Ladang", "tags": ["commerce", "food"], "context": "Bu Ratna, Medan" }));
        let b = draw(json!({ "project": "ladang ", "tags": ["food", "commerce", "food"], "context": "bu ratna medan" }));
        assert_eq!(a["directions"], b["directions"]);
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
            let m = ids(&r, "material");
            assert!(m[0] != m[1] && m[1] != m[2] && m[0] != m[2], "{p}: materials {m:?}");
            let h: Vec<f64> = d.iter().map(|x| x["accent"]["hue"].as_f64().unwrap()).collect();
            for (a, b) in [(0, 1), (1, 2), (0, 2)] {
                let x = (h[a] - h[b]).abs() % 360.0;
                assert!(x.min(360.0 - x) >= 60.0, "{p}: accents {h:?}");
            }
            for i in 0..3 {
                for j in i + 1..3 {
                    let diff = DIMS.iter().filter(|k| d[i][**k]["id"] != d[j][**k]["id"]).count();
                    assert!(diff >= 3, "{p}: {i} and {j} differ in {diff}");
                }
            }
        }
    }

    #[test]
    fn three_directions_take_three_conceptual_models_and_strong_text_for_seniors_and_health() {
        // owner H6 2026-11-25: three pages on one hero-and-card skeleton; small grey helper text for seniors and health
        for p in ["Senyum", "a", "b", "c", "d", "e", "f", "g", "h", "i"] {
            for tags in [json!(["dental", "senior", "glance"]), json!(["laundry", "students", "glance"]), json!(["food", "family"])] {
                let r = draw(json!({ "project": p, "tags": tags }));
                let pg = ids(&r, "model");
                assert!(pg[0] != pg[1] && pg[1] != pg[2] && pg[0] != pg[2], "{p} {tags}: {pg:?}");
                assert!(!ids(&r, "surface").iter().any(|s| s.starts_with("dark")) || tags[0] == "laundry", "{p} {tags}");
                for d in r["directions"].as_array().unwrap() {
                    let c = &d["colours"];
                    let need = 7.0;
                    let got = ratio(c["muted"].as_str().unwrap(), c["section"].as_str().unwrap());
                    assert!(got >= need, "{p} {tags}: muted {got}");
                    if tags[1] == "senior" {
                        assert_eq!(d["ramp"]["body"], json!(18.0));
                    }
                }
            }
        }
    }

    #[test]
    fn tutoring_and_an_age_over_55_map_to_the_catalog() {
        // owner H7 2026-11-25: "tutoring" and "adults-40plus" were ignored; an age says senior only from 55
        let r = draw(json!({ "project": "Lesin", "tags": ["tutoring", "adults-60plus", "glance"] }));
        assert_eq!(r["tags"], json!(["education", "senior", "glance"]), "{r}");
        let r = draw(json!({ "project": "Lesin", "tags": ["tutoring", "adults-40plus"] }));
        assert_eq!(r["unknownTags"], json!(["adults-40plus"]));
    }

    #[test]
    fn a_family_or_baby_brief_never_draws_a_dark_surface() {
        // owner H5 notes 2026-11-25: navy for a family with a baby read technical and night, against clean and soft
        for p in ["Bilas", "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k"] {
            for tags in [json!(["home-service", "family"]), json!(["laundry", "bayi", "glance"]), json!(["health", "consumer"])] {
                let r = draw(json!({ "project": p, "tags": tags }));
                assert!(!ids(&r, "surface").iter().any(|s| s.starts_with("dark")), "{p} {tags}: {:?}", ids(&r, "surface"));
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
    fn every_ramp_passes_the_scale_check() {
        for ty in ["grotesk", "serif-display", "humanist"] {
            for session in [true, false] {
                let r = ramp(ty, session, false);
                let s: Vec<f64> = ["caption", "body", "heading", "title", "display"].iter().map(|k| r[*k].as_f64().unwrap()).collect();
                for w in s.windows(2) {
                    assert!(w[1] / w[0] >= 1.12, "{ty} {session}: {s:?}");
                }
                assert!(s[0] >= 12.0);
            }
        }
        assert_eq!(ramp("grotesk", true, false)["body"], json!(14.0));
        assert_eq!(ramp("grotesk", true, false)["heading"], json!(18.0));
    }

    #[test]
    fn layout_comes_only_from_patterns_that_fit_the_task() {
        for p in 0..30 {
            let r = draw(json!({ "project": format!("laundry{p}"), "tags": ["home-service", "umkm"] }));
            for l in ids(&r, "layout") {
                assert!(["list-first", "steps", "map-first", "tiles", "table-first", "calendar-first"].contains(&l.as_str()), "{l}");
            }
        }
        let r = draw(json!({ "project": "x", "tags": [] }));
        assert_eq!(ids(&r, "layout"), vec!["from-task"; 3]);
    }

    #[test]
    fn the_users_own_entry_replaces_or_joins_the_catalog() {
        let extra = json!({ "type": [{ "id": "brand", "name": "Huruf merek", "note": "the font the brand owns", "fonts": ["Acme Sans"] }] });
        let r = draw(json!({ "project": "Acme", "extra": extra, "lock": { "type": "brand" } }));
        assert_eq!(ids(&r, "type"), vec!["brand"; 3]);
        assert_eq!(r["userEntries"], json!(["type=brand"]));
        let bad = draw(json!({ "project": "Acme", "extra": { "type": [{ "id": "noname" }] } }));
        assert_eq!(bad["userEntries"], json!([]));
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
                let diff = ["accent", "carrier", "material", "idea", "treatment"].iter().filter(|k| d[i][**k]["id"] != d[j][**k]["id"]).count();
                assert!(diff >= 3, "{i} {j}");
            }
        }
        let bad = draw(json!({ "project": "Kasir", "lock": { "layout": "nope" } }));
        assert_eq!(bad["unknownLocks"], json!(["layout=nope"]));
    }

    #[test]
    fn an_agents_own_tags_map_to_the_catalog() {
        let r = draw(json!({ "project": "Ladang", "tags": ["grocery", "smallbusiness", "glance", "zzz"] }));
        assert_eq!(r["tags"], json!(["food", "commerce", "umkm", "glance"]));
        assert_eq!(r["unknownTags"], json!(["zzz"]));
    }

    #[test]
    fn paper_comes_only_with_a_reason_and_no_other_surface_is_cream() {
        for i in 0..200 {
            let r = draw(json!({ "project": format!("p{i}"), "tags": ["food", "family", "glance"] }));
            for d in r["directions"].as_array().unwrap() {
                assert_ne!(d["surface"]["id"], "warm-paper", "p{i}");
                for k in ["page", "section"] {
                    let h = d["colours"][k].as_str().unwrap();
                    let v: Vec<f64> = (0..3).map(|j| u8::from_str_radix(&h[1 + j * 2..3 + j * 2], 16).unwrap() as f64).collect();
                    assert!(!crate::probe::cream([v[0], v[1], v[2], 1.0]), "p{i} {k} {h}");
                }
            }
        }
        // paper for education comes with the report model, in the same direction
        let mut paper = 0;
        for i in 0..50 {
            let r = draw(json!({ "project": format!("b{i}"), "tags": ["education"] }));
            for d in r["directions"].as_array().unwrap() {
                if d["surface"]["id"] == "warm-paper" {
                    paper += 1;
                    assert_eq!(d["model"]["id"], "report", "b{i}");
                }
            }
        }
        assert!(paper > 0);
    }

    #[test]
    fn warm_is_not_only_cream_for_tutoring() {
        // owner 2026-11-26: warm need not be cream. Paper was in 40 of 40 tutoring draws; now at most a third, and warmth
        // also comes as a warm field (terracotta to turmeric) or a warm accent on a white page
        let n = 40;
        let (mut paper, mut warm_other) = (0, 0);
        for i in 0..n {
            let r = draw(json!({ "project": format!("Les{i}"), "context": format!("les privat {i}"), "tags": ["education", "family", "session"] }));
            let s = ids(&r, "surface");
            if s.contains(&"warm-paper".to_string()) { paper += 1 }
            for d in r["directions"].as_array().unwrap() {
                let hue = d["accent"]["hue"].as_f64().unwrap_or(-1.0);
                if d["surface"]["id"] == "warm-field" || d["surface"]["id"] == "dark-warm" || (d["surface"]["id"].as_str().unwrap().starts_with("light") && (0.0..=50.0).contains(&hue)) {
                    warm_other += 1;
                }
                for k in ["page", "section"] {
                    let h = d["colours"][k].as_str().unwrap();
                    let v: Vec<f64> = (0..3).map(|j| u8::from_str_radix(&h[1 + j * 2..3 + j * 2], 16).unwrap() as f64).collect();
                    assert!(d["surface"]["id"] == "warm-paper" || !crate::probe::cream([v[0], v[1], v[2], 1.0]), "{i} {k} {h}");
                }
            }
        }
        assert!(paper * 3 <= n, "paper in {paper} of {n} draws");
        assert!(warm_other * 4 >= n, "warm without cream in {warm_other} directions of {}", n * 3);
    }

    #[test]
    fn layout_spreads_when_few_patterns_fit() {
        let mut seen = std::collections::HashSet::new();
        for i in 0..40 {
            for l in ids(&draw(json!({ "project": format!("g{i}"), "tags": ["glance"] })), "layout") {
                seen.insert(l);
            }
        }
        assert!(seen.len() >= 2, "{seen:?}");
    }

    #[test]
    fn a_light_flat_direction_never_rests_on_space_and_names_its_signature() {
        for i in 0..200 {
            for d in draw(json!({ "project": format!("q{i}"), "tags": ["food", "family", "glance"] }))["directions"].as_array().unwrap() {
                let light_flat = d["surface"]["id"].as_str().unwrap().starts_with("light") && ["flat", "flat2", "minimal"].contains(&d["treatment"]["id"].as_str().unwrap());
                if light_flat {
                    assert_ne!(d["carrier"]["id"], "space", "q{i}");
                    assert!(d["signature"].is_string(), "q{i}");
                }
            }
        }
    }

    fn contrast(a: &str, b: &str) -> f64 {
        let lum = |h: &str| {
            let c: Vec<f64> = (0..3).map(|j| u8::from_str_radix(&h[1 + j * 2..3 + j * 2], 16).unwrap() as f64 / 255.0).collect();
            let l = |v: f64| if v <= 0.04045 { v / 12.92 } else { ((v + 0.055) / 1.055).powf(2.4) };
            0.2126 * l(c[0]) + 0.7152 * l(c[1]) + 0.0722 * l(c[2])
        };
        let (x, y) = (lum(a), lum(b));
        (x.max(y) + 0.05) / (x.min(y) + 0.05)
    }

    #[test]
    fn every_drawn_colour_pair_passes_contrast() {
        for i in 0..300 {
            let tags = [["food", "family", "glance"], ["finance", "umkm", "glance"], ["media", "youth", "session"]][i % 3];
            for d in draw(json!({ "project": format!("k{i}"), "tags": tags }))["directions"].as_array().unwrap() {
                let c = &d["colours"];
                let s = |k: &str| c[k].as_str().unwrap().to_string();
                for (fg, bg, min) in [("ink", "page", 7.0), ("muted", "page", 4.5), ("muted", "section", 4.5), ("onAccent", "accent", 4.5)] {
                    let r = contrast(&s(fg), &s(bg));
                    assert!(r >= min, "k{i} {} {fg} {} on {bg} {}: {r:.2}", d["surface"]["id"], s(fg), s(bg));
                }
                if c["field"].is_string() {
                    assert!(contrast(&s("onField"), &s("field")) >= 4.5, "k{i} field");
                }
            }
        }
    }

    #[test]
    fn each_direction_says_why_and_what_it_costs() {
        let r = draw(json!({ "project": "Bilas", "tags": ["laundry", "students", "glance"] }));
        for d in r["directions"].as_array().unwrap() {
            assert!(!d["why"].as_array().unwrap().is_empty());
            assert_eq!(d["pros"].as_array().unwrap().len(), 7);
            assert_eq!(d["cons"].as_array().unwrap().len(), 7);
        }
    }

    #[test]
    fn direction_one_is_not_always_the_strongest_fit() {
        // owner H8 2026-11-25: five tutoring briefs, one timeline built on 4 of 5 pages; direction 1 is now any of the three
        use std::collections::HashMap;
        let mut first: HashMap<String, usize> = HashMap::new();
        let mut seen: Vec<String> = Vec::new();
        let n = 40;
        for i in 0..n {
            let r = draw(json!({ "project": format!("Les{i}"), "context": format!("les privat {i}"), "tags": ["education", "family", "session"] }));
            let m = ids(&r, "model");
            assert!(m[0] != m[1] && m[1] != m[2] && m[0] != m[2], "{i}: {m:?}");
            *first.entry(m[0].clone()).or_default() += 1;
            for x in m { if !seen.contains(&x) { seen.push(x) } }
        }
        let top = first.values().max().copied().unwrap_or(0);
        assert!(top * 3 <= n, "one model leads direction 1 in {top} of {n}: {first:?}");
        assert!(seen.len() >= 6, "models seen: {seen:?}");
    }
}
