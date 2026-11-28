# Code block

Part of `knowledge/design-system.md` (component catalog). This file says what the component must do, not how it
looks: its appearance comes from DESIGN.md and the project's system. In code, a hand-written copy usually looks like:
a dark box with font-mono and padding, holding a <pre> or <code>.

**Job**: show code, a command, or a key the person will copy. Inline code in a sentence is a different, smaller
component.

**Anatomy**: optional label (file name or language), the code, a copy button.

**Variants**: block, single command (one line with a copy button), with line numbers for long code.

**States**: copy button: default, focus-visible, copied (says so for a moment), failed.

**Behaviour**: long lines scroll inside the block, never the page (RX-RD-01); copy copies exactly the code, without
prompts or line numbers; a secret is masked until revealed.

**Accessibility**: `<pre><code>`; the scrolling block is reachable by keyboard; the copy button has a name and its
result is announced; contrast of syntax colours on the dark background 4.5:1.

**Common mistakes**: each docs page styling its own dark box; copy that includes the `$` prompt; a long command
that pushes the page sideways at 320 px.
