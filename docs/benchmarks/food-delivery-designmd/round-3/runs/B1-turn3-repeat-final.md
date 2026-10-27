The prototype from the last turn is already built, so I didn't rebuild it. I re-checked the code on disk just now and it's in the same working state:

- **Checks:** typecheck and the production build pass, and all 18 tests pass.
- **Browser run:** the full scripted run through every state (placed to delivered, running late, sold-out items including the failed-send retry, lost location, failed refresh) finishes with no errors and no sideways scrolling at 390 and 360. This time I didn't re-run 1280, the reduced-motion pass, or the motion, keyboard and tap-target checks; they passed last turn.

Run it with `npm install && npm run dev`, then open http://localhost:5173. The **Prototype** button (top right) jumps to any state.

My previous message still holds: what's covered, the six places I departed from `DESIGN.md`, what isn't built, and the Delivery Gate.

If you meant something else by asking again, tell me which:
1. **Iterate on the current build:** for example the late-state notification, the "earlier than expected" state, browser back support, or removing the "Proposed rule" tag from the late reason.
2. **Rebuild from scratch:** a clean second take from the same brief and `DESIGN.md`, for comparison.
3. **Record my departures in `DESIGN.md`:** add the six changes from last turn so the design file matches the build.
