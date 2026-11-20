//! The markup detectors' reading of a file as structure, not text: JSX and TSX through oxc, HTML through
//! html5ever (scraper's tree). scan.rs asks for it once per source and judges what comes back; Vue, Svelte,
//! Astro, and a JSX file oxc cannot parse stay on the patterns over the text.
//!
//! Offsets are UTF-16 code units of the raw text, as JavaScript counts them, and point where the patterns
//! pointed: the "<" that opens a tag, or the first letter of the tabindex attribute.

use crate::js::trim;
use crate::jsre::u16_at;
use std::cell::{Cell, RefCell};

/// What the markup detectors need from one file.
#[derive(Default)]
pub struct Markup {
    /// `<img>` with no alt and no spread.
    pub img: Vec<usize>,
    /// A clickable `<div>` or `<span>` with no role that is not a scrim around a dialog: offset and tag.
    pub click: Vec<(usize, String)>,
    /// An icon-only `<button>` with no name.
    pub icon: Vec<usize>,
    /// Every h1 to h6, in source order: offset and level.
    pub headings: Vec<(usize, i64)>,
    /// A positive tabindex: offset of the attribute (or property) and the value as written in the message.
    pub tabindex: Vec<(usize, String)>,
    /// A `<button>` with no type inside a `<form>`, other than the one taken as the form's submit.
    pub untyped: Vec<usize>,
    /// The first loading indicator: a spinner, loader, loading, or skeleton class or component, or "Loading…" text.
    /// A component imported from another module is not here but in `loaders_from`.
    pub loading: Option<usize>,
    /// Loading components imported from another module (not an icon set): offset, the name that module exports
    /// it under ("default" for a default import), and the import path. Each is judged by its own markup there.
    pub loaders_from: Vec<(usize, String, String)>,
    /// The first modal dialog: an element with a dialog or alertdialog role and aria-modal, or with a scrim around
    /// it or just before it. An alertdialog with neither is an inline confirmation, not modal. A panel with none of these is not modal, and a native `<dialog>` is
    /// modal only through showModal(), which gives Esc and the inert page itself.
    pub dialog: Option<usize>,
    /// The first inline confirmation: an alertdialog that is not modal, with no autofocus on it or inside it.
    pub alert: Option<usize>,
    /// The `src` of every `<script src>` an HTML page loads, as written: what it does at run time, such as closing a
    /// dialog on Esc or setting aria-busy, is in that file.
    pub scripts: Vec<String>,
    /// The first field a person types into or picks from (input, select, textarea) with no label tied to it: not
    /// inside a <label>, no label for its id, and no aria-label, aria-labelledby, or title. A placeholder is not a
    /// label. An id or a label's for that is an expression may match, so such a field is left alone.
    pub unlabeled: Option<usize>,
    /// The first control that goes nowhere: a link to "#", "", or javascript: with no click handler, or a click
    /// handler that is an empty function. In HTML, only on a page with no script, which may give it its handler.
    pub dead: Option<usize>,
    /// The first phone, OTP, or amount field (by its name, id, or autocomplete) that opens the text keyboard: type
    /// text or none, and no inputmode.
    pub keyboard: Option<usize>,
    /// The first field marked aria-invalid (not "false") with no aria-describedby or aria-errormessage.
    pub invalid: Option<usize>,
    /// The first radio button of a name shared by two or more, none of them inside a <fieldset> or a named
    /// radiogroup or group, a named form, or a named landmark that holds no other field: each option has its
    /// label, but nothing names the question. With it, how many such groups the file has.
    pub ungrouped: Option<(usize, usize)>,
    /// The first <a> with a click handler and no href or tabindex: Tab does not reach it.
    pub anchor: Option<usize>,
    /// The first field for the person's own data (email, phone, name, address, by its name, id, or type) with
    /// autocomplete="off".
    pub autofill_off: Option<usize>,
}

/// A re-export: the path, and the names as (imported, exported), or None for `export *`.
pub type ReExport = (String, Option<Vec<(String, String)>>);

/// What a module defines and re-exports, for finding a component another file imports.
#[derive(Default)]
pub struct Module {
    /// Top-level functions, classes, and variables (exported or not), "default" for the default export:
    /// the name and the byte span of its declaration.
    pub defs: Vec<(String, usize, usize)>,
    /// `export * from "p"` (None) and `export { a as b } from "p"` (the names, as (imported, exported)).
    pub reexports: Vec<ReExport>,
}

/// The module read from a script or component file, or None when oxc cannot parse it.
pub fn module(text: &str, ext: &str) -> Option<Module> {
    jsx::module(text, ext)
}

/// A class or id word that names a scrim: scrim, backdrop, or overlay.
fn scrim_name(s: &str) -> bool {
    words(s).iter().any(|w| matches!(w.as_str(), "scrim" | "backdrop" | "overlay"))
}

/// aria-modal written as true (the value starts with "true", as hidden() reads aria-hidden).
fn modal_value(v: &str) -> bool {
    v.trim().to_ascii_lowercase().starts_with("true")
}


/// The file read as structure, or None when it stays on the patterns (not JSX, TSX, or HTML; or oxc gave up).
pub fn read(raw: &str, ext: &str) -> Option<Markup> {
    match ext {
        "jsx" | "tsx" => jsx::read(raw, ext),
        "html" | "htm" => Some(html::read(raw)),
        _ => None,
    }
}

const CLICK: [&str; 5] = ["onClick", "onclick", "@click", "v-on:click", "on:click"];
const RUNTIME: [&str; 6] = ["id", "data-bind", "data-text", "data-i18n", "x-text", "v-text"];

/// A role value that makes the element a dialog (`role="dialog"`, `role="alertdialog"`).
fn dialog_role(v: &str) -> bool {
    let v = v.trim_start();
    ["alertdialog", "dialog"].iter().any(|r| v.starts_with(r) && !v[r.len()..].starts_with(|c: char| c.is_alphanumeric() || c == '_'))
}

/// `role="alertdialog"`: a confirmation that asks before an action.
fn alert_role(v: &str) -> bool {
    let v = v.trim_start();
    v.starts_with("alertdialog") && !v["alertdialog".len()..].starts_with(|c: char| c.is_alphanumeric() || c == '_')
}

/// An input type a person types into or picks from; None (no type) is text.
fn typed_field(kind: Option<&str>) -> bool {
    !matches!(kind.map(|k| k.trim().to_ascii_lowercase()).as_deref(), Some("hidden" | "submit" | "button" | "reset" | "image"))
}

/// A name, id, or autocomplete value that names a phone number, a one-time code, or an amount.
fn number_name(v: &str) -> bool {
    let auto = v.trim().to_ascii_lowercase();
    auto.starts_with("tel") && (auto.len() == 3 || auto[3..].starts_with('-')) || auto == "one-time-code"
        || words(v).iter().any(|w| matches!(w.as_str(), "phone" | "tel" | "telepon" | "hp" | "handphone" | "whatsapp" | "otp" | "nominal" | "amount"))
}

/// A style that sets display to none: `display: none` in CSS, or `display: "none"` in a style object.
fn no_display(style: &str) -> bool {
    let s: String = style.chars().filter(|c| !c.is_whitespace() && *c != '"' && *c != '\'').collect::<String>().to_ascii_lowercase();
    s.contains("display:none")
}

/// A name, id, or type that names the person's own data the browser can fill: email, phone, name, or address.
fn personal_name(v: &str) -> bool {
    let w = words(v);
    w.iter().any(|w| matches!(w.as_str(), "email" | "phone" | "tel" | "telepon" | "hp" | "whatsapp" | "nama" | "address" | "alamat" | "postal" | "zip" | "kodepos"))
        || (w.iter().any(|w| w == "name") && w.iter().all(|w| matches!(w.as_str(), "name" | "full" | "first" | "last" | "given" | "family")))
}

/// Radio buttons that share a name with another and are all outside a group: the first one's offset, and how
/// many names are like that.
fn ungrouped_radios(radios: &[(usize, String, bool)]) -> Option<(usize, usize)> {
    let bad: Vec<&(usize, String, bool)> = radios.iter().filter(|(_, n, _)| radios.iter().filter(|r| &r.1 == n).count() > 1 && !radios.iter().any(|r| &r.1 == n && r.2)).collect();
    let names: std::collections::HashSet<&String> = bad.iter().map(|r| &r.1).collect();
    bad.iter().map(|r| r.0).min().map(|at| (at, names.len()))
}

/// A landmark element or role, which a screen reader announces with its name when focus enters it.
fn landmark(tag: &str, role: Option<&str>) -> bool {
    matches!(tag, "aside" | "section" | "nav" | "main" | "header" | "footer")
        || role.is_some_and(|r| matches!(r.trim(), "region" | "complementary" | "navigation" | "main" | "form" | "search"))
}

/// The fields a named landmark holds are all radio buttons of one name: then its name is that group's name.
fn one_radio_group(fields: &[(bool, Option<String>)]) -> bool {
    !fields.is_empty() && fields.iter().all(|f| f.0 && f.1.is_some() && f.1 == fields[0].1)
}

/// A field, form, or form handler named for someone else: an invite, a recipient, a member, a contact.
fn someone_else(v: &str) -> bool {
    words(v).iter().any(|w| matches!(w.as_str(), "invite" | "invitee" | "invitation" | "recipient" | "member" | "guest" | "contact" | "to" | "cc" | "friend" | "referral" | "referee"))
}

/// A link target that goes nowhere: "#", "", or javascript:.
fn nowhere(href: &str) -> bool {
    let h = href.trim();
    h.is_empty() || h == "#" || h.to_ascii_lowercase().starts_with("javascript:")
}

/// `aria-hidden="true"` as the patterns read it: the value starts with "true".
fn hidden(v: &str) -> bool {
    v.starts_with("true")
}

/// A tabindex value the browser reads as a positive integer, written back as that integer.
fn positive(v: &str) -> Option<String> {
    let v = v.trim_start_matches([' ', '\t', '\n', '\r', '\x0c']);
    let v = v.strip_prefix('+').unwrap_or(v);
    let digits: String = v.chars().take_while(|c| c.is_ascii_digit()).collect();
    let n: u64 = digits.trim_start_matches('0').parse().ok()?;
    (n > 0).then(|| n.to_string())
}

/// The words of a class, component, or identifier: split at non-alphanumerics, digits, and camelCase
/// ("LoadingSkeleton" gives loading and skeleton, "Loader2" gives loader, "KEY_ESCAPE" gives key and escape).
pub fn words(s: &str) -> Vec<String> {
    let c: Vec<char> = s.chars().collect();
    let mut out = Vec::new();
    let mut cur = String::new();
    for (i, &ch) in c.iter().enumerate() {
        if !ch.is_ascii_alphabetic() {
            if !cur.is_empty() {
                out.push(std::mem::take(&mut cur).to_ascii_lowercase());
            }
            continue;
        }
        let prev = if i > 0 { c[i - 1] } else { ' ' };
        let next = c.get(i + 1).copied().unwrap_or(' ');
        // a new word at aB, and at the B of ABc
        let starts = ch.is_ascii_uppercase() && (prev.is_ascii_lowercase() || (prev.is_ascii_uppercase() && next.is_ascii_lowercase()));
        if starts && !cur.is_empty() {
            out.push(std::mem::take(&mut cur).to_ascii_lowercase());
        }
        cur.push(ch);
    }
    if !cur.is_empty() {
        out.push(cur.to_ascii_lowercase());
    }
    out
}

/// A class or component name that says it is a loading indicator.
fn loader_name(s: &str) -> bool {
    words(s).iter().any(|w| matches!(w.as_str(), "spinner" | "loader" | "loading" | "skeleton"))
}

/// Visible text that says something is loading: "Loading…", "Memuat data...", "Memproses…".
fn loading_text(s: &str) -> bool {
    let t = trim(s);
    let lower = t.to_lowercase();
    t.chars().count() <= 60 && ["loading", "memuat", "memproses"].iter().any(|w| lower.starts_with(w)) && (t.ends_with('…') || t.ends_with("..."))
}

/// The typeless buttons of one form to flag: all of them, but when nothing in the form is an explicit submit,
/// the last one with no click handler is taken as the form's submit button and left alone. A form with
/// method="dialog" closes its dialog on purpose and is skipped.
fn untyped_in_form(dialog_method: bool, explicit_submit: bool, buttons: &[(usize, bool)]) -> Vec<usize> {
    if dialog_method {
        return Vec::new();
    }
    let submit = if explicit_submit { None } else { buttons.iter().rposition(|b| !b.1) };
    buttons.iter().enumerate().filter(|(i, _)| Some(*i) != submit).map(|(_, b)| b.0).collect()
}

/// An import path whose components are icons, which draw and announce nothing. A Spinner or Skeleton from any
/// other import (a UI kit, or this project's own components) may announce itself where it is defined; that file is
/// checked on its own, so here it is not counted as an indicator.
fn icon_package(source: &str) -> bool {
    let s = source.to_ascii_lowercase();
    !s.starts_with('.') && (s.contains("icon") || s.contains("lucide") || s.contains("feather"))
}

/// What a button's content says about its name, gathered over its descendants.
#[derive(Default)]
struct Inside {
    icon: bool,
    named: bool,
    words: bool,
}

mod jsx {
    use super::*;
    use oxc_allocator::Allocator;
    use oxc_ast::ast::{
        ArrowFunctionBody, AssignmentExpression, AssignmentTarget, Expression, ImportDeclaration, ImportDeclarationSpecifier, JSXAttributeItem, JSXAttributeValue, JSXChild, JSXElement,
        JSXExpression, JSXFragment, JSXOpeningElement, StringLiteral, TemplateElement,
    };
    use std::collections::HashMap;
    use oxc_ast_visit::{walk, Visit};
    use oxc_parser::Parser;
    use oxc_span::{GetSpan, SourceType, Span};

    struct Reader<'s> {
        src: &'s str,
        out: Markup,
        /// The forms the visit is inside, innermost last.
        forms: Vec<Form>,
        /// Loading indicators: offset, and for a component its name as written (UI.Spinner).
        loaders: Vec<(usize, Option<String>)>,
        /// Imported names: the path each comes from, and the name it has there ("default", or "*" for a namespace).
        imports: HashMap<String, (String, String)>,
        /// For each element being visited, innermost last: whether it is a scrim (a scrim class or id, or a click
        /// handler) and whether the sibling just before the current child was one (by class or id).
        around: Vec<(bool, bool)>,
        /// How many <label> elements the visit is inside.
        labels: usize,
        /// Each label's htmlFor: the id, or None for an expression.
        fors: Vec<Option<String>>,
        /// Fields with no label of their own: offset, and the id (None: no id; Some(None): an expression).
        fields: Vec<(usize, Option<Option<String>>)>,
        /// How many fieldsets or named groups the visit is inside.
        groups: usize,
        /// Radio buttons with a literal name: offset, name, and whether a group holds it.
        radios: Vec<(usize, String, bool)>,
    }

    #[derive(Default)]
    struct Form {
        /// Named for someone else (onSubmit={invite}, action="/invite"): its fields hold another person's details.
        other: bool,
        dialog_method: bool,
        explicit_submit: bool,
        /// Typeless buttons: offset, and whether it has a click handler.
        buttons: Vec<(usize, bool)>,
    }

    /// The strings in an expression (literals and template text), not those in JSX inside it.
    struct Strings<'s> {
        src: &'s str,
        out: Vec<(usize, String)>,
    }

    impl<'a> Visit<'a> for Strings<'_> {
        fn visit_string_literal(&mut self, s: &StringLiteral<'a>) {
            self.out.push((s.span.start as usize, s.value.as_str().unwrap_or_default().to_string()));
        }
        fn visit_template_element(&mut self, t: &TemplateElement<'a>) {
            self.out.push((t.span.start as usize, text(self.src, t.span).to_string()));
        }
        fn visit_jsx_element(&mut self, _: &JSXElement<'a>) {}
        fn visit_jsx_fragment(&mut self, _: &JSXFragment<'a>) {}
    }

    /// The fields inside an element: whether each is a radio button, and its literal name.
    struct Controls<'s> {
        src: &'s str,
        out: Vec<(bool, Option<String>)>,
    }

    impl<'a> Visit<'a> for Controls<'_> {
        fn visit_jsx_element(&mut self, el: &JSXElement<'a>) {
            let name = text(self.src, el.opening_element.name.span());
            if matches!(name, "input" | "select" | "textarea") {
                let a = attrs(self.src, &el.opening_element);
                let kind = match a.get("type") {
                    Some(Value::Str(t)) => Some(t.trim().to_ascii_lowercase()),
                    _ => None,
                };
                if name != "input" || typed_field(kind.as_deref()) {
                    let n = match a.get("name") {
                        Some(Value::Str(v)) => Some(v.clone()),
                        _ => None,
                    };
                    self.out.push((kind.as_deref() == Some("radio"), n));
                }
            }
            walk::walk_jsx_element(self, el);
        }
    }

    fn strings(src: &str, e: &JSXExpression) -> Vec<(usize, String)> {
        let mut s = Strings { src, out: Vec::new() };
        s.visit_jsx_expression(e);
        s.out
    }

    fn text(src: &str, span: Span) -> &str {
        &src[span.start as usize..span.end as usize]
    }

    /// An attribute value, as far as the checks need it: a literal, or some other expression.
    enum Value {
        None,
        Str(String),
        Num(f64),
        Bool(bool),
        Other,
    }

    struct Attrs<'s> {
        list: Vec<(&'s str, usize, Value)>,
        spread: bool,
    }

    impl<'s> Attrs<'s> {
        fn has(&self, name: &str) -> bool {
            self.list.iter().any(|a| a.0 == name)
        }
        fn get(&self, name: &str) -> Option<&Value> {
            self.list.iter().find(|a| a.0 == name).map(|a| &a.2)
        }
    }

    fn expression(e: &JSXExpression) -> Value {
        match e {
            JSXExpression::EmptyExpression(_) => Value::None,
            JSXExpression::StringLiteral(s) => Value::Str(s.value.as_str().unwrap_or_default().to_string()),
            JSXExpression::NumericLiteral(n) => Value::Num(n.value),
            JSXExpression::BooleanLiteral(b) => Value::Bool(b.value),
            _ => Value::Other,
        }
    }

    fn attrs<'s>(src: &'s str, el: &JSXOpeningElement) -> Attrs<'s> {
        let mut list = Vec::new();
        let mut spread = false;
        for a in &el.attributes {
            match a {
                JSXAttributeItem::Attribute(at) => {
                    let value = match &at.value {
                        None => Value::Bool(true),
                        Some(JSXAttributeValue::StringLiteral(s)) => Value::Str(s.value.as_str().unwrap_or_default().to_string()),
                        Some(JSXAttributeValue::ExpressionContainer(c)) => expression(&c.expression),
                        Some(_) => Value::Other,
                    };
                    list.push((text(src, at.name.span()), at.span.start as usize, value));
                }
                JSXAttributeItem::SpreadAttribute(_) => spread = true,
            }
        }
        Attrs { list, spread }
    }

    /// The strings in the named attributes: a literal value, or the strings in an expression (cn("scrim", x)).
    fn class_strings(src: &str, el: &JSXOpeningElement, names: &[&str]) -> Vec<String> {
        let mut out = Vec::new();
        for item in &el.attributes {
            let JSXAttributeItem::Attribute(attr) = item else { continue };
            if !names.contains(&text(src, attr.name.span())) {
                continue;
            }
            match &attr.value {
                Some(JSXAttributeValue::StringLiteral(s)) => out.push(s.value.as_str().unwrap_or_default().to_string()),
                Some(JSXAttributeValue::ExpressionContainer(c)) => out.extend(strings(src, &c.expression).into_iter().map(|(_, s)| s)),
                _ => {}
            }
        }
        out
    }

    fn tabindex(v: &Value) -> Option<String> {
        match v {
            Value::Str(s) => positive(s),
            Value::Num(n) if n.is_finite() && *n >= 1.0 => Some(format!("{}", n.trunc() as u64)),
            _ => None,
        }
    }

    /// The first child that is not blank text, when it is an element whose role is a dialog.
    fn scrim(src: &str, children: &[JSXChild]) -> bool {
        for c in children {
            match c {
                JSXChild::Text(t) if trim(text(src, t.span)).is_empty() => continue,
                JSXChild::Element(e) => {
                    return match attrs(src, &e.opening_element).get("role") {
                        Some(Value::Str(s)) => dialog_role(s),
                        _ => false,
                    };
                }
                _ => return false,
            }
        }
        false
    }

    fn inside(src: &str, children: &[JSXChild], into: &mut Inside) {
        for c in children {
            match c {
                JSXChild::Text(t) => into.words |= !trim(text(src, t.span)).is_empty(),
                // {label}, {t("save")}, {open ? "Tutup" : <Icon />}: may well be the name
                JSXChild::ExpressionContainer(e) => into.words |= !matches!(e.expression, JSXExpression::EmptyExpression(_)),
                JSXChild::Spread(_) => into.words = true,
                JSXChild::Fragment(f) => inside(src, &f.children, into),
                JSXChild::Element(e) => {
                    let name = text(src, e.opening_element.name.span());
                    into.icon |= name == "svg" || name == "i" || name.starts_with(|c: char| c.is_ascii_uppercase());
                    let a = attrs(src, &e.opening_element);
                    into.named |= a.has("aria-label")
                        || match a.get("alt") {
                            Some(Value::Str(s)) => !s.is_empty(),
                            Some(Value::Other) => true,
                            _ => false,
                        };
                    // an empty element a script fills: <span id="label"></span>
                    let shown = !matches!(a.get("aria-hidden"), Some(Value::Str(s)) if hidden(s)) && !matches!(a.get("aria-hidden"), Some(Value::Bool(true)));
                    let empty = e.closing_element.is_some() && e.children.iter().all(|c| matches!(c, JSXChild::Text(t) if trim(text(src, t.span)).is_empty()));
                    into.named |= shown && empty && RUNTIME.iter().any(|n| a.has(n));
                    inside(src, &e.children, into);
                }
            }
        }
    }

    impl<'a> Visit<'a> for Reader<'_> {
        fn visit_jsx_element(&mut self, el: &JSXElement<'a>) {
            let src = self.src;
            let open = &el.opening_element;
            let name = text(src, open.name.span());
            let at = u16_at(src, open.span.start as usize);
            let a = attrs(src, open);
            let named_scrim = class_strings(src, open, &["className", "class", "id"]).iter().any(|s| scrim_name(s));
            let (parent, before) = self.around.last().copied().unwrap_or((false, false));
            for (n, start, v) in &a.list {
                if *n == "tabIndex" || *n == "tabindex" {
                    if let Some(t) = tabindex(v) {
                        self.out.tabindex.push((u16_at(src, *start), t));
                    }
                }
            }
            match name {
                "img" if !a.has("alt") && !a.spread => self.out.img.push(at),
                "div" | "span" if CLICK.iter().any(|c| a.has(c)) && !a.has("role") && !scrim(src, &el.children) => self.out.click.push((at, name.to_string())),
                "button" if !(a.has("aria-label") || a.has("aria-labelledby") || a.has("title") || a.spread) => {
                    let mut i = Inside::default();
                    inside(src, &el.children, &mut i);
                    if i.icon && !i.named && !i.words {
                        self.out.icon.push(at);
                    }
                }
                "h1" | "h2" | "h3" | "h4" | "h5" | "h6" => self.out.headings.push((at, name[1..].parse().unwrap())),
                _ => {}
            }
            self.markup_checks(el, name, at, &a, parent || before);
            self.field_checks(el, name, at, &a);
            self.around.push((named_scrim || CLICK.iter().any(|c| a.has(c)), false));
            // a label's htmlFor, or a wrapper component's (<Field htmlFor="owner">) that renders the label
            match a.get("htmlFor").or(if name == "label" { a.get("for") } else { None }) {
                Some(Value::Str(f)) => self.fors.push(Some(f.clone())),
                Some(_) => self.fors.push(None),
                None => {}
            }
            let named = a.has("aria-label") || a.has("aria-labelledby");
            let role = match a.get("role") {
                Some(Value::Str(r)) => Some(r.as_str()),
                _ => None,
            };
            let group = name == "fieldset"
                || (named && (role.is_some_and(|r| matches!(r.trim(), "radiogroup" | "group")) || name == "form"))
                || (named && landmark(name, role) && {
                    let mut c = Controls { src, out: Vec::new() };
                    walk::walk_jsx_element(&mut c, el);
                    one_radio_group(&c.out)
                });
            self.groups += usize::from(group);
            if name == "label" {
                self.labels += 1;
                walk::walk_jsx_element(self, el);
                self.labels -= 1;
            } else if name == "form" {
                let dialog_method = matches!(a.get("method"), Some(Value::Str(m)) if m.eq_ignore_ascii_case("dialog"));
                let other = open.attributes.iter().any(|i| matches!(i, JSXAttributeItem::Attribute(at) if someone_else(text(src, at.span))));
                self.forms.push(Form { dialog_method, other, ..Default::default() });
                walk::walk_jsx_element(self, el);
                let f = self.forms.pop().unwrap();
                self.out.untyped.extend(untyped_in_form(f.dialog_method, f.explicit_submit, &f.buttons));
            } else {
                walk::walk_jsx_element(self, el);
            }
            self.groups -= usize::from(group);
            self.around.pop();
            if let Some(top) = self.around.last_mut() {
                top.1 = named_scrim;
            }
        }

        fn visit_jsx_fragment(&mut self, f: &JSXFragment<'a>) {
            self.around.push((false, false));
            walk::walk_jsx_fragment(self, f);
            self.around.pop();
        }

        fn visit_import_declaration(&mut self, d: &ImportDeclaration<'a>) {
            let from = d.source.value.as_str().unwrap_or_default().to_string();
            for sp in d.specifiers.iter().flatten() {
                let (local, there) = match sp {
                    ImportDeclarationSpecifier::ImportSpecifier(s) => (&s.local, s.imported.name().as_str().to_string()),
                    ImportDeclarationSpecifier::ImportDefaultSpecifier(s) => (&s.local, "default".to_string()),
                    ImportDeclarationSpecifier::ImportNamespaceSpecifier(s) => (&s.local, "*".to_string()),
                };
                self.imports.insert(local.name.as_str().to_string(), (from.clone(), there));
            }
        }

        // el.tabIndex = 2, which the pattern also caught
        fn visit_assignment_expression(&mut self, e: &AssignmentExpression<'a>) {
            if let AssignmentTarget::StaticMemberExpression(m) = &e.left {
                let p = m.property.name.as_str();
                if p == "tabIndex" || p == "tabindex" {
                    let v = match &e.right {
                        Expression::NumericLiteral(n) => Value::Num(n.value),
                        Expression::StringLiteral(s) => Value::Str(s.value.as_str().unwrap_or_default().to_string()),
                        _ => Value::None,
                    };
                    if let Some(t) = tabindex(&v) {
                        self.out.tabindex.push((u16_at(self.src, m.property.span.start as usize), t));
                    }
                }
            }
            walk::walk_assignment_expression(self, e);
        }
    }

    impl Reader<'_> {
        /// The field and link checks' reading of one element.
        fn field_checks(&mut self, el: &JSXElement, name: &str, at: usize, a: &Attrs) {
            let s = |n: &str| match a.get(n) {
                Some(Value::Str(v)) => Some(v.as_str()),
                _ => None,
            };
            if a.spread {
                return;
            }
            let field = matches!(name, "select" | "textarea") || (name == "input" && (!a.has("type") || s("type").is_some_and(|t| typed_field(Some(t)))));
            if name == "input" && s("type").is_some_and(|t| t.trim().eq_ignore_ascii_case("radio")) {
                if let Some(n) = s("name") {
                    self.radios.push((at, n.to_string(), self.groups > 0));
                }
            }
            if self.out.anchor.is_none() && name == "a" && CLICK.iter().any(|c| a.has(c)) && !a.has("href") && !a.has("tabIndex") {
                self.out.anchor = Some(at);
            }
            let others = self.forms.iter().any(|f| f.other) || ["name", "id", "placeholder"].iter().any(|n| s(n).is_some_and(someone_else));
            if self.out.autofill_off.is_none() && field && !others && s("autoComplete").or(s("autocomplete")).is_some_and(|v| v.trim().eq_ignore_ascii_case("off"))
                && ["name", "id", "type"].iter().any(|n| s(n).is_some_and(personal_name)) {
                self.out.autofill_off = Some(at);
            }
            // not on screen: hidden, display none, or aria-hidden with the keyboard kept out too (aria-hidden alone
            // still lets Tab reach a field a screen reader cannot name)
            let aria_hidden = matches!(a.get("aria-hidden"), Some(Value::Str(v)) if hidden(v)) || matches!(a.get("aria-hidden"), Some(Value::Bool(true)));
            let keyboard_out = a.has("disabled") || matches!(a.get("tabIndex"), Some(Value::Num(n)) if *n < 0.0) || matches!(a.get("tabIndex"), Some(Value::Str(v)) if v.trim().starts_with('-'));
            let display_none = el.opening_element.attributes.iter().any(|i| match i {
                JSXAttributeItem::Attribute(at) => text(self.src, at.name.span()) == "style" && no_display(text(self.src, at.span)),
                _ => false,
            });
            let shown = !a.has("hidden") && !(aria_hidden && keyboard_out) && !display_none;
            if field && shown {
                if self.labels == 0 && !a.has("aria-label") && !a.has("aria-labelledby") && !a.has("title") {
                    let id = match a.get("id") {
                        None => None,
                        Some(Value::Str(v)) => Some(Some(v.clone())),
                        Some(_) => Some(None),
                    };
                    self.fields.push((at, id));
                }
                let text_keyboard = name == "input" && (!a.has("type") || s("type").is_some_and(|t| t.trim().eq_ignore_ascii_case("text")));
                if self.out.keyboard.is_none() && text_keyboard && !a.has("inputMode") && !a.has("inputmode")
                    && ["name", "id", "autoComplete", "autocomplete"].iter().any(|n| s(n).is_some_and(number_name)) {
                    self.out.keyboard = Some(at);
                }
                let invalid = match a.get("aria-invalid") {
                    Some(Value::Str(v)) => v.trim() != "false",
                    Some(Value::Bool(b)) => *b,
                    Some(Value::Other) => true,
                    _ => false,
                };
                if self.out.invalid.is_none() && invalid && !a.has("aria-describedby") && !a.has("aria-errormessage") {
                    self.out.invalid = Some(at);
                }
            }
            if self.out.dead.is_some() {
                return;
            }
            let lower = name.starts_with(|c: char| c.is_ascii_lowercase());
            let handler = CLICK.iter().any(|c| a.has(c));
            if lower && name == "a" && !handler && s("href").is_some_and(nowhere) {
                self.out.dead = Some(at);
                return;
            }
            // onClick={() => {}} or onClick={function () {}}
            for item in &el.opening_element.attributes {
                let JSXAttributeItem::Attribute(attr) = item else { continue };
                if text(self.src, attr.name.span()) != "onClick" {
                    continue;
                }
                let Some(JSXAttributeValue::ExpressionContainer(c)) = &attr.value else { continue };
                let empty = match &c.expression {
                    JSXExpression::ArrowFunctionExpression(f) => matches!(&f.body, ArrowFunctionBody::FunctionBody(b) if b.statements.is_empty()),
                    JSXExpression::FunctionExpression(f) => f.body.as_ref().is_some_and(|b| b.statements.is_empty()),
                    _ => false,
                };
                if empty {
                    self.out.dead = Some(at);
                }
            }
        }

        /// The button, loading, and dialog checks' reading of one element.
        fn markup_checks(&mut self, el: &JSXElement, name: &str, at: usize, a: &Attrs, scrimmed: bool) {
            let src = self.src;
            let lower = name.starts_with(|c: char| c.is_ascii_lowercase());
            // a submit the form names itself: <button type="submit">, <input type="image">, <Button type="submit">
            if matches!(a.get("type"), Some(Value::Str(t)) if t.eq_ignore_ascii_case("submit") || t.eq_ignore_ascii_case("image")) {
                if let Some(f) = self.forms.last_mut() {
                    f.explicit_submit = true;
                }
            }
            if name == "button" && !a.has("type") && !a.spread && !a.has("form") {
                if let Some(f) = self.forms.last_mut() {
                    f.buttons.push((at, a.has("onClick")));
                }
            }
            let modal = match a.get("aria-modal") {
                Some(Value::Str(v)) => modal_value(v),
                Some(Value::Bool(b)) => *b,
                Some(Value::Other) => true,
                _ => false,
            };
            if self.out.dialog.is_none() && lower && (modal || scrimmed) && matches!(a.get("role"), Some(Value::Str(r)) if dialog_role(r)) {
                self.out.dialog = Some(at);
            }
            // its own markup, nested elements included: an autoFocus there moves focus in when it opens
            if self.out.alert.is_none() && lower && !modal && !scrimmed && matches!(a.get("role"), Some(Value::Str(r)) if alert_role(r)) && !text(src, el.span).contains("autoFocus") {
                self.out.alert = Some(at);
            }
            // a loading class (className="spinner", cn("skeleton", x)), a component (<Spinner />), or a web component
            for item in &el.opening_element.attributes {
                let JSXAttributeItem::Attribute(attr) = item else { continue };
                let n = text(src, attr.name.span());
                if n != "className" && n != "class" {
                    continue;
                }
                let found = match &attr.value {
                    Some(JSXAttributeValue::StringLiteral(s)) => loader_name(s.value.as_str().unwrap_or_default()),
                    Some(JSXAttributeValue::ExpressionContainer(c)) => strings(src, &c.expression).iter().any(|(_, s)| loader_name(s)),
                    _ => false,
                };
                if found {
                    self.loaders.push((at, None));
                }
            }
            if !lower {
                let last = name.rsplit('.').next().unwrap_or(name);
                if loader_name(last) {
                    self.loaders.push((at, Some(name.to_string())));
                }
            } else if name.contains('-') && loader_name(name) {
                self.loaders.push((at, None));
            }
            // visible text: a text child, or a string in a child expression ({busy ? "Memproses…" : "Bayar"})
            for c in &el.children {
                match c {
                    JSXChild::Text(t) if loading_text(text(src, t.span)) => {
                        let raw = text(src, t.span);
                        let lead = raw.len() - raw.trim_start().len();
                        self.loaders.push((u16_at(src, t.span.start as usize + lead), None));
                    }
                    JSXChild::ExpressionContainer(e) => {
                        if let Some((i, _)) = strings(src, &e.expression).into_iter().find(|(_, s)| loading_text(s)) {
                            self.loaders.push((u16_at(src, i), None));
                        }
                    }
                    _ => {}
                }
            }
        }
    }

    fn parse(raw: &str, kind: SourceType) -> Option<Markup> {
        let alloc = Allocator::default();
        let ret = Parser::new(&alloc, raw, kind).parse();
        if ret.fatal_error {
            return None;
        }
        let mut r = Reader { src: raw, out: Markup::default(), forms: Vec::new(), loaders: Vec::new(), imports: HashMap::new(), around: Vec::new(), labels: 0, fors: Vec::new(), fields: Vec::new(), groups: 0, radios: Vec::new() };
        r.visit_program(&ret.program);
        r.out.unlabeled = r.fields.iter().find(|(_, id)| match id {
            None => true,
            Some(None) => false,
            Some(Some(id)) => !r.fors.iter().any(|f| f.as_ref().is_none_or(|f| f == id)),
        }).map(|f| f.0);
        r.out.ungrouped = ungrouped_radios(&r.radios);
        // a component imported from an icon set, or defined in this file, counts here; one from another module is
        // judged by its own markup there (loaders_from)
        let mut here = Vec::new();
        for (at, name) in &r.loaders {
            let root = name.as_deref().map(|n| n.split('.').next().unwrap_or(n));
            match root.and_then(|n| r.imports.get(n)) {
                Some((from, _)) if icon_package(from) => here.push(*at),
                Some((from, there)) => {
                    let name = name.as_deref().unwrap_or_default();
                    let exported = if there == "*" { name.rsplit('.').next().unwrap_or(name).to_string() } else { there.clone() };
                    r.out.loaders_from.push((*at, exported, from.clone()));
                }
                None => here.push(*at),
            }
        }
        r.out.loading = here.into_iter().min();
        Some(r.out)
    }

    pub fn read(raw: &str, ext: &str) -> Option<Markup> {
        parse(raw, if ext == "tsx" { SourceType::tsx() } else { SourceType::jsx() })
    }

    pub fn module(text: &str, ext: &str) -> Option<Module> {
        use oxc_ast::ast::{Declaration, ExportDefaultDeclarationKind, Statement};
        let kind = match ext {
            "tsx" => SourceType::tsx(),
            "ts" | "mts" | "cts" => SourceType::ts(),
            _ => SourceType::jsx(),
        };
        let alloc = Allocator::default();
        let ret = Parser::new(&alloc, text, kind).parse();
        if ret.fatal_error {
            return None;
        }
        let mut m = Module::default();
        let span = |s: Span| (s.start as usize, s.end as usize);
        fn func(f: &oxc_ast::ast::Function, out: &mut Vec<(String, Span)>) {
            out.extend(f.id.as_ref().map(|i| (i.name.as_str().to_string(), f.span)));
        }
        fn class(c: &oxc_ast::ast::Class, out: &mut Vec<(String, Span)>) {
            out.extend(c.id.as_ref().map(|i| (i.name.as_str().to_string(), c.span)));
        }
        fn vars(v: &oxc_ast::ast::VariableDeclaration, out: &mut Vec<(String, Span)>) {
            for d in &v.declarations {
                out.extend(d.id.get_identifier_name().map(|n| (n.as_str().to_string(), d.span)));
            }
        }
        fn declared(d: &Declaration, out: &mut Vec<(String, Span)>) {
            match d {
                Declaration::FunctionDeclaration(f) => func(f, out),
                Declaration::ClassDeclaration(c) => class(c, out),
                Declaration::VariableDeclaration(v) => vars(v, out),
                _ => {}
            }
        }
        let mut found: Vec<(String, Span)> = Vec::new();
        let mut default_of: Option<String> = None;
        for st in &ret.program.body {
            match st {
                Statement::FunctionDeclaration(f) => func(f, &mut found),
                Statement::ClassDeclaration(c) => class(c, &mut found),
                Statement::VariableDeclaration(v) => vars(v, &mut found),
                Statement::ExportDeclaration(e) => declared(&e.declaration, &mut found),
                Statement::ExportDefaultDeclaration(e) => match &e.declaration {
                    ExportDefaultDeclarationKind::Identifier(i) => default_of = Some(i.name.as_str().to_string()),
                    _ => found.push(("default".to_string(), e.span)),
                },
                Statement::ExportFromDeclaration(e) => {
                    let names = e.specifiers.iter().map(|s| (s.local.name().as_str().to_string(), s.exported.name().as_str().to_string())).collect();
                    m.reexports.push((e.source.value.as_str().unwrap_or_default().to_string(), Some(names)));
                }
                Statement::ExportAllDeclaration(e) if e.exported.is_none() => m.reexports.push((e.source.value.as_str().unwrap_or_default().to_string(), None)),
                _ => {}
            }
        }
        if let Some(n) = default_of {
            if let Some((_, sp)) = found.iter().find(|f| f.0 == n).cloned() {
                found.push(("default".to_string(), sp));
            }
        }
        m.defs = found.into_iter().map(|(n, s)| { let (a, b) = span(s); (n, a, b) }).collect();
        Some(m)
    }

    /// The positive tabindex a page's inline script sets (`el.tabIndex = 2`), with UTF-16 offsets in `code`.
    pub fn script_tabindex(code: &str) -> Vec<(usize, String)> {
        parse(code, SourceType::cjs()).map_or(Vec::new(), |m| m.tabindex)
    }
}

mod html {
    use super::*;
    use html5ever::buffer_queue::BufferQueue;
    use html5ever::tendril::StrTendril;
    use html5ever::tokenizer::{TagKind, Token, TokenSink, TokenSinkResult, Tokenizer, TokenizerOpts};
    use html5ever::tree_builder::{ElementFlags, NodeOrText, QuirksMode, TreeBuilder, TreeBuilderOpts, TreeSink};
    use html5ever::{Attribute, QualName};
    use scraper::{Html, HtmlTreeSink, Node};
    use std::borrow::Cow;
    use std::collections::HashMap;

    type Id = <HtmlTreeSink as TreeSink>::Handle;

    /// A start tag as written: where its "<" is, where it ends, its name, and its attributes.
    struct Tag {
        start: usize,
        end: usize,
        name: String,
        attrs: Vec<(String, String)>,
    }

    /// scraper's tree, noting which start tag made each element.
    struct Placed {
        inner: HtmlTreeSink,
        /// The start tag being processed: its index in `tags` and its name.
        pending: RefCell<Option<(usize, String)>>,
        made: RefCell<HashMap<Id, usize>>,
    }

    impl TreeSink for Placed {
        type Handle = Id;
        type Output = (Html, HashMap<Id, usize>);
        type ElemName<'a> = <HtmlTreeSink as TreeSink>::ElemName<'a>;

        fn finish(self) -> Self::Output {
            (self.inner.finish(), self.made.into_inner())
        }
        fn parse_error(&self, msg: Cow<'static, str>) {
            self.inner.parse_error(msg)
        }
        fn get_document(&self) -> Id {
            self.inner.get_document()
        }
        fn elem_name<'a>(&'a self, target: &'a Id) -> Self::ElemName<'a> {
            self.inner.elem_name(target)
        }
        fn create_element(&self, name: QualName, attrs: Vec<Attribute>, flags: ElementFlags) -> Id {
            let local = name.local.to_string();
            let id = self.inner.create_element(name, attrs, flags);
            // Only the element the tag itself makes, not one the parser adds or clones on the way.
            let mut pending = self.pending.borrow_mut();
            if pending.as_ref().is_some_and(|p| p.1 == local) {
                self.made.borrow_mut().insert(id, pending.take().unwrap().0);
            }
            id
        }
        fn create_comment(&self, text: StrTendril) -> Id {
            self.inner.create_comment(text)
        }
        fn create_pi(&self, target: StrTendril, data: StrTendril) -> Id {
            self.inner.create_pi(target, data)
        }
        fn append(&self, parent: &Id, child: NodeOrText<Id>) {
            self.inner.append(parent, child)
        }
        fn append_based_on_parent_node(&self, element: &Id, prev_element: &Id, child: NodeOrText<Id>) {
            self.inner.append_based_on_parent_node(element, prev_element, child)
        }
        fn append_doctype_to_document(&self, name: StrTendril, public_id: StrTendril, system_id: StrTendril) {
            self.inner.append_doctype_to_document(name, public_id, system_id)
        }
        fn mark_script_already_started(&self, node: &Id) {
            self.inner.mark_script_already_started(node)
        }
        fn pop(&self, node: &Id) {
            self.inner.pop(node)
        }
        fn get_template_contents(&self, target: &Id) -> Id {
            self.inner.get_template_contents(target)
        }
        fn same_node(&self, x: &Id, y: &Id) -> bool {
            self.inner.same_node(x, y)
        }
        fn set_quirks_mode(&self, mode: QuirksMode) {
            self.inner.set_quirks_mode(mode)
        }
        fn append_before_sibling(&self, sibling: &Id, new_node: NodeOrText<Id>) {
            self.inner.append_before_sibling(sibling, new_node)
        }
        fn add_attrs_if_missing(&self, target: &Id, attrs: Vec<Attribute>) {
            self.inner.add_attrs_if_missing(target, attrs)
        }
        fn associate_with_form(&self, target: &Id, form: &Id, nodes: (&Id, Option<&Id>)) {
            self.inner.associate_with_form(target, form, nodes)
        }
        fn remove_from_parent(&self, target: &Id) {
            self.inner.remove_from_parent(target)
        }
        fn reparent_children(&self, node: &Id, new_parent: &Id) {
            self.inner.reparent_children(node, new_parent)
        }
        fn is_mathml_annotation_xml_integration_point(&self, handle: &Id) -> bool {
            self.inner.is_mathml_annotation_xml_integration_point(handle)
        }
        fn set_current_line(&self, line_number: u64) {
            self.inner.set_current_line(line_number)
        }
        fn allow_declarative_shadow_roots(&self, intended_parent: &Id) -> bool {
            self.inner.allow_declarative_shadow_roots(intended_parent)
        }
        fn attach_declarative_shadow(&self, location: &Id, template: &Id, attrs: &[Attribute]) -> bool {
            self.inner.attach_declarative_shadow(location, template, attrs)
        }
        fn maybe_clone_an_option_into_selectedcontent(&self, option: &Id) {
            self.inner.maybe_clone_an_option_into_selectedcontent(option)
        }
    }

    /// Sits between html5ever's tokenizer and tree builder and works out where each start tag is in the text.
    /// The tokenizer reports no offsets, so the place comes from how much input it has consumed when a token
    /// arrives: a start tag arrives as its ">" is consumed, and no token arrives between its "<" and its ">",
    /// so its "<" is the first one after the input consumed at the token before.
    struct Locate<'q> {
        tb: TreeBuilder<Id, Placed>,
        queue: &'q BufferQueue,
        bytes: &'q [u8],
        /// Byte offset from which the next start tag's "<" is searched.
        from: Cell<usize>,
        tags: RefCell<Vec<Tag>>,
    }

    impl Locate<'_> {
        fn consumed(&self) -> usize {
            // The queue holds what is left (the tokenizer may have pushed some back to read it again).
            let mut parts = Vec::new();
            while let Some(b) = self.queue.pop_front() {
                parts.push(b);
            }
            let left: usize = parts.iter().map(|b| b.len()).sum();
            for b in parts.into_iter().rev() {
                self.queue.push_front(b);
            }
            self.bytes.len() - left
        }
    }

    impl TokenSink for Locate<'_> {
        type Handle = Id;

        fn process_token(&self, token: Token, line_number: u64) -> TokenSinkResult<Id> {
            let consumed = self.consumed();
            if let Token::TagToken(t) = &token {
                if t.kind == TagKind::StartTag {
                    let from = self.from.get().min(consumed);
                    let start = self.bytes[from..consumed].iter().position(|&b| b == b'<').map_or(from, |p| from + p);
                    let mut tags = self.tags.borrow_mut();
                    let attrs = t.attrs.iter().map(|a| (a.name.local.to_string(), a.value.to_string())).collect();
                    tags.push(Tag { start, end: consumed, name: t.name.to_string(), attrs });
                    *self.tb.sink.pending.borrow_mut() = Some((tags.len() - 1, t.name.to_string()));
                }
            }
            let r = self.tb.process_token(token, line_number);
            *self.tb.sink.pending.borrow_mut() = None;
            // The character just consumed may be read again as the start of a tag ("<<div>").
            self.from.set(consumed.saturating_sub(1));
            r
        }

        fn end(&self) {
            self.tb.end()
        }

        fn adjusted_current_node_present_but_not_in_html_namespace(&self) -> bool {
            self.tb.adjusted_current_node_present_but_not_in_html_namespace()
        }
    }

    /// Byte offset of the attribute `want` in the start tag `src[start..end]`, read the way the tokenizer reads it.
    fn attr_at(src: &[u8], start: usize, end: usize, want: &str) -> Option<usize> {
        let ws = |c: u8| matches!(c, b' ' | b'\t' | b'\n' | b'\r' | b'\x0c');
        let mut i = start + 1;
        while i < end && !ws(src[i]) && src[i] != b'/' && src[i] != b'>' {
            i += 1;
        }
        while i < end {
            while i < end && (ws(src[i]) || src[i] == b'/') {
                i += 1;
            }
            if i >= end || src[i] == b'>' {
                return None;
            }
            let name = i;
            i += 1; // a name may start with "="
            while i < end && !ws(src[i]) && !matches!(src[i], b'/' | b'>' | b'=') {
                i += 1;
            }
            if src[name..i].eq_ignore_ascii_case(want.as_bytes()) {
                return Some(name);
            }
            while i < end && ws(src[i]) {
                i += 1;
            }
            if i < end && src[i] == b'=' {
                i += 1;
                while i < end && ws(src[i]) {
                    i += 1;
                }
                if i < end && (src[i] == b'"' || src[i] == b'\'') {
                    let q = src[i];
                    i += 1;
                    while i < end && src[i] != q {
                        i += 1;
                    }
                    i += 1;
                } else {
                    while i < end && !ws(src[i]) && src[i] != b'>' {
                        i += 1;
                    }
                }
            }
        }
        None
    }

    const VOID: [&str; 14] = ["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"];

    pub fn read(raw: &str) -> Markup {
        let queue = BufferQueue::default();
        queue.push_back(StrTendril::from_slice(raw));
        // Scripting off, so markup inside <noscript> is read as markup, as the patterns read it.
        let opts = TreeBuilderOpts { scripting_enabled: false, ..Default::default() };
        let sink = Placed { inner: HtmlTreeSink::new(Html::new_document()), pending: RefCell::new(None), made: RefCell::new(HashMap::new()) };
        let locate = Locate { tb: TreeBuilder::new(sink, opts), queue: &queue, bytes: raw.as_bytes(), from: Cell::new(0), tags: RefCell::new(Vec::new()) };
        let tok = Tokenizer::new(locate, TokenizerOpts::default());
        while !matches!(tok.feed(&queue), html5ever::TokenizerResult::Done) {}
        tok.end();
        let Locate { tb, tags, .. } = tok.sink;
        let tags = tags.into_inner();
        let (doc, made) = tb.sink.finish();

        let spread = crate::jsre::js(r"\{\s*\.\.\.", "");
        let at = |t: &Tag| u16_at(raw, t.start);
        let mut out = Markup::default();
        for t in &tags {
            let has = |n: &str| t.attrs.iter().any(|a| a.0 == n);
            if let Some((_, v)) = t.attrs.iter().find(|a| a.0 == "tabindex") {
                if let (Some(v), Some(p)) = (positive(v), attr_at(raw.as_bytes(), t.start, t.end, "tabindex")) {
                    out.tabindex.push((u16_at(raw, p), v));
                }
            }
            match t.name.as_str() {
                // el.tabIndex = 2 in an inline script, which the pattern also caught
                "script" => {
                    if let Some((_, v)) = t.attrs.iter().find(|a| a.0 == "src") {
                        out.scripts.push(v.to_string());
                    }
                    let b = raw.as_bytes();
                    let close = (t.end..b.len()).find(|&i| b[i..].len() >= 8 && b[i..i + 8].eq_ignore_ascii_case(b"</script")).unwrap_or(b.len());
                    let code = &raw[t.end..close];
                    let base = u16_at(raw, t.end);
                    out.tabindex.extend(super::jsx::script_tabindex(code).into_iter().map(|(i, v)| (base + i, v)));
                }
                "img" if !has("alt") && !spread.test(&raw[t.start..t.end]) => out.img.push(at(t)),
                "h1" | "h2" | "h3" | "h4" | "h5" | "h6" => out.headings.push((at(t), t.name[1..].parse().unwrap())),
                _ => {}
            }
        }

        // Elements in document order, for the checks that need what is inside them.
        for node in doc.tree.root().descendants() {
            let Node::Element(el) = node.value() else { continue };
            let Some(&ti) = made.get(&node.id()) else { continue };
            let t = &tags[ti];
            let attr = |n: &str| el.attrs().find(|a| a.0 == n).map(|a| a.1);
            match el.name() {
                "div" | "span" if el.attrs().any(|a| CLICK.contains(&a.0)) && attr("role").is_none() => {
                    let first = node.children().find(|c| match c.value() {
                        Node::Text(s) => !trim(s).is_empty(),
                        Node::Comment(_) => false,
                        _ => true,
                    });
                    let scrim = first.and_then(|c| c.value().as_element().and_then(|e| e.attr("role"))).is_some_and(dialog_role);
                    if !scrim {
                        out.click.push((at(t), el.name().to_string()));
                    }
                }
                "button" if !(["aria-label", "aria-labelledby", "title"].iter().any(|n| attr(n).is_some()) || spread.test(&raw[t.start..t.end])) => {
                    let mut i = Inside::default();
                    for d in node.descendants().skip(1) {
                        match d.value() {
                            Node::Text(s) => i.words |= !trim(s).is_empty(),
                            Node::Element(e) => {
                                let upper = made.get(&d.id()).is_some_and(|&k| raw.as_bytes().get(tags[k].start + 1).is_some_and(|c| c.is_ascii_uppercase()));
                                i.icon |= e.name() == "svg" || e.name() == "i" || upper;
                                i.named |= e.attr("alt").is_some_and(|v| !v.is_empty()) || e.attr("aria-label").is_some();
                                let shown = !e.attr("aria-hidden").is_some_and(hidden);
                                let empty = !VOID.contains(&e.name()) && d.children().all(|c| matches!(c.value(), Node::Text(s) if trim(s).is_empty()));
                                i.named |= shown && empty && RUNTIME.iter().any(|n| e.attr(n).is_some());
                            }
                            _ => {}
                        }
                    }
                    if i.icon && !i.named && !i.words {
                        out.icon.push(at(t));
                    }
                }
                _ => {}
            }
        }

        let fors: std::collections::HashSet<String> = doc.tree.root().descendants().filter_map(|n| n.value().as_element().filter(|e| e.name() == "label").and_then(|e| e.attr("for")).map(|f| f.to_string())).collect();
        let scripted = tags.iter().any(|t| t.name == "script");
        let mut radios: Vec<(usize, String, bool)> = Vec::new();
        // The button, loading, and dialog checks. Text has no place of its own here: it is placed at its element.
        let mut loaders = Vec::new();
        for node in doc.tree.root().descendants() {
            if let Node::Text(s) = node.value() {
                let parent = node.parent().filter(|p| p.value().as_element().is_some_and(|e| !matches!(e.name(), "script" | "style" | "template")));
                if let Some(&k) = parent.and_then(|p| made.get(&p.id())) {
                    if loading_text(s) {
                        loaders.push(at(&tags[k]));
                    }
                }
                continue;
            }
            let Node::Element(el) = node.value() else { continue };
            let Some(&ti) = made.get(&node.id()) else { continue };
            let t = &tags[ti];
            if el.attr("class").is_some_and(loader_name) || (el.name().contains('-') && loader_name(el.name())) {
                loaders.push(at(t));
            }
            if el.attr("role").is_some_and(dialog_role) {
                let named = |e: &scraper::node::Element| ["class", "id"].iter().any(|n| e.attr(n).is_some_and(scrim_name));
                let parent = node.parent().and_then(|p| p.value().as_element().map(|e| named(e) || e.attrs().any(|a| CLICK.contains(&a.0)))).unwrap_or(false);
                let before = node.prev_siblings().find_map(|p| p.value().as_element().map(named)).unwrap_or(false);
                let modal = el.attr("aria-modal").is_some_and(modal_value) || parent || before;
                if out.dialog.is_none() && modal {
                    out.dialog = Some(at(t));
                }
                // an inline confirmation: an autofocus on it or inside it moves focus in when it opens
                let focus = node.descendants().any(|d| d.value().as_element().is_some_and(|e| e.attr("autofocus").is_some()));
                if out.alert.is_none() && !modal && !focus && el.attr("role").is_some_and(alert_role) {
                    out.alert = Some(at(t));
                }
            }
            let field = matches!(el.name(), "select" | "textarea") || (el.name() == "input" && typed_field(el.attr("type")));
            let keyboard_out = el.attr("disabled").is_some() || el.attr("tabindex").is_some_and(|v| v.trim().starts_with('-'));
            let shown = el.attr("hidden").is_none() && !(el.attr("aria-hidden").is_some_and(hidden) && keyboard_out) && !el.attr("style").is_some_and(no_display);
            if field && shown && !spread.test(&raw[t.start..t.end]) {
                let in_label = node.ancestors().any(|p| p.value().as_element().is_some_and(|e| e.name() == "label"));
                let named = ["aria-label", "aria-labelledby", "title"].iter().any(|n| el.attr(n).is_some());
                if out.unlabeled.is_none() && !in_label && !named && !el.attr("id").is_some_and(|id| fors.contains(id)) {
                    out.unlabeled = Some(at(t));
                }
                let text_keyboard = el.name() == "input" && el.attr("type").is_none_or(|k| k.trim().eq_ignore_ascii_case("text"));
                if out.keyboard.is_none() && text_keyboard && el.attr("inputmode").is_none() && ["name", "id", "autocomplete"].iter().any(|n| el.attr(n).is_some_and(number_name)) {
                    out.keyboard = Some(at(t));
                }
                if out.invalid.is_none() && el.attr("aria-invalid").is_some_and(|v| v.trim() != "false") && el.attr("aria-describedby").is_none() && el.attr("aria-errormessage").is_none() {
                    out.invalid = Some(at(t));
                }
            }
            if el.name() == "input" && el.attr("type").is_some_and(|t| t.trim().eq_ignore_ascii_case("radio")) {
                if let Some(n) = el.attr("name") {
                    let grouped = node.ancestors().any(|p| p.value().as_element().is_some_and(|e| {
                        let named = e.attr("aria-label").is_some() || e.attr("aria-labelledby").is_some();
                        e.name() == "fieldset"
                            || (named && (e.attr("role").is_some_and(|r| matches!(r.trim(), "radiogroup" | "group")) || e.name() == "form"))
                            || (named && landmark(e.name(), e.attr("role")) && {
                                let fields: Vec<(bool, Option<String>)> = p.descendants().filter_map(|d| d.value().as_element().filter(|x| matches!(x.name(), "input" | "select" | "textarea") && (x.name() != "input" || typed_field(x.attr("type")))).map(|x| (x.attr("type").is_some_and(|t| t.trim().eq_ignore_ascii_case("radio")), x.attr("name").map(|n| n.to_string())))).collect();
                                one_radio_group(&fields)
                            })
                    }));
                    radios.push((at(t), n.to_string(), grouped));
                }
            }
            if out.anchor.is_none() && el.name() == "a" && el.attrs().any(|a| CLICK.contains(&a.0)) && el.attr("href").is_none() && el.attr("tabindex").is_none() {
                out.anchor = Some(at(t));
            }
            let others = ["name", "id", "placeholder"].iter().any(|n| el.attr(n).is_some_and(someone_else))
                || node.ancestors().any(|p| p.value().as_element().is_some_and(|e| e.name() == "form" && e.attrs().any(|a| someone_else(a.1))));
            if out.autofill_off.is_none() && field && !others && el.attr("autocomplete").is_some_and(|v| v.trim().eq_ignore_ascii_case("off")) && ["name", "id", "type"].iter().any(|n| el.attr(n).is_some_and(personal_name)) {
                out.autofill_off = Some(at(t));
            }
            if out.dead.is_none() && !scripted && el.name() == "a" && el.attr("href").is_some_and(nowhere) && !el.attrs().any(|a| CLICK.contains(&a.0)) {
                out.dead = Some(at(t));
            }
            if el.name() != "form" {
                continue;
            }
            let dialog_method = el.attr("method").is_some_and(|m| m.trim().eq_ignore_ascii_case("dialog"));
            let mut explicit_submit = false;
            let mut buttons = Vec::new();
            for d in node.descendants().skip(1) {
                let Node::Element(e) = d.value() else { continue };
                let Some(&k) = made.get(&d.id()) else { continue };
                // a control of a form nested inside this one belongs to that form
                let form = d.ancestors().find(|a| a.value().as_element().is_some_and(|x| x.name() == "form"));
                if form.map(|f| f.id()) != Some(node.id()) {
                    continue;
                }
                let kind = e.attr("type").map(|v| v.trim().to_ascii_lowercase());
                if matches!(e.name(), "button" | "input") && matches!(kind.as_deref(), Some("submit" | "image")) {
                    explicit_submit = true;
                }
                let bt = &tags[k];
                if e.name() == "button" && kind.is_none() && e.attr("form").is_none() && !spread.test(&raw[bt.start..bt.end]) {
                    buttons.push((at(bt), e.attrs().any(|a| CLICK.contains(&a.0))));
                }
            }
            out.untyped.extend(untyped_in_form(dialog_method, explicit_submit, &buttons));
        }
        out.loading = loaders.into_iter().min();
        out.ungrouped = ungrouped_radios(&radios);
        out
    }

    #[cfg(test)]
    mod tests {
        use super::*;

        #[test]
        fn start_tags_are_placed_at_their_angle_bracket() {
            let src = "a<<b>x &amp; <3 <img title=\"<y>\" src=1>\n<!-- <img> --><script>if (a<b) x='<img>'</script><IMG src=2>";
            let m = read(src);
            let want: Vec<usize> = src.match_indices("<img title").chain(src.match_indices("<IMG")).map(|(i, _)| u16_at(src, i)).collect();
            assert_eq!(m.img, want);
        }

        #[test]
        fn elements_judged_on_the_tree_keep_their_place() {
            let src = "<p>a &amp; b\r\n</p><table><span onclick=\"x()\">😀</span><tr><td>\r\n<button><svg></svg></button></table>";
            let m = read(src);
            assert_eq!(m.click, vec![(u16_at(src, src.find("<span").unwrap()), "span".to_string())]);
            assert_eq!(m.icon, vec![u16_at(src, src.find("<button").unwrap())]);
        }

        #[test]
        fn the_tabindex_attribute_is_found_where_it_is_written() {
            let src = "<div data-x='tabindex=9' TabIndex = \"3\">x</div><script>\nconst t = '😀'; el.tabIndex = 4;</script>";
            let script = u16_at(src, src.find("tabIndex = 4").unwrap());
            assert_eq!(read(src).tabindex, vec![(src.find("TabIndex").unwrap(), "3".to_string()), (script, "4".to_string())]);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn all(src: &str, ext: &str) -> String {
        let m = read(src, ext).unwrap();
        format!("img{:?} click{:?} icon{:?} h{:?} tab{:?}", m.img, m.click, m.icon, m.headings, m.tabindex)
    }

    #[test]
    fn strings_and_comments_are_not_markup() {
        assert_eq!(all("const s = '<img src=x>'; /* <h3> */ const a = <h1>x</h1>;", "tsx"), "img[] click[] icon[] h[(46, 1)] tab[]");
        assert_eq!(all("<script>var s = '<h3>'</script><h1>x</h1>", "html"), "img[] click[] icon[] h[(31, 1)] tab[]");
    }

    #[test]
    fn a_clickable_div_is_judged_on_its_own_children() {
        // a self-closing div has no children, so the dialog after it is a sibling, not its content
        assert_eq!(read("<><div onClick={c} /><div role=\"dialog\">x</div></>", "tsx").unwrap().click.len(), 1);
        assert!(read("<div onClick={c}>\n  <div role=\"dialog\">x</div></div>", "tsx").unwrap().click.is_empty());
        assert!(read("<div onclick=\"c()\"> <!-- sheet --> <div role=\"dialog\">x</div></div>", "html").unwrap().click.is_empty());
    }

    #[test]
    fn an_icon_button_is_named_by_text_a_label_or_a_runtime_child() {
        let flagged = |s: &str, e: &str| !read(s, e).unwrap().icon.is_empty();
        assert!(flagged("<button><Icon onClick={() => a > b} /></button>", "tsx"));
        assert!(flagged("<button><X />{/* soon */}</button>", "tsx"));
        assert!(!flagged("<button><X />{label}</button>", "tsx"));
        assert!(!flagged("<button><Image alt={name} /></button>", "tsx"));
        assert!(!flagged("<button><svg><title>Close</title></svg></button>", "html"));
        assert!(flagged("<button><svg></svg>&nbsp;</button>", "html"));
    }

    #[test]
    fn positive_tabindex_in_jsx_and_by_assignment() {
        assert_eq!(read("<div tabIndex={2} /> ; el.tabIndex = 3; <a tabIndex=\"-1\" />", "tsx").unwrap().tabindex, vec![(5, "2".to_string()), (26, "3".to_string())]);
    }

    #[test]
    fn other_markup_stays_on_the_patterns() {
        for ext in ["vue", "svelte", "astro"] {
            assert!(read("<img src=x>", ext).is_none());
        }
        assert!(read("const = = <div", "tsx").is_none());
    }
}
