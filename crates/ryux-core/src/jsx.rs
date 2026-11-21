//! Checks that read JSX and TSX as a syntax tree (oxc), where a pattern over the text cannot tell an element
//! from a string, or a prop from text. engine.ts runs them through `syntaxScan`.

use crate::jsre::u16_at;
use oxc_allocator::Allocator;
use oxc_ast::ast::{JSXAttributeItem, JSXAttributeName, JSXElementName, JSXOpeningElement};
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

#[cfg(test)]
mod tests {
    use super::*;

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
