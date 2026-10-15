# 2. Form workflow with validation and error recovery

**Prompt** (`prompts/02.txt`)

> Build the "Add employee" form of a small-business payroll app as one HTML, CSS, and JavaScript
> file, `index.html`, no frameworks. Users: business owners, often on a phone. Fields: full name,
> work email, start date, monthly salary, bank account number. All are required. Submitting sends
> the employee to the server; the server can reject the email as already used, or fail. There is
> no real server: simulate it in the page and make the simulation obvious in the code. Widths: 390
> and 1280. Currency, brand, and anything else: not decided.

**Context given**: the prompt only.

**Expected**
- Visible labels (not placeholder-only), correct input types and autocomplete, required marked.
- Validation when it helps (on blur or submit, not on every keystroke), messages that say how to
  fix, focus moves to the first error, an error summary or equivalent for screen readers.
- Input kept after any error; submitting state disables double submit; server "email already
  used" shown on the email field; server failure shown with a retry that keeps the data.
- Success says what happened (employee added) and what next; it appears only after the simulated
  server succeeded.
- Currency not decided: no currency symbol presented as fact (a neutral or clearly labeled one).

**Critical failures**: a success shown without the simulated request finishing; invented rules
(salary minimum, email domain rule, tax fields) presented as requirements; a submit that does
nothing; data cleared on error.

**Gates**: PRODUCT, UX, ACCESSIBILITY, RESPONSIVE (390, 1280), EDGE CASES, CODE QUALITY,
VISUAL QA, ANTI-SLOP.

**Verify** (Playwright, scripted): load at 390 and 1280 and screenshot; submit empty → errors shown,
focus on first error; fill valid data with the "used" email path → field error, data kept; trigger
server failure → retry keeps data; succeed → success state. Check labels are associated, contrast of
error text, keyboard-only completion.

**Evidence to count the run**: `index.html`, the screenshots, the Playwright log of each path.
