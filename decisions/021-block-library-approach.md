# ADR-021: Block Library Implementation Approach

**Status:** Accepted
**Date:** 2026-03-27
**Context:** Phase 3 adds the 6 block types, visual rendering, inline editing, property panel, image upload, and mobile preview. This ADR defines the step order and rationale. Informed by ADR-005 (block schema), ADR-004 (Zustand + XState), ADR-014 (Phase 2 approach pattern).

## The Problem

Phase 3 has eight interconnected deliverables. Building in the wrong order means rework — e.g., building a property panel before element CRUD exists means mocking store actions, or adding inline editing before visual rendering means editing invisible elements.

## Decision — Step Order

### Dependency chain

```
Store actions + templates → Rendering → Selection → Property panel → Inline editing → Block picker → Image upload → Mobile preview
  (data foundation)         (visual)    (interact)   (primary edit)   (edit enhance)   (add flow)    (media)        (responsive)
```

Principle: **data → rendering → interaction → editing → polish** (same pattern as Phase 2).

### Step 1: Document Store Element Actions + Block Template Definitions

Add `updateElement`, `addElement`, `deleteElement`, `updateSectionStyles` to `useDocumentStore`. Define block templates — what elements each `variantStyleId` contains with default content/styles.

**Why first:** Every other step needs element CRUD. Block templates are pure data — they define what gets rendered, edited, and picked.

### Step 2: Visual Element Rendering (SectionRenderer Upgrade)

Replace text-preview rendering with actual styled elements — headings with real fonts, buttons with colors, images, grid/stack layouts.

**Styling approach:** Hybrid — Tailwind for layout/structure, inline `style` for user-customizable values (color, fontSize, padding). Standard pattern for builder tools where values are dynamic and user-defined.

**Why second:** Highest-impact visual change. Validates schema → rendering pipeline before building editing on top.

### Step 3: Element Selection + Visual Highlight

Click element → XState `SELECT_ELEMENT` → highlight ring on canvas. Wire `selectedElementId` from machine context to canvas.

**Why third:** Users must target elements before editing them. Pure interaction wiring — no editing yet.

**Approach:** Click-only selection. Keyboard nav deferred to polish.

### Step 4: Property Panel (Right Sidebar)

Right sidebar with accordion sections (Content, Typography, Colors, Spacing, Background). Edits flow through `updateElement` → store → canvas re-render. UIStore already has `'properties'` panel type — fill in the implementation.

**Why fourth:** Primary editing interface. Requires element selection (step 3) and store actions (step 1).

**Layout approach:** Accordion sections. Middle ground between monolithic and over-engineered tabs.

### Step 5: Inline Text Editing

Double-click text/heading/button → `contentEditable` activates → blur saves via `updateElement`.

**Why fifth:** Delight feature. Property panel already handles text, but inline editing makes the builder feel professional.

**Approach:** `contentEditable` with blur-to-save. No rich text in schema, so keep it simple.

### Step 6: Block Picker with Variant Previews

Upgrade "add section" dialog to show visual thumbnails of each block type and its 2-3 variants. Live mini-renders of actual templates.

**Why sixth:** Requires block templates (step 1) and visual rendering (step 2) for previews.

**Approach:** Live mini-renders — always matches actual output, DRY.

### Step 7: Image Upload/Selection

Upload button in property panel for image elements. Local `/public/uploads` in dev, abstracted behind upload service interface for future cloud swap.

**Why seventh:** Needs property panel infrastructure (step 4). Independent of other editing features.

### Step 8: Mobile Preview Toggle

Toggle canvas to mobile viewport width (~375px). Blocks reflow responsively.

**Why last:** Polish feature. Requires all blocks rendered with responsive styles.

**Approach:** CSS container queries — canvas is already constrained width.

## Consequences

- 8 steps, each producing a testable increment
- Block templates defined as data, not hardcoded in components — variants are extensible
- Hybrid styling (Tailwind + inline) adds minor complexity but is necessary for dynamic user values
- `contentEditable` limits us to plain text — acceptable given schema has no rich text
- Local image upload needs swapping to cloud in Phase 4
