//! Checks that read JSX and TSX as a syntax tree (oxc), where a pattern over the text cannot tell an element
//! from a string, or a prop from text. engine.ts runs them through `syntaxScan`.

use crate::jsre::u16_at;
use oxc_allocator::Allocator;
use oxc_ast::ast::{JSXAttributeItem, JSXAttributeName, JSXAttributeValue, JSXChild, JSXElement, JSXElementName, JSXOpeningElement};
use oxc_ast_visit::{walk, Visit};
use oxc_parser::Parser;
use oxc_span::{GetSpan, SourceType};

/// Props that start a drag.
const DRAG: [&str; 4] = ["onPointerDown", "onMouseDown", "onTouchStart", "onDragStart"];
thread_local! {
    /// `{(e) => e.preventDefault()}` or `{e => { e.preventDefault(); e.stopPropagation(); }}`, and nothing else.
    static ONLY_DEFAULT: regex::Regex = regex::Regex::new(r"^\{\s*(?:\(\s*\w*\s*(?::\s*[\w.<>]+)?\s*\)|\w+)\s*=>\s*\{?\s*(?:\w+\.(?:preventDefault|stopPropagation)\(\)\s*;?\s*)+\}?\s*\}$").unwrap();
}
/// Props that give an element a keyboard way, or a role that says what it is.
const KEYBOARD: [&str; 4] = ["onKeyDown", "onKeyUp", "tabIndex", "role"];
/// Native controls: the browser gives them keyboard behaviour.
const NATIVE: [&str; 5] = ["a", "button", "input", "select", "textarea"];

/// An element that starts a drag and has no keyboard way: its UTF-16 offset, tag, and the prop.
pub struct Drag {
    pub index: usize,
    pub tag: String,
    pub via: String,
}

struct Finder<'s> {
    src: &'s str,
    found: Vec<Drag>,
}

impl<'a> Visit<'a> for Finder<'_> {
    fn visit_jsx_opening_element(&mut self, el: &JSXOpeningElement<'a>) {
        // Lowercase names are DOM elements; a component (Slider, Sheet) may handle the keyboard itself.
        if let JSXElementName::Identifier(id) = &el.name {
            let tag = id.name.as_str();
            let mut names = Vec::new();
            let mut spread = false;
            for a in &el.attributes {
                match a {
                    JSXAttributeItem::Attribute(at) => {
                        if let JSXAttributeName::Identifier(n) = &at.name {
                            let name = n.name.as_str();
                            // a handler written in place that only keeps the press from doing its default (focus,
                            // text selection) does not start a drag: (e) => e.preventDefault()
                            let only_default = at.value.as_ref().is_some_and(|v| ONLY_DEFAULT.with(|re| re.is_match(&self.src[v.span().start as usize..v.span().end as usize])));
                            if DRAG.contains(&name) && name != "onDragStart" && only_default {
                                continue;
                            }
                            names.push(name);
                        }
                    }
                    // {...bind()} may carry the keyboard props: not this check's call
                    JSXAttributeItem::SpreadAttribute(_) => spread = true,
                }
            }
            if !NATIVE.contains(&tag) && !spread && !names.iter().any(|n| KEYBOARD.contains(n)) {
                if let Some(via) = names.iter().find(|n| DRAG.contains(n)) {
                    self.found.push(Drag { index: u16_at(self.src, el.span().start as usize), tag: tag.to_string(), via: via.to_string() });
                }
            }
        }
        walk::walk_jsx_opening_element(self, el);
    }
}

/// Elements in a .jsx or .tsx file that start a drag with no keyboard way. A file that does not parse
/// gives what the parser could still read.
pub fn drag_without_keyboard(raw: &str, ext: &str) -> Vec<Drag> {
    let alloc = Allocator::default();
    let kind = if ext == "tsx" { SourceType::tsx() } else { SourceType::jsx() };
    let ret = Parser::new(&alloc, raw, kind).parse();
    let mut f = Finder { src: raw, found: Vec::new() };
    f.visit_program(&ret.program);
    f.found
}

/// A native control styled in place: its UTF-16 offset, tag, and its static classes, sorted and without repeats.
pub struct Control {
    pub index: usize,
    pub tag: String,
    pub classes: Vec<String>,
    /// Its props other than className, key, ref, and style, as (name, value): `true` for a bare prop, `"text"` for a
    /// string, `{…}` for an expression, and `{...spread}` for spread props.
    pub attrs: Vec<(String, String)>,
    /// What it holds: text, icon+text, icon, expression, or none.
    pub content: &'static str,
    /// The catalog component it most likely is (button, field, card, alert, badge, tabs, dialog, dropdown-menu,
    /// empty-state, icon-tile, code-block), from its tag, classes, role, and children; None when nothing tells.
    pub kind: Option<&'static str>,
}

/// Elements a hand-built component is usually made of (a card, an alert, a badge), besides the native controls.
const BOXES: [&str; 8] = ["div", "section", "article", "li", "span", "aside", "header", "nav"];

/// A guess at which catalog component an element is. Only signals that held on the corpus (2026-11-28, 77
/// projects) decide; a padded box with children that matches nothing sharper is a card or panel.
fn kind_of(tag: &str, classes: &[String], attrs: &[(String, String)], kids: &[String], text: usize) -> Option<&'static str> {
    use std::sync::OnceLock;
    static RES: OnceLock<Vec<regex::Regex>> = OnceLock::new();
    let res = RES.get_or_init(|| {
        [
            r"^bg-(?:red|rose|yellow|amber|green|emerald|blue|sky|orange|teal|destructive|success|warning|info|danger|error)(?:-(?:50|100|500|900))?(?:/(?:\d+|\[[\d.]+\]))?$",
            r"^border(?:-\d)?$|^border-[a-z]+-\d{3}(?:/\d+)?$|^border-(?:destructive|success|warning|info)",
            r"^p-(?:1|1\.5|2|2\.5|3|4)$",
            r"^px-(?:1|1\.5|2|2\.5|3|4)$",
            r"^text-(?:xs|\[1\d(?:\.\d)?px\])$",
            r"^py-(?:8|10|12|16|20)$",
            r"^p-(?:3|4|5|6|8)$|^px-(?:4|5|6)$",
        ]
        .iter()
        .map(|r| regex::Regex::new(r).unwrap())
        .collect()
    });
    let has = |i: usize| classes.iter().any(|c| res[i].is_match(bare(c)));
    let is = |n: &str| classes.iter().any(|c| bare(c) == n);
    let role = attrs.iter().find(|(k, _)| k == "role").map(|(_, v)| v.trim_matches('"')).unwrap_or("");
    let icon = |k: &str| k.starts_with(|c: char| c.is_ascii_uppercase()) || k == "svg" || k == "img";
    match tag {
        "button" | "a" => return Some("button"),
        "input" | "select" | "textarea" => return Some("field"),
        _ => {}
    }
    if role == "dialog" || role == "alertdialog" || attrs.iter().any(|(k, _)| k == "aria-modal") || (is("fixed") && is("inset-0")) {
        return Some("dialog");
    }
    // a menu: a role, a floating list anchored to its trigger, a tight column panel, or an item lit on hover and focus
    let state_bg = |state: &str| classes.iter().any(|c| c.strip_prefix(state).is_some_and(|b| b.starts_with("bg-")));
    if matches!(role, "menu" | "listbox" | "menuitem" | "option")
        || (is("absolute") && classes.iter().any(|c| bare(c).starts_with("shadow")) && (is("top-full") || is("right-0") || is("left-0") || classes.iter().any(|c| { let b = bare(c); b.starts_with("mt-") && b[3..].chars().all(|x| x.is_ascii_digit()) })))
        || (is("flex-col") && (is("space-y-1") || is("space-y-0.5") || is("gap-1") || is("gap-0.5")) && (is("p-1") || is("p-1.5") || is("p-2")))
        || (is("cursor-pointer") && state_bg("hover:") && (state_bg("focus:") || state_bg("focus-visible:")))
    {
        return Some("dropdown-menu");
    }
    if role == "tablist" || (is("flex") && is("p-1") && is("gap-1")) {
        return Some("tabs");
    }
    if is("font-mono") || matches!(kids.first().map(String::as_str), Some("pre" | "code")) {
        return Some("code-block");
    }
    if role == "alert" || role == "status" || (has(0) && has(1) && (kids.first().is_some_and(|k| icon(k)) || kids.len() <= 1 || kids.iter().any(|k| k == "button"))) {
        return Some("alert");
    }
    if kids.len() == 1 && icon(&kids[0]) && text == 0 && has(2) {
        return Some("icon-tile");
    }
    if (tag == "span" || (tag == "div" && kids.is_empty())) && classes.iter().any(|c| bare(c).starts_with("rounded")) && has(3) && (has(4) || is("rounded-full")) && kids.len() <= 1 && text <= 30 {
        return Some("badge");
    }
    if is("text-center") && has(5) {
        return Some("empty-state");
    }
    if matches!(tag, "div" | "article" | "section" | "li") && has(6) && !kids.is_empty() {
        return Some("card");
    }
    None
}

struct Controls<'s> {
    src: &'s str,
    found: Vec<Control>,
    /// Keep controls with any class text, not only the styled ones (a component's own element).
    all: bool,
    /// What the elements around the current one give a button: a form (it submits), a link or an asChild trigger
    /// (the wrapper acts), or a click handler (the click reaches it).
    around: Vec<bool>,
    /// The <button>s that do nothing when pressed, by offset.
    dead: Vec<usize>,
}

/// The name an element is written with: button, Link, Dialog.Trigger.
fn element_name(n: &JSXElementName) -> String {
    match n {
        JSXElementName::Identifier(id) => id.name.to_string(),
        JSXElementName::IdentifierReference(id) => id.name.to_string(),
        JSXElementName::NamespacedName(x) => format!("{}:{}", x.namespace.name, x.name.name),
        JSXElementName::MemberExpression(m) => format!("{}.{}", element_name_member(&m.object), m.property.name),
        JSXElementName::ThisExpression(_) => "this".into(),
    }
}

fn element_name_member(o: &oxc_ast::ast::JSXMemberExpressionObject) -> String {
    use oxc_ast::ast::JSXMemberExpressionObject as O;
    match o {
        O::IdentifierReference(id) => id.name.to_string(),
        O::MemberExpression(m) => format!("{}.{}", element_name_member(&m.object), m.property.name),
        O::ThisExpression(_) => "this".into(),
    }
}

/// An element's props as (name, value), className, key, ref, and style left out.
fn attributes(el: &JSXOpeningElement) -> Vec<(String, String)> {
    el.attributes.iter().filter_map(|a| match a {
        JSXAttributeItem::SpreadAttribute(_) => Some(("{...spread}".to_string(), "{...spread}".to_string())),
        JSXAttributeItem::Attribute(at) => {
            let name = match &at.name {
                JSXAttributeName::Identifier(n) => n.name.to_string(),
                JSXAttributeName::NamespacedName(n) => format!("{}:{}", n.namespace.name, n.name.name),
            };
            if matches!(name.as_str(), "className" | "class" | "key" | "ref" | "style") {
                return None;
            }
            let value = match &at.value {
                None => "true".to_string(),
                Some(JSXAttributeValue::StringLiteral(s)) => format!("\"{}\"", s.value.as_str().unwrap_or("")),
                Some(_) => "{…}".to_string(),
            };
            Some((name, value))
        }
    }).collect()
}

/// What an element holds: an icon (a component, svg, or img) with text, an icon alone, text, an expression, or none.
fn content_of(el: &JSXElement) -> &'static str {
    let (mut text, mut icon, mut expr) = (false, false, false);
    for c in &el.children {
        match c {
            JSXChild::Text(t) if !t.value.trim().is_empty() => text = true,
            JSXChild::Element(e) => {
                let n = element_name(&e.opening_element.name);
                if n.starts_with(|c: char| c.is_ascii_uppercase()) || matches!(n.as_str(), "svg" | "img") { icon = true } else { text = true }
            }
            JSXChild::Fragment(_) => text = true,
            JSXChild::ExpressionContainer(x) if !matches!(x.expression, oxc_ast::ast::JSXExpression::EmptyExpression(_)) => expr = true,
            _ => {}
        }
    }
    match (icon, text || expr) {
        (true, true) => "icon+text",
        (true, false) => "icon",
        _ if text => "text",
        _ if expr => "expression",
        _ => "none",
    }
}

/// Props that make a button do something itself, or hand its press to the page.
/// A button that answers hover or focus (lights a pin, opens a preview) is wired too, even with nothing on press.
const ACTS: [&str; 17] = ["onClick", "onMouseDown", "onMouseUp", "onPointerDown", "onPointerUp", "onTouchStart", "onTouchEnd", "onKeyDown", "onFocus", "onPointerEnter", "onMouseEnter", "onContextMenu", "onDoubleClick", "formAction", "form", "popoverTarget", "commandfor"];

impl<'a> Visit<'a> for Controls<'_> {
    fn visit_jsx_element(&mut self, it: &JSXElement<'a>) {
        let el = &it.opening_element;
        let tag = element_name(&el.name);
        let attrs = attributes(el);
        let has = |n: &str| attrs.iter().any(|(k, _)| k == n);
        if tag == "button" {
            let typed = attrs.iter().any(|(k, v)| k == "type" && (v == "\"submit\"" || v == "\"reset\"" || v == "{…}"));
            // an id or a ref can get a listener from a script; a disabled button is not pressed
            let wired = ACTS.iter().any(|a| has(a)) || has("{...spread}") || has("id") || has("disabled") || typed;
            let ref_given = el.attributes.iter().any(|a| matches!(a, JSXAttributeItem::Attribute(at) if matches!(&at.name, JSXAttributeName::Identifier(n) if n.name == "ref")));
            if !wired && !ref_given && !self.around.iter().any(|x| *x) {
                self.dead.push(u16_at(self.src, el.span().start as usize));
            }
        }
        let is_box = !self.all && BOXES.contains(&tag.as_str());
        if NATIVE.contains(&tag.as_str()) || is_box {
            let class = el.attributes.iter().find_map(|a| match a {
                JSXAttributeItem::Attribute(at) => match &at.name {
                    JSXAttributeName::Identifier(n) if matches!(n.name.as_str(), "className" | "class") => at.value.as_ref().and_then(class_text),
                    _ => None,
                },
                _ => None,
            });
            if let Some(text) = class {
                let mut classes: Vec<String> = text.split_whitespace().map(str::to_string).collect();
                classes.sort();
                classes.dedup();
                if self.all || if is_box { box_styled(&classes) } else { styled(&classes) } {
                    let kids: Vec<String> = it.children.iter().filter_map(|c| match c {
                        JSXChild::Element(e) => Some(element_name(&e.opening_element.name)),
                        _ => None,
                    }).collect();
                    let text: usize = it.children.iter().map(|c| match c {
                        JSXChild::Text(t) => t.value.trim().chars().count(),
                        _ => 0,
                    }).sum();
                    let kind = kind_of(&tag, &classes, &attrs, &kids, text);
                    self.found.push(Control { index: u16_at(self.src, el.span().start as usize), tag: tag.clone(), classes, attrs: attrs.clone(), content: content_of(it), kind });
                }
            }
        }
        // a form submits a button in it; a link, an asChild trigger, a label, or a click handler around it acts for it
        // SignInButton, Dialog.Close, AlertDialogAction wrap a plain <button> and give it their own handler
        let wrapper = tag.starts_with(|c: char| c.is_ascii_uppercase()) && ["Button", "Trigger", "Close", "Action", "Link"].iter().any(|w| tag.ends_with(w));
        let gives = tag == "form" || tag == "a" || tag == "label" || wrapper || has("asChild") || has("onClick");
        self.around.push(gives);
        walk::walk_jsx_element(self, it);
        self.around.pop();
    }
}

/// The static class text of a className: "a b", {`a ${x} b`} (the fixed parts), or {cn("a", x && "b")} (the string
/// arguments); None for a value the scan cannot read (a variable, buttonVariants()).
fn class_text(v: &oxc_ast::ast::JSXAttributeValue) -> Option<String> {
    use oxc_ast::ast::{Expression, JSXAttributeValue};
    fn of(e: &Expression) -> Option<String> {
        match e {
            Expression::StringLiteral(s) => s.value.as_str().map(str::to_string),
            Expression::TemplateLiteral(t) => Some(t.quasis.iter().map(|q| q.value.raw.as_str()).collect::<Vec<_>>().join(" ")),
            Expression::CallExpression(c) => {
                let parts: Vec<String> = c.arguments.iter().filter_map(|a| a.as_expression()).filter_map(|e| match e {
                    Expression::StringLiteral(_) | Expression::TemplateLiteral(_) => of(e),
                    _ => None,
                }).collect();
                (!parts.is_empty()).then(|| parts.join(" "))
            }
            _ => None,
        }
    }
    match v {
        JSXAttributeValue::StringLiteral(s) => s.value.as_str().map(str::to_string),
        JSXAttributeValue::ExpressionContainer(c) => c.expression.as_expression().and_then(of),
        _ => None,
    }
}

/// A class with its variant prefixes (hover:, md:, dark:) taken off.
pub fn bare(c: &str) -> &str {
    c.rsplit(':').next().unwrap_or(c)
}

/// A colour value in a utility class: a hex, a palette step (slate-900), or a theme token (primary, input, ring).
const COLOUR_VALUE: &str = r"(?:\[#[0-9a-fA-F]{3,8}\]|(?:primary|secondary|accent|destructive|muted|foreground|background|input|ring|card|popover|border|white|black|[a-z]+-\d{2,3})(?:-foreground)?(?:/\d+)?)";

/// Utility classes that make a control look like one on their own: a colour (background, text, or border), a
/// corner radius, and padding. A semantic class (btn-primary) is already reuse, and is not counted.
/// A box (div, span, li...) styled as a component: a background or border colour, a corner radius, and padding. A
/// text colour alone does not make a box look like one.
fn box_styled(classes: &[String]) -> bool {
    thread_local! {
        static FILL: regex::Regex = regex::Regex::new(&format!(r"^(?:bg|border)-{COLOUR_VALUE}$")).unwrap();
    }
    styled(classes) && classes.iter().any(|c| FILL.with(|r| r.is_match(bare(c))))
}

fn styled(classes: &[String]) -> bool {
    thread_local! {
        static COLOUR: regex::Regex = regex::Regex::new(&format!(r"^(?:bg|text|border)-{COLOUR_VALUE}$")).unwrap();
        static PAD: regex::Regex = regex::Regex::new(r"^p[xytblrse]?-").unwrap();
    }
    let has = |f: &dyn Fn(&str) -> bool| classes.iter().any(|c| f(bare(c)));
    has(&|c| COLOUR.with(|r| r.is_match(c))) && has(&|c| c == "rounded" || c.starts_with("rounded-")) && has(&|c| PAD.with(|r| r.is_match(c)))
}

/// The native controls (button, a, input, select, textarea) in a .jsx or .tsx file styled in place with utility
/// classes: a colour, a radius, and padding. A file that does not parse gives what the parser could still read.
pub fn styled_controls(raw: &str, ext: &str) -> Vec<Control> {
    controls(raw, ext, false)
}

fn controls(raw: &str, ext: &str, all: bool) -> Vec<Control> {
    let alloc = Allocator::default();
    let kind = if ext == "tsx" { SourceType::tsx() } else { SourceType::jsx() };
    let ret = Parser::new(&alloc, raw, kind).parse();
    let mut f = Controls { src: raw, found: Vec::new(), all, around: Vec::new(), dead: Vec::new() };
    f.visit_program(&ret.program);
    f.found
}

/// The <button>s in a .jsx or .tsx file that do nothing when pressed (RX-QA-08): no click or key handler, no
/// type="submit" or "reset", no spread props, id, or ref a script could wire, not disabled, and no form, link,
/// label, asChild trigger, or click handler around it.
pub fn dead_buttons(raw: &str, ext: &str) -> Vec<usize> {
    let alloc = Allocator::default();
    let kind = if ext == "tsx" { SourceType::tsx() } else { SourceType::jsx() };
    let ret = Parser::new(&alloc, raw, kind).parse();
    let mut f = Controls { src: raw, found: Vec::new(), all: false, around: Vec::new(), dead: Vec::new() };
    f.visit_program(&ret.program);
    f.dead
}

/// How often each prop is written in a file, by name and by name with its string value (type and type="email"), on
/// any element: what a refactor that replaces copies with a component must keep passing.
pub fn prop_counts(raw: &str, ext: &str) -> std::collections::HashMap<String, usize> {
    struct Props(std::collections::HashMap<String, usize>);
    impl<'a> Visit<'a> for Props {
        fn visit_jsx_opening_element(&mut self, el: &JSXOpeningElement<'a>) {
            for (k, v) in attributes(el) {
                *self.0.entry(k.clone()).or_default() += 1;
                if v.starts_with('"') {
                    *self.0.entry(format!("{k}={v}")).or_default() += 1;
                }
            }
            walk::walk_jsx_opening_element(self, el);
        }
    }
    let alloc = Allocator::default();
    let kind = if ext == "tsx" { SourceType::tsx() } else { SourceType::jsx() };
    let ret = Parser::new(&alloc, raw, kind).parse();
    let mut p = Props(Default::default());
    p.visit_program(&ret.program);
    p.0
}

/// A form component a project defines, and the class that marks its look: Button's fill, Input's border.
pub struct Signature {
    /// The component's name (Button, Input, Select, Textarea).
    pub component: &'static str,
    /// The native element it renders.
    pub tag: &'static str,
    /// The class that marks its look; empty when its element has none (an Input styled by a variable).
    pub class: String,
}

/// The form components a file defines (export function Input, export const Button, const Textarea = forwardRef,
/// or a file named button.tsx, input.tsx), each with the class that marks its look: the default variant's
/// background in a cva() or variants table for Button, else the first background or border colour on its own
/// element. Hover and other states are not the look; white, black, and transparent are too common to mark one.
pub fn signatures(path: &str, raw: &str) -> Vec<Signature> {
    const KINDS: [(&str, &str); 4] = [("Button", "button"), ("Input", "input"), ("Select", "select"), ("Textarea", "textarea")];
    thread_local! {
        static DEFAULT: regex::Regex = regex::Regex::new(r#"\bdefault\s*:\s*["'`]([^"'`]*)["'`]"#).unwrap();
        static MARK: regex::Regex = regex::Regex::new(&format!(r"^(?:bg|border)-{COLOUR_VALUE}$")).unwrap();
    }
    let file = path.rsplit('/').next().unwrap_or(path).to_lowercase();
    let ext = if file.ends_with(".tsx") { "tsx" } else { "jsx" };
    let mut own: Option<Vec<Control>> = None;
    let mut out = Vec::new();
    for (component, tag) in KINDS {
        let defines = regex::Regex::new(&format!(r"\bexport\s+(?:default\s+)?(?:const|function)\s+{component}\b|\bconst\s+{component}\s*=\s*(?:React\.)?forwardRef")).unwrap();
        if !(file.starts_with(&format!("{}.", tag)) || defines.is_match(raw)) {
            continue;
        }
        let bg_only = tag == "button";
        let mark = |text: &str| {
            text.split_whitespace()
                .filter(|c| !c.contains(':') && MARK.with(|r| r.is_match(c)) && (!bg_only || c.starts_with("bg-")))
                .find(|c| !matches!(c.split_once('-').map(|x| x.1).unwrap_or(""), "white" | "black" | "background" | "transparent"))
                .map(str::to_string)
        };
        let from_default = if bg_only { DEFAULT.with(|r| r.captures_iter(raw).find_map(|m| mark(&m[1]))) } else { None };
        let class = from_default.or_else(|| {
            own.get_or_insert_with(|| controls(raw, ext, true)).iter().filter(|c| c.tag == tag).find_map(|c| mark(&c.classes.join(" ")))
        });
        // a Button is known by its fill (raw chips and toolbar buttons are fine); any styled input, select, or
        // textarea beside an Input, Select, or Textarea is one written again, whatever its colours
        match class {
            Some(class) => out.push(Signature { component, tag, class }),
            None if !bg_only => out.push(Signature { component, tag, class: String::new() }),
            None => {}
        }
    }
    out
}

/// A finding from the code checks: offset, rule, message.
pub struct Smell {
    pub index: usize,
    pub rule: &'static str,
    pub message: String,
}

/// Calls whose value comes from outside the component: an effect that makes one is syncing, not copying.
/// A ref or a motion value (.current, .get()) is read outside React's render too.
const OUTSIDE: [&str; 11] = ["fetch(", "await", "=>", "setTimeout", "setInterval", "localStorage", "sessionStorage", "window.", "document.", ".current", ".get("];

struct Smells<'s> {
    src: &'s str,
    ts: bool,
    ui: bool,
    catches: Vec<(usize, u32, u32)>,
    /// Each any: UTF-16 offset and byte offset.
    anys: Vec<(usize, usize)>,
    out: Vec<Smell>,
}

impl<'a> Visit<'a> for Smells<'_> {
    fn visit_catch_clause(&mut self, c: &oxc_ast::ast::CatchClause<'a>) {
        if c.body.body.is_empty() {
            self.catches.push((u16_at(self.src, c.span.start as usize), c.body.span.start, c.body.span.end));
        }
        walk::walk_catch_clause(self, c);
    }

    fn visit_ts_any_keyword(&mut self, k: &oxc_ast::ast::TSAnyKeyword) {
        if self.ts {
            self.anys.push((u16_at(self.src, k.span.start as usize), k.span.start as usize));
        }
    }

    fn visit_call_expression(&mut self, c: &oxc_ast::ast::CallExpression<'a>) {
        use oxc_ast::ast::{Argument, Expression, Statement};
        let callee = &self.src[c.callee.span().start as usize..c.callee.span().end as usize];
        // console.log left in a component: debugging output (warn and error report real problems)
        if self.ui && matches!(callee, "console.log" | "console.debug" | "console.info" | "console.dir" | "console.table") {
            self.out.push(Smell { index: u16_at(self.src, c.span.start as usize), rule: "RX-FE-07", message: format!("{callee}() left in UI code: remove debugging output before it ships (console.warn and console.error for real problems stay)") });
        }
        // useEffect(() => { setFull(first + " " + last) }, [first, last]): a value copied into state
        if matches!(callee, "useEffect" | "React.useEffect") && c.arguments.len() == 2 {
            let deps = matches!(&c.arguments[1], Argument::ArrayExpression(a) if !a.elements.is_empty());
            use oxc_ast::ast::ArrowFunctionBody;
            // the expressions the effect runs: each statement must be one, or the arrow's body is one
            let mut exprs: Vec<&Expression> = Vec::new();
            let mut plain = true;
            let stmts = match &c.arguments[0] {
                Argument::ArrowFunctionExpression(f) => match &f.body {
                    ArrowFunctionBody::FunctionBody(b) => Some(&b.statements),
                    other => {
                        exprs.push(other.as_expression().unwrap());
                        None
                    }
                },
                Argument::FunctionExpression(f) => f.body.as_ref().map(|b| &b.statements),
                _ => {
                    plain = false;
                    None
                }
            };
            for st in stmts.into_iter().flatten() {
                match st {
                    Statement::ExpressionStatement(e) => exprs.push(&e.expression),
                    _ => plain = false,
                }
            }
            let copies = deps && plain && !exprs.is_empty() && exprs.iter().all(|e| match e {
                Expression::CallExpression(call) => {
                    let name = &self.src[call.callee.span().start as usize..call.callee.span().end as usize];
                    let args = &self.src[call.span.start as usize..call.span.end as usize];
                    name.len() > 3 && name.starts_with("set") && name[3..].starts_with(|ch: char| ch.is_ascii_uppercase()) && call.arguments.len() == 1 && !OUTSIDE.iter().any(|o| args.contains(o))
                }
                _ => false,
            });
            {
                if copies {
                    self.out.push(Smell { index: u16_at(self.src, c.span.start as usize), rule: "RX-FE-13", message: "an effect that only sets state from props or other state: a value that can be computed is computed while rendering (const total = …); state that resets when a prop changes gets a key on the component or is adjusted during render. The effect adds a render and shows the old value first (react.dev, You Might Not Need an Effect)".into() });
                }
            }
        }
        walk::walk_call_expression(self, c);
    }
}

/// The code checks over a script or component: an empty catch (RX-FE-05), `any` in TypeScript, console.log left
/// in a component, a lint or type directive with no reason (RX-FE-07), and an effect that only copies a value into
/// state (RX-FE-13). A file that does not parse gives nothing.
pub fn code_smells(raw: &str, ext: &str) -> Vec<Smell> {
    let kind = match ext {
        "tsx" => SourceType::tsx(),
        "jsx" => SourceType::jsx(),
        "ts" | "mts" | "cts" => SourceType::ts(),
        "js" | "mjs" | "cjs" => SourceType::mjs(),
        _ => return Vec::new(),
    };
    let alloc = Allocator::default();
    let ret = Parser::new(&alloc, raw, kind).parse();
    if ret.fatal_error {
        return Vec::new();
    }
    let ts = matches!(ext, "ts" | "tsx" | "mts" | "cts");
    let mut f = Smells { src: raw, ts, ui: matches!(ext, "jsx" | "tsx"), catches: Vec::new(), anys: Vec::new(), out: Vec::new() };
    f.visit_program(&ret.program);
    let comments: Vec<(u32, &str)> = ret.program.comments.iter().map(|c| { let sp = c.content_span(); (c.span.start, &raw[sp.start as usize..sp.end as usize]) }).collect();
    for (at, start, end) in f.catches {
        if !comments.iter().any(|(c, _)| *c > start && *c < end) {
            f.out.push(Smell { index: at, rule: "RX-FE-05", message: "an empty catch: the error disappears and nothing says the call failed; handle it, show it, or rethrow, or write in the block why it is safe to ignore".into() });
        }
    }
    // an any the line before or the line itself excuses with a no-explicit-any directive (whose reason the
    // directive check asks for), or a file-wide disable, is not counted again
    let line_of = |b: usize| raw[..b].matches('\n').count();
    let excused: Vec<(usize, bool)> = comments.iter().filter(|(_, t)| t.contains("no-explicit-any")).map(|(c, t)| (line_of(*c as usize), t.trim().starts_with("eslint-disable-next-line"))).collect();
    let file_wide = comments.iter().any(|(_, t)| { let t = t.trim(); t.starts_with("eslint-disable ") && t.contains("no-explicit-any") });
    let anys: Vec<usize> = f.anys.iter().filter(|(_, b)| {
        let l = line_of(*b);
        !file_wide && !excused.iter().any(|(cl, next)| if *next { *cl + 1 == l } else { *cl == l })
    }).map(|(u, _)| *u).collect();
    if let Some(&first) = anys.first() {
        let n = anys.len();
        f.out.push(Smell { index: first, rule: "RX-FE-07", message: format!("{n} use{} of any in this file: it turns off type checking for the value; describe its shape with a type, or take unknown and narrow it", if n == 1 { "" } else { "s" }) });
    }
    for (start, text) in comments {
        let t = text.trim().trim_start_matches('*').trim();
        let lint = t.starts_with("eslint-disable") && !t.contains(" -- ");
        let tsdir = (t.starts_with("@ts-ignore") || t.starts_with("@ts-expect-error") || t.starts_with("@ts-nocheck")) && t.split_whitespace().count() < 2 && !t.contains(':');
        if lint || tsdir {
            let what = t.split_whitespace().next().unwrap_or(t);
            f.out.push(Smell { index: u16_at(raw, start as usize), rule: "RX-FE-07", message: format!("{what} with no reason: say why after it ({})", if lint { "eslint-disable-next-line no-console -- prints the CLI's result" } else { "@ts-expect-error the library's types miss the size prop" }) });
        }
    }
    f.out.sort_by_key(|s| s.index);
    f.out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn boxes_get_a_kind_from_their_classes_and_children() {
        let kind = |src: &str| styled_controls(src, "tsx").into_iter().map(|c| format!("{}:{}", c.tag, c.kind.unwrap_or("-"))).collect::<Vec<_>>();
        assert_eq!(kind(r#"const A = () => <div className="rounded-lg border border-red-200 bg-red-50 p-4"><AlertCircle /><p>Gagal</p></div>;"#), vec!["div:alert"]);
        assert_eq!(kind(r#"const A = () => <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">Lunas</span>;"#), vec!["span:badge"]);
        assert_eq!(kind(r#"const A = () => <div className="rounded-lg bg-blue-100 p-3"><Target /></div>;"#), vec!["div:icon-tile"]);
        assert_eq!(kind(r#"const A = () => <div className="rounded-lg bg-gray-900 p-4 font-mono"><code>npm i</code></div>;"#), vec!["div:code-block"]);
        assert_eq!(kind(r#"const A = () => <div className="fixed inset-0 rounded-none bg-black/50 p-4"><div>x</div></div>;"#), vec!["div:dialog"]);
        assert_eq!(kind(r#"const A = () => <div className="rounded-xl bg-white p-6 shadow-sm"><h3>Saldo</h3><p>Rp1.250.000</p></div>;"#), vec!["div:card"]);
        assert_eq!(kind(r#"const A = () => <button className="rounded-lg bg-blue-600 px-4 py-2 text-white">Simpan</button>;"#), vec!["button:button"]);
        // a menu: its panel and its items (chatbot-ui's pickers), a role, or an anchored floating list
        assert_eq!(kind(r#"const A = () => <div className="bg-background flex flex-col space-y-1 rounded-xl border-2 p-2 text-sm">{list}</div>;"#), vec!["div:dropdown-menu"]);
        assert_eq!(kind(r#"const A = () => <div tabIndex={0} onClick={pick} className="hover:bg-accent focus:bg-accent flex cursor-pointer items-center rounded p-2 focus:outline-none"><div>{name}</div></div>;"#), vec!["div:dropdown-menu"]);
        assert_eq!(kind(r#"const A = () => <ul role="menu" className="rounded-md bg-white p-1"><li>Ubah</li></ul>;"#).first().map(String::as_str), None, "ul is not a box");
        assert_eq!(kind(r#"const A = () => <div role="menu" className="rounded-md bg-white p-1"><button>Ubah</button></div>;"#), vec!["div:dropdown-menu", "button:button"].into_iter().take(1).collect::<Vec<_>>());
        assert_eq!(kind(r#"const A = () => <div className="absolute right-0 mt-2 w-48 rounded-md bg-white p-1 shadow-lg"><a>Profil</a></div>;"#), vec!["div:dropdown-menu"]);
        assert_eq!(kind(r#"const A = () => <input className="rounded-md border border-gray-300 px-3 py-2" />;"#), vec!["input:field"]);
        // a box with only a text colour, or no radius, or no padding: layout, not a component copy
        assert!(kind(r#"const A = () => <div className="rounded-lg p-4 text-gray-600"><p>x</p></div>;"#).is_empty());
        assert!(kind(r#"const A = () => <div className="flex gap-4 bg-white p-4"><p>x</p></div>;"#).is_empty());
    }

    fn tags(src: &str) -> Vec<String> {
        drag_without_keyboard(src, "tsx").into_iter().map(|d| format!("{}:{}", d.tag, d.via)).collect()
    }

    #[test]
    fn drag_needs_a_keyboard_way() {
        assert_eq!(tags("const A = () => <div className=\"compare\" onPointerDown={start}>x</div>;"), vec!["div:onPointerDown"]);
        // a keyboard way, a role, a native control, a component, or a spread: not flagged
        for ok in [
            "<div role=\"slider\" tabIndex={0} onPointerDown={s} onKeyDown={k} />",
            "<div tabIndex={0} onPointerDown={s} />",
            "<button onPointerDown={s}>Drag</button>",
            "<Slider onPointerDown={s} />",
            "<div {...bind()} onPointerDown={s} />",
            "<div onClick={go} />",
        ] {
            assert!(tags(&format!("const a = {ok};")).is_empty(), "{ok}");
        }
        // a handler written in place that does nothing a drag does (no move, capture, or position) is not one
        assert!(tags("const a = <div className=\"toolbar\" onMouseDown={(e) => e.preventDefault()}><button>B</button></div>;").is_empty());
        assert_eq!(tags("const a = <div onPointerDown={(e) => { e.currentTarget.setPointerCapture(e.pointerId); }} />;"), vec!["div:onPointerDown"]);
        assert_eq!(tags("const a = <div onMouseDown={(e) => setX(e.clientX)} />;"), vec!["div:onMouseDown"]);
        assert_eq!(tags("const a = <div onPointerDown={(e) => !wide && controls.start(e)} />;"), vec!["div:onPointerDown"]);
        assert!(tags("const a = <div onMouseDown={e => { e.preventDefault(); e.stopPropagation(); }} />;").is_empty());
        // inside a string it is text, not an element
        assert!(tags("const s = '<div onPointerDown={x}>';").is_empty());
        // offsets are UTF-16, as in JavaScript
        assert_eq!(drag_without_keyboard("const e = \"😀\"; const a = <div onMouseDown={s} />;", "jsx")[0].index, 26);
    }
}
