# ADR-005: Block Schema Design

**Status:** Accepted
**Date:** 2026-03-24
**Context:** Define the data structure that represents a landing page — the JSON shape that `documentStore` holds, serializes to the database, and publishes as HTML. Every feature touches this schema: the editor renders it, the sidebar edits it, drag-reorder mutates it, undo/redo snapshots it, publishing converts it to HTML, A/B testing duplicates parts of it. Informed by ADR-001 (MVP features, variant-aware schema), ADR-002 (section-based editor), and ADR-004 (Zustand `documentStore` owns this data).

## The Problem

We need a data structure that supports:

| Requirement              | Why                                                                        |
| ------------------------ | -------------------------------------------------------------------------- |
| **Render a page**        | Editor canvas iterates sections → elements and draws them                  |
| **Edit any element**     | Sidebar reads/writes properties on a specific element by ID                |
| **Reorder sections**     | Drag-drop changes section order — must be a simple array operation         |
| **Undo/redo**            | `documentStore` snapshots the entire document — complexity = snapshot cost |
| **A/B variants**         | Each variant may have different sections, elements, or content             |
| **Publish to HTML**      | Schema must be walkable to generate static HTML + CSS                      |
| **Multi-column layouts** | Features section has 3 cards side-by-side, hero stacks vertically          |

The schema must be **simple enough** to snapshot for undo/redo (deep clone on every action), **structured enough** to support section layouts, and **variant-aware** from day 1 (ADR-001).

## Key Design Questions

### 1. Hierarchy — how deep does nesting go?

| Approach           | Structure                                     | Pros                                     | Cons                                                          |
| ------------------ | --------------------------------------------- | ---------------------------------------- | ------------------------------------------------------------- |
| **2-level**        | Section → Elements (layout config on section) | Simple, flat, easy to snapshot/serialize | Layout logic implicit via config                              |
| **3-level**        | Section → Columns → Elements                  | Explicit column containers               | Extra nesting, harder to manipulate                           |
| **Recursive tree** | Node → children → children → ... (like DOM)   | Maximum flexibility                      | Complex traversal, hard undo/redo, overkill for landing pages |

**Decision: 2-level.** Sections define their layout (e.g., "3-column grid"), elements declare which slot they occupy. No intermediate column nodes. Matches ADR-002 — sections are the unit of layout, elements are leaf nodes.

Why not 3-level? A Features section with 3 cards doesn't need explicit `<Column>` containers in the schema. The section says "I'm a 3-column grid," each element says "I'm in slot 0/1/2." Simpler to reorder, simpler to snapshot, simpler to render.

### 2. Variants — full copy or diff-based?

| Approach       | How it works                                      | Pros                                                   | Cons                                                                                      |
| -------------- | ------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------------------------------------- |
| **Full copy**  | Each variant owns its own complete sections array | Simple — render/edit/publish any variant independently | Duplicated data                                                                           |
| **Diff-based** | Variants share a base, store only overrides       | Space-efficient                                        | Complex — what's the "base"? How do you reorder sections in one variant? Merge conflicts. |

**Decision: Full copy.** A landing page is a few KB of JSON. Duplicating the sections array per variant costs nothing in storage but saves massive complexity in editing, undo/redo, and publishing. Each variant is a self-contained renderable document.

### 3. Styles — where do they live?

| Approach                 | How it works                       | Pros                           | Cons                                                   |
| ------------------------ | ---------------------------------- | ------------------------------ | ------------------------------------------------------ |
| **Inline on element**    | Each element has a `styles` object | Simple, direct, no indirection | Repeated values if elements share styles               |
| **Shared style objects** | Elements reference style IDs       | DRY                            | Indirection, harder to edit, shared mutation risk      |
| **CSS classes**          | Elements reference class names     | Familiar                       | Requires CSS knowledge from users, class management UI |

**Decision: Inline on element.** Per-element styles (ADR-001). No CSS classes, no shared style objects. Users pick a color, it goes on that element. Style duplication across elements is fine — landing pages have <50 elements, not 5000.

## Decision — The Schema

### Hierarchy

```
Page
 └─ Variant[]           (A/B variants — each is a full copy)
     └─ Section[]        (vertical stack — the page structure)
         └─ Element[]    (leaf nodes — text, buttons, images)
```

### TypeScript Types

```typescript
// ── Page ──────────────────────────────────────────────
interface Page {
  id: string
  name: string // user-facing name ("My Startup Landing Page")
  slug: string // URL path ("my-startup")
  variants: Variant[]
  activeVariantId: string // which variant is shown in editor
  createdAt: string
  updatedAt: string
}

// ── Variant ───────────────────────────────────────────
interface Variant {
  id: string
  name: string // "Original", "Variant B"
  trafficWeight: number // 0-100, all variants sum to 100
  sections: Section[] // full copy — independent per variant
}

// ── Section ───────────────────────────────────────────
type SectionType = 'hero' | 'features' | 'cta' | 'pricing' | 'testimonials' | 'footer'

interface Section {
  id: string
  type: SectionType
  variantStyleId: string // which visual variant of this section type ("hero-1", "hero-2")
  layout: SectionLayout
  background: BackgroundConfig
  padding: SpacingConfig
  elements: Element[]
}

interface SectionLayout {
  type: 'stack' | 'grid'
  columns?: number // for grid: 2, 3, 4
  gap: number // px between elements
  align: 'left' | 'center' | 'right'
  verticalAlign: 'top' | 'center' | 'bottom'
}

interface BackgroundConfig {
  type: 'color' | 'gradient' | 'image'
  value: string // hex, gradient string, or image URL
  overlay?: string // optional overlay color with opacity
}

interface SpacingConfig {
  top: number
  bottom: number
  left: number
  right: number
}

// ── Element ───────────────────────────────────────────
type ElementType = 'heading' | 'text' | 'button' | 'image' | 'icon'

interface Element {
  id: string
  type: ElementType
  slot: number // position in section layout (0-indexed)
  content: ElementContent
  styles: ElementStyles
  link?: LinkConfig
}

// Content varies by element type
type ElementContent =
  | { type: 'heading'; text: string; level: 1 | 2 | 3 | 4 }
  | { type: 'text'; text: string }
  | { type: 'button'; text: string }
  | { type: 'image'; src: string; alt: string }
  | { type: 'icon'; name: string }

interface ElementStyles {
  // Typography
  fontSize?: number
  fontWeight?: number
  fontFamily?: string
  color?: string
  textAlign?: 'left' | 'center' | 'right'
  lineHeight?: number

  // Box
  backgroundColor?: string
  borderRadius?: number
  padding?: SpacingConfig

  // Dimensions
  width?: string // "100%", "auto", "300px"
  maxWidth?: string

  // Spacing within section
  marginTop?: number
  marginBottom?: number
}

interface LinkConfig {
  type: 'url' | 'section' | 'variant'
  value: string // URL, section ID, or variant ID
  newTab: boolean
}
```

### Example — Real Page JSON

A page with a Hero and Features section, one variant:

```json
{
  "id": "page_1",
  "name": "My Startup",
  "slug": "my-startup",
  "activeVariantId": "var_1",
  "variants": [
    {
      "id": "var_1",
      "name": "Original",
      "trafficWeight": 100,
      "sections": [
        {
          "id": "sec_1",
          "type": "hero",
          "variantStyleId": "hero-1",
          "layout": {
            "type": "stack",
            "gap": 16,
            "align": "center",
            "verticalAlign": "center"
          },
          "background": { "type": "color", "value": "#0a0a0a" },
          "padding": { "top": 80, "bottom": 80, "left": 24, "right": 24 },
          "elements": [
            {
              "id": "el_1",
              "type": "heading",
              "slot": 0,
              "content": { "type": "heading", "text": "Build landing pages fast", "level": 1 },
              "styles": {
                "fontSize": 48,
                "fontWeight": 700,
                "color": "#ffffff",
                "textAlign": "center"
              }
            },
            {
              "id": "el_2",
              "type": "text",
              "slot": 1,
              "content": {
                "type": "text",
                "text": "No code required. Just drag, drop, and publish."
              },
              "styles": {
                "fontSize": 18,
                "color": "#a0a0a0",
                "textAlign": "center",
                "maxWidth": "600px"
              }
            },
            {
              "id": "el_3",
              "type": "button",
              "slot": 2,
              "content": { "type": "button", "text": "Get Started" },
              "styles": {
                "fontSize": 16,
                "fontWeight": 600,
                "color": "#ffffff",
                "backgroundColor": "#6366f1",
                "borderRadius": 8,
                "padding": { "top": 12, "bottom": 12, "left": 24, "right": 24 }
              },
              "link": { "type": "url", "value": "#pricing", "newTab": false }
            }
          ]
        },
        {
          "id": "sec_2",
          "type": "features",
          "variantStyleId": "features-1",
          "layout": {
            "type": "grid",
            "columns": 3,
            "gap": 24,
            "align": "center",
            "verticalAlign": "top"
          },
          "background": { "type": "color", "value": "#111111" },
          "padding": { "top": 64, "bottom": 64, "left": 24, "right": 24 },
          "elements": [
            {
              "id": "el_4",
              "type": "heading",
              "slot": 0,
              "content": { "type": "heading", "text": "Drag & Drop", "level": 3 },
              "styles": { "fontSize": 20, "fontWeight": 600, "color": "#ffffff" }
            },
            {
              "id": "el_5",
              "type": "text",
              "slot": 0,
              "content": { "type": "text", "text": "Intuitive editor that just works." },
              "styles": { "fontSize": 14, "color": "#a0a0a0" }
            },
            {
              "id": "el_6",
              "type": "heading",
              "slot": 1,
              "content": { "type": "heading", "text": "A/B Testing", "level": 3 },
              "styles": { "fontSize": 20, "fontWeight": 600, "color": "#ffffff" }
            },
            {
              "id": "el_7",
              "type": "text",
              "slot": 1,
              "content": { "type": "text", "text": "Test variants and optimize conversions." },
              "styles": { "fontSize": 14, "color": "#a0a0a0" }
            },
            {
              "id": "el_8",
              "type": "heading",
              "slot": 2,
              "content": { "type": "heading", "text": "One-Click Publish", "level": 3 },
              "styles": { "fontSize": 20, "fontWeight": 600, "color": "#ffffff" }
            },
            {
              "id": "el_9",
              "type": "text",
              "slot": 2,
              "content": { "type": "text", "text": "Go live instantly on your subdomain." },
              "styles": { "fontSize": 14, "color": "#a0a0a0" }
            }
          ]
        }
      ]
    }
  ]
}
```

### How the slot system works

The `slot` field tells the renderer where an element goes within the section layout:

- **Stack layout** (`type: 'stack'`): `slot` = vertical order (0, 1, 2 = top to bottom). Elements render in slot order.
- **Grid layout** (`type: 'grid'`, `columns: 3`): `slot` = column index (0, 1, 2). Multiple elements in the same slot stack vertically within that column.

```
Features section (grid, 3 columns):

  slot 0          slot 1          slot 2
  ┌─────────┐    ┌─────────┐    ┌─────────┐
  │ heading  │    │ heading  │    │ heading  │
  │ text     │    │ text     │    │ text     │
  └─────────┘    └─────────┘    └─────────┘

Hero section (stack):

  slot 0: heading
  slot 1: subtext
  slot 2: button
```

This avoids a 3rd level of nesting (no column containers). The section's layout config + element slot values are enough to determine rendering.

## How This Connects to Other Decisions

| Decision                           | Connection                                                                                                          |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **ADR-002** (Section-based editor) | Schema mirrors the editor model: page = stack of sections, sections contain elements                                |
| **ADR-004** (`documentStore`)      | This schema is what `documentStore` holds. Undo/redo = snapshot this JSON.                                          |
| **ADR-004** (XState)               | Editor machine events map to schema mutations: `DRAG_START` → reorder `sections[]`, `SELECT` → find element by ID   |
| **ADR-006** (Styling — TBD)        | `ElementStyles` and `BackgroundConfig` define what's customizable. Styling ADR will define how these render to CSS. |
| **ADR-007** (Database — TBD)       | Schema must be serializable. Likely stored as a single JSON column (document model) vs normalized tables.           |
| **ADR-008** (Publishing — TBD)     | Publisher walks this schema to generate static HTML. Simpler schema = simpler publisher.                            |

## Extensibility — What If We Need More Nesting?

Landing pages have a finite set of layouts. Every real section maps to 1-column stack or multi-column grid:

```
Hero:         stack       → [heading] [text] [button]
Features:     grid (3)    → [card] [card] [card]
Pricing:      grid (3)    → [plan] [plan] [plan]
Testimonials: grid (2)    → [quote] [quote]
CTA:          stack       → [heading] [text] [button]
Footer:       grid (3-4)  → [links] [links] [links] [copyright]
```

No real landing page needs nested grids (a card containing a grid containing another card). That's app UI, not landing pages. Our section types are constrained by design (ADR-002).

**If we later need grouped content** (e.g., a feature card with icon + heading + text as a unit), two options:

| Approach                   | How                                                                                  | Schema change?                                                        |
| -------------------------- | ------------------------------------------------------------------------------------ | --------------------------------------------------------------------- |
| **Composite element type** | Add `ElementType = 'feature-card'` with structured content `{ icon, heading, text }` | No structural change — new element type, same 2-level schema          |
| **3rd level nesting**      | Add `children: Element[]` on Element                                                 | Structural change — every function that walks elements needs updating |

**Rule: prefer composite element types over deeper nesting.** Add nesting only when users need multiple _different_ arrangements of children, not when the structure is known and fixed. A feature card always has icon + heading + text — that's a data type, not a tree.

**Recursive trees** (like Notion blocks or the DOM) solve a different problem: arbitrary user-defined structures. Our users pick pre-built sections and customize content. The structure is defined by us, the content by them.

## Undo/Redo — Snapshot Strategy

From ADR-004: undo/redo uses snapshot-based history in `documentStore`. This means on every action, we deep-clone the document.

### Snapshot cost

Schema complexity directly affects snapshot cost:

- **Our schema**: 2 levels of nesting, ~50 elements max → deep clone is <1ms. No concern.
- **If we had recursive nesting**: tree diffing, structural sharing needed. Unnecessary complexity.
- **If variants were diff-based**: undo on one variant could affect the "base" that other variants reference. Full copy avoids this entirely.

### History cap: 50 snapshots

A typical landing page (6 sections, ~30 elements) is **5-15 KB** of JSON.

| Snapshots | Memory cost      | Context               |
| --------- | ---------------- | --------------------- |
| 30        | ~150-450 KB      | Comfortable           |
| 50        | ~250-750 KB      | Still nothing         |
| 100       | ~500 KB - 1.5 MB | Fine, but unnecessary |

**Cap at 50 undo steps.** Rationale:

- Enough to undo any realistic sequence of edits in a session
- Memory cost is negligible (~500 KB worst case)
- Simple implementation — fixed-size array, push new, shift oldest when full
- Nobody meaningfully undoes 50+ steps — that's version history (v1.1), not undo

```typescript
// Conceptual implementation in documentStore
const MAX_HISTORY = 50

interface DocumentHistory {
  undoStack: DocumentSnapshot[] // max 50
  redoStack: DocumentSnapshot[] // cleared on new action, also max 50
}

// On every action:
// 1. Push current state to undoStack
// 2. If undoStack.length > MAX_HISTORY → shift oldest
// 3. Clear redoStack
```

Reference: Figma uses ~100 steps, Photoshop defaults to ~50. Both deal with much larger documents.

### When snapshots stop being enough

| Trigger                                    | What to do                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------ |
| **Large documents (hundreds of elements)** | Switch to **patches** (store only what changed). `immer` gives patches for free. Not needed for MVP.   |
| **Collaborative editing**                  | Snapshots don't work — need operational transforms or CRDTs. "Later" feature (ADR-003 migration path). |

Both are post-MVP concerns. Full snapshots with a cap of 50 is the right starting point.

## Consequences

- `variantStyleId` on sections (e.g., "hero-1", "hero-2") connects to the pre-built block library. Each style variant is a different visual layout of the same section type — implementation details in the block library, not the schema.
- `slot` system is simple but constrained — elements can't span multiple columns. Sufficient for MVP; CSS Grid `span` support could extend this later.
- Full copy per variant means duplicating sections when creating a new variant. Trivial (JSON deep clone) but means edits to one variant don't propagate to others — this is a feature, not a bug.
- Single JSON document model implies the database stores this as one blob per page. Impacts ADR-007 (database design).
- Element types are a closed set (`heading | text | button | image | icon`). Adding new types later requires schema + renderer changes, but the pattern is clear.
