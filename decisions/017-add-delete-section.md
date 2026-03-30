# ADR-017: Add Section + Delete Section Implementation Decisions

**Status:** Accepted
**Date:** 2026-03-27
**Context:** Phase 2, Step 4 adds the ability to add new sections (via a type picker) and delete existing ones. Both operations support undo/redo. This ADR captures the non-trivial design decisions.

## Decision 1: Insert Position — End-Only

`addSection(variantId, section)` always appends to the end of the section list. There is no `atIndex` parameter.

**Why:** Positional insertion requires the UI to communicate a target index — a separate insert-zone UX problem (hover zones between sections, insert indicators). Drag-to-reorder already exists (Step 3). The user workflow is: add at end → drag to position. Two well-defined operations beat one complex one.

**Deferred, not dropped:** The right UX is hover-reveal `+` zones between sections (Webflow/Framer pattern). This pairs with the section list panel (Step 7) and is built then — not now. The store already accepts `atIndex?: number`. The UI work is what's deferred.

## Decision 2: Section Template Registry in `editor/lib/`

Creating a valid `Section` requires a UUID, default layout, background, padding, and elements array. These templates live in `editor/lib/section-templates.ts` as a registry:

```ts
SECTION_TEMPLATES: Record<
  SectionType,
  {
    label: string
    icon: LucideIcon
    createSection: () => Section
  }
>
```

**Why a registry over inline switch:** The type picker, the factory, and Phase 3's block library all need the same type → metadata mapping. A registry centralizes it — Phase 3 adds a `previewComponent` field to each entry without touching picker or factory code.

**Why `editor/lib/`, not `shared/lib/`:** Section creation is an editor-only concern. The server (publishing pipeline, server actions) never creates sections from templates — it reads existing ones. `shared/` would be a wrong dependency direction for editor-only logic.

**Why not in the store action:** The store action would need a large switch statement to build each section type. Registry + factory keeps store actions thin (they just receive a ready-made Section and append it).

## Decision 3: Type Picker as Dialog (Modal)

The "Add section" trigger opens a `shadcn/ui Dialog`, not a popover or slide-in panel.

| Option              | Why rejected                                                                                                                                                                                                    |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Popover             | No room for visual previews. Phase 3 adds 2-3 layout variants per type — a popover would need to be replaced entirely.                                                                                          |
| Slide-in panel      | Panels are for tools kept open _while_ working. Type picking is a one-shot action: open → pick → close. A panel would also compete with the left (section list) and right (properties) panels for screen edges. |
| **Dialog (chosen)** | Correct primitive for transient decisions. Has room for a 2–3 column type grid today, and preview thumbnails in Phase 3 without changing the trigger or open/close logic.                                       |

## Decision 4: Delete UX — Immediate, No Confirmation

Clicking delete on a section removes it immediately. No confirm dialog. No toast with an "Undo" button.

**Why no confirmation:** Confirmation dialogs add friction to every delete. Real editors (Figma, Webflow, Notion) don't confirm deletes — they make undo effortless instead.

**Why no toast:** A toast "Undo" button would create a second, parallel undo mechanism alongside Ctrl+Z. Two paths to the same action is confusing UX. The global undo (already in `documentStore`) is the safety net — surface it clearly in the editor chrome (Step 7) instead of duplicating it per-action.

**UX contract:** Delete is immediate + undoable via Ctrl+Z / editor undo button. That's the full story.

## Decision 5: Undo/Redo Comes Free

`addSection()` and `deleteSection()` call `snapshot()` before mutating, same as `reorderSections()`. No extra undo logic needed at the UI layer.

**The pattern:** Every `documentStore` mutation is: `snapshot()` → mutate → `set()`. Undo pops the last snapshot. This contract means any new mutation is automatically undoable — the undo system doesn't know or care what changed.

**Memory implication:** Same as ADR-015 Decision 2. Each snapshot is ~15KB. 50-entry cap = ~750KB. Add and delete operations push the same size snapshot as reorder — no new concern.

## Consequences

- `editor/lib/section-templates.ts` is the single source of truth for section type metadata
- Phase 3 adds `previewComponent` to each registry entry — the type picker Dialog renders previews without other changes
- The Dialog's open/close state lives in the component that contains the "Add section" button (`EditorCanvas` or a dedicated `AddSectionButton` component) — not in Zustand, because it's transient UI state with no persistence need
- Delete button appears per section (hover-visible, consistent with drag handle UX in Step 3)
