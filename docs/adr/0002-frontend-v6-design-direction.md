# ADR 0002 — Frontend v6.0 rebuild direction (restraint, not motion)

**Date**: 2026-08-03
**Status**: Accepted

## Context

The user asked the UI to be elevated, and named DavidHDev/react-bits as a
reference. react-bits is a motion-heavy component library with components
like Aurora, GlowSnake, StarBorder, and ASCIIText that ship bright canvas
or SVG animations by default.

In contrast taste-skill and impeccable prescribe the opposite direction —
"anti-slop": no purple/blue gradients, no aurora glow, no glass panels, and
no attention-grabbing surface motion. The two references pull in opposite
directions.

Our design read is that barista is neither a consumer creative platform nor
a data dashboard; it is a work-type knowledge tool — consultant chat + cupping
scorecards + recipe lookups. So we borrow only the smallest atoms from
react-bits: structural components like Carousel / Stepper as tools, and we
explicitly do not use Aurora / GlowSnake / StarBorder / ASCIIText / Cubeify /
Cyberglow, which carry noise/gradient canvas backgrounds.

## Decision

From react-bits we adopt: a restrained hover intensity, structured row
cards, and the dot-based typing indicator. We avoid everything that turns
the background into hero motion.

Type is Instrument Serif (editorial) + PingFang SC (body) + JetBrains Mono
(keystroke). Accent is one hue family per theme (copper-amber in light,
warm gold in dark), with tinted shadows. Reduced-motion is honored with a
0-duration fallback.

## Rationale

mattpocock's writing-great-skills lesson: when a description piles
multiple branch trigger conditions that could be merged, that is
duplication. Apply the same principle to UI. Motion is a black hole: an
animation that runs in a loop always "looks different" but rarely improves
clarity. Barista's clarity comes from:

- Type contrast (mono for metrics and prices)
- Single surface tier (surface / surface-inset, never nested)
- One accent position (every hover uses accent-bg shift)

Everything else is left to prose and data. The same discipline SAG applies
to its API picker chrome (the picker is a tool, not the main chrome) holds
for ours: surface motion should not compete with the content.
