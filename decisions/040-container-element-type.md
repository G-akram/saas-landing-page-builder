# ADR 040 — Container Element Type (Compound Components)

## Status
Accepted

## Context

Sections rendered a flat array of atomic elements (`heading`, `text`, `button`, `image`, `icon`). This produced bland output because there was no concept of a "card" as a grouped visual unit. Creative Tim-quality designs use compound components — a card is a styled box containing icon + title + body as one cohesive unit with internal spacing and shared visual identity.

The existing `slotStyle` field applied the same card styling to every grid cell, but it had three hard limits:
- Users couldn't add or remove elements from an individual card
- Every card in a section had to be identically composed
- The "card" had no semantic identity — it was just a CSS wrapper around elements that happened to share a slot number

The core user problem: a user adding a Features section wanted to remove the icon from one card and add a button to another. `slotStyle` made this impossible.

## Decision

Add a `container` element type that creates real compound components with **one level of nesting only**: a container holds `AtomicElement[]` children; children cannot themselves be containers.

Schema:
- `ContainerElementSchema` — adds `containerStyle` (bg, border, radius, shadow, backdrop-filter, padding), `containerLayout` (direction, gap, align), and `children: AtomicElementSchema[]`
- `ElementSchema = z.union([AtomicElementSchema, ContainerElementSchema])`
- `isContainerElement(element)` type guard for narrowing throughout the codebase

Key implementation choices:
- `children` is typed as `AtomicElement[]`, not `Element[]` — enforcing the 1-level limit at the type system level, not just by convention
- Children use `slot: 0`; layout inside a container is controlled by `containerLayout.direction/gap`, not slot numbers
- The `slotStyle` field on `Section` is kept for backward compatibility but marked `@deprecated` — new templates use per-container styling instead
- Factory functions (`heading`, `text`, `button`, `icon`, `image`, `badge`) return `AtomicElement` (not the full union) so they can be passed directly as container children without casts

## Alternatives considered

### Full tree recursion (containers can hold containers)
- **Pro**: Maximum flexibility, mirrors the DOM
- **Con**: Zod recursive schemas add complexity (`z.lazy`). Editor UX explodes — how deep can you go? Property panel needs breadcrumb chains. Template authoring becomes much harder.
- **Verdict**: 99% of landing page layouts fit 1 level. The flexibility gain doesn't justify the complexity cost at this stage.

### Keep `slotStyle` + more pre-made variants
- **Pro**: Zero schema change, just add 100 templates
- **Con**: Doesn't solve the user's actual problem (add/remove elements from a card). The user is always stuck with whatever composition the template chose.
- **Verdict**: Templates are a complement to the system, not a substitute for composability.

### Separate `Card` block type
- **Pro**: Simpler — no schema union, card is its own section type
- **Con**: A card inside a features section is an element, not a section. Modeling it as a section type breaks the conceptual hierarchy and the editor layout model.
- **Verdict**: Rejected on conceptual grounds.

## Consequences

- **Better default output**: Features, pricing, and testimonial sections now render as real card groups, not flat stacked elements
- **User control**: Users can add/remove elements from any card independently
- **Template authoring**: Templates use `container()` factory instead of flat element arrays + `slotStyle`
- **Store**: `addElement`, `updateElement`, `deleteElement` all support deep lookup (top-level or inside a container child array)
- **Publishing**: `published-page-element.ts` renders containers as `<div>` with flex CSS and maps children through the same renderer
- **Constraint accepted**: 2-level nesting (container → container) is not supported. If this becomes a real need, revisit with ADR.
