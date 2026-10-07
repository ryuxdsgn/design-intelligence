# EN-DB-A1 · Dashboard: design reasoning

Frame: `uYEUg` in ryux.pen (1440×900, x=63100, y=0)

## What the screen has to do
A brand-new user has no projects, tasks, or teammates yet, so a normal dashboard of widgets and charts
would be empty or would need fake data. This screen has one job: get the user to their first project.
It should also show what Home will become, so the empty areas don't look broken.

## Structure
- **Sidebar (248px)**: workspace switcher ("Dana's workspace · Free · 1 member"), Home / My tasks / Inbox /
  Search (⌘K), then a Projects section with an honest empty line, "Your projects will appear here."
  At the bottom: Invite people, Help & shortcuts, Settings. The navigation is the same one a returning
  user will see, so nothing moves around after onboarding.
- **Greeting**: shows the date, then a headline that states the goal ("Welcome, Dana. Let's set up your
  first project."), then one line saying what this page will show later (due items, changes, things that
  need you). That line sets expectations, so the user doesn't get a feature tour.
- **Main region, start panel**: the strongest part of the page. One primary button (New project) with a
  short description that lowers the stakes ("You can change everything later"). Below it are three
  templates with concrete details (view type, number of starter tasks), and below those a quieter import
  row for people moving from Trello, Asana, Jira, or CSV. That gives three entry paths in order of
  emphasis, with only one filled button.
- **Due this week**: a real Mon to Fri strip with today (Wed 7) highlighted and "0 tasks". It shows the
  shape of the future dashboard without fake tasks, and the caption says plainly that nothing is due yet.
- **Right column**: a "Getting started" checklist (1 of 4 done, with a progress bar). The current step
  is raised onto white so it matches the main panel's call to action. Each step has a one-line reason.
  Below it, "Invite your team" has an email field, a secondary Invite button, and Copy invite link. It
  sits second because inviting people means more once a project exists.

## Visual decisions
- Warm off-white canvas (#F7F6F3) with white surfaces. Only the elements that need a container get one
  (the start panel, the template choices, the invite form). The checklist and week strip sit on the page
  directly so the screen doesn't turn into a grid of cards.
- A single accent (deep blue #1F3FBF) is used only for the primary action, the current location and
  step, links, and today. Template tiles use soft neutral tints for identification only.
- Instrument Sans for headings gives a bit of character; Inter for UI text. The type scale is
  30 / 17 / 16 / 14 / 13 / 12.
- Medium density: this is a low-complexity first-run moment, so the spacing is generous, but the layout
  is the same as a working dashboard's.

## Deliberately left out
- No charts, KPIs, or "recent activity" filled with sample data. Fake numbers on a first login mislead
  people and teach them nothing.
- No onboarding modal or carousel. The page itself is the onboarding, and the user can skip it by
  using the sidebar.
- No illustration in the empty states. The copy and the real structure do that work.

## Assumptions (not asked, since the brief was clear enough to proceed)
- A generic team PM tool with list, board, and timeline views. The user signed up alone (1 member) and
  the workspace already exists (step 1 is done). Desktop web at 1440 wide.
- States not drawn: what Home looks like after the first project, loading, and an invite error. These
  would be next.
