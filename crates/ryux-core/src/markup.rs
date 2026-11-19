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
        AssignmentExpression, AssignmentTarget, Expression, JSXAttributeItem, JSXAttributeValue, JSXChild, JSXElement, JSXExpression, JSXOpeningElement,
    };
    use oxc_ast_visit::{walk, Visit};
    use oxc_parser::Parser;
    use oxc_span::{GetSpan, SourceType, Span};

    struct Reader<'s> {
        src: &'s str,
        out: Markup,
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
            walk::walk_jsx_element(self, el);
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

    fn parse(raw: &str, kind: SourceType) -> Option<Markup> {
        let alloc = Allocator::default();
        let ret = Parser::new(&alloc, raw, kind).parse();
        if ret.fatal_error {
            return None;
        }
        let mut r = Reader { src: raw, out: Markup::default() };
        r.visit_program(&ret.program);
        Some(r.out)
    }

    pub fn read(raw: &str, ext: &str) -> Option<Markup> {
        parse(raw, if ext == "tsx" { SourceType::tsx() } else { SourceType::jsx() })
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
