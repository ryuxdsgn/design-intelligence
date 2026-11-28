//! Source scan: the detectors behind `ryux scan` and `scan_sources`. Offsets, lines, and columns are
//! UTF-16 code units, as JavaScript counts them. Findings come back ordered by source, then
//! line and column; ordering files by name (`localeCompare`) is left to the JavaScript caller.

use crate::drift::{self, Direction};
use crate::js::{len16, num_str, round, slice16, trim};
use crate::jsre::{byte_at, js, JsRe};
use crate::markup::{self, Markup};
use serde_json::{json, Value};
use std::collections::{HashMap, HashSet};
use std::sync::{Mutex, OnceLock};

/// A compiled JavaScript regex, kept for the life of the process.
fn re(pattern: &str, flags: &str) -> &'static JsRe {
    static CACHE: OnceLock<Mutex<HashMap<String, &'static JsRe>>> = OnceLock::new();
    let key = format!("{flags}/{pattern}");
    let mut cache = CACHE.get_or_init(|| Mutex::new(HashMap::new())).lock().unwrap();
    if let Some(r) = cache.get(&key) {
        return r;
    }
    let r: &'static JsRe = Box::leak(Box::new(js(pattern, flags)));
    cache.insert(key, r);
    r
}

pub struct Source {
    pub path: String,
    pub ext: String,
    pub raw: String,
    /// The raw text with comments blanked (same UTF-16 length and line breaks).
    pub text: String,
    /// The file read as structure, for the markup detectors (crate::markup), once.
    markup: std::cell::OnceCell<Option<Markup>>,
    /// The file read as a module (what it defines and re-exports), once.
    module: std::cell::OnceCell<Option<markup::Module>>,
}

fn module_of(s: &Source) -> Option<&markup::Module> {
    s.module.get_or_init(|| if is(&s.ext, &[SCRIPT, &["jsx", "tsx", "mts", "cts"]]) { markup::module(&s.text, &s.ext) } else { None }).as_ref()
}

/// JSX, TSX, and HTML read as structure; None keeps a detector on its pattern over the text.
fn structure(s: &Source) -> Option<&Markup> {
    s.markup.get_or_init(|| markup::read(&s.raw, &s.ext)).as_ref()
}

#[derive(Default)]
pub struct Ctx<'a> {
    pub reduced_motion: Option<bool>,
    pub indonesian: Option<bool>,
    pub reduced_transparency: Option<bool>,
    pub growing_textarea: Option<bool>,
    pub design: Option<Direction>,
    /// What the user chose for controls written again: Some("extract" | "storybook" | "later"), None when undecided.
    components: Option<&'static str>,
    /// Every file the scan was given, scanned or context only, by its normalized path.
    files: HashMap<String, &'a Source>,
    /// The styled controls and Button fills across the folder (RX-DS-01), read once.
    copies: std::cell::OnceCell<Copies>,
}

/// Styled native controls by file, the groups written the same way in several files, and each Button
/// component's fill, across the folder.
#[derive(Default)]
struct Copies {
    /// Per file: (offset, tag, classes key, group size, files in the group, the other files).
    repeated: HashMap<String, Vec<(usize, String, usize, usize, Vec<String>)>>,
    /// Per file: its styled form controls (button, input, select, textarea), (offset, tag, classes).
    natives: HashMap<String, Vec<(usize, String, Vec<String>)>>,
    /// (component file, signature) for each form component a file defines.
    signatures: Vec<(String, crate::jsx::Signature)>,
}

/// A file directly in a component library folder (components/ui/button.tsx, primitives/x.tsx), or a test or story: where a control is the component
/// itself or an example of it, not a copy.
fn library_file(path: &str) -> bool {
    re(r"(?:^|/)(?:ui|primitives)/[^/]+$|\.(?:test|spec|stories)\.[jt]sx?$|(?:^|/)(?:__tests__|stories)/", "i").test(path)
}

/// The app or package a file belongs to in a monorepo (apps/web, packages/admin), else "".
fn package_of(path: &str) -> String {
    re(r"(?:^|/)((?:apps|packages)/[^/]+)/", "").exec(path).map(|m| m.g(1).to_string()).unwrap_or_default()
}

fn copies<'c>(c: &'c Ctx) -> &'c Copies {
    c.copies.get_or_init(|| {
        let mut out = Copies::default();
        let mut groups: HashMap<(String, String, String), Vec<(String, usize)>> = HashMap::new();
        let mut paths: Vec<&String> = c.files.keys().collect();
        paths.sort();
        for path in paths {
            let s = c.files[path];
            if !jsx(&s.ext) {
                continue;
            }
            for sig in crate::jsx::signatures(path, &s.raw) {
                out.signatures.push((path.clone(), sig));
            }
            if library_file(path) {
                continue;
            }
            for ctl in crate::jsx::styled_controls(&s.raw, &s.ext) {
                if matches!(ctl.tag.as_str(), "button" | "input" | "select" | "textarea") {
                    out.natives.entry(path.clone()).or_default().push((ctl.index, ctl.tag.clone(), ctl.classes.clone()));
                }
                groups.entry((package_of(path), ctl.tag.clone(), ctl.classes.join(" "))).or_default().push((path.clone(), ctl.index));
            }
        }
        for ((_, tag, _), at) in groups {
            let mut files: Vec<String> = at.iter().map(|(p, _)| p.clone()).collect();
            files.dedup();
            if at.len() < 3 || files.len() < 2 {
                continue;
            }
            for f in &files {
                // once per file, at its first copy
                let first = at.iter().filter(|(p, _)| p == f).map(|(_, i)| *i).min().unwrap();
                let others: Vec<String> = files.iter().filter(|o| *o != f).cloned().collect();
                out.repeated.entry(f.clone()).or_default().push((first, tag.clone(), at.len(), files.len(), others));
            }
        }
        out
    })
}

fn file_name(p: &str) -> &str {
    p.rsplit('/').next().unwrap_or(p)
}

/// The user's choice in DESIGN.md's Components field, by its first word: extract (one component in code),
/// storybook (a component with its stories), or later; anything else is undecided.
fn decision(value: &str) -> Option<&'static str> {
    let first = value.trim().trim_start_matches(['`', '*', '_']).split(|c: char| !c.is_ascii_alphabetic()).next()?.to_ascii_lowercase();
    match first.as_str() {
        "extract" => Some("extract"),
        "storybook" => Some("storybook"),
        "later" => Some("later"),
        _ => None,
    }
}

/// The same styled control written out again in several files instead of one component. What to do about it is
/// the user's call (a refactor, perhaps Storybook): until DESIGN.md records it, the finding asks for that choice;
/// "later" keeps the scan quiet (`ryux components` still lists the copies).
fn rule_ds01_copies(s: &Source, c: &Ctx) -> Vec<Hit> {
    let Some(list) = copies(c).repeated.get(&norm(&s.path)) else { return Vec::new() };
    if c.components == Some("later") {
        return Vec::new();
    }
    list.iter().map(|(at, tag, n, files, others)| {
        // a file name, or the path when another file in the list has the same name (two Dashboard.tsx)
        let here = norm(&s.path);
        let names: Vec<&str> = others.iter().map(|o| file_name(o)).chain([file_name(&here)]).collect();
        let shown: Vec<&str> = others.iter().take(3).map(|o| if names.iter().filter(|n| **n == file_name(o)).count() > 1 { o.as_str() } else { file_name(o) }).collect();
        let more = if others.len() > 3 { format!(" and {} more", others.len() - 3) } else { String::new() };
        let found = format!("this <{tag}> is written {n} times with the same classes in {files} files (also {}{more})", shown.join(", "));
        match c.components {
            Some("extract") => hit(*at, format!("{found}: make it one component and use it in each place, so a change to its look or states happens once (DESIGN.md: Components: extract). Build it from `ryux components --inventory` (every prop, variant, and missing state); save it with --json first and check the refactor with --verify")),
            Some("storybook") => hit(*at, format!("{found}: make it one component with a story for each state, and use it in each place (DESIGN.md: Components: storybook). Build it from `ryux components --inventory` (every prop, variant, and missing state); save it with --json first and check the refactor with --verify")),
            _ => hit(*at, format!("{found}. Before changing it, ask the user to choose, with the pros and cons of each: one component in code (one change reaches every place; the refactor touches these files), a component with Storybook (every state visible for review; Storybook to set up and keep), or later (nothing changes now; the copies keep growing). Record the answer with `ryux components --set extract|storybook|later`, or let the user run `ryux components`")),
        }
    }).collect()
}

/// The family a utility class belongs to, so px-4 → px-5 is one change of padding; None for a class outside the
/// families a variant changes. Width and margin are placement (a className from outside), not a variant.
fn family(c: &str) -> Option<String> {
    let b = crate::jsx::bare(c);
    let pre = &c[..c.len() - b.len()];
    if re(r"^text-(?:xs|sm|base|lg|xl|\d?xl)$", "").test(b) {
        return Some(format!("{pre}text-size"));
    }
    if b.starts_with("text-") {
        return Some(format!("{pre}text-colour"));
    }
    let m = re(r"^(px|py|pt|pb|pl|pr|p|h|bg|border|rounded|gap|font|shadow|ring|leading|tracking)(?:-|$)", "").exec(b)?;
    Some(format!("{pre}{}", m.g(1)))
}

/// What a change of one family does to a control: size, colour, shape, or weight.
fn variant_kind(fam: &str) -> &'static str {
    match crate::jsx::bare(fam) {
        "p" | "px" | "py" | "pt" | "pb" | "pl" | "pr" | "h" | "text-size" | "gap" | "leading" => "size",
        "bg" | "text-colour" | "border" | "ring" | "shadow" => "colour",
        "rounded" => "shape",
        _ => "weight",
    }
}

/// One palette step within the same hue (gray-600 → gray-700): drift to make one, not a variant to keep.
fn drift_change(a: &str, b: &str) -> bool {
    let hue = |c: &str| re(r"^(?:bg|text|border|ring)-([a-z]+)-(\d{2,3})", "").exec(crate::jsx::bare(c)).map(|m| m.g(1).to_string());
    matches!((hue(a), hue(b)), (Some(x), Some(y)) if x == y)
}

/// How two class sets differ when they are one control in two variants: at most two classes changed, each within one
/// family; the changes as "old → new", or None.
fn near(a: &[String], b: &[String]) -> Option<Vec<(String, String)>> {
    let only_a: Vec<&String> = a.iter().filter(|c| !b.contains(c)).collect();
    let only_b: Vec<&String> = b.iter().filter(|c| !a.contains(c)).collect();
    if only_a.is_empty() || only_a.len() > 2 || only_a.len() != only_b.len() {
        return None;
    }
    let mut out = Vec::new();
    for x in &only_a {
        let f = family(x)?;
        let y = only_b.iter().find(|y| family(y).as_deref() == Some(f.as_str()))?;
        out.push(((*x).clone(), (*y).clone()));
    }
    let mut fb: Vec<String> = only_b.iter().filter_map(|y| family(y)).collect();
    let mut fa: Vec<String> = only_a.iter().filter_map(|x| family(x)).collect();
    fa.sort();
    fb.sort();
    (fa == fb).then_some(out)
}

/// Every styled control the copies checks read, with where it is: (file, line, package, control).
fn styled_everywhere(sources: &[Source]) -> Vec<(String, usize, String, crate::jsx::Control)> {
    let mut out = Vec::new();
    let mut list: Vec<&Source> = sources.iter().filter(|s| jsx(&s.ext)).collect();
    list.sort_by(|a, b| a.path.cmp(&b.path));
    for s in list {
        let path = norm(&s.path);
        if library_file(&path) {
            continue;
        }
        for c in crate::jsx::styled_controls(&s.raw, &s.ext) {
            let line = line_col(&s.raw, c.index).0;
            out.push((path.clone(), line, package_of(&path), c));
        }
    }
    out
}

/// What a component made from copies has to carry (RX-DS-01), for `ryux components --inventory`: each group of a
/// control written again across files (the same classes, or one control in variants that change at most two classes
/// within one family), with every place it is written, its variants, the props its copies pass (how many copies, and
/// the values), what it holds, the states its classes style, the states missing, and the props each file passes on
/// those copies, which `verify` checks after the refactor.
pub fn inventory(sources: &[Source]) -> Value {
    let all = styled_everywhere(sources);
    // one key per (package, tag, classes)
    let mut keys: Vec<(String, String, Vec<String>)> = Vec::new();
    let mut members: Vec<Vec<usize>> = Vec::new();
    for (i, (_, _, pkg, c)) in all.iter().enumerate() {
        match keys.iter().position(|(p, t, cl)| p == pkg && *t == c.tag && *cl == c.classes) {
            Some(k) => members[k].push(i),
            None => {
                keys.push((pkg.clone(), c.tag.clone(), c.classes.clone()));
                members.push(vec![i]);
            }
        }
    }
    let mut parent: Vec<usize> = (0..keys.len()).collect();
    fn root(p: &mut Vec<usize>, mut k: usize) -> usize {
        while p[k] != k {
            k = p[k];
        }
        k
    }
    for a in 0..keys.len() {
        for b in a + 1..keys.len() {
            if keys[a].0 == keys[b].0 && keys[a].1 == keys[b].1 && near(&keys[a].2, &keys[b].2).is_some() {
                let (ra, rb) = (root(&mut parent, a), root(&mut parent, b));
                parent[ra] = rb;
            }
        }
    }
    let mut clusters: Vec<Vec<usize>> = Vec::new();
    let mut seen: HashMap<usize, usize> = HashMap::new();
    for k in 0..keys.len() {
        let r = root(&mut parent, k);
        let at = *seen.entry(r).or_insert_with(|| {
            clusters.push(Vec::new());
            clusters.len() - 1
        });
        clusters[at].push(k);
    }
    let mut groups = Vec::new();
    for mut ks in clusters {
        let uses: Vec<usize> = ks.iter().flat_map(|k| members[*k].clone()).collect();
        let mut files: Vec<String> = uses.iter().map(|i| all[*i].0.clone()).collect();
        files.sort();
        files.dedup();
        if uses.len() < 3 || files.len() < 2 {
            continue;
        }
        ks.sort_by_key(|k| std::cmp::Reverse(members[*k].len()));
        let base = ks[0];
        let tag = keys[base].1.clone();
        let place = |i: &usize| format!("{}:{}", all[*i].0, all[*i].1);
        let variants: Vec<Value> = ks[1..].iter().map(|k| {
            // against the base when one step from it, else against the member it was linked through
            let (from, changes) = std::iter::once(base).chain(ks.iter().copied().filter(|m| m != k && *m != base))
                .find_map(|m| near(&keys[m].2, &keys[*k].2).map(|c| (m, c)))
                .unwrap_or((base, Vec::new()));
            let kind = if changes.iter().all(|(a, b)| drift_change(a, b)) { "drift".to_string() } else {
                let mut kinds: Vec<&str> = changes.iter().filter_map(|(a, _)| family(a)).map(|f| variant_kind(&f)).collect();
                kinds.sort();
                kinds.dedup();
                kinds.join(", ")
            };
            json!({ "changes": changes.iter().map(|(a, b)| format!("{a} → {b}")).collect::<Vec<_>>(), "from": if from == base { Value::Null } else { json!(keys[from].2.join(" ")) }, "kind": kind, "count": members[*k].len(), "at": members[*k].iter().map(place).collect::<Vec<_>>() })
        }).collect();
        // props across the copies
        let mut names: Vec<String> = uses.iter().flat_map(|i| all[*i].3.attrs.iter().map(|(k, _)| k.clone())).collect();
        names.sort();
        names.dedup();
        let props: Vec<Value> = names.iter().map(|n| {
            let with: Vec<&String> = uses.iter().filter_map(|i| all[*i].3.attrs.iter().find(|(k, _)| k == n).map(|(_, v)| v)).collect();
            let mut values: Vec<String> = with.iter().filter(|v| v.starts_with('"')).map(|v| v.to_string()).collect();
            values.sort();
            values.dedup();
            json!({ "name": n, "copies": with.len(), "of": uses.len(), "values": values })
        }).collect();
        let mut content: Vec<&str> = uses.iter().map(|i| all[*i].3.content).collect();
        content.sort();
        content.dedup();
        let classes: Vec<&String> = ks.iter().flat_map(|k| keys[*k].2.iter()).collect();
        let styles = |state: &str| classes.iter().any(|c| c.split(':').rev().skip(1).any(|p| p == state));
        let states: Vec<&str> = ["hover", "focus", "focus-visible", "active", "disabled"].into_iter().filter(|s| styles(s)).collect();
        let mut missing = Vec::new();
        if !styles("focus") && !styles("focus-visible") {
            missing.push("focus-visible: no copy shows keyboard focus".to_string());
        }
        let disabled_used = uses.iter().any(|i| all[*i].3.attrs.iter().any(|(k, _)| k == "disabled"));
        if disabled_used && !styles("disabled") {
            missing.push("disabled: copies take disabled, and none styles it".to_string());
        }
        // the props each file passes on its copies, as that file writes them in all (what verify compares)
        let mut per_file = serde_json::Map::new();
        for f in &files {
            let Some(src) = sources.iter().find(|s| norm(&s.path) == *f) else { continue };
            let counts = crate::jsx::prop_counts(&src.raw, &src.ext);
            let mut on_copies: Vec<String> = uses.iter().filter(|i| all[**i].0 == *f).flat_map(|i| all[*i].3.attrs.iter().flat_map(|(k, v)| {
                let mut x = vec![k.clone()];
                if v.starts_with('"') {
                    x.push(format!("{k}={v}"));
                }
                x
            })).collect();
            on_copies.sort();
            on_copies.dedup();
            per_file.insert(f.clone(), Value::Object(on_copies.into_iter().map(|k| { let n = counts.get(&k).copied().unwrap_or(0); (k, json!(n)) }).collect()));
        }
        groups.push(json!({
            "app": keys[base].0, "tag": tag, "classes": keys[base].2.join(" "), "count": uses.len(), "files": files,
            "at": members[base].iter().map(place).collect::<Vec<_>>(), "variants": variants, "props": props,
            "content": content, "states": states, "missing": missing, "keys": ks.iter().map(|k| keys[*k].2.join(" ")).collect::<Vec<_>>(),
            "props_in_files": per_file,
        }));
    }
    groups.sort_by_key(|g| std::cmp::Reverse(g["count"].as_u64().unwrap_or(0)));
    json!({ "groups": groups })
}

/// After a refactor, against the inventory taken before it: the copies left (a control with the classes of a group
/// still written in 2+ files), and each prop a file passed on its copies that the file now writes fewer times
/// (type="password" gone from Signup.tsx), or a file that is gone.
pub fn verify(before: &Value, sources: &[Source]) -> Value {
    let all = styled_everywhere(sources);
    let mut out = Vec::new();
    let mut ok = true;
    for g in before["groups"].as_array().into_iter().flatten() {
        let tag = g["tag"].as_str().unwrap_or("");
        let app = g["app"].as_str().unwrap_or("");
        let keys: Vec<&str> = g["keys"].as_array().into_iter().flatten().filter_map(|k| k.as_str()).collect();
        let left: Vec<String> = all.iter().filter(|(_, _, pkg, c)| pkg == app && c.tag == tag && keys.contains(&c.classes.join(" ").as_str())).map(|(f, l, _, _)| format!("{f}:{l}")).collect();
        let left_files: HashSet<&str> = left.iter().map(|x| x.rsplit_once(':').map_or(x.as_str(), |p| p.0)).collect();
        let copies_left = if left_files.len() >= 2 { left.clone() } else { Vec::new() };
        let mut lost = Vec::new();
        for (file, props) in g["props_in_files"].as_object().into_iter().flatten() {
            let Some(src) = sources.iter().find(|s| norm(&s.path) == *file) else {
                lost.push(json!({ "file": file, "gone": true }));
                continue;
            };
            let now = crate::jsx::prop_counts(&src.raw, &src.ext);
            for (k, n) in props.as_object().into_iter().flatten() {
                let (was, is) = (n.as_u64().unwrap_or(0) as usize, now.get(k).copied().unwrap_or(0));
                if is < was {
                    lost.push(json!({ "file": file, "prop": k, "before": was, "after": is }));
                }
            }
        }
        if !copies_left.is_empty() || !lost.is_empty() {
            ok = false;
        }
        out.push(json!({ "tag": tag, "classes": g["classes"], "copies_left": copies_left, "lost": lost }));
    }
    json!({ "ok": ok, "groups": out })
}

/// A <button> that does nothing when pressed: no handler, no submit, nothing around it that acts (RX-QA-08).
fn rule_qa08_dead(s: &Source, _: &Ctx) -> Vec<Hit> {
    if library_file(&norm(&s.path)) {
        return Vec::new();
    }
    crate::jsx::dead_buttons(&s.raw, &s.ext).into_iter().map(|at| hit(at, "a <button> with no onClick, no type=\"submit\", and no form, link, or trigger around it: pressing it does nothing; give it its action, or, if it is not a control, make it text")).collect()
}

/// A native form control styled by hand with the class that marks the project's own component for it: a <button>
/// with Button's fill, an <input> with Input's border.
fn rule_ds01_bypass(s: &Source, c: &Ctx) -> Vec<Hit> {
    let cp = copies(c);
    let path = norm(&s.path);
    let Some(natives) = cp.natives.get(&path) else { return Vec::new() };
    let mine: Vec<&(String, crate::jsx::Signature)> = cp.signatures.iter().filter(|(f, _)| *f != path && package_of(f) == package_of(&path)).collect();
    natives.iter().filter_map(|(at, tag, classes)| {
        let button = tag == "button";
        let (comp, sig) = mine.iter().find(|(_, sig)| sig.tag == tag && (!button || classes.iter().any(|c| *c == sig.class)))?;
        let article = if tag == "input" { "an" } else { "a" };
        let (name, from) = (sig.component, file_name(comp));
        Some(hit(*at, if button {
            format!("a <button> styled by hand with the Button component's fill ({}): use Button from {from} so its states, sizes, and focus ring stay the same everywhere", sig.class)
        } else {
            format!("{article} <{tag}> styled by hand while the project has {name} ({from}): use {name}, with a className for what differs, so its border, focus ring, and error state stay the same everywhere")
        }))
    }).collect()
}

/// A path with forward slashes, and "." and ".." resolved where they can be.
pub fn norm(p: &str) -> String {
    let p = p.replace('\\', "/");
    let mut out: Vec<&str> = Vec::new();
    for seg in p.split('/') {
        match seg {
            "" | "." => {}
            ".." if out.last().is_some_and(|l| *l != "..") => {
                out.pop();
            }
            s => out.push(s),
        }
    }
    let joined = out.join("/");
    if p.starts_with('/') { format!("/{joined}") } else { joined }
}

fn dir_of(path: &str) -> String {
    let p = path.replace('\\', "/");
    p.rfind('/').map_or(String::new(), |i| p[..i].to_string())
}

fn join(dir: &str, rel: &str) -> String {
    norm(&if dir.is_empty() { rel.to_string() } else { format!("{dir}/{rel}") })
}

/// The file a page's `<script src>` names, when it is in the project: not another site, not the site root (which
/// the scan cannot place), not a data: URL.
fn local_script(dir: &str, src: &str) -> Option<String> {
    let src = src.trim();
    let src = src.split(['?', '#']).next().unwrap_or("");
    if src.is_empty() || src.starts_with('/') || src.starts_with('\\') || re(r"^[A-Za-z][\w+.-]*:", "").test(src) {
        return None;
    }
    Some(join(dir, src))
}

/// The files a relative import may name, in the order a bundler tries them.
fn candidates(dir: &str, spec: &str) -> Vec<String> {
    let base = join(dir, spec);
    let mut out = vec![base.clone()];
    out.extend(["tsx", "ts", "jsx", "js", "mjs"].iter().map(|e| format!("{base}.{e}")));
    out.extend(["tsx", "ts", "jsx", "js"].iter().map(|e| format!("{base}/index.{e}")));
    out
}

/// The files the scan would read to judge these sources fully: the scripts a page loads, the modules its loading
/// components come from, and, with `reexports` (for files read because another named them), what those modules
/// re-export. The caller reads the ones that exist and passes them as context; one it cannot read leaves the check
/// quiet.
pub fn references(sources: &[Source], reexports: bool) -> Vec<String> {
    let mut out: Vec<String> = Vec::new();
    for s in sources {
        let dir = dir_of(&s.path);
        if let Some(m) = structure(s) {
            out.extend(m.scripts.iter().filter_map(|src| local_script(&dir, src)));
            for (_, _, from) in &m.loaders_from {
                if from.starts_with('.') {
                    out.extend(candidates(&dir, from));
                }
            }
        }
        if let Some(m) = module_of(s).filter(|_| reexports) {
            for (from, _) in &m.reexports {
                if from.starts_with('.') {
                    out.extend(candidates(&dir, from));
                }
            }
        }
    }
    let mut seen = HashSet::new();
    out.retain(|p| seen.insert(p.clone()));
    out
}

/// The page's text with the text of every script it loads, or None when one of them is not in the scan (another
/// site, the site root, or a file the caller did not pass): then what the page does at run time is out of sight.
fn with_scripts(s: &Source, m: &Markup, ctx: &Ctx) -> Option<String> {
    let dir = dir_of(&s.path);
    let mut text = s.text.clone();
    for src in &m.scripts {
        let file = ctx.files.get(&local_script(&dir, src)?)?;
        text.push('\n');
        text.push_str(&file.text);
    }
    Some(text)
}

/// Whether the component `name` that `from_file` imports from `spec` announces a wait in its own markup, following
/// re-exports; None when the scan does not have the module that defines it.
fn announces(ctx: &Ctx, from_file: &str, spec: &str, name: &str, depth: usize) -> Option<bool> {
    if depth > 4 || !spec.starts_with('.') {
        return None;
    }
    let file = candidates(&dir_of(from_file), spec).into_iter().find_map(|c| ctx.files.get(&c).copied())?;
    let m = module_of(file)?;
    if let Some((_, a, b)) = m.defs.iter().find(|d| d.0 == name) {
        return Some(re(ANNOUNCED, "").test(&file.text[*a..*b]));
    }
    for (from, names) in &m.reexports {
        let there = match names {
            None if name != "default" => name.to_string(),
            None => continue,
            Some(list) => match list.iter().find(|(_, exported)| exported == name) {
                Some((imported, _)) => imported.clone(),
                None => continue,
            },
        };
        if let Some(found) = announces(ctx, &file.path, from, &there, depth + 1) {
            return Some(found);
        }
    }
    None
}

struct Hit {
    index: usize,
    message: String,
}

fn hit(index: usize, message: impl Into<String>) -> Hit {
    Hit { index, message: message.into() }
}

const MARKUP: &[&str] = &["html", "htm", "jsx", "tsx", "vue", "svelte", "astro"];
const STYLE: &[&str] = &["css", "scss", "sass", "less"];
const SCRIPT: &[&str] = &["js", "mjs", "cjs", "ts"];

fn is(ext: &str, sets: &[&[&str]]) -> bool {
    sets.iter().any(|s| s.contains(&ext))
}

const LOADER: &str = r"spin|load|skeleton|shimmer|progress|pulse|busy|pending";
const LAYOUT_PROPS: &str = r"^(?:width|height|top|left|right|bottom|margin(?:-\w+)?|padding(?:-\w+)?|max-height|max-width)$";
const GROWS: &str = r"field-sizing\s*:\s*content|fieldSizing|\bscrollHeight\b|[Aa]utosize|autoResize|auto-resize|\bminRows\b|\bmaxRows\b";
const INDONESIAN: &str = r#"\blang=["']id\b|\bid-ID\b|\blocale\s*[:=]\s*["'`]id\b|\bRp\.?\s?\d|\b(?:yang|untuk|tidak|silakan|pesanan|belum)\b"#;
const TEST_FILE: &str = r"(?:^|\/)(?:tests?|__tests__)\/|\.(?:test|spec)\.[cm]?[jt]sx?$";
const RUNTIME_LABEL: &str = r#"<[\w-]+(?![^>]*\baria-hidden\s*=\s*["']?true)[^>]*\s(?:id|data-bind|data-text|data-i18n|x-text|v-text)\s*=[^>]*>\s*<\/"#;
const SCRIM: &str = r#"^\s*<[\w.-]+(?=[\s/>])[^>]*\brole\s*=\s*["'{]?\s*["']?(?:alertdialog|dialog)\b"#;
const RUPIAH_FIX: &str = "write Rp1.250.000 (Rp right before the number, dots for thousands, no decimals)";

fn short(s: &str) -> String {
    let t = re(r"\s+", "g").replace(s, " ");
    let t = trim(&t);
    if len16(t) > 48 { format!("{}...", slice16(t, 0, Some(45))) } else { t.to_string() }
}

/// `Number.parseFloat` for the number forms the detectors capture.
fn parse_float(v: &str) -> f64 {
    let m = re(r"^[\s]*[+-]?(?:\d+\.?\d*(?:e[+-]?\d+)?|\.\d+(?:e[+-]?\d+)?)", "i").exec(v);
    m.map_or(f64::NAN, |h| trim(h.g(0)).parse::<f64>().unwrap_or(f64::NAN))
}

type Msg = fn(&crate::jsre::Hit) -> Option<String>;

fn matches(text: &str, patterns: &[(&str, &str, Msg)]) -> Vec<Hit> {
    let mut hits = Vec::new();
    for (p, flags, message) in patterns {
        let flags = if flags.contains('g') { flags.to_string() } else { format!("{flags}g") };
        for m in re(p, &flags).match_all(text) {
            if let Some(msg) = message(&m) {
                hits.push(hit(m.index, msg));
            }
        }
    }
    hits
}

/// UTF-16 units of `text`, for the scanners that walk it the way JavaScript indexes a string.
fn units(text: &str) -> Vec<u16> {
    text.encode_utf16().collect()
}

/// The end of the tag that opens at `start` (index of "<"), skipping ">" inside quotes and {...}.
fn tag_end(u: &[u16], start: usize) -> Option<usize> {
    let mut quote: u16 = 0;
    let mut depth: i64 = 0;
    for (i, &c) in u.iter().enumerate().skip(start + 1) {
        if quote != 0 {
            if c == quote {
                quote = 0;
            }
        } else if c == b'"' as u16 || c == b'\'' as u16 || c == b'`' as u16 {
            quote = c;
        } else if c == b'{' as u16 {
            depth += 1;
        } else if c == b'}' as u16 {
            depth = (depth - 1).max(0);
        } else if c == b'>' as u16 && depth == 0 {
            return Some(i);
        }
    }
    None
}

struct Tag {
    index: usize,
    length: usize,
    name: String,
    attrs: String,
}

fn tags(text: &str, names: &str) -> Vec<Tag> {
    let u = units(text);
    let mut out = Vec::new();
    for m in re(&format!(r"<({names})(?=[\s/>])"), "g").match_all(text) {
        let Some(end) = tag_end(&u, m.index) else { continue };
        out.push(Tag { index: m.index, length: end - m.index + 1, name: m.g(1).to_string(), attrs: String::from_utf16_lossy(&u[m.index + len16(m.g(0))..end]) });
    }
    out
}

fn rule_cd02(s: &Source, _: &Ctx) -> Vec<Hit> {
    matches(&s.text, &[
        (r"\bRp\.?[  ]*\d[\d.,]*", "", |m| {
            let v = re(r"[.,]$", "").replace(m.g(0), "");
            if re(r"^Rp\d{1,3}(?:(?:\.\d{3})*|,\d{1,2})$", "").test(&v) && !re(r",00$", "").test(m.g(0)) { None } else { Some(format!("\"{}\": {RUPIAH_FIX}", short(m.g(0)))) }
        }),
        (r"\bRp[  ]+(?:\{|\$\{)", "", |m| Some(format!("\"{}...\": Rupiah with a space before the value; {RUPIAH_FIX}", short(m.g(0))))),
        (r#"["'`]Rp\.?[  ]["'`]"#, "", |m| Some(format!("{}: a Rupiah prefix with a space; {RUPIAH_FIX}", short(m.g(0))))),
        (r"\bIDR[  ]?\d[\d.,]*", "", |m| Some(format!("\"{}\": {RUPIAH_FIX}", short(m.g(0))))),
    ])
}

fn rule_fe12(s: &Source, _: &Ctx) -> Vec<Hit> {
    matches(&s.text, &[(r#"currency\s*:\s*["'`]IDR["'`]"#, "", |_| Some("Intl currency style writes a space after Rp (and ,00 unless maximumFractionDigits is 0): format with id-ID grouping and prepend Rp".into()))])
}

fn rule_cd09(s: &Source, c: &Ctx) -> Vec<Hit> {
    if re(TEST_FILE, "").test(&s.path) || !c.indonesian.unwrap_or_else(|| re(INDONESIAN, "").test(&s.text)) {
        return Vec::new();
    }
    matches(&s.text, &[
        (r"(?<![\d/])\d{1,2}\/\d{1,2}\/\d{4}(?![\d/])", "", |m| Some(format!("\"{}\": in Indonesian copy write 2 Okt 2026 (other markets follow their locale)", m.g(0)))),
        (r"\b\d{1,2}[:.]\d{2}\s?(?:AM|PM|am|pm)\b", "", |m| Some(format!("\"{}\": in Indonesian copy write 14.30 in 24-hour form (other markets follow their locale)", m.g(0)))),
    ])
}

const VAGUE_LABEL: &str = r"(?:baca |lihat )?selengkapnya|klik di ?sini|learn more|read more|click here|submit";
fn vague_label(label: &str) -> String {
    format!("\"{label}\": a label that does not say where it leads or what it does; name the destination or the result (\"Lihat syarat promo\", \"Kirim laporan\")")
}

/// Each piece of copy, read from the parsed file when it parses (inline tags joined, an expression as one word), or
/// the text between ">" and "<" otherwise; with where it starts.
fn copy_pieces(s: &Source) -> Vec<(usize, String)> {
    if let Some(m) = structure(s) {
        return m.copy.clone();
    }
    re(r">([^<>{}]+)<", "gu").match_all(&without_code_blocks(&s.text)).iter().map(|m| (m.index, m.g(1).to_string())).collect()
}

/// A rule's phrase found in the copy: each piece that holds it, with the phrase as written.
fn in_copy(s: &Source, phrase: &str) -> Vec<(usize, String)> {
    let p = re(phrase, "iu");
    copy_pieces(s).into_iter().filter_map(|(at, text)| p.exec(&text).map(|m| (at, m.g(1).to_string()))).collect()
}

fn rule_cd12_label(s: &Source, _: &Ctx) -> Vec<Hit> {
    if let Some(m) = structure(s) {
        let vague = re(&format!("^({VAGUE_LABEL})$"), "i");
        return m.labels.iter().filter(|(_, l)| vague.test(l)).map(|(at, l)| hit(*at, vague_label(l))).collect();
    }
    matches(&s.text, &[(&format!(r">\s*({VAGUE_LABEL})\s*<\/(?:a|button|Link|NavLink|Button)\s*>"), "i", |m| Some(vague_label(m.g(1))))])
}

fn rule_cd12_heading(s: &Source, _: &Ctx) -> Vec<Hit> {
    matches(&s.text, &[(r"<h[1-6]\b[^>]*>\s*(selamat datang di|yuk|ayo|welcome to|introducing)(?![\p{L}\d])", "iu", |m| {
        Some(format!("\"{}\": the first two words of a heading are what a scanning eye reads; start with what the section is about", m.g(1)))
    })])
}

/// The longest sentence in a text node, in words (tokens with a letter or digit); a sentence ends at
/// . ! ? or … followed by a space or the end, so Rp1.250.000 and 14.30 stay inside one sentence.
fn longest_sentence(text: &str) -> (usize, String) {
    let mut best = (0, String::new());
    let chars: Vec<char> = text.chars().collect();
    let mut start = 0;
    for i in 0..=chars.len() {
        let end = i == chars.len() || (matches!(chars[i], '.' | '!' | '?' | '…') && chars.get(i + 1).map_or(true, |c| c.is_whitespace()));
        if !end {
            continue;
        }
        let sentence: String = chars[start..i].iter().collect();
        let words: Vec<&str> = sentence.split_whitespace().filter(|w| w.chars().any(|c| c.is_alphanumeric())).collect();
        if words.len() > best.0 {
            best = (words.len(), words.iter().take(6).cloned().collect::<Vec<_>>().join(" "));
        }
        start = (i + 1).min(chars.len());
    }
    best
}

/// The text with every `<script>` and `<style>` block blanked (same UTF-16 offsets), so code is not read as copy.
fn without_code_blocks(text: &str) -> String {
    let mut ranges = Vec::new();
    for m in re(r"<(script|style)\b[^>]*>[\s\S]*?<\/(?:script|style)\s*>", "gi").match_all(text) {
        ranges.push((m.index, m.index + len16(m.g(0))));
    }
    let mut out = String::with_capacity(text.len());
    let mut at = 0;
    for c in text.chars() {
        let inside = ranges.iter().any(|&(a, b)| at >= a && at < b);
        if inside && c != '\n' {
            out.push_str(&" ".repeat(c.len_utf16()));
        } else {
            out.push(c);
        }
        at += c.len_utf16();
    }
    out
}

fn rule_cd21_sentence(s: &Source, _: &Ctx) -> Vec<Hit> {
    copy_pieces(s).into_iter().filter_map(|(at, text)| {
        let (words, opening) = longest_sentence(&text);
        (words > 20).then(|| hit(at, format!("\"{opening} ...\": a sentence of {words} words; NN/g's ceiling is 15 to 20 words, so split it into one idea per sentence")))
    }).collect()
}

fn rule_cd18(s: &Source, _: &Ctx) -> Vec<Hit> {
    in_copy(s, r"(memungkinkan (?:anda|kamu)|kami memahami bahwa|perlu diketahui bahwa|allows you to|enables you to|we understand that)(?![\p{L}\d])").into_iter()
        .map(|(at, p)| hit(at, format!("\"{p}\": filler that adds words, not meaning; say what the user can do (\"Bayar dengan QRIS\", not \"memungkinkan Anda membayar dengan QRIS\")")))
        .collect()
}

fn rule_cd19(s: &Source, _: &Ctx) -> Vec<Hit> {
    in_copy(s, r"(?<![\p{L}\d#-])(terbaik|tercepat|termurah|nomor 1|#1|the best|fastest|cheapest|world[- ]class|best[- ]in[- ]class)(?![\p{L}\d])").into_iter()
        .map(|(at, p)| hit(at, format!("\"{p}\": a superlative needs a source from the brief; otherwise write the fact that would earn it")))
        .collect()
}

fn rule_as03_lorem(s: &Source, _: &Ctx) -> Vec<Hit> {
    matches(&s.text, &[(r"\blorem ipsum\b", "i", |_| Some("lorem ipsum: use realistic sample content from the brief, labeled as sample data".into()))])
}

fn rule_as03_placeholder(s: &Source, _: &Ctx) -> Vec<Hit> {
    let mut hits = matches(&s.text, &[
        (r"\b(?:John|Jane) Doe\b", "", |m| Some(format!("\"{}\": a placeholder person; use realistic sample data and label it, or the real name", m.g(0)))),
        (r"\[(?:REAL DATA|DATA|TBD|TODO|PLACEHOLDER)\]", "i", |m| Some(format!("\"{}\": a placeholder where sample data would do; keep a visible placeholder only for an asset that does not exist yet", m.g(0)))),
        (r"(?<![A-Za-z])X{4,}(?![A-Za-z])", "", |m| Some(format!("\"{}\": placeholder characters; use realistic sample data, labeled", m.g(0)))),
        // a stand-in asset set as text in the interface: the screen shows a word where a picture belongs
        (r"\[(?:QR(?: ?CODE)?|QRIS|IMAGE|IMG|FOTO|PHOTO|GAMBAR|ICON|IKON|MAP|PETA|AVATAR|CHART|VIDEO)\]", "i", |m| Some(format!("\"{}\": a stand-in asset set as text; use a sample asset (a sample QR or photo, labeled Sample where the user would act on it) or the icon set", m.g(0)))),
    ]);
    // A logo slot standing alone. One with the brand's name in plain text right after it (`[LOGO]</span> RideApp`)
    // is what RX-AS-11 allows while the file does not exist (owner review 2026-11-23, sheet 8: S2 false, S1 real).
    for m in re(r"\[(?:LOGO|YOUR LOGO|LOGO HERE)\]|\b(?:your logo|logo here|logo di ?sini)\b", "gi").match_all(&s.text) {
        let rest = s.text[m.end..].split('\n').next().unwrap_or("");
        if !re(r"^[^<]*(?:</[\w-]+>\s*)+[\p{L}\d]{2,}", "u").test(rest) {
            hits.push(hit(m.index, format!("\"{}\": a logo slot standing alone; use the brand's own file, or with none, the name in plain text in the brand's type beside the slot, listed as missing in the handoff (RX-AS-11)", m.g(0))));
        }
    }
    hits.sort_by_key(|h| h.index);
    hits
}

fn rule_as04(s: &Source, _: &Ctx) -> Vec<Hit> {
    let mut hits = matches(&s.text, &[
        (
            r"\bonly \d+ (?:left|remaining)\b|\b(?:offer|sale|deal|promo) ends (?:tonight|today|soon)\b|\bhurry\b|\blimited time only\b|\bdon'?t miss out\b|\bhanya tersisa \d+|\btinggal \d+ lagi\b|\bburuan\b|\b(?:promo|diskon|penawaran) berakhir (?:malam ini|hari ini|segera)\b|\bjangan sampai kehabisan\b|\bstok terbatas\b",
            "i",
            |m| Some(format!("\"{}\": urgency copy; keep it only when the deadline or quota is real, stated as a plain fact", m.g(0))),
        ),
        // a low stock count set in the page: "stok 3", "tinggal 2 pcs", "3 left in stock" (not "tinggal 2 langkah")
        (
            r"\b(?:stok|stock)\s*(?:tinggal|tersisa|sisa|hanya|cuma|left|:)?\s*\d{1,2}\b(?!\s*(?:%|jam|hari|menit|days?|hours?|minutes?))|(?<!hanya )\b(?:tinggal|sisa|tersisa|cuma|hanya)\s*\d{1,2}\s*(?:pcs|item|unit|buah|porsi|kursi|tiket|slot|kamar|stok)\b|(?<!only )\b\d{1,2}\s*(?:left in stock|items? left|seats? left|tickets? left|rooms? left|in stock)\b",
            "i",
            |m| Some(format!("\"{}\": a low stock count set in the page; show stock only from real data, as a plain fact", m.g(0))),
        ),
        // other shoppers as pressure: "12 orang sedang melihat", "sold 30 times in the last hour"
        (
            r"\b\d+\s*(?:orang|people|others?|pembeli|shoppers?)\s*(?:lain\s*)?(?:sedang|are|is)?\s*(?:melihat|viewing|looking at|lihat)\b|\b(?:terjual|sold|dibeli)\s*\d+\s*(?:kali|times)?\s*(?:dalam|in the (?:last|past))\s*\d+\s*(?:jam|hours?|menit|minutes?)",
            "i",
            |m| Some(format!("\"{}\": other shoppers used as pressure; show it only from live data", m.g(0))),
        ),
    ]);
    // A promotion counting down: "Flash sale berakhir dalam", "Sale ends in". Not in a file that labels its data as
    // sample ("Sample data"): a countdown the brief asked for, with its end time marked as a stand-in (owner review
    // 2026-11-23, sheet 8: U3, U4 false).
    if !re(SAMPLE_LABEL, "i").test(&s.text) {
        hits.extend(matches(&s.text, &[(
            r#"(?:promo|flash\s*sale|diskon|sale|deal|offer|penawaran)[^\n<"'`]{0,40}(?:berakhir|habis|ends?)\s*(?:dalam|in)\b"#,
            "i",
            |m| Some(format!("\"{}\": a promotion counting down; keep it only when the end time is real (from the brief or data), stated as a plain fact, or label it as sample", m.g(0))),
        )]));
    }
    hits.sort_by_key(|h| h.index);
    hits
}

/// An element labelled as sample data ("Sample", "Sample data", "Contoh", "Data contoh", or a label that goes on to say
/// what to replace: "⚠ Data contoh — ganti dengan angka asli", "Testimoni contoh: ganti…"): the page says its numbers,
/// people, and deadlines are stand-ins (owner review 2026-11-23, sheet 8). A label only in a comment does not count:
/// the visitor never sees it.
const SAMPLE_LABEL: &str = r">[\s⚠*•·(\[]*(?:sample(?: data)?|example data|data contoh|(?:testimoni|ulasan|angka|nama|foto) contoh|contoh(?: data)?)(?:\s*<|\s*[—–:(-]\s*(?:ganti|replace|bukan|not\b|belum))";

/// A stand-in the page leaves for proof it does not have: a bracketed slot ("[Kutipan asli alumni]", "[Nama]"), a
/// placeholder class, a slot a script fills from empty data, or a logo slot set as text.
const STAND_IN: &str = r#"\[[^\]<\n]{2,80}\]|\b(?:class|className)\s*=\s*["'][^"']*\b(?:ph|placeholder|logo-slot|skeleton)\b|\bdata-fill\b|>\s*(?:customer logo|logo(?: pelanggan| klien| mitra)?|nama pelanggan)\s*<"#;

/// Up to `n` bytes of `text` from byte `at`, cut on a character boundary.
fn after(text: &str, at: usize, n: usize) -> &str {
    let mut end = (at + n).min(text.len());
    while !text.is_char_boundary(end) {
        end -= 1;
    }
    &text[at..end]
}

/// Up to `n` bytes of `text` before byte `at`, cut on a character boundary.
fn before(text: &str, at: usize, n: usize) -> &str {
    let mut start = at.saturating_sub(n);
    while !text.is_char_boundary(start) {
        start += 1;
    }
    &text[start..at]
}

/// A section whose quotes or logos are all stand-ins: the page asks for real proof instead of inventing it (corpus
/// 2026-11-27: 5 of 8 no-skill pages asked for testimonials answered with bracketed slots), so there is nothing to flag.
fn only_stand_ins(section: &str) -> bool {
    re(STAND_IN, "i").test(section) && !re(REAL_QUOTE, "u").test(section)
}

/// A quote set as text that is not a bracketed stand-in: “Dulu saya harus tutup toko…”.
const REAL_QUOTE: &str = r#">\s*[“"«‘]\s*[^\[\s<"”»’][^<"”»\[]{25,}"#;

/// Up to three quotes and how many more, for a finding that names what it found once per file.
fn quoted(found: &[String]) -> String {
    let head: Vec<String> = found.iter().take(3).map(|q| format!("\"{}\"", short(q))).collect();
    match found.len() {
        n if n > 3 => format!("{}, and {} more", head.join(", "), n - 3),
        _ => head.join(", "),
    }
}

/// RX-AS-01 as a "needs evidence" flag: a count of users or customers, a star rating, or a growth or percentage claim
/// set in the page. The scan cannot know whether the brief gave the number, so it only asks for the source; once per
/// file, at the first one. Not in a test file or a file that labels its data as sample.
fn rule_as01(s: &Source, _: &Ctx) -> Vec<Hit> {
    if re(TEST_FILE, "").test(&s.path) || re(SAMPLE_LABEL, "i").test(&s.text) {
        return Vec::new();
    }
    let nouns = r"pengguna|pelanggan|pengusaha|pemilik (?:warung|toko|usaha|bisnis)|pelaku (?:usaha|UMKM)|warung|toko|UMKM|mitra|merchant|pasien|siswa|murid|alumni|peserta|member|anggota|investor|keluarga|perusahaan|bisnis|klinik|sekolah|kantor|restoran|kafe|unduhan|ulasan|users?|customers?|teams?|companies|businesses|clinics?|schools?|restaurants?|downloads?|installs?|merchants?|clients?|freelancers?|designers?|writers?|creators?|sellers?|penjual|kreator|developers?|engineers?|managers?|members?|students?|learners?|patients?|sleepers?|subscribers?|reviews?|ratings?|people|orang";
    let count = format!(r"(?<![\w.,])(\d{{1,3}}(?:[.,]\d{{3}})+|\d+(?:[.,]\d+)?)\s?(rb|ribu|jt|juta|k|K|M|million|thousand)?(\+)?(?:\s|<[^>]{{0,60}}>)+(?:(?:active|happy|satisfied|paying|daily|monthly|verified|loyal|registered)\s+)?(?:{nouns})(?![\p{{L}}\d])");
    let mut found: Vec<(usize, String)> = Vec::new();
    // owner review 2026-11-27, sheet 13: numbers in a control (a "Rating 4.5+" filter chip) and a simulation's speed
    // ("runs 12× faster than real time") are not claims
    let in_control = |at: usize| {
        let open = s.text[..at].rfind('<').map_or("", |i| &s.text[i..at]);
        !open.starts_with("</") && re(r#"^<(?:button|option|select|label)\b|\b(?:chip|filter|toggle|segment)|aria-pressed|role\s*=\s*["']?(?:checkbox|radio|switch|option|tab)"#, "i").test(open)
    };
    let keep = |m: &crate::jsre::Hit| !in_control(m.start) && !re(r"simulat|simulasi|real time|waktu nyata|playback|kecepatan|speed\b|\bclock\b", "i").test(&format!("{} {}", before(&s.text, m.start, 80), after(&s.text, m.end, 80)));
    for m in re(&count, "giu").match_all(&s.text).iter().filter(|m| keep(m)) {
        let digits = re(r"[.,]", "g").replace(m.g(1), "");
        // a year beside a name ("© 2026 Klinik Gigi") is not a count
        if !m.has(2) && !m.has(3) && re(r"^(?:19|20)\d\d$", "").test(m.g(1)) {
            continue;
        }
        let big = m.has(2) || m.has(3) || (!m.g(1).contains(['.', ',']) || re(r"^\d{1,3}(?:[.,]\d{3})+$", "").test(m.g(1))) && digits.parse::<u64>().map_or(false, |v| v >= 100);
        if big {
            // the quote as the reader sees it, without the markup between the number and the noun
            found.push((m.index, re(r"\s+", "g").replace(&re(r"<[^>]*>", "g").replace(m.g(0), " "), " ")));
        }
    }
    for p in [
        // a star rating: "4,9/5", "★ 4.8", "4.8 stars", "rating 4,9"
        r"(?<![\d.,])[1-5][.,]\d\s*(?:\/\s*5(?![\d.,])|dari 5\b|★|⭐|bintang\b|stars?\b|rating\b)|[★⭐]\s*[1-5][.,]\d(?![\d])|\b(?:rating|nilai)\s*:?\s*[1-5][.,]\d(?![\d])",
        // a growth or comparison in percent or times: "+38%", "naik 30%", "up to 2x faster", "98% pelanggan puas"
        r"(?<![\w)\]])[+↑]\s?\d+(?:[.,]\d+)?\s?%|\b(?:naik|meningkat|tumbuh|lebih|increase[sd]?|grow(?:s|th)?|boost(?:s|ed)?|up)\s+(?:hingga\s+|sampai\s+|to\s+|by\s+)?\d+(?:[.,]\d+)?\s?%(?!\s*(?:off|diskon|discount|potongan|cashback|lebih murah))|(?<![\w.,])\d+(?:[.,]\d+)?\s?%\s+(?:lebih (?:cepat|banyak|hemat|tinggi)|faster|more|fewer|less time|growth|increase|pertumbuhan|kenaikan)\b|(?<![\w.,])\d+(?:[.,]\d+)?\s?[x×]\s+(?:lebih|faster|more|quicker|better)\b|(?<![\w.,])\d{2,3}(?:[.,]\d+)?\s?%\s+(?:pengguna|pelanggan|pasien|alumni|peserta|users|customers|teams|patients|students)\b",
    ] {
        for m in re(p, "giu").match_all(&s.text).iter().filter(|m| keep(m)) {
            // a bare star beside a name ("Marco · ★ 4.9", "★ 4.9 · 1,240 orders") is the product's own data about a
            // driver or shopper; a rating is a claim when it says so ("Rating 4,9", "4,8/5") or sits by its reviews
            let bare = !re(r"\/\s*5|dari 5|rating|nilai|stars?|bintang", "i").test(m.g(0)) && re(r"^[★⭐\d]", "").test(m.g(0)) && !m.g(0).contains('%') && !re(r"[x×]\s", "").test(m.g(0));
            if bare && !re(r"ulasan|reviews?|rating|penilaian|app store|play store|google play|trustpilot|capterra|\bg2\b|pengguna|pelanggan|customers|users", "i").test(&format!("{} {}", before(&s.text, m.start, 160), after(&s.text, m.end, 160))) {
                continue;
            }
            found.push((m.index, m.g(0).to_string()));
        }
    }
    // a counter a script counts up to: data-target="85000" data-suffix="+", the number set where the reader sees 0
    for m in re(r#"\bdata-(?:target|count|countup|end)\s*=\s*["'{]?\s*(\d[\d.,]*)["'}]?([^>]{0,160})"#, "gi").match_all(&s.text) {
        let suffix = re(r#"\bdata-suffix\s*=\s*["']\s*([^"']{1,4})["']"#, "i").exec(m.g(2)).map(|x| x.g(1).trim().to_string()).unwrap_or_default();
        let value = re(r"[.,]", "g").replace(m.g(1), "").parse::<u64>().unwrap_or(0);
        if value >= 100 || ["+", "%", "/5", "★"].contains(&suffix.as_str()) {
            found.push((m.index, format!("a counter to {}{}", m.g(1), suffix)));
        }
    }
    found.sort_by_key(|f| f.0);
    found.dedup_by_key(|f| f.0);
    let Some(first) = found.first() else { return Vec::new() };
    let mut quotes: Vec<String> = Vec::new();
    for f in &found {
        if !quotes.contains(&f.1) {
            quotes.push(f.1.clone());
        }
    }
    vec![hit(first.0, format!("{}: {} with no source the scan can see (a count of users, a rating, a growth claim); keep a number only when the brief or real data gives it, otherwise leave it out or label it as sample", quoted(&quotes), if quotes.len() == 1 { "a number" } else { "numbers" }))]
}

/// RX-AS-02 as a "needs evidence" flag: a testimonial or review section, a row of customers ("Dipercaya oleh"), or a
/// face from a generator. Once per file for each; not in a test file or a file that labels its data as sample.
fn rule_as02(s: &Source, _: &Ctx) -> Vec<Hit> {
    if re(TEST_FILE, "").test(&s.path) || re(SAMPLE_LABEL, "i").test(&s.text) {
        return Vec::new();
    }
    let mut hits = Vec::new();
    let said = r#">\s*(testimoni(?:al)?s?|apa kata (?:mereka|pelanggan|pengguna|alumni|pasien|peserta|mitra|klien)|kata (?:mereka|pelanggan|pengguna|alumni|pasien)|cerita (?:pelanggan|pengguna|alumni|mereka|pasien)|ulasan (?:pelanggan|pengguna|pasien)|what (?:our )?(?:customers|users|clients|people|teams|members|students|patients) (?:say|are saying|think)|loved by\b[^<]{0,40}|hear from\b[^<]{0,30})"#;
    let marked = r#"\b(?:class|className|id)\s*=\s*["'{`][^"'`}]*?\b(testimonials?|testimoni|quote-card|customer-reviews?|user-reviews?|ulasan)\b"#;
    // a quote signed with a person: a <blockquote> with a <figcaption>, a <cite>, or an author line right after it
    let signed = r#"<blockquote\b[^>]*>(?:\s|<[^>]*>|["“”'‘’«»])*([^<]{1,60})[\s\S]{0,800}?<\/blockquote>[\s\S]{0,300}?(?:<figcaption|<cite|\bclass(?:Name)?\s*=\s*["'{`][^"'`}]*?\b(?:who|author|name|sign|cite|person|byline|attribution)\b)"#;
    // every heading, class, and signed quote in order, so a nav link to "Testimoni" does not stand for the section
    let mut sections: Vec<_> = [re(said, "giu"), re(marked, "gi"), re(signed, "giu")].iter().flat_map(|r| r.match_all(&s.text)).collect();
    sections.sort_by_key(|m| m.start);
    // the first with a real quote after it; with no quote anywhere (a script renders them), the first, unless the page
    // left stand-ins for them
    let quote = |m: &&crate::jsre::Hit| !m.g(1).trim_start().starts_with('[') && (re(r"^\s*[^\[\s]", "").test(m.g(1)) && m.g(0).starts_with("<blockquote") || re(REAL_QUOTE, "u").test(after(&s.text, m.end, 2400)));
    let flagged = sections.iter().find(quote).or_else(|| sections.first().filter(|_| !sections.iter().any(|m| m.g(1).trim_start().starts_with('[') || only_stand_ins(after(&s.text, m.end, 2400)))));
    if let Some(m) = flagged {
        hits.push(hit(m.index, format!("\"{}\": a testimonial section; show only real quotes from real, consenting people, with their source, otherwise leave it out or label it as sample", short(m.g(1)))));
    }
    if let Some(m) = re(r#">\s*(dipercaya (?:oleh|lebih dari)[^<]{0,40}|trusted by\b[^<]{0,40}|used by\b[^<]{0,40}|digunakan oleh[^<]{0,40})"#, "iu").exec(&s.text).filter(|m| !only_stand_ins(after(&s.text, m.end, 900))) {
        hits.push(hit(m.index, format!("\"{}\": a row of customers; name only customers the brief gives, with their own logos, otherwise leave it out", short(m.g(1)))));
    }
    if let Some(m) = re(r"\b(?:i\.)?pravatar\.cc|randomuser\.me\/api\/portraits|thispersondoesnotexist\.com|generated\.photos|xsgames\.co\/randomusers|avatars\.dicebear\.com|api\.dicebear\.com", "i").exec(&s.text) {
        hits.push(hit(m.index, format!("\"{}\": a face from a generator stands in for a real person; use a real, consenting person's photo, or none", m.g(0))));
    }
    hits
}

fn rule_a11y02_zoom(s: &Source, _: &Ctx) -> Vec<Hit> {
    matches(&s.text, &[(r#"user-scalable\s*=\s*["']?(?:no|0)\b|maximum-scale\s*=\s*["']?1(?:\.0+)?(?![\d.])|userScalable\s*:\s*false|maximumScale\s*:\s*1(?![\d.])"#, "i", |m| {
        Some(format!("\"{}\": people must be able to zoom; remove it", m.g(0)))
    })])
}

fn rule_a11y02_small(s: &Source, _: &Ctx) -> Vec<Hit> {
    matches(&s.text, &[(r#"font-size\s*:\s*(\d+(?:\.\d+)?)px|\btext-\[(\d+(?:\.\d+)?)px\]|fontSize\s*:\s*["'`]?(\d+(?:\.\d+)?)(?:px)?["'`]?(?=\s*[,}])"#, "", |m| {
        let raw = if m.has(1) { m.g(1) } else if m.has(2) { m.g(2) } else { m.g(3) };
        let v = parse_float(raw);
        if v > 0.0 && v < 12.0 { Some(format!("{}px text: body text is 14 to 16px on mobile; below 12px is hard to read", num_str(v))) } else { None }
    })])
}

fn rule_a11y03_tabindex(s: &Source, _: &Ctx) -> Vec<Hit> {
    let message = |v: &str| format!("tabindex {v}: keep focus order the same as the visual order; use 0 or the DOM order");
    if let Some(m) = structure(s) {
        return m.tabindex.iter().map(|(i, v)| hit(*i, message(v))).collect();
    }
    matches(&s.text, &[(r#"\btab[iI]ndex\s*=\s*(?:["']|\{\s*)?([1-9]\d*)"#, "", |m| {
        Some(format!("tabindex {}: keep focus order the same as the visual order; use 0 or the DOM order", m.g(1)))
    })])
}

fn rule_a11y03_outline(s: &Source, _: &Ctx) -> Vec<Hit> {
    let removed = re(r#"outline\s*:\s*["']?(?:none|0)\b|\boutline-none\b"#, "");
    let replaced = re(r"focus-visible|focus:(?:ring|border|shadow|bg|underline|outline-(?!none))", "");
    let message = "focus outline removed on a control with no focus-visible style: show a visible focus indicator";
    let text = &s.text;
    if STYLE.contains(&s.ext.as_str()) {
        if replaced.test(text) {
            return Vec::new();
        }
        let mut hits = Vec::new();
        let target = re(r"(?:^|[\s,>+~])(?:button|a|input|select|textarea|summary)\b|:focus(?!-visible|-within)|\[role|\.btn|\*", "");
        for m in re(r"([^{}]+)\{([^}]*)\}", "g").match_all(text) {
            if let Some(r) = removed.exec(m.g(2)) {
                if target.test(m.g(1)) {
                    hits.push(hit(m.index + len16(m.g(1)) + 1 + r.index, message));
                }
            }
        }
        return hits;
    }
    let tabout = re(r#"\btab[iI]ndex\s*=\s*(?:["']|\{\s*)?-1"#, "");
    let plain = re(r"^(?:div|span|li)$", "");
    let acts = re(r#"\brole\s*=\s*["']?(?:button|link|tab|menuitem|option|checkbox|switch)|(?:^|\s)(?:onClick|onclick|@click|on:click)\s*="#, "");
    tags(text, "button|a|input|select|textarea|summary|div|span|li")
        .into_iter()
        .filter(|t| {
            if !removed.test(&t.attrs) || replaced.test(&t.attrs) || tabout.test(&t.attrs) {
                return false;
            }
            !plain.test(&t.name) || acts.test(&t.attrs)
        })
        .map(|t| hit(t.index, message))
        .collect()
}

fn rule_a11y04_img(s: &Source, _: &Ctx) -> Vec<Hit> {
    const MESSAGE: &str = "an <img> with no alt: describe meaningful images, use alt=\"\" for decorative ones";
    if let Some(m) = structure(s) {
        return m.img.iter().map(|&i| hit(i, MESSAGE)).collect();
    }
    tags(&s.text, "img")
        .into_iter()
        .filter(|t| !re(r"\balt\s*=", "").test(&t.attrs) && !re(r"\{\s*\.\.\.", "").test(&t.attrs))
        .map(|t| hit(t.index, MESSAGE))
        .collect()
}

fn rule_a11y04_click(s: &Source, _: &Ctx) -> Vec<Hit> {
    let message = |tag: &str| format!("a clickable <{tag}>: use a <button> or <a> so it works from the keyboard and has a role");
    if let Some(m) = structure(s) {
        return m.click.iter().map(|(i, tag)| hit(*i, message(tag))).collect();
    }
    tags(&s.text, "div|span")
        .into_iter()
        .filter(|t| {
            re(r"(?:^|\s)(?:onClick|onclick|@click|v-on:click|on:click)\s*=", "").test(&t.attrs) && !re(r"\brole\s*=", "").test(&t.attrs) && !re(SCRIM, "").test(&s.text[byte_at(&s.text, t.index + t.length)..])
        })
        .map(|t| hit(t.index, message(&t.name)))
        .collect()
}

/// `text.indexOf(needle, from)` in UTF-16 units.
fn index_of(u: &[u16], needle: &str, from: usize) -> Option<usize> {
    let n: Vec<u16> = needle.encode_utf16().collect();
    if from > u.len() {
        return None;
    }
    (from..=u.len().saturating_sub(n.len())).find(|&i| u[i..].starts_with(&n))
}

fn rule_a11y04_icon(s: &Source, _: &Ctx) -> Vec<Hit> {
    const MESSAGE: &str = "an icon-only <button> with no name: add aria-label or visually hidden text";
    if let Some(m) = structure(s) {
        return m.icon.iter().map(|&i| hit(i, MESSAGE)).collect();
    }
    let u = units(&s.text);
    let mut out = Vec::new();
    for t in tags(&s.text, "button") {
        if re(r"\baria-label(?:ledby)?\s*=|\btitle\s*=|\{\s*\.\.\.", "").test(&t.attrs) {
            continue;
        }
        let Some(close) = index_of(&u, "</button>", t.index + t.length) else { continue };
        let inner = String::from_utf16_lossy(&u[t.index + t.length..close]);
        let icon = re(r"<svg\b|<i\b|<[A-Z]\w*", "").test(&inner);
        let named = re(r#"\balt\s*=\s*["'][^"']+["']|\baria-label\s*="#, "").test(&inner) || re(RUNTIME_LABEL, "").test(&inner);
        let words = re(r"<[^>]*>", "g").replace(&inner, "");
        if icon && !named && trim(&words).is_empty() {
            out.push(hit(t.index, MESSAGE));
        }
    }
    out
}

fn rule_a11y04_heading(s: &Source, _: &Ctx) -> Vec<Hit> {
    // One finding per skip per file, at its first place, with how often it repeats.
    let mut skips: Vec<((i64, i64), usize, usize)> = Vec::new();
    let mut prev = 0;
    let headings: Vec<(usize, i64)> = match structure(s) {
        Some(m) => m.headings.clone(),
        None => re(r"<h([1-6])(?=[\s>])", "g").match_all(&s.text).iter().map(|m| (m.index, m.g(1).parse().unwrap())).collect(),
    };
    for (index, level) in headings {
        if prev != 0 && level > prev + 1 {
            match skips.iter_mut().find(|k| k.0 == (prev, level)) {
                Some(k) => k.2 += 1,
                None => skips.push(((prev, level), index, 1)),
            }
        }
        prev = level;
    }
    skips
        .into_iter()
        .map(|((from, to), index, count)| {
            let more = if count > 1 { format!(" ({count} times in this file: fix it once where it repeats)") } else { String::new() };
            hit(index, format!("h{from} then h{to}: headings skip a level; use h{}{more}", from + 1))
        })
        .collect()
}

fn rule_a11y04_untyped(s: &Source, _: &Ctx) -> Vec<Hit> {
    // Vue, Svelte, and Astro have no tree here, and no pattern stands in for one.
    let Some(m) = structure(s) else { return Vec::new() };
    m.untyped.iter().map(|&i| hit(i, "a <button> with no type inside a <form> submits the form when pressed: add type=\"button\", or type=\"submit\" if it sends the form")).collect()
}

/// Anything in the file that tells assistive technology about a wait. Read broadly, over the text: a mention
/// anywhere keeps the file quiet, since a false alarm costs more here than a miss.
const ANNOUNCED: &str = r#"aria-busy|ariaBusy|aria-live|ariaLive|\brole\s*[=:]\s*\{?\s*["'`](?:status|alert|progressbar)\b|setAttribute\(\s*["']role["']\s*,\s*["'](?:status|alert|progressbar)\b|<output\b|<progress\b"#;

fn rule_ix02_loading(s: &Source, c: &Ctx) -> Vec<Hit> {
    let Some(m) = structure(s) else { return Vec::new() };
    // a component from another module counts when that module has it and it announces nothing itself
    let from = m.loaders_from.iter().filter(|(_, name, spec)| announces(c, &s.path, spec, name, 0) == Some(false)).map(|l| l.0);
    let Some(at) = m.loading.into_iter().chain(from).min() else { return Vec::new() };
    match with_scripts(s, m, c) {
        Some(text) if !re(ANNOUNCED, "").test(&text) => {}
        _ => return Vec::new(),
    }
    vec![hit(at, "a loading indicator that only shows: nothing in this file tells a screen reader about the wait; put aria-busy on the region that is loading, or the in-progress text in a role=\"status\" element")]
}

/// Dialog and focus libraries that close on Esc and keep focus inside.
const DIALOG_LIBRARY: &str = r#"["'](?:focus-trap|focus-trap-react|react-focus-lock|@radix-ui/react-dialog|@radix-ui/react-alert-dialog|@headlessui/react|react-aria|react-aria-components|@reach/dialog|@ark-ui/[\w-]+|vaul|react-modal)(?:/[\w./-]*)?["']"#;

/// What a modal dialog's file (with the scripts a page loads) shows of a keyboard way out.
#[derive(PartialEq)]
enum WayOut {
    None,
    Esc,
    Tab,
    Both,
}

/// Esc and Tab, as the text shows them. Both: showModal() on a native <dialog>, or a known dialog or focus library.
/// Esc: an Esc key check (key "Escape", keyCode 27), or a word that names Esc in an identifier (useEscape,
/// closeOnEsc, onEscapeKeyDown). A cancel handler is not one: on a native <dialog> it is Esc, but that is not judged
/// here, and on anything else `onCancel` is a button's handler. Tab kept inside: a Tab key check (key "Tab", keyCode 9), inert on the
/// page behind, or a word for a focus trap (trapFocus, FocusTrap, FocusScope, FocusLock).
fn way_out(text: &str) -> WayOut {
    if re(r"\.showModal\s*\(", "").test(text) || re(DIALOG_LIBRARY, "").test(text) {
        return WayOut::Both;
    }
    let mut esc = re(r#"\b(?:keyCode|which)\s*===?\s*27\b|\b27\s*===?\s*[\w.]*\b(?:keyCode|which)\b"#, "").test(text);
    let mut tab = re(r#"\b(?:keyCode|which)\s*===?\s*9\b|\b9\s*===?\s*[\w.]*\b(?:keyCode|which)\b|["'`]Tab["'`]"#, "").test(text);
    let mut prev: Option<String> = None;
    for token in re(r"[A-Za-z_$][\w$]*", "g").matches(text) {
        for w in markup::words(&token) {
            let pair = prev.as_deref().map(|p| (p, w.as_str()));
            esc |= matches!(w.as_str(), "esc" | "escape");
            tab |= w == "inert" || w == "trap" || matches!(pair, Some(("focus", "lock" | "scope" | "guard")));
            prev = Some(w);
        }
        prev = None;
    }
    match (esc, tab) {
        (true, true) => WayOut::Both,
        (true, false) => WayOut::Esc,
        (false, true) => WayOut::Tab,
        (false, false) => WayOut::None,
    }
}

fn rule_a11y03_dialog(s: &Source, c: &Ctx) -> Vec<Hit> {
    let Some(m) = structure(s) else { return Vec::new() };
    let Some(at) = m.dialog else { return Vec::new() };
    let Some(text) = with_scripts(s, m, c) else { return Vec::new() };
    let message = match way_out(&text) {
        WayOut::Both => return Vec::new(),
        WayOut::None => "a modal dialog that does not close on Esc and does not keep Tab inside it: close it on Esc and keep focus inside it while it is open (showModal() on a <dialog> does both), or use a dialog component that does",
        WayOut::Esc => "a modal dialog that closes on Esc but lets Tab move to the page behind it: keep focus inside it while it is open (showModal() on a <dialog> does both), or use a dialog component that does",
        WayOut::Tab => "a modal dialog that keeps Tab inside but does not close on Esc: close it on Esc too (showModal() on a <dialog> does both), or use a dialog component that does",
    };
    vec![hit(at, message)]
}

/// An inline confirmation (an alertdialog that is not modal) that nothing moves focus into: no autofocus in its own
/// markup, and no .focus() call in its file or the scripts a page loads. Quiet when a page loads a script the scan
/// cannot read. Whether alertdialog is the right role for it is not judged.
fn rule_a11y03_alert(s: &Source, c: &Ctx) -> Vec<Hit> {
    let Some(m) = structure(s) else { return Vec::new() };
    let Some(at) = m.alert else { return Vec::new() };
    let Some(text) = with_scripts(s, m, c) else { return Vec::new() };
    if re(r"\.focus\s*\(", "").test(&text) {
        return Vec::new();
    }
    vec![hit(at, "an inline confirmation (role=\"alertdialog\") that nothing moves focus into: a screen reader announces it only when focus moves inside, and its key handlers hear keys only then; when it opens, put focus on one of its buttons (autoFocus, or .focus() from a script)")]
}

fn rule_fm01_label(s: &Source, _: &Ctx) -> Vec<Hit> {
    structure(s).map_or(Vec::new(), |m| m.unlabeled.iter().map(|&at| hit(at, "a form field with no label tied to it (a placeholder or text beside it is not one): give it a <label> with htmlFor, or put it inside the <label>; where the context already names it, such as a lone search box, an aria-label")).collect())
}

fn rule_ix12_dead(s: &Source, _: &Ctx) -> Vec<Hit> {
    // a directions preview (the page `ryux pick` opens) shows what a call to action would look like; it is not one
    if s.path.rsplit(['/', '\\']).next().is_some_and(|n| n.eq_ignore_ascii_case("directions.html")) {
        return Vec::new();
    }
    structure(s).and_then(|m| m.dead).map_or(Vec::new(), |at| vec![hit(at, "a control that goes nowhere (a link to \"#\" with no click handler, or an empty click handler): link it to a page or section that exists, give it the action it names, or remove it, or show it disabled with the reason, until that exists")])
}

fn rule_fm05_keyboard(s: &Source, _: &Ctx) -> Vec<Hit> {
    structure(s).and_then(|m| m.keyboard).map_or(Vec::new(), |at| vec![hit(at, "a phone, OTP, or amount field that opens the text keyboard: use type=\"tel\" for a phone number, and inputMode=\"numeric\" for a one-time code or an amount")])
}

fn rule_a11y07_invalid(s: &Source, _: &Ctx) -> Vec<Hit> {
    structure(s).and_then(|m| m.invalid).map_or(Vec::new(), |at| vec![hit(at, "a field marked aria-invalid with no aria-describedby or aria-errormessage: point it at the error text's id, so a screen reader reads the error with the field")])
}

fn rule_a11y04_radios(s: &Source, _: &Ctx) -> Vec<Hit> {
    let Some((at, n)) = structure(s).and_then(|m| m.ungrouped) else { return Vec::new() };
    let what = if n > 1 { format!("{n} groups of radio buttons, each for one question,") } else { "radio buttons for one question".to_string() };
    vec![hit(at, format!("{what} with nothing naming the question: each option is read with its own label, but not what it answers; put them in a <fieldset> with a <legend>, or a role=\"radiogroup\" or \"group\" with aria-labelledby"))]
}

fn rule_a11y04_checks(s: &Source, _: &Ctx) -> Vec<Hit> {
    let Some((at, n)) = structure(s).and_then(|m| m.ungrouped_checks) else { return Vec::new() };
    let what = if n > 1 { format!("{n} groups of checkboxes, each for one question,") } else { "checkboxes for one question".to_string() };
    vec![hit(at, format!("{what} with nothing naming the question: each option is read with its own label, but not what it answers; put them in a <fieldset> with a <legend>, or a role=\"group\" with aria-labelledby"))]
}

fn rule_a11y04_lone_radio(s: &Source, _: &Ctx) -> Vec<Hit> {
    structure(s).and_then(|m| m.lone_radio).map_or(Vec::new(), |at| vec![hit(at, "a single radio button with no other option of its name: once picked it cannot be unpicked; use a checkbox for a yes or no, or show the one option as text")])
}

fn rule_a11y04_lang(s: &Source, _: &Ctx) -> Vec<Hit> {
    // a run's working folder for generated assets (contact sheets) is not a page anyone ships
    if norm(&s.path).split('/').any(|p| p == "assets-src") {
        return Vec::new();
    }
    structure(s).and_then(|m| m.no_lang).map_or(Vec::new(), |at| vec![hit(at, "<html> with no lang: a screen reader reads the page in its own default language and may mispronounce it; set lang to the page's language (lang=\"id\" for Indonesian)")])
}

fn rule_ix12_disabled(s: &Source, _: &Ctx) -> Vec<Hit> {
    structure(s).and_then(|m| m.disabled).map_or(Vec::new(), |at| vec![hit(at, "a button shown disabled for good, with no reason given: say why and when it opens up (aria-describedby to that text, or a title), or remove it until it works")])
}

fn rule_a11y04_anchor(s: &Source, _: &Ctx) -> Vec<Hit> {
    structure(s).and_then(|m| m.anchor).map_or(Vec::new(), |at| vec![hit(at, "a link with a click handler and no href: Tab does not reach it and Enter does not run it; use a <button> for an action, or give it the href it goes to")])
}

fn rule_fm05_autofill(s: &Source, _: &Ctx) -> Vec<Hit> {
    structure(s).and_then(|m| m.autofill_off).map_or(Vec::new(), |at| vec![hit(at, "autocomplete=\"off\" on a field for the person's own email, phone, name, or address: it stops the browser filling it; use the matching autocomplete value (email, tel, name, street-address)")])
}

fn first(s: &Source, pattern: &str, message: impl Fn(&str) -> String) -> Vec<Hit> {
    re(pattern, "").exec(&s.text).map_or(Vec::new(), |m| vec![hit(m.index, message(m.g(0)))])
}

fn rule_fm05(s: &Source, c: &Ctx) -> Vec<Hit> {
    if c.growing_textarea != Some(false) {
        return Vec::new();
    }
    first(s, r"<(?:textarea|Textarea|TextArea)\b", |_| "a textarea, and nothing in the scanned folder makes one grow with its text: a fixed box hides what the person wrote past its edge; use field-sizing: content, with a script that sets the height from scrollHeight where it is not supported".into())
}

fn rule_a11y08_motion(s: &Source, c: &Ctx) -> Vec<Hit> {
    if c.reduced_motion != Some(false) {
        return Vec::new();
    }
    first(s, r"@keyframes\b|\banimation\s*:|\banimate-[a-z]|<motion\.\w+", |m| format!("\"{m}\" and nothing in the scanned folder handles prefers-reduced-motion: replace large movement with a fade or a cut when it is set"))
}

fn rule_a11y08_loop(s: &Source, _: &Ctx) -> Vec<Hit> {
    let mut hits = Vec::new();
    for m in re(r"\banimation(?:-iteration-count)?\s*:[^;}\n]*\binfinite\b|\brepeat\s*:\s*Infinity\b|\banimate-(?:bounce|ping)\b", "g").match_all(&s.text) {
        let around = &s.text[crate::js::back16(&s.text, m.start, 160)..crate::js::fwd16(&s.text, m.end, 40)];
        if re(LOADER, "i").test(around) {
            continue;
        }
        hits.push(hit(m.index, format!("\"{}\" repeats forever: give it a pause or stop control, stop it after a few cycles, or keep looping only for a loading indicator", trim(m.g(0)))));
    }
    hits
}

fn rule_ui11_props(s: &Source, _: &Ctx) -> Vec<Hit> {
    let mut hits = Vec::new();
    for m in re(r#"\btransition(?:-property)?\s*:\s*([^;}"'`\n]+)|\btransition-all\b"#, "g").match_all(&s.text) {
        if m.g(0) == "transition-all" {
            hits.push(hit(m.index, "transition-all animates every property: name the ones that move, transform and opacity where you can"));
            continue;
        }
        let props: Vec<String> = m.g(1).split(',').map(|part| re(r"\s+", "").split(trim(part))[0].clone()).collect();
        let bad: Vec<&String> = props.iter().filter(|p| p.as_str() == "all" || re(LAYOUT_PROPS, "").test(p)).collect();
        if bad.is_empty() {
            continue;
        }
        let msg = if bad.iter().any(|p| p.as_str() == "all") {
            "a transition on all properties: name the ones that move, transform and opacity where you can".to_string()
        } else {
            format!("a transition on {}: animate transform or opacity instead, so the page is not laid out again every frame", bad.iter().map(|p| p.as_str()).collect::<Vec<_>>().join(", "))
        };
        hits.push(hit(m.index, msg));
    }
    hits
}

fn rule_ui11_long(s: &Source, _: &Ctx) -> Vec<Hit> {
    let mut hits = Vec::new();
    let ms = |v: &str, unit: &str| { let n: f64 = v.parse().unwrap_or(f64::NAN); if unit == "s" { n * 1000.0 } else { n } };
    for m in re(r#"\btransition(?:-duration)?\s*:\s*([^;}"'`\n]+)"#, "g").match_all(&s.text) {
        let longest = m.g(1).split(',').map(|part| re(r"(?<![\w.-])(\d*\.?\d+)(ms|s)\b", "").exec(part).map_or(0.0, |t| ms(t.g(1), t.g(2)))).fold(0.0, |a: f64, b| if b.is_nan() || a.is_nan() { f64::NAN } else { a.max(b) });
        if longest > 500.0 {
            hits.push(hit(m.index, format!("a {} ms transition: task UI reads anything near 500 ms as waiting; about 100 to 300 ms, 400 ms for a large move", num_str(round(longest)))));
        }
    }
    for m in re(r"\bduration-(\d{3,4})\b", "g").match_all(&s.text) {
        if m.g(1).parse::<f64>().unwrap() > 500.0 {
            hits.push(hit(m.index, format!("{}: task UI reads anything near 500 ms as waiting; about 100 to 300 ms, 400 ms for a large move", m.g(0))));
        }
    }
    hits
}

/// A long wait before the interface answers (RX-UI-11): elements that wait over 500 ms before they move, or a stagger
/// step of 100 ms or more, reported once per file with the longest wait. A tooltip or hover card may wait before it
/// opens; a loader, a loop, a success moment, and a decorative line drawing itself (an SVG stroke; owner sheet 10,
/// 2026-11-23: D2) are left alone.
fn rule_ui11_delay(s: &Source, _: &Ctx) -> Vec<Hit> {
    let ms = |v: &str, unit: &str| { let n: f64 = v.parse().unwrap_or(0.0); if unit == "s" { n * 1000.0 } else { n } };
    let quiet = |at: usize, end: usize| {
        let around = &s.text[crate::js::back16(&s.text, at, 240)..crate::js::fwd16(&s.text, end, 60)];
        re(r"tooltip|\btip\b|popover|hover-?card|toast|hint|coach|splash|marquee|ticker|radar|ripple|success|sukses|berhasil|confirm|celebrat|confetti|done\b|complete|\bsvg\b|stroke-dash", "i").test(around) || re(LOADER, "i").test(around) || re(r"\binfinite\b|Infinity", "").test(around)
    };
    let mut waits: Vec<(usize, f64)> = Vec::new();
    let mut step: Option<(usize, f64)> = None;
    for m in re(r#"\b(?:transition|animation)-delay\s*:\s*([^;}"'`\n]+)|\banimationDelay\s*:\s*["'`]([^"'`]+)"#, "g").match_all(&s.text) {
        let v = if m.g(1).is_empty() { m.g(2) } else { m.g(1) };
        if quiet(m.start, m.end) {
            continue;
        }
        if let Some(t) = re(r"\*\s*(\d*\.?\d+)(ms|s)\b|(\d*\.?\d+)(ms|s)\s*\*", "").exec(v) {
            let n = if t.g(1).is_empty() { ms(t.g(3), t.g(4)) } else { ms(t.g(1), t.g(2)) };
            if n >= 100.0 && step.is_none_or(|(_, b)| n > b) {
                step = Some((m.index, n));
            }
            continue;
        }
        let longest = v.split(',').filter_map(|part| re(r"(?<![\w.-])(\d*\.?\d+)(ms|s)\b", "").exec(part).map(|t| ms(t.g(1), t.g(2)))).fold(0.0, f64::max);
        if longest > 500.0 {
            waits.push((m.index, longest));
        }
    }
    for m in re(r"\bdelay-(\d{3,4})\b", "g").match_all(&s.text) {
        let n = m.g(1).parse::<f64>().unwrap_or(0.0);
        if n > 500.0 && !quiet(m.start, m.end) {
            waits.push((m.index, n));
        }
    }
    if let Some((at, n)) = step {
        return vec![hit(at, format!("a stagger of {} ms per item: by the tenth item the list waits a second; about 30 to 60 ms a step, and the whole sequence under about 500 ms", num_str(round(n))))];
    }
    let Some(&(at, _)) = waits.first() else { return Vec::new() };
    let longest = waits.iter().map(|w| w.1).fold(0.0, f64::max);
    let many = if waits.len() > 1 { format!("{} elements wait before they move, the last {} ms", waits.len(), num_str(round(longest))) } else { format!("an element waits {} ms before it moves", num_str(round(longest))) };
    vec![hit(at, format!("{many}: content that arrives late reads as a slow page; start at once and keep the whole sequence under about 500 ms"))]
}

/// Motion already in a file: any transition, animation, or motion library. A file that has some is left alone by the
/// motion notes below: it may animate the part in a way a pattern cannot see.
const HAS_MOTION: &str = r"\btransition\b|\btransition-|\banimation\b|@keyframes|\banimate-|\bduration-\d|framer-motion|motion/react|AnimatePresence|useSpring|useTransition\b|\.animate\(|data-\[state=|\bmotion\.\w|<Transition\b|<CSSTransition\b|svelte/transition|\btransition:";

/// Motion note, L2 (RX-UI-11): in JSX, a part shown and hidden by a flag (open, show, visible, expanded) with a cut, in
/// a file with no motion; a component from elsewhere counts only when its own file is in the scan and has no motion
/// either (a library dialog or sheet usually animates itself). Once per file with the count. Owner sheet 12
/// (2026-11-24): 3 of 3 JSX flags real (an accordion pushing content down, a map card a status change inserts);
/// hover with no transition 0 of 6 (polish, written into the build instead) and display/hidden toggles in plain
/// pages 0 of 3 (an enter already timed by requestAnimationFrame, a note shown on load, a view swapped for a form).
fn note_ui11_reveal(s: &Source, c: &Ctx) -> Vec<Hit> {
    if re(HAS_MOTION, "").test(&s.text) || re(TEST_FILE, "").test(&s.path) {
        return Vec::new();
    }
    let mut hits: Vec<(usize, String, String)> = Vec::new();
    for m in re(r"\{\s*!?\s*([\w.]*?(?:[oO]pen|[sS]how|[vV]isible|[eE]xpanded)\w*)\s*(?:&&|\?)\s*\(?\s*<([A-Za-z][\w.]*)", "g").match_all(&s.text) {
        let (flag, tag) = (m.g(1).to_string(), m.g(2).to_string());
        if tag.chars().next().is_some_and(char::is_uppercase) {
            let name = tag.rsplit('.').next().unwrap_or(&tag);
            let def = re(&format!(r"(?:function|const|class)\s+{name}\b"), "");
            let Some(home) = c.files.values().find(|f| def.test(&f.text)) else { continue };
            if re(HAS_MOTION, "").test(&home.text) {
                continue;
            }
        }
        hits.push((m.index, flag, tag));
    }
    let Some((at, flag, tag)) = hits.first().cloned() else { return Vec::new() };
    let one = if tag.is_empty() { format!("\"{flag}\"") } else { format!("\"{flag}\" shows <{tag}>") };
    let what = if hits.len() == 1 { format!("{one} with a cut") } else { format!("{} parts appear and disappear with a cut (first {one})", hits.len()) };
    vec![hit(at, format!("motion L2: {what}; offer a 150 to 250 ms enter and exit when the flag changes, not on first render (a fade with a few pixels of movement, from the control when one opens it; exit a little faster), a fade or a cut under reduced motion"))]
}

fn rule_ui35(s: &Source, c: &Ctx) -> Vec<Hit> {
    if c.reduced_transparency != Some(false) {
        return Vec::new();
    }
    first(s, r"\bbackdrop-filter\s*:|\bbackdrop-blur\b|\bbackdropFilter\s*:", |m| format!("\"{m}\" and nothing in the scanned folder handles prefers-reduced-transparency or prefers-contrast: fall back to a solid surface when either is set, and check text contrast over the busiest background"))
}

/// The JavaScript pattern `(?<=[:(,[]\s*|["'`])(?<!(?:fill|stroke|stop-color)=["'])` before a hex: JavaScript has
/// variable-length lookbehind, fancy-regex does not, so it is checked here on the text before the "#".
fn hex_lookbehind_ok(before: &str) -> bool {
    let quoted_attr = ["fill=\"", "fill='", "stroke=\"", "stroke='", "stop-color=\"", "stop-color='"].iter().any(|p| before.ends_with(p));
    if quoted_attr {
        return false;
    }
    // a link or a reference to an id: href="#add", to="#top", url(#fade)
    if re(r#"(?:\b(?:href|src|to|action|formAction)\s*=\s*\{?\s*["'`]|url\(\s*["']?)$"#, "i").test(before) {
        return false;
    }
    if before.ends_with(['"', '\'', '`']) {
        return true;
    }
    re(r"[:(,[]\s*$", "").test(before)
}

fn rule_ds03_oneoff(s: &Source, _: &Ctx) -> Vec<Hit> {
    if re(r"token|theme|colou?r|palette|tailwind\.config", "i").test(&s.path) {
        return Vec::new();
    }
    let mut offset = 0;
    let mut found: Vec<(usize, String)> = Vec::new();
    let hex = re(r"#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3,4})\b", "g");
    for line in s.text.split('\n') {
        if !re(r"--[\w-]+\s*:", "").test(line) {
            for m in hex.match_all(line) {
                if hex_lookbehind_ok(&line[..m.start]) {
                    found.push((offset + m.index, m.g(0).to_lowercase()));
                }
            }
        }
        offset += len16(line) + 1;
    }
    let mut distinct: Vec<String> = Vec::new();
    for (_, v) in &found {
        if !distinct.contains(v) {
            distinct.push(v.clone());
        }
    }
    if distinct.len() < 3 {
        return Vec::new();
    }
    vec![hit(found[0].0, format!("{} one-off colors ({}{}): use the color tokens, or define them by role", distinct.len(), distinct[..3].join(", "), if distinct.len() > 3 { ", ..." } else { "" }))]
}

fn rule_ui19_viewbox(s: &Source, _: &Ctx) -> Vec<Hit> {
    match tags(&s.text, "svg").into_iter().next() {
        Some(root) if !re(r"\bviewBox\s*=", "").test(&root.attrs) => vec![hit(root.index, "<svg> with no viewBox: add one (viewBox=\"0 0 w h\") so the art scales with its container")],
        _ => Vec::new(),
    }
}

fn rule_ui19_art(s: &Source, _: &Ctx) -> Vec<Hit> {
    let Some(root) = tags(&s.text, "svg").into_iter().next() else { return Vec::new() };
    let fixed: Vec<(String, String)> = re(r#"(?<![\w:-])(width|height)\s*=\s*["']([^"']+)["']"#, "g")
        .match_all(&root.attrs)
        .into_iter()
        .filter(|m| !re(r"%$", "").test(trim(m.g(2))))
        .map(|m| (m.g(1).to_string(), m.g(2).to_string()))
        .collect();
    let mut out = Vec::new();
    if !fixed.is_empty() {
        let list: Vec<String> = fixed.iter().map(|(k, v)| format!("{k}=\"{v}\"")).collect();
        out.push(hit(root.index, format!("fixed {} on the root: leave the size to CSS so the art fits its container", list.join(" "))));
    }
    for (p, message) in [
        (r"<(?:image|feImage)\b|data:image\/(?:png|jpe?g|gif|webp)", "an embedded raster inside the SVG: draw it as vector, or ship the raster on its own at 2x"),
        (r"<text\b", "<text> inside the art: keep words in the HTML so they can be translated, read, and zoomed"),
        (r"\b(?:sodipodi|inkscape):|xmlns:sketch|data-figma|<metadata\b", "editor metadata: export without it"),
    ] {
        if let Some(m) = re(p, "").exec(&s.text) {
            out.push(hit(m.index, message));
        }
    }
    out
}

fn rule_ds03_drift(s: &Source, c: &Ctx) -> Vec<Hit> {
    let Some(d) = &c.design else { return Vec::new() };
    let all = [drift::drift_colours(&s.text, &s.ext, d), drift::drift_fonts(&s.text, d), drift::drift_radius(&s.text, d), drift::drift_durations(&s.text, d)];
    all.into_iter().flatten().map(|h| hit(h.index, h.message)).collect()
}

struct Detector {
    rule: &'static str,
    level: &'static str,
    exts: fn(&str) -> bool,
    folder: bool,
    find: fn(&Source, &Ctx) -> Vec<Hit>,
}

fn all(e: &str) -> bool {
    is(e, &[MARKUP, STYLE, SCRIPT]) || e == "svg"
}
fn code(e: &str) -> bool {
    is(e, &[MARKUP, SCRIPT])
}
fn markup(e: &str) -> bool {
    is(e, &[MARKUP])
}
fn visual(e: &str) -> bool {
    is(e, &[MARKUP, STYLE, SCRIPT])
}
fn markup_style(e: &str) -> bool {
    is(e, &[MARKUP, STYLE])
}
fn markup_script(e: &str) -> bool {
    is(e, &[MARKUP, SCRIPT])
}
fn svg(e: &str) -> bool {
    e == "svg"
}

/// The detectors, in the catalogue's order (findings on one line and column keep this order).
fn detectors() -> &'static [Detector] {
    const D: &[Detector] = &[
        Detector { rule: "RX-DS-03", level: "warn", exts: all, folder: false, find: rule_ds03_drift },
        Detector { rule: "RX-CD-02", level: "fail", exts: all, folder: false, find: rule_cd02 },
        Detector { rule: "RX-FE-12", level: "warn", exts: code, folder: false, find: rule_fe12 },
        Detector { rule: "RX-CD-09", level: "warn", exts: code, folder: false, find: rule_cd09 },
        Detector { rule: "RX-CD-12", level: "warn", exts: markup, folder: false, find: rule_cd12_label },
        Detector { rule: "RX-CD-12", level: "warn", exts: markup, folder: false, find: rule_cd12_heading },
        Detector { rule: "RX-CD-21", level: "warn", exts: markup, folder: false, find: rule_cd21_sentence },
        Detector { rule: "RX-CD-18", level: "warn", exts: markup, folder: false, find: rule_cd18 },
        Detector { rule: "RX-CD-19", level: "warn", exts: markup, folder: false, find: rule_cd19 },
        Detector { rule: "RX-AS-03", level: "fail", exts: code, folder: false, find: rule_as03_lorem },
        Detector { rule: "RX-AS-03", level: "warn", exts: code, folder: false, find: rule_as03_placeholder },
        Detector { rule: "RX-AS-04", level: "warn", exts: code, folder: false, find: rule_as04 },
        Detector { rule: "RX-AS-01", level: "warn", exts: code, folder: false, find: rule_as01 },
        Detector { rule: "RX-AS-02", level: "warn", exts: code, folder: false, find: rule_as02 },
        Detector { rule: "RX-A11Y-02", level: "fail", exts: code, folder: false, find: rule_a11y02_zoom },
        Detector { rule: "RX-A11Y-02", level: "warn", exts: visual, folder: false, find: rule_a11y02_small },
        Detector { rule: "RX-A11Y-03", level: "fail", exts: markup, folder: false, find: rule_a11y03_tabindex },
        Detector { rule: "RX-A11Y-03", level: "warn", exts: markup_style, folder: false, find: rule_a11y03_outline },
        Detector { rule: "RX-A11Y-03", level: "warn", exts: markup, folder: false, find: rule_a11y03_dialog },
        Detector { rule: "RX-A11Y-03", level: "warn", exts: markup, folder: false, find: rule_a11y03_alert },
        Detector { rule: "RX-FM-01", level: "warn", exts: markup, folder: false, find: rule_fm01_label },
        Detector { rule: "RX-IX-12", level: "warn", exts: markup, folder: false, find: rule_ix12_dead },
        Detector { rule: "RX-FM-05", level: "warn", exts: markup, folder: false, find: rule_fm05_keyboard },
        Detector { rule: "RX-A11Y-07", level: "warn", exts: markup, folder: false, find: rule_a11y07_invalid },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_radios },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_anchor },
        Detector { rule: "RX-FM-05", level: "warn", exts: markup, folder: false, find: rule_fm05_autofill },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_checks },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_lone_radio },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_lang },
        Detector { rule: "RX-IX-12", level: "warn", exts: markup, folder: false, find: rule_ix12_disabled },
        Detector { rule: "RX-A11Y-04", level: "fail", exts: markup, folder: false, find: rule_a11y04_img },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_click },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_icon },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_heading },
        Detector { rule: "RX-A11Y-04", level: "warn", exts: markup, folder: false, find: rule_a11y04_untyped },
        Detector { rule: "RX-IX-02", level: "warn", exts: markup, folder: false, find: rule_ix02_loading },
        Detector { rule: "RX-FM-05", level: "warn", exts: markup_script, folder: true, find: rule_fm05 },
        Detector { rule: "RX-A11Y-08", level: "warn", exts: visual, folder: true, find: rule_a11y08_motion },
        Detector { rule: "RX-A11Y-08", level: "warn", exts: visual, folder: false, find: rule_a11y08_loop },
        Detector { rule: "RX-UI-11", level: "warn", exts: visual, folder: false, find: rule_ui11_props },
        Detector { rule: "RX-UI-11", level: "warn", exts: visual, folder: false, find: rule_ui11_long },
        Detector { rule: "RX-UI-11", level: "warn", exts: visual, folder: false, find: rule_ui11_delay },
        Detector { rule: "RX-UI-35", level: "warn", exts: visual, folder: true, find: rule_ui35 },
        Detector { rule: "RX-DS-03", level: "warn", exts: visual, folder: false, find: rule_ds03_oneoff },
        Detector { rule: "RX-UI-19", level: "fail", exts: svg, folder: false, find: rule_ui19_viewbox },
        Detector { rule: "RX-UI-19", level: "warn", exts: svg, folder: false, find: rule_ui19_art },
        Detector { rule: "RX-UI-11", level: "note", exts: markup_script, folder: false, find: note_ui11_reveal },
    ];
    D
}

fn blank(s: &str) -> String {
    s.chars().map(|c| if c == '\n' { "\n".to_string() } else { " ".repeat(c.len_utf16()) }).collect()
}

/// The comments the parser finds in a script, blanked; `None` when it cannot read the script.
fn js_comments(code: &str, kind: oxc_span::SourceType) -> Option<String> {
    let alloc = oxc_allocator::Allocator::default();
    let ret = oxc_parser::Parser::new(&alloc, code, kind).parse();
    if ret.fatal_error || !ret.diagnostics.is_empty() {
        return None;
    }
    let mut out = String::with_capacity(code.len());
    let mut last = 0;
    for c in ret.program.comments.iter() {
        let (a, b) = (c.span.start as usize, c.span.end as usize);
        if a < last || b > code.len() {
            return None;
        }
        out.push_str(&code[last..a]);
        out.push_str(&blank(&code[a..b]));
        last = b;
    }
    out.push_str(&code[last..]);
    Some(out)
}

/// Comments by pattern, for a part no parser reads: `/* */` and `<!-- -->`, and `//` unless `line` is false.
fn comments_by_pattern(raw: &str, line: bool) -> String {
    let mut text = raw.to_string();
    for p in [r"\/\*[\s\S]*?\*\/", r"<!--[\s\S]*?-->"] {
        text = replace_with(re(p, "g"), &text, |h| blank(h.g(0)));
    }
    if line {
        text = replace_with(re(r#"(^|[^:\\"'`])(\/\/[^\n]*)"#, "g"), &text, |h| format!("{}{}", h.g(1), blank(h.g(2))));
    }
    text
}

fn script_kind(ext: &str) -> Option<oxc_span::SourceType> {
    use oxc_span::SourceType;
    Some(match ext {
        "js" | "mjs" | "cjs" | "jsx" => SourceType::jsx(),
        "ts" | "mts" | "cts" => SourceType::ts(),
        "tsx" => SourceType::tsx(),
        _ => return None,
    })
}

/// A page's `<style>` and `<script>` parts, each blanked by its own comment syntax; the rest by pattern
/// (`<!-- -->` only in plain HTML, where `/*` and `//` are text).
fn page_comments(raw: &str, ext: &str) -> String {
    let plain = ext == "html" || ext == "htm";
    let mut out = String::with_capacity(raw.len());
    let mut last = 0;
    let rest = |s: &str| if plain { replace_with(re(r"<!--[\s\S]*?-->", "g"), s, |h| blank(h.g(0))) } else { comments_by_pattern(s, true) };
    for h in re(r"(<style\b[^>]*>)([\s\S]*?)(<\/style\s*>)|(<script\b[^>]*>)([\s\S]*?)(<\/script\s*>)", "gi").match_all(raw) {
        out.push_str(&rest(&raw[last..h.start]));
        let style = h.has(1);
        let g = if style { 1 } else { 4 };
        let (open, body, close) = (h.g(g), h.g(g + 1), h.g(g + 2));
        let lang = re(r#"\blang\s*=\s*["']?([a-z]+)"#, "i").exec(open).map(|m| m.g(1).to_lowercase());
        let body = if style {
            comments_by_pattern(body, matches!(lang.as_deref(), Some("scss" | "sass" | "less")))
        } else {
            let kind = match lang.as_deref() { Some("ts") => oxc_span::SourceType::ts(), Some("tsx") => oxc_span::SourceType::tsx(), _ => oxc_span::SourceType::mjs() };
            js_comments(body, kind).unwrap_or_else(|| comments_by_pattern(body, true))
        };
        out.push_str(open);
        out.push_str(&body);
        out.push_str(close);
        last = h.end;
    }
    out.push_str(&rest(&raw[last..]));
    out
}

/// Blank out comments (keeping UTF-16 length and line breaks) so commented-out code is not scanned. Scripts are
/// read by the parser, so "/*" or "//" inside a string stays text.
pub fn strip_comments(raw: &str, ext: &str) -> String {
    if let Some(kind) = script_kind(ext) {
        return js_comments(raw, kind).unwrap_or_else(|| comments_by_pattern(raw, true));
    }
    match ext {
        "html" | "htm" | "vue" | "svelte" | "astro" => page_comments(raw, ext),
        "css" => comments_by_pattern(raw, false),
        _ => comments_by_pattern(raw, true),
    }
}

fn replace_with(r: &JsRe, s: &str, f: impl Fn(&crate::jsre::Hit) -> String) -> String {
    let mut out = String::new();
    let mut last = 0;
    for h in r.match_all(s) {
        out.push_str(&s[last..h.start]);
        out.push_str(&f(&h));
        last = h.end;
    }
    out.push_str(&s[last..]);
    out
}

pub fn to_source(path: &str, raw: &str) -> Source {
    let u: Vec<u16> = path.encode_utf16().collect();
    let dot = u.iter().rposition(|&c| c == b'.' as u16).map_or(0, |i| i + 1);
    let ext = String::from_utf16_lossy(&u[dot..]).to_lowercase();
    Source { path: path.to_string(), text: strip_comments(raw, &ext), ext, raw: raw.to_string(), markup: Default::default(), module: Default::default() }
}

struct Ignores {
    file: HashSet<String>,
    lines: HashMap<usize, HashSet<String>>,
}

/// `ryux-ignore` notes. A note is in a comment (`text` has it blanked) and skips the rules whose IDs follow it on
/// that line, in any case and with a reason anywhere; with no ID it skips every rule. It covers its own line and
/// the next.
fn ignores(raw: &str, text: &str) -> Ignores {
    let mut file = HashSet::new();
    let mut lines: HashMap<usize, HashSet<String>> = HashMap::new();
    for (i, (line, stripped)) in raw.split('\n').zip(text.split('\n')).enumerate() {
        let Some(m) = re(r"(?<![\w-])ryux-ignore(-file)?\b", "").match_all(line).into_iter().find(|m| stripped.get(m.start..m.end).is_some_and(|t| t.trim().is_empty())) else { continue };
        let mut ids: Vec<String> = re(r"\bRX-[A-Z0-9]+-\d+\b", "gi").matches(&line[m.end..]).into_iter().map(|id| id.to_uppercase()).collect();
        if ids.is_empty() {
            ids = vec!["*".into()];
        }
        if m.has(1) {
            file.extend(ids);
        } else {
            for n in [i + 1, i + 2] {
                lines.entry(n).or_default().extend(ids.iter().cloned());
            }
        }
    }
    Ignores { file, lines }
}

/// Line and column (UTF-16) of a UTF-16 offset in `raw`.
fn line_col(raw: &str, index: usize) -> (usize, usize) {
    let before = &raw[..byte_at(raw, index)];
    let line = before.matches('\n').count() + 1;
    // a byte order mark at the start is not a column an editor shows
    let last = before.rfind('\n').map_or(if raw.starts_with('\u{FEFF}') { 0 } else { -1 }, |b| len16(&before[..b]) as isize);
    (line, (index as isize - last) as usize)
}

pub struct ScanOptions {
    pub folder: bool,
    pub skip: HashSet<String>,
    pub design: Option<Direction>,
    /// The Components field of DESIGN.md's project context, as written: what the user chose to do with controls
    /// written again (RX-DS-01): extract, storybook, or later.
    pub components: Option<String>,
    /// Files the checks may consult but do not report on: the scripts a page loads, the modules a component
    /// comes from (see `references`).
    pub context: Vec<Source>,
}

/// Run every detector over the sources: findings by source, then line and column.
pub fn scan_sources(sources: &[Source], opts: ScanOptions) -> Vec<Value> {
    run(sources, opts, detectors())
}

fn rule_a11y03_drag(s: &Source, _: &Ctx) -> Vec<Hit> {
    crate::jsx::drag_without_keyboard(&s.raw, &s.ext)
        .into_iter()
        .map(|d| hit(d.index, format!("a <{}> that starts a drag ({}) with no keyboard way: give it a role such as slider, with tabIndex and arrow keys, or add controls that do the same without dragging (WCAG 2.1.1, 2.5.7)", d.tag, d.via)))
        .collect()
}

fn jsx(e: &str) -> bool {
    e == "jsx" || e == "tsx"
}

fn script_or_jsx(e: &str) -> bool {
    matches!(e, "js" | "mjs" | "cjs" | "ts" | "mts" | "cts" | "jsx" | "tsx")
}

fn smells(s: &Source, rule: &str) -> Vec<Hit> {
    crate::jsx::code_smells(&s.raw, &s.ext).into_iter().filter(|m| m.rule == rule).map(|m| hit(m.index, m.message)).collect()
}
fn rule_fe05_catch(s: &Source, _: &Ctx) -> Vec<Hit> {
    smells(s, "RX-FE-05")
}
fn rule_fe07_code(s: &Source, _: &Ctx) -> Vec<Hit> {
    smells(s, "RX-FE-07")
}
fn rule_fe13_effect(s: &Source, _: &Ctx) -> Vec<Hit> {
    smells(s, "RX-FE-13")
}

/// The checks that read JSX and TSX as a syntax tree, run apart from `scan_sources` (whose output
/// fixtures/checks/scan.json records) with the same options and ignores.
fn syntax_detectors() -> &'static [Detector] {
    const D: &[Detector] = &[
        Detector { rule: "RX-A11Y-03", level: "warn", exts: jsx, folder: false, find: rule_a11y03_drag },
        Detector { rule: "RX-FE-05", level: "warn", exts: script_or_jsx, folder: false, find: rule_fe05_catch },
        Detector { rule: "RX-FE-07", level: "warn", exts: script_or_jsx, folder: false, find: rule_fe07_code },
        Detector { rule: "RX-FE-13", level: "warn", exts: script_or_jsx, folder: false, find: rule_fe13_effect },
        Detector { rule: "RX-DS-01", level: "warn", exts: jsx, folder: false, find: rule_ds01_copies },
        Detector { rule: "RX-DS-01", level: "warn", exts: jsx, folder: false, find: rule_ds01_bypass },
        Detector { rule: "RX-QA-08", level: "warn", exts: jsx, folder: false, find: rule_qa08_dead },
    ];
    D
}

pub fn scan_syntax(sources: &[Source], opts: ScanOptions) -> Vec<Value> {
    run(sources, opts, syntax_detectors())
}

fn run(sources: &[Source], opts: ScanOptions, detectors: &[Detector]) -> Vec<Value> {
    let files: HashMap<String, &Source> = sources.iter().chain(opts.context.iter()).map(|s| (norm(&s.path), s)).collect();
    let mut ctx = if opts.folder {
        Ctx {
            reduced_motion: Some(sources.iter().any(|s| re(r"prefers-reduced-motion|motion-(?:reduce|safe):|useReducedMotion|reducedMotion", "").test(&s.text))),
            indonesian: Some(sources.iter().any(|s| !re(TEST_FILE, "").test(&s.path) && re(INDONESIAN, "").test(&s.text))),
            reduced_transparency: Some(sources.iter().any(|s| re(r"prefers-reduced-transparency|prefers-contrast|contrast-more:|useReducedTransparency", "").test(&s.text))),
            growing_textarea: Some(sources.iter().any(|s| re(GROWS, "").test(&s.text))),
            design: None,
            components: None,
            files: HashMap::new(),
            copies: Default::default(),
        }
    } else {
        Ctx::default()
    };
    ctx.design = opts.design;
    ctx.components = opts.components.as_deref().and_then(decision);
    ctx.files = files;
    let mut out: Vec<(usize, usize, usize, Value)> = Vec::new();
    for (si, src) in sources.iter().enumerate() {
        let ign = ignores(&src.raw, &src.text);
        for d in detectors {
            if !(d.exts)(&src.ext) || opts.skip.contains(d.rule) || ign.file.contains(d.rule) || ign.file.contains("*") {
                continue;
            }
            if d.folder && !opts.folder {
                continue;
            }
            let mut seen = HashSet::new();
            for h in (d.find)(src, &ctx) {
                let (line, column) = line_col(&src.raw, h.index);
                let off = ign.lines.get(&line);
                if seen.contains(&h.index) || off.map_or(false, |o| o.contains(d.rule) || o.contains("*")) {
                    continue;
                }
                seen.insert(h.index);
                out.push((si, line, column, json!({ "level": d.level, "rule": d.rule, "file": src.path, "line": line, "column": column, "message": h.message })));
            }
        }
    }
    out.sort_by(|a, b| (a.0, a.1, a.2).cmp(&(b.0, b.1, b.2)));
    out.into_iter().map(|x| x.3).collect()
}

/// The detectors as data, in order: `[{rule, level, folder}]`; `syntax` picks the JSX and TSX syntax checks.
/// The CLI's catalogue (packages/cli/src/checks.ts, printed by `ryux scan --list-rules` and the rule text) is
/// tested against it, so the two lists cannot drift apart.
pub fn catalogue(syntax: bool) -> Value {
    let list = if syntax { syntax_detectors() } else { detectors() };
    Value::Array(list.iter().map(|d| json!({ "rule": d.rule, "level": d.level, "folder": d.folder })).collect())
}

#[cfg(test)]
mod tests {
    use super::*;

    /// The findings of one rule in one file whose message says `says`, as "line:column".
    fn found(path: &str, raw: &str, rule: &str, says: &str) -> Vec<String> {
        let opts = ScanOptions { folder: false, skip: HashSet::new(), design: None, components: None, context: Vec::new() };
        scan_sources(&[to_source(path, raw)], opts)
            .into_iter()
            .filter(|f| f["rule"] == rule && f["message"].as_str().unwrap().contains(says))
            .map(|f| format!("{}:{}", f["line"], f["column"]))
            .collect()
    }

    #[test]
    fn low_stock_other_shoppers_and_a_promotion_counting_down_are_urgency() {
        let urgency = |raw: &str| found("a.html", raw, "RX-AS-04", "");
        for hit in [
            "<p>Stok tinggal 3</p>", "<p>Sisa 2 pcs</p>", "<p>stock: 4</p>", "<span>Only 3 left in stock</span>", "<b>5 seats left</b>",
            "<p>Hanya tersisa 2 kursi</p>", "<p>12 orang sedang melihat produk ini</p>", "<p>18 people are viewing this</p>", "<p>Terjual 30 kali dalam 1 jam</p>",
            "<div>Flash sale berakhir dalam 02:14:09</div>", "<div>Sale ends in</div>",
        ] {
            assert_eq!(urgency(hit).len(), 1, "{hit}");
        }
        for quiet in [
            "<p>Tinggal 2 langkah lagi</p>", "<p>Stok 30%</p>", "<p>Sisa 3 hari langganan</p>", "<p>Stok tersedia</p>",
            "<p>Bayar dalam 23:59:12</p>", "<p>Kirim ulang kode dalam 0:30</p>", "<p>3 orang di keluargamu</p>",
        ] {
            assert!(urgency(quiet).is_empty(), "{quiet}");
        }
        // a countdown in a file that labels its data as sample is the deliverable the brief asked for
        assert!(urgency("<span class=\"tag\">Sample data</span><div>Sale ends in</div>").is_empty());
        // the quote stops at the string's end
        assert!(found("a.js", r#"t = s ? "Sale starts in " : "Sale ends in";"#, "RX-AS-04", "\"Sale ends in\": a promotion").len() == 1);
    }

    #[test]
    fn a_long_wait_before_motion_is_one_finding_per_file() {
        let wait = |raw: &str| found("a.css", raw, "RX-UI-11", "");
        assert_eq!(wait(".card { transition-delay: 800ms; }").len(), 1);
        assert_eq!(wait(".card { transition-delay: 300ms; }").len(), 0);
        let rows = ".tx li:nth-child(1) { animation-delay: .3s; }\n.tx li:nth-child(3) { animation-delay: .6s; }\n.tx li:nth-child(4) { animation-delay: .75s; }";
        let one = found("a.css", rows, "RX-UI-11", "2 elements wait before they move, the last 750 ms");
        assert_eq!(one, vec!["2:23"]);
        assert_eq!(wait(".item { animation-delay: calc(var(--i) * 120ms); }").len(), 1);
        assert_eq!(wait(".item { animation-delay: calc(var(--i) * 40ms); }").len(), 0);
        assert_eq!(wait(".tooltip { transition-delay: 700ms; }").len(), 0);
        assert_eq!(wait(".confirm.is-active .breeze path { animation-delay: 760ms; }").len(), 0);
        assert_eq!(wait(".list li:nth-child(3) .tick svg{animation-delay:1.2s}").len(), 0);
        assert_eq!(found("a.html", "<div class=\"delay-700 transition\">x</div>", "RX-UI-11", "700 ms").len(), 1);
    }

    #[test]
    fn motion_notes_name_a_cut_where_a_short_transition_would_help() {
        let l2 = |raw: &str, ctx: &[(&str, &str)]| found_with("src/Order.tsx", raw, ctx, "RX-UI-11", "motion L2");
        // a flag that shows a part with a cut, in a file with no motion
        assert_eq!(l2("export function Order() { return <div>{open && <ul>...</ul>}</div> }", &[]).len(), 1);
        assert!(l2("export function Order() { return <div className=\"transition-all\">{open && <ul>...</ul>}</div> }", &[]).is_empty());
        // a component counts only when its own file is scanned and has no motion
        assert!(l2("import { Sheet } from 'ui'; export function Order() { return <>{isOpen && <Sheet/>}</> }", &[]).is_empty());
        assert_eq!(l2("export function Order() { return <>{showMap && <MapCard/>}</> }", &[("src/MapCard.tsx", "export function MapCard() { return <div/> }")]).len(), 1);
        assert!(l2("export function Order() { return <>{showMap && <MapCard/>}</> }", &[("src/MapCard.tsx", "export function MapCard() { return <div className=\"animate-in\"/> }")]).is_empty());
        // a test file renders parts to check them, not to show them
        assert!(found_with("src/__tests__/Order.test.tsx", "render(<div>{open && <ul/>}</div>)", &[], "RX-UI-11", "motion L2").is_empty());
        // hover with no transition and plain-page hidden toggles are not notes (owner sheet 12)
        assert!(found("a.tsx", r#"<button className="hover:bg-zinc-50">A</button>"#, "RX-UI-11", "motion").is_empty());
        assert!(found("a.html", "<script>panel.hidden = !panel.hidden</script>", "RX-UI-11", "motion").is_empty());
        // notes carry level note, never warn or fail
        let opts = ScanOptions { folder: false, skip: HashSet::new(), design: None, components: None, context: Vec::new() };
        let all = scan_sources(&[to_source("a.tsx", "export function A() { return <div>{open && <ul/>}</div> }")], opts);
        assert!(all.iter().filter(|f| f["rule"] == "RX-UI-11").all(|f| f["level"] == "note"));
    }

    #[test]
    fn a_count_a_rating_or_a_growth_claim_needs_evidence() {
        let claims = |raw: &str| found("a.html", raw, "RX-AS-01", "");
        for hit in [
            "<p>Dipakai 10.000+ pengguna</p>", "<p>4,000+ teams</p>", "<p>12rb warung</p>", "<p>2 juta unduhan</p>", "<p>1,200 patients</p>",
            "<b>4,9/5</b>", "<span>★ 4.8 dari 2.000 ulasan</span>", "<p>4.9 stars</p>", "<p>Rating 4,8</p>",
            "<p>+38% penjualan</p>", "<p>naik 30%</p>", "<p>up to 2x faster</p>", "<p>98% pelanggan puas</p>", "<p>40% faster reviews</p>",
        ] {
            assert_eq!(claims(hit).len(), 1, "{hit}");
        }
        for quiet in [
            "<p>Free for up to 3 clients</p>", "<p>2 pengguna</p>", "<p>Rp49.000 per bulan</p>", "<p>40% off</p>", "<p>Diskon 40%</p>", "<p>Up to 40% off</p>",
            "<p>Mulai dari Rp10.000</p>", "<p>Paket 4 orang</p>", "<div style=\"width:calc(100% + 12px)\"></div>", "<p>Versi 2.5 rilis</p>",
        ] {
            assert!(claims(quiet).is_empty(), "{quiet}");
        }
        // once per file, naming the first three
        assert_eq!(found("a.html", "<p>10.000+ pengguna</p><p>★ 4,9</p><p>+38%</p><p>naik 30%</p>", "RX-AS-01", "\"10.000+ pengguna\", \"★ 4,9\", \"+38%\", and 1 more: numbers"), vec!["1:4"]);
        assert!(claims("<span class=\"tag\">Contoh</span><p>10.000+ pengguna</p>").is_empty());
        assert!(claims("<p>⚠ Data contoh — ganti dengan angka asli sebelum terbit</p><p>10.000+ pengguna</p>").is_empty());
        // a count with markup between the number and the noun, and a counter a script counts up to
        assert_eq!(claims("<p><strong>1.200+</strong> ulasan</p>").len(), 1);
        assert_eq!(found("a.html", "<b data-target=\"85000\" data-suffix=\"+\">0</b> paket", "RX-AS-01", "\"a counter to 85000+\""), vec!["1:4"]);
        assert_eq!(claims("<b data-target=\"4.8\" data-decimals=\"1\" data-suffix=\"/5\">0</b>").len(), 1);
        assert!(claims("<b data-count=\"3\">0</b> langkah").is_empty());
        assert!(claims("<p>© <span>2026</span> Klinik Gigi Senyum</p>").is_empty());
        // sheet 13: a driver's or shopper's own rating, an order count, a filter chip, a simulation's speed are not claims
        assert!(claims("<div class=\"meta\"><strong>Marco</strong>Silver Toyota Corolla · ★ 4.9</div>").is_empty());
        assert!(claims("<p>Maya · ★ 4.9 · 1,240 orders</p>").is_empty());
        assert!(claims("<button class=\"chip\" data-f=\"rating\" aria-pressed=\"false\">⭐ Rating 4.5+</button>").is_empty());
        assert!(claims("<p class=\"panel-note\">Not part of the app. Simulated time runs 12× faster than real time (1×).</p>").is_empty());
        // an adjective before the noun, across markup (held-out page 2026-11-27)
        assert_eq!(found("a.html", "<div class=\"num\">48.000+</div><div class=\"label\">Active users today</div>", "RX-AS-01", "\"48.000+ Active users\": a number").len(), 1);
        // a bare star by its reviews is still a claim
        assert_eq!(claims("<div><strong>4,8</strong> ★★★★★ <span>dari 1.200 ulasan pasien</span></div>").len(), 1);
        assert!(claims("<p>Contoh: Tebet, Jakarta Selatan</p><p>10.000+ pengguna</p>").len() == 1);
    }

    #[test]
    fn a_testimonial_a_customer_row_or_a_generated_face_needs_evidence() {
        let people = |raw: &str| found("a.html", raw, "RX-AS-02", "");
        assert_eq!(people("<h2>Apa kata mereka</h2><blockquote>Mantap</blockquote>").len(), 1);
        assert_eq!(people("<section class=\"testimonials\"><p>Great</p></section>").len(), 1);
        assert_eq!(people("<h2>What our customers say</h2>").len(), 1);
        assert_eq!(people("<figure><blockquote>\"It just works.\"</blockquote><figcaption><b>Maya</b> Designer</figcaption></figure>").len(), 1);
        assert!(people("<blockquote>A quote with no one named.</blockquote><p>Next section</p>").is_empty());
        assert_eq!(people("<p>Dipercaya oleh 500 klinik</p>").len(), 1);
        assert_eq!(people("<img src=\"https://i.pravatar.cc/80?img=3\">").len(), 1);
        assert_eq!(people("<h2>Testimoni</h2><img src=\"https://randomuser.me/api/portraits/women/4.jpg\">").len(), 2);
        for quiet in ["<div class=\"preview\">x</div>", "<p class=\"review-time\">Review wait time</p>", "<h2>Cara kerja</h2>"] {
            assert!(people(quiet).is_empty(), "{quiet}");
        }
        assert!(people("<span>Sample data</span><h2>Testimoni</h2>").is_empty());
        // a label that says what to replace counts; one only in a comment does not (corpus 2026-11-27, claims2 P1, P4)
        assert!(people("<p>⚠ Testimoni contoh — ganti dengan testimoni asli</p><h2>Testimoni</h2>").is_empty());
        assert_eq!(people("<!-- isi di bawah adalah CONTOH --><h2>Testimoni</h2><p>“Pelayanannya cepat sekali dan dokternya ramah.”</p>").len(), 1);
        // quotes and logos left as stand-ins ask for real proof instead of inventing it
        assert!(people("<h2>Cerita Alumni</h2><p>\"[Kutipan asli alumni: tantangan dan hasil.]\"</p><p>[Nama Alumni]</p>").is_empty());
        assert!(people("<p>Trusted by small businesses like yours</p><div class=\"logo-slot ph\">CUSTOMER LOGO</div>").is_empty());
        assert!(people("<div>Used by <strong data-fill=\"users\"></strong> people</div>").is_empty());
        assert!(people("<figure><blockquote>“[Real customer quote.]”</blockquote><figcaption>[Name]</figcaption></figure>").is_empty());
        // a nav link to the section is not the section (claims2 P8)
        assert!(people("<nav><a href=\"#t\">Testimoni</a></nav><p>[Foto produk]</p><h2 id=\"t\">Kata pelanggan</h2><p>[Kutipan testimoni asli #1]</p>").is_empty());
        // a real-looking quote beside a stand-in is still a quote
        assert_eq!(people("<h2>Testimoni</h2><p>“Dulu saya harus tutup toko sebentar buat ke agen ekspedisi.”</p><p>[Nama]</p>").len(), 1);
    }

    #[test]
    fn a_stand_in_asset_or_a_logo_slot_set_as_text_is_a_placeholder() {
        let placeholder = |raw: &str| found("a.html", raw, "RX-AS-03", "");
        assert_eq!(placeholder("<div class=\"qr\">[QR]</div>"), vec!["1:17"]);
        assert_eq!(placeholder("<span>[icon]</span><div>[FOTO]</div>").len(), 2);
        assert!(found("a.html", "<div>[LOGO]</div>", "RX-AS-03", "a logo slot standing alone").len() == 1);
        // the brand's name in plain text beside the slot is what RX-AS-11 allows
        assert!(found("a.html", "<div class=\"mark\"><span class=\"slot\" title=\"Logo file missing\">[LOGO]</span> RideApp</div>", "RX-AS-03", "logo").is_empty());
        assert!(placeholder("<p>Scan QR untuk bayar</p><p>[1]</p>").is_empty());
    }

    fn button(path: &str, raw: &str) -> Vec<String> {
        found(path, raw, "RX-A11Y-04", "with no type inside a <form>")
    }

    #[test]
    fn a_typeless_button_in_a_form_warns_at_its_tag() {
        let show = "<form>\n  <input type=\"password\" />\n  <button onClick={toggle}>Show</button>\n  <button>Sign in</button>\n</form>";
        assert_eq!(button("a.tsx", show), vec!["3:3"]);
        let html = "<form>\n<input type=password>\n<button onclick=\"t()\">Show</button>\n<button>Sign in</button>\n</form>";
        assert_eq!(button("a.html", html), vec!["3:1"]);
        // with an explicit submit, no typeless button is the submit: each one warns, once
        assert_eq!(button("a.tsx", "<form><button>Add item</button><button>Remove</button><button type=\"submit\">Save</button></form>"), vec!["1:7", "1:32"]);
        assert_eq!(button("a.html", "<form><button>Add item</button><input type=submit value=Save></form>"), vec!["1:7"]);
        // a button deep inside the form's JSX tree still belongs to it
        assert_eq!(button("a.jsx", "<form><Field><div><button onClick={add}>Add</button></div></Field><Button type=\"submit\">Save</Button></form>"), vec!["1:19"]);
    }

    #[test]
    fn a_button_with_a_type_a_spread_or_no_form_is_left_alone() {
        for ok in [
            "<form><button type=\"button\" onClick={t}>Show</button><button type={kind}>Go</button><button type=\"submit\">Sign in</button></form>",
            "<form><button {...props}>Show</button><button type=\"submit\">Go</button></form>",
            // the form's only button, or its last with no click handler, is taken as its submit
            "<form><input /><button>Sign in</button></form>",
            "<form><button type=\"button\">Cancel</button><button>Save</button></form>",
            // no literal <form> in this JSX tree
            "<Form><button onClick={t}>Show</button></Form>",
            "<div><button onClick={t}>Show</button></div>",
            // a form with method="dialog" closes its dialog on purpose; form= points elsewhere
            "<form method=\"dialog\"><button>Close</button><button>OK</button></form>",
            "<form><button form=\"other\" onClick={t}>x</button><button type=\"submit\">Go</button></form>",
        ] {
            assert!(button("a.tsx", ok).is_empty(), "{ok}");
        }
        assert!(button("a.html", "<form><button type=button onclick=t()>Show</button><button>Sign in</button></form>").is_empty());
        assert!(button("a.html", "<form><button {...attrs}>Show</button><button type=submit>Go</button></form>").is_empty());
        assert!(button("a.html", "<button onclick=t()>Show</button>").is_empty());
        // inside a string it is text
        assert!(button("a.tsx", "const s = '<form><button>a</button><button>b</button></form>';").is_empty());
    }

    fn loading(path: &str, raw: &str) -> Vec<String> {
        found(path, raw, "RX-IX-02", "loading indicator")
    }

    #[test]
    fn a_loading_indicator_nothing_announces_warns_once_at_the_first() {
        assert_eq!(loading("a.tsx", "<div>\n  <div className=\"card-skeleton\" />\n  <Spinner />\n</div>"), vec!["2:3"]);
        assert_eq!(loading("a.tsx", "<button disabled={busy}>{busy ? \"Memproses…\" : \"Bayar\"}</button>"), vec!["1:33"]);
        assert_eq!(loading("a.tsx", "const A = () => <p>\n  Loading...\n</p>;"), vec!["2:3"]);
        assert_eq!(loading("a.tsx", "<div className={cn(\"h-4\", busy && \"loading\")} />"), vec!["1:1"]);
        assert_eq!(loading("a.tsx", "import { Loader2 } from \"lucide-react\";\nconst A = () => <Loader2 className=\"animate-spin\" />;"), vec!["2:17"]);
        assert_eq!(loading("a.tsx", "function Spinner() { return null; }\nconst A = () => <Spinner />;"), vec!["2:17"]);
        assert_eq!(loading("a.html", "<p>x</p>\n<div class=\"spinner\"></div><p>Memuat data…</p>"), vec!["2:1"]);
        assert_eq!(loading("a.html", "<loading-dots></loading-dots>"), vec!["1:1"]);
    }

    #[test]
    fn a_loading_indicator_that_is_announced_or_is_not_one_is_left_alone() {
        for ok in [
            "<div aria-busy={busy}><Spinner /></div>",
            "<div className=\"spinner\" role=\"status\" />",
            "<div className=\"spinner\" /><p role=\"alert\">{e}</p>",
            "<div role=\"progressbar\" className=\"loader\" />",
            "<p aria-live=\"polite\">Loading…</p>",
            "<div className=\"skeleton\" /><output>{n}</output>",
            "<progress value={p} />",
            // a kit's Spinner, or this project's own, may announce itself where it is defined
            "import { Spinner } from \"@chakra-ui/react\";\nconst A = () => <Spinner />;",
            "import { SkeletonList } from \"../components\";\nconst A = () => <SkeletonList rows={4} />;",
            "import * as UI from \"@/components/ui\";\nconst A = () => <UI.Spinner />;",
            // words that only contain the letters, attributes, and plain text
            "<img loading=\"lazy\" src={s} alt=\"\" /><div className=\"uploader\" /><p>Loading times vary</p><p aria-label=\"Loading…\">x</p>",
            "const s = '<div className=\"spinner\">';",
        ] {
            assert!(loading("a.tsx", ok).is_empty(), "{ok}");
        }
        assert!(loading("a.html", "<div class=\"spinner\"></div><script>el.setAttribute('aria-busy', 'true')</script>").is_empty());
        assert!(loading("a.html", "<script>const t = 'Loading…'</script><style>.spinner{}</style>").is_empty());
        assert!(loading("a.html", "<div class=spinner></div><script type=module src=./main.js></script>").is_empty());
        // Vue, Svelte, and Astro get no tree checks
        for ext in ["vue", "svelte", "astro"] {
            assert!(loading(&format!("a.{ext}"), "<div class=\"spinner\"></div>").is_empty());
        }
    }

    /// The findings of one rule in one file, with other files the scan may consult but does not report.
    fn found_with(path: &str, raw: &str, context: &[(&str, &str)], rule: &str, says: &str) -> Vec<String> {
        let opts = ScanOptions { folder: false, skip: HashSet::new(), design: None, components: None, context: context.iter().map(|(p, r)| to_source(p, r)).collect() };
        scan_sources(&[to_source(path, raw)], opts)
            .into_iter()
            .filter(|f| f["rule"] == rule && f["message"].as_str().unwrap().contains(says))
            .map(|f| format!("{}:{}", f["line"], f["column"]))
            .collect()
    }

    fn dialog(path: &str, raw: &str) -> Vec<String> {
        found(path, raw, "RX-A11Y-03", "modal dialog")
    }

    fn dialog_says(path: &str, raw: &str, context: &[(&str, &str)]) -> Vec<String> {
        let opts = ScanOptions { folder: false, skip: HashSet::new(), design: None, components: None, context: context.iter().map(|(p, r)| to_source(p, r)).collect() };
        scan_sources(&[to_source(path, raw)], opts)
            .into_iter()
            .filter(|f| f["rule"] == "RX-A11Y-03" && f["message"].as_str().unwrap().contains("modal dialog"))
            .map(|f| f["message"].as_str().unwrap().to_string())
            .collect()
    }

    const ESC: &str = "onKeyDown={(e) => e.key === \"Escape\" && close()}";
    const TAB: &str = "onKeyDown={(e) => e.key === \"Tab\" && keep(e)}";

    #[test]
    fn only_a_modal_dialog_is_judged() {
        // aria-modal, or a scrim around it or just before it; an alert dialog the same way
        assert_eq!(dialog("a.tsx", "<div>\n  <div role=\"dialog\" aria-modal=\"true\">x</div>\n  <div role=\"alertdialog\" aria-modal=\"true\">y</div>\n</div>"), vec!["2:3"]);
        assert_eq!(dialog("a.tsx", "<div role=\"alertdialog\" aria-modal=\"true\">y</div>"), vec!["1:1"]);
        assert_eq!(dialog("a.tsx", "<>\n<div className=\"scrim\" />\n<div role=\"alertdialog\">y</div></>"), vec!["3:1"]);
        assert_eq!(dialog("a.tsx", "<div role=\"dialog\" aria-modal={true}>x</div>"), vec!["1:1"]);
        assert_eq!(dialog("a.tsx", "<div className=\"scrim\" onClick={close}>\n  <div className=\"sheet\" role=\"dialog\">x</div></div>"), vec!["2:3"]);
        assert_eq!(dialog("a.tsx", "<>\n<div className=\"backdrop\" />\n<section role=\"dialog\">x</section></>"), vec!["3:1"]);
        assert_eq!(dialog("a.html", "<div class=\"modal-overlay\" hidden></div>\n<div role=dialog>x</div>"), vec!["2:1"]);
        assert_eq!(dialog("a.html", "<div id=\"backdrop\"><div role=dialog>x</div></div>"), vec!["1:20"]);
        // a panel with no aria-modal and no scrim is not modal: Tab may leave it, and its Close button is the way out
        for ok in [
            "<div role=\"dialog\" aria-label=\"Help\"><button onClick={close}>Close</button></div>",
            "<motion.div role=\"dialog\" onClick={close}>x</motion.div>",
            "<div role=\"dialog\" aria-modal=\"false\">x</div>",
            "<div className=\"card\" /><div role=\"dialog\">x</div>",
            // an inline confirmation in a row or a bar: the page behind stays usable, so Tab may go there
            "<div role=\"alertdialog\" aria-labelledby=\"c\" onKeyDown={(e) => e.key === \"Escape\" && no()} className=\"flex gap-3 rounded-xl p-3\">x</div>",
            "<div role=\"alertdialog\" className=\"fixed inset-x-3 bottom-20 z-30 shadow-2xl\">x</div>",
        ] {
            assert!(dialog("a.tsx", ok).is_empty(), "{ok}");
        }
        assert!(dialog("a.html", "<div id=\"chat\" role=\"dialog\" aria-label=\"Checkout assistant\"><button id=\"chat-close\">x</button></div>").is_empty());
        // a native <dialog>: show() and open are not modal, and showModal() gives Esc and the inert page itself
        assert!(dialog("a.html", "<p>x</p><dialog open>Saved</dialog><script>d.show()</script>").is_empty());
        assert!(dialog("a.html", "<dialog id=d>x</dialog><script>d.showModal()</script>").is_empty());
    }

    #[test]
    fn a_field_has_a_label_tied_to_it() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-FM-01", "no label tied to it");
        // a placeholder is not a label, and text beside a field is not tied to it
        assert_eq!(says("a.tsx", "<form>\n  <input name=\"email\" placeholder=\"Email\" />\n</form>"), vec!["2:3"]);
        assert_eq!(says("a.tsx", "<div><p>Kota</p><select name=\"city\"><option>A</option></select></div>"), vec!["1:17"]);
        assert_eq!(says("a.html", "<label>Catatan</label>\n<textarea name=n></textarea>"), vec!["2:1"]);
        assert_eq!(says("a.html", "<label for=\"a\">A</label><input id=\"b\">"), vec!["1:25"]);
        // one finding per field, so fixing one does not hide the next
        assert_eq!(says("a.tsx", "<>\n<input />\n<input /></>"), vec!["2:1", "3:1"]);
        assert_eq!(says("a.html", "<input name=a>\n<input name=b>"), vec!["1:1", "2:1"]);
        for ok in [
            "<label>Email <input name=\"email\" /></label>",
            "<><label htmlFor=\"e\">Email</label><input id=\"e\" /></>",
            "<input aria-label=\"Cari\" type=\"search\" />",
            "<><span id=\"l\">Nominal</span><input aria-labelledby=\"l\" /></>",
            "<input title=\"Kode\" />",
            "<input {...field} />",
            // ids the parser cannot read: a label may well match
            "<><label htmlFor={id}>Email</label><input id={id} /></>",
            "<input id={`${name}-input`} />",
            // not a field a person types into or picks
            "<input type=\"hidden\" name=\"t\" /><input type=\"submit\" value=\"Kirim\" /><input type=\"button\" value=\"x\" />",
            // a component names its own label
            "<Input label=\"Email\" />",
            // a wrapper component that renders the label for the id
            "<Field label=\"Pemilik\" htmlFor=\"owner\"><input id=\"owner\" /></Field>",
            // not on screen
            "<input type=\"file\" id=\"f\" hidden /><input type=\"file\" aria-hidden=\"true\" tabIndex={-1} />",
            "<input aria-hidden=\"true\" disabled /><input style={{ display: \"none\" }} />",
            // a utility class that sets display none (Tailwind's hidden)
            "<input ref={fileRef} type=\"file\" className=\"hidden\" /><input type=\"file\" className={cn(\"hidden\", x)} />",
            // visibility hidden is off screen too
            "<input className=\"invisible\" />",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
        assert!(says("a.html", "<label for=e>E</label><input id=e>").is_empty());
        assert!(says("a.html", "<label>E <input></label>").is_empty());
        assert!(says("a.html", "<input type=file hidden><input type=file aria-hidden=true tabindex=-1>").is_empty());
        assert!(says("a.html", "<input style=\"display: none\">").is_empty());
        assert!(says("a.html", "<input type=file class=\"hidden\">").is_empty());
        // a class that only contains the word is not it, and sr-only is on the page for a screen reader
        assert_eq!(says("a.tsx", "<input className=\"overflow-hidden\" />"), vec!["1:1"]);
        assert_eq!(says("a.tsx", "<input className=\"sr-only\" />"), vec!["1:1"]);
        // hidden until a breakpoint or state shows it, or hidden only from one size up: on screen at some size
        assert_eq!(says("a.tsx", "<input className=\"hidden md:block\" />"), vec!["1:1"]);
        assert_eq!(says("a.tsx", "<input className=\"hidden peer-checked:flex\" />"), vec!["1:1"]);
        assert_eq!(says("a.tsx", "<input className=\"md:hidden\" />"), vec!["1:1"]);
        assert_eq!(says("a.html", "<input class=\"hidden lg:inline-block\">"), vec!["1:1"]);
        // opacity 0 is still read by a screen reader
        assert_eq!(says("a.tsx", "<input className=\"opacity-0\" />"), vec!["1:1"]);
        // aria-hidden alone hides it from a screen reader, not from the keyboard: still a field with no name
        assert_eq!(says("a.tsx", "<input aria-hidden=\"true\" />"), vec!["1:1"]);
        assert_eq!(says("a.html", "<input aria-hidden=true>"), vec!["1:1"]);
        // a field's id must be the one a label or wrapper names
        assert_eq!(says("a.tsx", "<><Field htmlFor=\"name\"><input id=\"name\" /></Field><input id=\"phone\" /></>"), vec!["1:52"]);
    }

    #[test]
    fn a_link_goes_somewhere() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-IX-12", "goes nowhere");
        assert_eq!(says("a.tsx", "<nav>\n  <a href=\"#\">Promo</a>\n</nav>"), vec!["2:3"]);
        assert_eq!(says("a.tsx", "<a href=\"javascript:void(0)\">x</a>"), vec!["1:1"]);
        assert_eq!(says("a.tsx", "<button onClick={() => {}}>Simpan</button>"), vec!["1:1"]);
        assert_eq!(says("a.html", "<footer><a href=\"#\">Syarat</a></footer>"), vec!["1:9"]);
        for ok in [
            "<a href=\"#\" onClick={open}>Promo</a>",
            "<a href=\"#harga\">Harga</a>",
            "<a href=\"/promo\">Promo</a>",
            "<a {...props} href=\"#\">x</a>",
            "<button onClick={() => setOpen(true)}>Buka</button>",
            "<Link href=\"#\">x</Link>",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
        // a page with a script may give the link its handler
        assert!(says("a.html", "<a href=\"#\" id=\"more\">Lagi</a><script>more.onclick = load</script>").is_empty());
        assert!(says("a.html", "<a href=\"#\">x</a><script src=\"app.js\"></script>").is_empty());
        // a directions preview shows what a call to action would look like; it is not one
        assert!(says("directions.html", "<a class=\"btn\" href=\"#\">Jadwalkan demo</a>").is_empty());
        assert!(says("out/run/directions.html", "<a class=\"btn\" href=\"#\">Download</a>").is_empty());
    }

    #[test]
    fn a_number_field_opens_the_number_keyboard() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-FM-05", "the text keyboard");
        assert_eq!(says("a.tsx", "<label>No. HP <input name=\"phone\" /></label>"), vec!["1:15"]);
        assert_eq!(says("a.tsx", "<label>OTP <input type=\"text\" autoComplete=\"one-time-code\" /></label>"), vec!["1:12"]);
        assert_eq!(says("a.html", "<label>Nominal <input id=\"nominal\" name=\"nominal\"></label>"), vec!["1:16"]);
        assert_eq!(says("a.tsx", "<label>WA <input id=\"whatsappNumber\" /></label>"), vec!["1:11"]);
        for ok in [
            "<input type=\"tel\" name=\"phone\" />",
            "<input inputMode=\"numeric\" name=\"otp\" />",
            "<input type=\"number\" name=\"amount\" />",
            "<input name=\"email\" />",
            "<input name=\"phone\" {...rest} />",
            // a word inside another word is not one
            "<input name=\"telegram\" /><input name=\"description\" />",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
        assert!(says("a.html", "<input name=otp inputmode=numeric>").is_empty());
    }

    #[test]
    fn radio_buttons_for_one_question_have_a_group_name() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-A11Y-04", "radio buttons");
        // each option has its label, but nothing names the question they answer
        assert_eq!(says("a.tsx", "<div>\n  <p>Metode bayar</p>\n  <label><input type=\"radio\" name=\"pay\" /> QRIS</label>\n  <label><input type=\"radio\" name=\"pay\" /> VA</label>\n</div>"), vec!["3:10"]);
        assert_eq!(says("a.html", "<label><input type=radio name=s value=1>1</label><label><input type=radio name=s value=2>2</label>"), vec!["1:8"]);
        for ok in [
            "<fieldset><legend>Metode bayar</legend><label><input type=\"radio\" name=\"pay\" /> QRIS</label><label><input type=\"radio\" name=\"pay\" /> VA</label></fieldset>",
            "<div role=\"radiogroup\" aria-labelledby=\"q\"><label><input type=\"radio\" name=\"pay\" /> QRIS</label><label><input type=\"radio\" name=\"pay\" /> VA</label></div>",
            // one radio of a name, or names the parser cannot read
            "<label><input type=\"radio\" name=\"agree\" /> Ya</label>",
            "<>{opts.map((o) => <label key={o}><input type=\"radio\" name={q.id} /> {o}</label>)}</>",
            // a named group, a named form, or a named landmark that holds only this group
            "<div role=\"group\" aria-label=\"Metode bayar\"><label><input type=\"radio\" name=\"pay\" /> QRIS</label><label><input type=\"radio\" name=\"pay\" /> VA</label></div>",
            "<form aria-label=\"Metode bayar\"><label><input type=\"radio\" name=\"pay\" /> QRIS</label><label><input type=\"radio\" name=\"pay\" /> VA</label></form>",
            "<aside aria-label=\"Status demo\"><h2>Status</h2><form><label><input type=\"radio\" name=\"st\" /> Normal</label><label><input type=\"radio\" name=\"st\" /> Offline</label></form><button>Reset</button></aside>",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
        assert!(says("a.html", "<aside aria-label=\"Status demo\"><label><input type=radio name=st> A</label><label><input type=radio name=st> B</label></aside>").is_empty());
        // a named landmark that holds other fields does not name this group
        assert_eq!(says("a.tsx", "<section aria-label=\"Checkout\"><input aria-label=\"Nama\" /><label><input type=\"radio\" name=\"pay\" /> QRIS</label><label><input type=\"radio\" name=\"pay\" /> VA</label></section>"), vec!["1:66"]);
        assert_eq!(says("a.html", "<main aria-label=\"Checkout\"><input aria-label=\"Nama\"><label><input type=radio name=pay> QRIS</label><label><input type=radio name=pay> VA</label></main>"), vec!["1:61"]);
        // one line per file, saying how many groups it has
        let opts = ScanOptions { folder: false, skip: HashSet::new(), design: None, components: None, context: Vec::new() };
        let two = "<><label><input type=\"radio\" name=\"a\" />1</label><label><input type=\"radio\" name=\"a\" />2</label><label><input type=\"radio\" name=\"b\" />1</label><label><input type=\"radio\" name=\"b\" />2</label></>";
        let m: Vec<String> = scan_sources(&[to_source("a.tsx", two)], opts).into_iter().filter(|f| f["rule"] == "RX-A11Y-04").map(|f| f["message"].as_str().unwrap().to_string()).collect();
        assert_eq!(m.len(), 1);
        assert!(m[0].starts_with("2 groups of radio buttons"), "{}", m[0]);
    }

    #[test]
    fn checkboxes_for_one_question_have_a_group_name() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-A11Y-04", "checkboxes");
        assert_eq!(says("a.tsx", "<div>\n  <p>Minat</p>\n  <label><input type=\"checkbox\" name=\"topic\" /> UI</label>\n  <label><input type=\"checkbox\" name=\"topic\" /> UX</label>\n</div>"), vec!["3:10"]);
        assert_eq!(says("a.html", "<label><input type=checkbox name=t[]>A</label><label><input type=checkbox name=t[]>B</label>"), vec!["1:8"]);
        for ok in [
            "<fieldset><legend>Minat</legend><label><input type=\"checkbox\" name=\"topic\" /> UI</label><label><input type=\"checkbox\" name=\"topic\" /> UX</label></fieldset>",
            // separate yes/no choices each name themselves
            "<label><input type=\"checkbox\" name=\"agree\" /> Setuju</label><label><input type=\"checkbox\" name=\"news\" /> Kabar</label>",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
        // radio buttons are still told apart from checkboxes
        assert!(found("a.tsx", "<><label><input type=\"radio\" name=\"x\" />A</label><label><input type=\"checkbox\" name=\"x\" />B</label></>", "RX-A11Y-04", "radio buttons").is_empty());
    }

    #[test]
    fn a_page_says_its_language() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-A11Y-04", "no lang");
        assert_eq!(says("a.html", "<!doctype html>\n<html>\n<head><title>Bayar</title></head><body>x</body></html>"), vec!["2:1"]);
        assert!(says("a.html", "<!doctype html><html lang=\"id\"><body>x</body></html>").is_empty());
        // a fragment with no <html> is not a page
        assert!(says("a.html", "<div>x</div>").is_empty());
        // a root layout in JSX renders the page's <html>
        assert_eq!(says("app/layout.tsx", "export default function L({ children }) {\n  return <html><body>{children}</body></html>;\n}"), vec!["2:10"]);
        assert!(says("app/layout.tsx", "export default function L({ children }) { return <html lang={locale}><body>{children}</body></html>; }").is_empty());
        // a run's working folder for generated assets is not a page anyone ships
        assert!(says("run/assets-src/sheet.html", "<html><body><img src=a.svg></body></html>").is_empty());
    }

    #[test]
    fn a_button_shown_disabled_says_why() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-IX-12", "disabled");
        assert_eq!(says("a.tsx", "<div>\n  <button disabled>Ekspor PDF</button>\n</div>"), vec!["2:3"]);
        assert_eq!(says("a.html", "<button disabled>Ekspor</button>"), vec!["1:1"]);
        for ok in [
            // a state that changes is not a control shown disabled for good
            "<button disabled={busy}>Simpan</button>",
            "<button disabled title=\"Tersedia setelah verifikasi\">Ekspor</button>",
            "<><button disabled aria-describedby=\"why\">Ekspor</button><p id=\"why\">Tersedia setelah verifikasi</p></>",
            "<button {...rest} disabled>x</button>",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
    }

    #[test]
    fn a_lone_radio_button_has_another_option() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-A11Y-04", "single radio button");
        assert_eq!(says("a.tsx", "<form>\n  <label><input type=\"radio\" name=\"ship\" defaultChecked /> Reguler</label>\n</form>"), vec!["2:10"]);
        assert_eq!(says("a.html", "<label><input type=radio name=ship checked> Reguler</label>"), vec!["1:8"]);
        for ok in [
            "<label><input type=\"radio\" name=\"ship\" /> A</label><label><input type=\"radio\" name=\"ship\" /> B</label>",
            // one radio written once and rendered for each option
            "<>{opts.map((o) => <label key={o}><input type=\"radio\" name=\"ship\" /> {o}</label>)}</>",
            "<input type=\"radio\" name={n} />",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
        // a page with a script may add the other options
        assert!(says("a.html", "<label><input type=radio name=ship> A</label><script>add()</script>").is_empty());
    }

    #[test]
    fn a_link_that_runs_an_action_is_reachable_by_keyboard() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-A11Y-04", "no href");
        assert_eq!(says("a.tsx", "<nav>\n  <a onClick={logout}>Keluar</a>\n</nav>"), vec!["2:3"]);
        assert_eq!(says("a.html", "<a onclick=\"load()\">Muat lagi</a>"), vec!["1:1"]);
        for ok in [
            "<a href=\"/keluar\" onClick={track}>Keluar</a>",
            "<a role=\"button\" tabIndex={0} onClick={logout} onKeyDown={key}>Keluar</a>",
            "<a {...props} onClick={go}>x</a>",
            "<button onClick={logout}>Keluar</button>",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
    }

    #[test]
    fn a_personal_field_lets_the_browser_fill_it() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-FM-05", "stops the browser filling");
        assert_eq!(says("a.tsx", "<label>Email <input type=\"email\" name=\"email\" autoComplete=\"off\" /></label>"), vec!["1:14"]);
        assert_eq!(says("a.tsx", "<label>Alamat <textarea name=\"alamat\" autoComplete=\"off\" /></label>"), vec!["1:15"]);
        assert_eq!(says("a.html", "<label>Nama <input name=\"fullName\" autocomplete=\"off\"></label>"), vec!["1:13"]);
        assert!(says("a.html", "<form action=\"/invite\"><input name=\"email\" autocomplete=\"off\"></form>").is_empty());
        for ok in [
            "<input name=\"email\" autoComplete=\"email\" />",
            "<input name=\"email\" />",
            // not the person's own data
            "<input id=\"key-owner\" autoComplete=\"off\" /><input name=\"productName\" autoComplete=\"off\" /><input name=\"search\" autoComplete=\"off\" />",
            "<input name=\"otp\" autoComplete=\"off\" />",
            // someone else's address: an invite, a recipient, a member
            "<input id=\"invite-email\" name=\"email\" type=\"email\" autoComplete=\"off\" />",
            "<form onSubmit={invite}><label>Email <input name=\"email\" type=\"email\" autoComplete=\"off\" /></label></form>",
            "<input name=\"recipientPhone\" autoComplete=\"off\" />",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
    }

    #[test]
    fn an_invalid_field_is_tied_to_its_error() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-A11Y-07", "aria-invalid");
        assert_eq!(says("a.tsx", "<label>Email\n  <input aria-invalid={!!error} />\n</label>"), vec!["2:3"]);
        assert_eq!(says("a.html", "<label>E <input aria-invalid=\"true\"></label>"), vec!["1:10"]);
        for ok in [
            "<input aria-invalid={!!error} aria-describedby=\"email-error\" />",
            "<input aria-invalid=\"true\" aria-errormessage=\"e\" />",
            "<input aria-invalid=\"false\" />",
            "<input aria-invalid={bad} {...field} />",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
    }

    #[test]
    fn an_inline_confirmation_moves_focus_into_it() {
        let says = |path: &str, raw: &str| found(path, raw, "RX-A11Y-03", "inline confirmation");
        // nothing moves focus in: a screen reader says nothing of it, and a key handler on it never hears a key
        assert_eq!(says("a.tsx", "<div>\n  <div role=\"alertdialog\" aria-labelledby=\"c\"><p id=\"c\">Delete?</p><button onClick={no}>Cancel</button></div>\n</div>"), vec!["2:3"]);
        assert_eq!(says("a.html", "<div role=alertdialog><p>Delete?</p><button>Cancel</button></div>"), vec!["1:1"]);
        // once per file
        assert_eq!(says("a.tsx", "<>\n<div role=\"alertdialog\">a</div>\n<div role=\"alertdialog\">b</div></>"), vec!["2:1"]);
        for ok in [
            // focus moves to one of its buttons, or a script moves it
            "<div role=\"alertdialog\"><button onClick={no}>Cancel</button><Button autoFocus onClick={yes}>Delete</Button></div>",
            "<div role=\"alertdialog\" ref={box} tabIndex={-1}>x</div>; useEffect(() => box.current?.focus(), []);",
            // a modal one is the modal dialog check's, and a dialog that is not an alert is a panel
            "<div role=\"alertdialog\" aria-modal=\"true\">x</div>",
            "<div role=\"dialog\">x</div>",
        ] {
            assert!(says("a.tsx", ok).is_empty(), "{ok}");
        }
        assert!(says("a.html", "<div role=alertdialog><button autofocus>Cancel</button></div>").is_empty());
        assert!(says("a.html", "<div id=c role=alertdialog>x</div><script>c.querySelector('button').focus()</script>").is_empty());
        // a script the scan cannot read may move it
        assert!(says("a.html", "<div role=alertdialog>x</div><script src=\"https://cdn.example.com/a.js\"></script>").is_empty());
        let opts = ScanOptions { folder: false, skip: HashSet::new(), design: None, components: None, context: Vec::new() };
        let messages: Vec<String> = scan_sources(&[to_source("a.tsx", "<div role=\"alertdialog\">x</div>")], opts)
            .into_iter()
            .filter(|f| f["rule"] == "RX-A11Y-03")
            .map(|f| f["message"].as_str().unwrap().to_string())
            .collect();
        assert_eq!(messages, vec!["an inline confirmation (role=\"alertdialog\") that nothing moves focus into: a screen reader announces it only when focus moves inside, and its key handlers hear keys only then; when it opens, put focus on one of its buttons (autoFocus, or .focus() from a script)"]);
    }

    #[test]
    fn a_modal_dialog_needs_both_esc_and_tab_kept_inside() {
        let m = |attrs: &str| format!("<div role=\"dialog\" aria-modal=\"true\" {attrs}>x</div>");
        assert_eq!(dialog_says("a.tsx", &m(""), &[]), vec!["a modal dialog that does not close on Esc and does not keep Tab inside it: close it on Esc and keep focus inside it while it is open (showModal() on a <dialog> does both), or use a dialog component that does"]);
        assert_eq!(dialog_says("a.tsx", &m(ESC), &[]), vec!["a modal dialog that closes on Esc but lets Tab move to the page behind it: keep focus inside it while it is open (showModal() on a <dialog> does both), or use a dialog component that does"]);
        assert_eq!(dialog_says("a.tsx", &m(TAB), &[]), vec!["a modal dialog that keeps Tab inside but does not close on Esc: close it on Esc too (showModal() on a <dialog> does both), or use a dialog component that does"]);
        // a key handler for another key is neither, and a cancel prop is a button's handler, not Esc
        assert_eq!(dialog("a.tsx", &m("onKeyDown={(e) => e.key === \"Enter\" && go()}")).len(), 1);
        assert!(dialog_says("a.tsx", &format!("<div className=\"sheet-scrim\" onClick={{onCancel}}>{}</div>", m("onCancel={onCancel}")), &[])[0].contains("does not close on Esc and does not keep Tab"));
        // "desc" and "escrow" are not Esc
        assert_eq!(dialog("a.tsx", &format!("const desc = escrow; const a = {};", m(TAB))).len(), 1);
        for esc in [
            ESC.to_string(),
            "onKeyDown={(e) => { if (e.keyCode === 27) close(); }}".into(),
            "onKeyDown={(e) => e.which == 27 && close()}".into(),
        ] {
            for tab in [TAB, "onKeyUp={(e) => e.keyCode === 9 && keep(e)}", "data-x={trapFocus}", "data-x={useFocusTrap}"] {
                let ok = format!("<div role=\"dialog\" aria-modal=\"true\" {esc} {tab}>x</div>");
                assert!(dialog("a.tsx", &ok).is_empty(), "{ok}");
            }
        }
        for ok in [
            format!("useHotkeys('esc', close); const t = useFocusTrap(); const a = {};", m("")),
            format!("useEscapeKey(close); const a = <><main inert={{open}} />{}</>;", m("")),
            format!("import FocusTrap from \"focus-trap-react\";\nconst a = <FocusTrap>{}</FocusTrap>;", m("")),
            format!("import * as Dialog from \"@radix-ui/react-dialog\";\nconst a = {};", m("")),
            format!("import {{ Dialog }} from \"@headlessui/react\";\nconst a = {};", m("")),
            format!("import {{ Drawer }} from \"vaul\";\nconst a = {};", m("")),
            format!("import {{ Modal }} from \"react-aria-components\";\nconst a = {};", m("")),
            // a component with a dialog role is the component's business
            "<Sheet role=\"dialog\" aria-modal=\"true\">x</Sheet>".into(),
            "<Dialog open={o}>x</Dialog>".into(),
            // a dialog in a string is text
            "const s = '<div role=\"dialog\" aria-modal=\"true\">';".into(),
        ] {
            assert!(dialog("a.tsx", &ok).is_empty(), "{ok}");
        }
        assert_eq!(dialog("a.html", "<div role=dialog aria-modal=true>x</div><script>open()</script>").len(), 1);
        assert_eq!(dialog("a.html", "<div role=dialog aria-modal=true>x</div><script>addEventListener('keydown', (e) => { if (e.key === 'Escape') close() })</script>").len(), 1);
        assert!(dialog("a.html", "<div role=dialog aria-modal=true>x</div><script>addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); if (e.key === 'Tab') keep(e) })</script>").is_empty());
        for ext in ["vue", "svelte", "astro"] {
            assert!(dialog(&format!("a.{ext}"), "<div role=\"dialog\" aria-modal=\"true\">x</div>").is_empty());
        }
    }

    const PAGE: &str = "<div class=\"scrim\" hidden></div>\n<section role=\"dialog\" aria-modal=\"true\" hidden></section>\n<script src=\"js/app.js\"></script>";

    #[test]
    fn a_page_is_judged_with_the_scripts_it_loads_from_the_project() {
        let both = "document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); if (e.key === 'Tab') trap(e); });";
        let esc = "document.addEventListener('keydown', e => { if (e.key === 'Escape' && S.modal) closeModal(); });";
        assert!(dialog_says("site/index.html", PAGE, &[("site/js/app.js", both)]).is_empty());
        assert_eq!(dialog_says("site/index.html", PAGE, &[("site/js/app.js", esc)]).len(), 1);
        assert!(dialog_says("site/index.html", PAGE, &[("site/js/app.js", esc)])[0].contains("lets Tab move"));
        assert_eq!(dialog_says("site/index.html", PAGE, &[("site/js/app.js", "open();")]).len(), 1);
        // paths: ./, ../, a query string, and a path written with backslashes
        let at = |src: &str, file: &str| dialog_says("site/pages/a.html", &PAGE.replace("js/app.js", src), &[(file, esc)]).len();
        assert_eq!(at("./app.js?v=2", "site/pages/app.js"), 1);
        assert_eq!(at("../js/app.js", "site/js/app.js"), 1);
        assert_eq!(dialog_says("site\\pages\\a.html", &PAGE.replace("js/app.js", "../js/app.js"), &[("site\\js\\app.js", esc)]).len(), 1);
        // a script the scan cannot read keeps the page quiet: not given, from another site, or from the site root
        assert!(dialog_says("site/index.html", PAGE, &[]).is_empty());
        assert!(dialog_says("site/index.html", PAGE, &[("site/js/other.js", esc)]).is_empty());
        for src in ["https://cdn.example.com/app.js", "//cdn.example.com/app.js", "/js/app.js"] {
            assert!(dialog_says("site/index.html", &PAGE.replace("js/app.js", src), &[("site/js/app.js", esc)]).is_empty(), "{src}");
        }
        // every script it loads is read, and one it cannot read keeps it quiet
        let two = PAGE.replace("<script src=\"js/app.js\"></script>", "<script src=\"js/a.js\"></script><script src=\"js/b.js\"></script>");
        assert!(dialog_says("site/index.html", &two, &[("site/js/a.js", "esc();"), ("site/js/b.js", "if (e.key === 'Tab') trap(e);")]).is_empty());
        assert!(dialog_says("site/index.html", &two, &[("site/js/a.js", esc)]).is_empty());
        // the scripts also settle the wait
        let wait = "<div class=\"spinner\"></div><script type=module src=\"./main.js\"></script>";
        assert_eq!(found_with("a.html", wait, &[("main.js", "render();")], "RX-IX-02", "loading indicator"), vec!["1:1"]);
        assert!(found_with("a.html", wait, &[("main.js", "el.setAttribute('aria-busy', 'true')")], "RX-IX-02", "loading indicator").is_empty());
        assert!(found_with("a.html", wait, &[], "RX-IX-02", "loading indicator").is_empty());
    }

    const SKELETON: &str = "export function Skeleton({ width }: { width?: string }) {\n  return <span className=\"skeleton\" style={{ width }} aria-hidden=\"true\" />;\n}\n\nexport function SkeletonList({ rows = 3 }) {\n  return (\n    <div aria-busy=\"true\" aria-label=\"Memuat\">\n      {Array.from({ length: rows }, (_, i) => <Skeleton key={i} />)}\n    </div>\n  );\n}\n";

    #[test]
    fn an_imported_loading_component_is_judged_by_its_own_markup() {
        let home = |name: &str, from: &str| format!("import {{ Card, {name} }} from \"{from}\";\nexport const Home = () => <Card>{{b === null ? <{name} /> : b}}</Card>;");
        let kit = [("src/components/index.ts", "export * from \"./Card\";\nexport { Skeleton, SkeletonList } from \"./Skeleton\";\n"), ("src/components/Skeleton.tsx", SKELETON), ("src/components/Card.tsx", "export const Card = (p) => <div {...p} />;")];
        let ix = |raw: &str, ctx: &[(&str, &str)]| found_with("src/screens/Home.tsx", raw, ctx, "RX-IX-02", "loading indicator");
        // the Skeleton itself is aria-hidden with nothing announcing the wait; SkeletonList carries aria-busy
        assert_eq!(ix(&home("Skeleton", "../components"), &kit), vec!["2:47"]);
        assert!(ix(&home("SkeletonList", "../components"), &kit).is_empty());
        // straight from its file, under another name, and through `export *`
        assert_eq!(ix(&home("Skeleton", "../components/Skeleton"), &kit), vec!["2:47"]);
        assert_eq!(ix("import { Skeleton as BalanceSkeleton } from \"../components\";\nexport const A = () => <BalanceSkeleton />;", &kit), vec!["2:24"]);
        let star = [("src/components/index.ts", "export * from \"./Skeleton\";"), ("src/components/Skeleton.tsx", SKELETON)];
        assert_eq!(ix(&home("Skeleton", "../components"), &star), vec!["2:47"]);
        // the screen announcing the wait itself keeps it quiet
        assert!(ix("import { Skeleton } from \"../components\";\nexport const A = () => <div aria-busy={busy}><Skeleton /></div>;", &kit).is_empty());
        // a component the scan cannot find stays uncounted: not given, a package, or an alias
        assert!(ix(&home("Skeleton", "../components"), &[]).is_empty());
        assert!(ix(&home("Skeleton", "@/components"), &kit).is_empty());
        assert!(ix("import { Spinner } from \"@chakra-ui/react\";\nconst A = () => <Spinner />;", &kit).is_empty());
        let gone = [("src/components/index.ts", "export { Skeleton } from \"./Missing\";")];
        assert!(ix(&home("Skeleton", "../components"), &gone).is_empty());
    }

    #[test]
    fn the_scan_names_the_files_it_would_read() {
        let page = to_source("site/pages/a.html", "<script src=\"../js/app.js?v=1\"></script><script src=\"https://x.io/a.js\"></script><script src=\"/root.js\"></script>");
        assert_eq!(references(&[page], false), vec!["site/js/app.js"]);
        let home = to_source("src/screens/Home.tsx", "import { Card, Skeleton } from \"../components\";\nimport { Spinner } from \"@chakra-ui/react\";\nimport { go } from \"./nav\";\nconst A = () => <Card><Skeleton /><Spinner /></Card>;");
        let want = references(&[home], false);
        assert!(want.contains(&"src/components.tsx".to_string()) && want.contains(&"src/components/index.ts".to_string()), "{want:?}");
        assert!(!want.iter().any(|p| p.contains("nav") || p.contains("chakra")), "{want:?}");
        // a module that re-exports names the files it re-exports from
        let index = to_source("src/components/index.ts", "export * from \"./Card\";\nexport { Skeleton } from \"./Skeleton\";\nexport { x } from \"pkg\";");
        assert!(references(std::slice::from_ref(&index), false).is_empty());
        let want = references(&[index], true);
        assert!(want.contains(&"src/components/Skeleton.tsx".to_string()) && want.contains(&"src/components/Card.tsx".to_string()), "{want:?}");
        assert!(!want.iter().any(|p| p.contains("pkg")), "{want:?}");
    }

    fn rupiah(path: &str, raw: &str) -> Vec<String> {
        found(path, raw, "RX-CD-02", "")
    }

    #[test]
    fn a_comment_marker_inside_a_string_is_text_not_a_comment() {
        // a route or a glob holds "/*"; the code after it is still read
        assert_eq!(rupiah("a.tsx", "<Route path=\"/docs/*\" element={<Docs />} />;\nconst p = <p>Rp 10.000,00</p>;\n/** helper */\nexport const x = 1;"), vec!["2:14"]);
        assert_eq!(rupiah("a.ts", "const g = \"src/**/*.ts\";\nconst p = \"Rp 10.000,00\";\n/* end */"), vec!["2:12"]);
        // "//" in a string is text too
        assert_eq!(rupiah("a.ts", "const u = \"a // Rp 10.000,00\";"), vec!["1:17"]);
        // real comments are still not read, and columns after them do not move
        assert!(rupiah("a.tsx", "/* Rp 10.000,00 */\n// Rp 10.000,00\nconst A = () => <p>{/* Rp 10.000,00 */}</p>;").is_empty());
        assert_eq!(rupiah("a.ts", "/* é */ const p = \"Rp 10.000,00\";"), vec!["1:20"]);
        // a file the parser cannot read still has its comments blanked
        assert!(rupiah("a.ts", "const = ;\n// Rp 10.000,00").is_empty());
    }

    #[test]
    fn a_page_reads_css_and_scripts_by_their_own_comment_syntax() {
        // "//" in CSS is a URL, not a comment
        assert_eq!(rupiah("a.html", "<style>.a{background:url(//cdn.x/a.png)} .b{}</style><p>Rp 10.000,00</p>"), vec!["1:57"]);
        assert_eq!(rupiah("a.vue", "<template><p>Rp 10.000,00</p></template>\n<style>.a{background:url(//cdn.x/a.png)}</style>"), vec!["1:14"]);
        // a script's string holds "/*"
        assert_eq!(rupiah("a.html", "<script>const r = \"/docs/*\";</script>\n<p>Rp 10.000,00</p>\n<script>/* x */</script>"), vec!["2:4"]);
        // comments are still blanked in each part
        assert!(rupiah("a.html", "<!-- <p>Rp 10.000,00</p> -->\n<style>/* Rp 10.000,00 */</style>\n<script>// Rp 10.000,00\n</script>").is_empty());
        // SCSS and Less have line comments
        assert!(rupiah("a.vue", "<style lang=\"scss\">\n// Rp 10.000,00\n</style>").is_empty());
        assert!(rupiah("a.scss", "// Rp 10.000,00").is_empty());
    }

    #[test]
    fn ryux_ignore_skips_only_the_rules_it_names() {
        let price = "<p>Rp 10.000,00 <img src=\"a.png\" /></p>";
        let rules = |raw: &str| -> Vec<String> {
            let opts = ScanOptions { folder: false, skip: HashSet::new(), design: None, components: None, context: Vec::new() };
            let mut r: Vec<String> = scan_sources(&[to_source("a.tsx", raw)], opts).into_iter().map(|f| f["rule"].as_str().unwrap().to_string()).collect();
            r.dedup();
            r
        };
        let all = rules(price);
        assert!(all.contains(&"RX-CD-02".to_string()) && all.len() > 1, "{all:?}");
        let rest: Vec<String> = all.iter().filter(|r| *r != "RX-CD-02").cloned().collect();
        for note in [
            "{/* ryux-ignore RX-CD-02 harga dari API */}",
            "{/* ryux-ignore: RX-CD-02 harga dari API */}",
            "{/* ryux-ignore rx-cd-02 */}",
            "{/* ryux-ignore (harga dari API) RX-CD-02 */}",
        ] {
            assert_eq!(rules(&format!("{note}\n{price}")), rest, "{note}");
        }
        // no ID: every rule, as before
        assert!(rules(&format!("{{/* ryux-ignore harga dari API */}}\n{price}")).is_empty());
        // the words in code or text are not a note
        for text in ["const help = \"add ryux-ignore to skip a line\";", "<div data-ryux-ignore>"] {
            assert_eq!(rules(&format!("{text}\n{price}")), all, "{text}");
        }
    }

    #[test]
    fn a_link_target_is_not_a_colour() {
        let one_off = |raw: &str| found("a.tsx", raw, "RX-DS-03", "one-off");
        assert!(one_off("<a href=\"#add\">a</a><a href='#bad'>b</a><use xlink:href=\"#fee\" /><Link to=\"#cafe\" /><p style={{ fill: \"url(#dad)\" }} />").is_empty());
        assert_eq!(one_off("const a = { color: \"#add\", bg: \"#bad\", border: \"#fee\" };").len(), 1);
    }

    #[test]
    fn font_size_zero_hides_text_and_is_not_small_text() {
        assert!(found("a.tsx", "const s = { fontSize: 0 };", "RX-A11Y-02", "").is_empty());
        assert!(found("a.css", ".a{font-size:0px}", "RX-A11Y-02", "").is_empty());
        assert_eq!(found("a.css", ".a{font-size:10px}", "RX-A11Y-02", "").len(), 1);
    }

    #[test]
    fn a_byte_order_mark_does_not_move_the_first_line() {
        assert_eq!(rupiah("a.ts", "\u{FEFF}const p = \"Rp 10.000,00\";"), vec!["1:12"]);
        assert_eq!(rupiah("a.ts", "\u{FEFF}\nconst p = \"Rp 10.000,00\";"), vec!["2:12"]);
    }

    #[test]
    fn words_split_at_case_digits_and_punctuation() {
        assert_eq!(
            markup::words("LoadingSkeleton Loader2 KEY_ESCAPE onEscapeKeyDown HTMLDialog"),
            vec!["loading", "skeleton", "loader", "key", "escape", "on", "escape", "key", "down", "html", "dialog"]
        );
    }

    /// RX-DS-01 findings over a folder, as "file:line message-start".
    fn ds01(files: &[(&str, &str)]) -> Vec<String> {
        let sources: Vec<Source> = files.iter().map(|(p, r)| to_source(p, r)).collect();
        let opts = ScanOptions { folder: true, skip: HashSet::new(), design: None, components: None, context: Vec::new() };
        scan_syntax(&sources, opts).into_iter().filter(|f| f["rule"] == "RX-DS-01").map(|f| format!("{}:{} {}", f["file"].as_str().unwrap(), f["line"], &f["message"].as_str().unwrap()[..24])).collect()
    }

    #[test]
    fn ds01_same_control_written_again_in_several_files() {
        let btn = r#"<button className="rounded-lg bg-lime-300 px-4 py-2 text-slate-900">Save</button>"#;
        let a = format!("export const A = () => <div>{btn}{btn}</div>;");
        let b = format!("export const B = () => <form>{btn}</form>;");
        // once per file, at the first copy
        assert_eq!(ds01(&[("src/a.tsx", &a), ("src/b.tsx", &b)]), vec!["src/a.tsx:1 this <button> is written", "src/b.tsx:1 this <button> is written"]);
        // class order does not matter; cn("..") and template text are read
        let b2 = r#"export const B = () => <button className={cn("px-4 py-2 rounded-lg", "text-slate-900 bg-lime-300", on && "ring")}>Go</button>;"#;
        assert_eq!(ds01(&[("src/a.tsx", &a), ("src/b.tsx", b2)]).len(), 2);
        // two copies, or all copies in one file: not flagged
        assert!(ds01(&[("src/a.tsx", &format!("const A = () => <>{btn}</>;")), ("src/b.tsx", &b)]).is_empty());
        assert!(ds01(&[("src/a.tsx", &format!("const A = () => <>{btn}{btn}{btn}</>;"))]).is_empty());
        // the component itself, a story, separate apps in a monorepo, and semantic classes: not copies
        assert!(ds01(&[("components/ui/a.tsx", &a), ("components/ui/b.tsx", &b)]).is_empty());
        assert!(ds01(&[("apps/web/a.tsx", &a), ("apps/admin/b.tsx", &b)]).is_empty());
        let sem = r#"<button className="btn btn-primary">Save</button>"#;
        assert!(ds01(&[("a.tsx", &format!("const A = () => <>{sem}{sem}</>;")), ("b.tsx", &format!("const B = () => {sem};"))]).is_empty());
        // a list rendered with map is written once
        assert!(ds01(&[("a.tsx", &format!("const A = () => items.map((i) => {btn});")), ("b.tsx", &b)]).is_empty());
    }

    #[test]
    fn ds01_button_fill_written_by_hand() {
        let comp = r#"const buttonVariants = cva("inline-flex rounded-md", { variants: { variant: { default: "bg-primary text-primary-foreground hover:bg-primary/90", outline: "border" } } });
export function Button(props) { return <button className={cn(buttonVariants())} {...props} />; }"#;
        let page = r#"export const P = () => <div><button className="bg-primary text-primary-foreground rounded-md px-3 py-1.5">Run</button><button className="hover:bg-muted rounded-md px-3 py-1.5 text-muted-foreground">Chip</button><Button>Ok</Button></div>;"#;
        assert_eq!(ds01(&[("components/ui/button.tsx", comp), ("app/page.tsx", page)]), vec!["app/page.tsx:1 a <button> styled by han"]);
        // a Button with a plain fill on its own <button>
        let own = r#"export function Button({ children }) { return <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">{children}</button>; }"#;
        let page2 = r#"export const P = () => <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">Buy</button>;"#;
        assert_eq!(ds01(&[("src/Button.jsx", own), ("src/Page.jsx", page2)]), vec!["src/Page.jsx:1 a <button> styled by han"]);
        // no Button component: nothing to bypass
        assert!(ds01(&[("app/page.tsx", page)]).is_empty());
    }

    /// RX-DS-01 findings for files scanned on their own, with the rest of the project as context (the edit hook).
    fn ds01_edited(edited: &[(&str, &str)], project: &[(&str, &str)]) -> Vec<String> {
        let sources: Vec<Source> = edited.iter().map(|(p, r)| to_source(p, r)).collect();
        let opts = ScanOptions { folder: false, skip: HashSet::new(), design: None, components: None, context: project.iter().map(|(p, r)| to_source(p, r)).collect() };
        scan_syntax(&sources, opts).into_iter().filter(|f| f["rule"] == "RX-DS-01").map(|f| format!("{}:{} {}", f["file"].as_str().unwrap(), f["line"], &f["message"].as_str().unwrap()[..24])).collect()
    }

    #[test]
    fn ds01_input_border_written_by_hand() {
        let comp = r#"const Input = React.forwardRef(({ className, ...props }, ref) => <input className={cn("flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1", className)} ref={ref} {...props} />);
export { Input };"#;
        let page = r#"export const P = () => <form><input className="w-full rounded-md border border-input px-3 py-2" /><Input /></form>;"#;
        assert_eq!(ds01(&[("components/ui/input.tsx", comp), ("app/page.tsx", page)]), vec!["app/page.tsx:1 an <input> styled by han"]);
        // its own colours do not make it a different control
        let own = r#"export const P = () => <input className="rounded-full border border-slate-300 px-4 py-2" />;"#;
        assert_eq!(ds01(&[("components/ui/input.tsx", comp), ("app/search.tsx", own)]), vec!["app/search.tsx:1 an <input> styled by han"]);
        // unstyled or hidden inputs (a file picker, a checkbox) are not copies
        let hidden = r#"export const P = () => <><input type="file" className="hidden" /><input type="checkbox" className="size-4" /></>;"#;
        assert!(ds01(&[("components/ui/input.tsx", comp), ("app/upload.tsx", hidden)]).is_empty());
        // no Input in the project: a styled input is not bypassing anything
        assert!(ds01(&[("app/search.tsx", own)]).is_empty());
    }

    #[test]
    fn ds01_edited_file_against_the_project() {
        let btn = r#"<button className="rounded-lg bg-lime-300 px-4 py-2 text-slate-900">Save</button>"#;
        let a = format!("export const A = () => <div>{btn}{btn}</div>;");
        let b = format!("export const B = () => <form>{btn}</form>;");
        // only the edited file is reported; the project files are read, not reported
        assert_eq!(ds01_edited(&[("src/b.tsx", &b)], &[("src/a.tsx", &a)]), vec!["src/b.tsx:1 this <button> is written"]);
        let comp = r#"export function Button({ children }) { return <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">{children}</button>; }"#;
        let page = r#"export const P = () => <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">Buy</button>;"#;
        assert_eq!(ds01_edited(&[("src/Page.jsx", page)], &[("src/Button.jsx", comp)]), vec!["src/Page.jsx:1 a <button> styled by han"]);
        // with nothing else to compare against, a lone file is quiet
        assert!(ds01_edited(&[("src/b.tsx", &a)], &[]).is_empty());
    }

    #[test]
    fn ds01_copies_follow_the_users_choice() {
        let btn = r#"<button className="rounded-lg bg-lime-300 px-4 py-2 text-slate-900">Save</button>"#;
        let a = format!("export const A = () => <div>{btn}{btn}</div>;");
        let b = format!("export const B = () => <form>{btn}</form>;");
        let with = |components: Option<&str>| {
            let sources = vec![to_source("src/a.tsx", &a), to_source("src/b.tsx", &b)];
            let opts = ScanOptions { folder: true, skip: HashSet::new(), design: None, components: components.map(String::from), context: Vec::new() };
            scan_syntax(&sources, opts).into_iter().filter(|f| f["rule"] == "RX-DS-01").map(|f| (f["level"].as_str().unwrap().to_string(), f["message"].as_str().unwrap().to_string())).collect::<Vec<_>>()
        };
        // undecided: ask the user, with the three options
        let (level, msg) = &with(None)[0];
        assert_eq!(level, "warn");
        assert!(msg.contains("ask the user to choose") && msg.contains("Storybook") && msg.contains("ryux components --set"), "{msg}");
        assert!(with(Some("extract"))[0].1.contains("(DESIGN.md: Components: extract). Build it from `ryux components --inventory`"));
        assert!(with(Some("Storybook (the user's choice, 2026-11-28)"))[0].1.contains("a story for each state"));
        // later: the scan stays quiet
        assert!(with(Some("later")).is_empty());
        // a field still holding its hint is undecided
        assert!(with(Some("(extract, storybook, or later)"))[0].1.contains("ask the user"));
    }

    #[test]
    fn qa08_button_that_does_nothing() {
        let dead = |raw: &str| crate::jsx::dead_buttons(raw, "tsx").len();
        assert_eq!(dead(r#"const A = () => <div><button className="px-3">Share</button></div>;"#), 1);
        // wired, or acted for
        for ok in [
            r#"const A = () => <button onClick={go}>Go</button>;"#,
            r#"const A = () => <button type="submit">Go</button>;"#,
            r#"const A = () => <form action={save}><button>Save</button></form>;"#,
            r#"const A = () => <DialogTrigger asChild><button>Open</button></DialogTrigger>;"#,
            r#"const A = () => <SignInButton mode="modal"><button>Sign in</button></SignInButton>;"#,
            r#"const A = () => <Link href="/x"><button>Next</button></Link>;"#,
            r#"const A = () => <button disabled>Soon</button>;"#,
            r#"const A = (p) => <button {...p}>Go</button>;"#,
            r#"const A = () => <button id="menu">Menu</button>;"#,
            r#"const A = () => <button ref={r}>Menu</button>;"#,
            r#"const A = () => <button type="button" onFocus={hot} onPointerEnter={hot}>Pin</button>;"#,
            r#"const A = () => <li onClick={pick}><button>Pick</button></li>;"#,
        ] {
            assert_eq!(dead(ok), 0, "{ok}");
        }
        // reported through the scan, not in a story
        let src = r#"export const A = () => <button className="rounded px-3 py-1">Export</button>;"#;
        let opts = || ScanOptions { folder: false, skip: HashSet::new(), design: None, components: None, context: Vec::new() };
        assert_eq!(scan_syntax(&[to_source("src/a.tsx", src)], opts()).iter().filter(|f| f["rule"] == "RX-QA-08").count(), 1);
        assert_eq!(scan_syntax(&[to_source("src/a.stories.tsx", src)], opts()).iter().filter(|f| f["rule"] == "RX-QA-08").count(), 0);
    }

    #[test]
    fn inventory_lists_what_the_component_must_carry_and_verify_checks_it() {
        let a = r#"export const A = () => <form>
<button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white">Save</button>
<button onClick={go} className="rounded-lg bg-blue-600 px-4 py-2 text-white">Go</button>
</form>;"#;
        let b = r#"export const B = () => <div>
<button onClick={x} disabled={busy} className="rounded-lg bg-blue-600 px-4 py-2 text-white">Send</button>
<button onClick={y} className="rounded-lg bg-blue-600 px-3 py-1.5 text-white">Small</button>
</div>;"#;
        let before = inventory(&[to_source("src/a.tsx", a), to_source("src/b.tsx", b)]);
        let g = &before["groups"][0];
        assert_eq!(g["count"], 4);
        assert_eq!(g["files"], json!(["src/a.tsx", "src/b.tsx"]));
        assert_eq!(g["variants"][0]["changes"], json!(["px-4 → px-3", "py-2 → py-1.5"]));
        assert_eq!(g["variants"][0]["kind"], "size");
        // a variant three changes from the base, one from the small variant, is described against that one
        let c = r#"export const C = () => <div><button onClick={z} className="rounded bg-blue-600 px-3 py-1.5 text-white">Tiny</button></div>;"#;
        let chained = inventory(&[to_source("src/a.tsx", a), to_source("src/b.tsx", b), to_source("src/c.tsx", c)]);
        let tiny = chained["groups"][0]["variants"].as_array().unwrap().iter().find(|v| v["at"][0] == "src/c.tsx:1").cloned().unwrap();
        assert_eq!(tiny["changes"], json!(["rounded-lg → rounded"]));
        assert_eq!(tiny["from"], "bg-blue-600 px-3 py-1.5 rounded-lg text-white");
        let prop = |n: &str| g["props"].as_array().unwrap().iter().find(|p| p["name"] == n).cloned().unwrap();
        assert_eq!(prop("type")["values"], json!(["\"submit\""]));
        assert_eq!(prop("onClick")["copies"], 3);
        let missing: Vec<&str> = g["missing"].as_array().unwrap().iter().map(|m| m.as_str().unwrap()).collect();
        assert!(missing.iter().any(|m| m.starts_with("focus-visible")) && missing.iter().any(|m| m.starts_with("disabled")), "{missing:?}");
        // nothing changed: every copy is still there
        let same = verify(&before, &[to_source("src/a.tsx", a), to_source("src/b.tsx", b)]);
        assert_eq!(same["ok"], false);
        assert_eq!(same["groups"][0]["copies_left"].as_array().unwrap().len(), 4, "the variant too");
        // a refactor that keeps every prop
        let a2 = r#"export const A = () => <form><Button type="submit">Save</Button><Button onClick={go}>Go</Button></form>;"#;
        let b2 = r#"export const B = () => <div><Button onClick={x} disabled={busy}>Send</Button><Button size="sm" onClick={y}>Small</Button></div>;"#;
        assert_eq!(verify(&before, &[to_source("src/a.tsx", a2), to_source("src/b.tsx", b2)])["ok"], true);
        // one that drops type="submit"
        let a3 = r#"export const A = () => <form><Button>Save</Button><Button onClick={go}>Go</Button></form>;"#;
        let lost = verify(&before, &[to_source("src/a.tsx", a3), to_source("src/b.tsx", b2)]);
        assert_eq!(lost["ok"], false);
        let props: Vec<&str> = lost["groups"][0]["lost"].as_array().unwrap().iter().map(|l| l["prop"].as_str().unwrap()).collect();
        assert_eq!(props, vec!["type", "type=\"submit\""]);
    }
}
