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
