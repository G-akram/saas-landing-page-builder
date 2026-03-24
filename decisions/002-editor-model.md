# ADR-002: Section-Based Editor (not Canvas)

**Status:** Accepted
**Date:** 2026-03-24
**Context:** Choose the editor model. This is the most fundamental architectural decision — everything else (schema, responsive, rendering) depends on it. Informed by competitive research (`research/competitive-analysis.md`).

## Options Considered

### A: Canvas-based (Framer / Webflow style)

- Free-form positioning on a 2D canvas
- Layers panel, z-index management, snapping guides
- Elements positioned absolutely or in nested flex/grid containers

### B: Section-based (Carrd / Unbounce Smart Builder style)

- Page = vertical stack of sections
- Each section contains elements in a constrained layout (grid or flow)
- No free-form positioning — elements live within section boundaries

## Decision

**Section-based editor.**

## Rationale

| Factor                 | Canvas                                                                                            | Section-based                                                              |
| ---------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| **Engineering effort** | 10x — coordinate system, collision detection, z-index, layers panel, snap guides, zoom/pan        | Manageable — ordered list of sections, each with a layout                  |
| **Responsive**         | Painful — absolute positions don't stack. Need separate mobile layout or complex reflow logic     | Near-free — sections stack vertically by nature. Auto-stack handles mobile |
| **A/B variant schema** | Harder — tree of arbitrarily nested nodes with positions. Diffing/duplicating variants is complex | Cleaner — flat array of sections. Duplicate a variant = clone the array    |
| **User speed**         | Slower — more decisions (where to place, how to size, layer order)                                | Faster — pick a block, customize it, done                                  |
| **Design freedom**     | Maximum                                                                                           | Constrained (but sufficient for landing pages)                             |
| **Target user**        | Designers                                                                                         | Marketers, founders, devs — people who want results fast                   |

### Why not canvas?

1. **Scope** — A production-quality canvas editor is a multi-year effort (Framer has 100+ engineers). Section-based lets us ship a complete product.
2. **Landing pages don't need it** — Landing pages are inherently vertical: hero → content → CTA → footer. A canvas adds freedom users won't use.
3. **Responsive** — Our MVP promises auto-stack responsive. This only works with flow-based layouts. Canvas would require a separate mobile editor (like Unbounce Classic), which is a UX nightmare.
4. **A/B testing** — Variant-aware schema (ADR-001) is dramatically simpler when pages are section arrays vs nested node trees.

## Consequences

- Maximum layout flexibility is sacrificed — users can't do arbitrary positioning
- Section layout system still needs design (grid? flex? slots?) — decided in Step 3
- Canvas could be a "Later" evolution if needed, but section-based is the foundation
