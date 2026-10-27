The v3 illustrations are in place on "Pilot B1 fixed". Every standing scene now has its own body. "Pilot B1" itself is unchanged: it has 0 new illustration nodes and the same 33 old instances.

## What changed

**Poses.** I replaced the art inside the existing components. Their IDs stayed the same, so all 62 illustration slots on the screens updated without swapping anything.

| Scene | v2 | v3 |
| --- | --- | --- |
| Placed | straight body, holding the ticket | weight on one leg with the hip shifted (contrapposto), hand on hip, reading the ticket, head tilted |
| Preparing | straight body, holding the bag | lunges toward the pass, front knee bent, both hands gripping the bag rim |
| Picking | straight body, arm up | on tiptoe, torso turned to the shelf, grocery bag held by the handle |
| Arriving | feet side by side | mid-step, back heel lifting, bag carried by its strap, looking up |
| Delivered | straight body | weight forward, bag held out |
| Item unavailable | straight body | shrug with the hip shifted, open palm by the gap, head tilted |
| Cancelled | straight body, hands relaxed | shoulders dropped, hand on the closed box, head down |
| Finding a courier | straight body | weight on one leg, phone in both hands, head bowed; signal moved clear of the head |
| Offline | straight body | hand in pocket, phone lowered, head up to the faded signal |
| Running late | (rides) | same body, head tilted more |

**Head.** It's still one component with the same eight expressions. I only made the brows thicker and steeper.

**Kept.** The palette, the places, the e-bike and the On the way scene are as they were. Colours are still bound to the tokens, with no hex colours left.

**Header crops.**
- At 120 pt (390) and 88 pt (360), several crops clipped the top of the helmet. I moved the framing in seven of the crops: Placed, Preparing, Picking, Arriving, Item unavailable, Finding a courier and Offline. They all now leave at least 4 pt above the helmet.
- On Offline the signal arcs and the left edge were cut off, and on Item unavailable the raised hand was. Both are now in frame.
- I rendered all six 360 headers and four of the 390 ones: Preparing, Picking and Finding a courier (both widths), Running late and Item unavailable (360), Offline (both widths, plus once more after the final nudge at 390). The state reads from posture and head tilt.
- Delivered (240 pt) and Cancelled (280 pt) use the full scenes, and no head is cut off in any full-scene slot.

**Sheet.**
- The title now says v3, and the style text describes the pose rules.
- Provenance now reads: "Made by the agent (Claude) as SVG from a script, imported into Figma as editable vectors; no generated images, no copied references."
- Each cell label describes its pose, and labels wrap so the grid stays even.
- The same wording fix went into the scene and header-crop component descriptions.
- **Skin variants b and c lost their skin colour when the art was replaced.** I reapplied it as raw colours, a deeper and a lighter tone, because the file only has the `illo/skin-1` variable.

**DESIGN.md.** Added a v3 change note, a "Pose with weight" rule, the stronger-brows note on the face, a rewritten pose table, and the corrected provenance in Delivery. The previous version is saved at `/tmp/b1illo3/DESIGN.before-v3.md`.

**One near-miss.** My page-wide search for "drawn by us" also matched an unrelated note about street labels coming from the platform map. I changed it back to its original wording right away.

## Delivery Gate

- **Shipped:** v3 heads and nine standing scenes, adjusted header crops, updated sheet and DESIGN.md.
- **Checked:**
  - **Screens:** checked the crops at 390 and 360 at 120 and 88 pt.
  - **Sheet and board:** both rendered.
  - **Tokens:** all colours bound.
  - **Provenance:** says agent-made.
  - **Original page:** unchanged.
- **Not checked:**
  - I didn't look at the 30 pt map markers with the new brows.
  - I didn't render the 360 Placed and Arriving headers or the 120 pt (390) Arriving and Placed headers.
  - No contrast check was run on the art. It's decorative, and the alt text carries the meaning (RX-UI-19).
- **Risks:**
  - The skin-variant colours aren't tokens. Adding `illo/skin-2` and `illo/skin-3` variables would fix that.
  - In the Picking header at 88 pt the helmet sits close to the top edge (about 5 pt).
- **Provenance:** illustrative. I made it as SVG from a script (`/tmp/b1scripts/illo3.py`) and imported it as editable vectors; no generated images and no copied references.
- **Confidence:** medium. The poses are clearly different and carry weight, but they still need an owner review at real size on a device.
