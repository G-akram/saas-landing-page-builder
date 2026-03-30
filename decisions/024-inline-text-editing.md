# ADR-024: Inline Text Editing

**Status:** Accepted
**Date:** 2026-03-28
**Context:** Phase 3 step 5. Adds double-click-to-edit for heading, text, and button elements in the canvas.

## Decisions

### 1. `contentEditable` over a floating input overlay

A floating `<input>` positioned over the element requires coordinate math that drifts when the canvas scrolls or sections are styled with transforms. `contentEditable` is WYSIWYG by construction — the element the user edits _is_ the element they see. The downside (limited to plain text) matches our schema: `PageElement` content has no rich-text format.

### 2. `editing` state in XState — not a Zustand flag

`isEditing: boolean` in UIStore would require manual guards everywhere:

- "block DRAG_START if editing"
- "block SELECT_SECTION if editing"
- "save before TOGGLE_PREVIEW if editing"

In XState, impossible transitions are structurally absent. The `editing` state has no `DRAG_START` handler — drag while typing is impossible by design, not by runtime check.

Transition map:

```
selected → (EDIT_START) → editing
editing  → (EDIT_END)   → selected
editing  → (DESELECT)   → idle
editing  → (TOGGLE_PREVIEW) → previewing   // blur-save already fired before click
editing drops: DRAG_START, SELECT_ELEMENT   // silently ignored, not guarded
```

### 3. Blur fires before click — no save/transition race

Browser event order: `mousedown` on new element → `blur` on contentEditable (synchronous) → `mouseup` → `click`. This means:

- `EDIT_END` + inline save commit before any click-triggered `SELECT_ELEMENT` or `TOGGLE_PREVIEW`.
- No timer or `flushSync` needed.

### 4. React + `contentEditable` coexistence

React's reconciler would overwrite DOM text on re-render if another subtree update triggers. This is safe because:

- The store only updates `element.content.text` on `updateElement`, which is called from the blur handler.
- Blur fires before the store update, which fires before the re-render.
- By re-render time, `element.content.text` in the store equals what's in the DOM.

`suppressContentEditableWarning` suppresses the React warning; it does not prevent reconciliation. The ordering guarantee above is what makes it safe.

### 5. `innerText` over `textContent` for reading edited content

`textContent` returns raw DOM text including `<br>` as nothing and doesn't collapse whitespace per CSS rules. `innerText` returns the rendered text — it normalizes line endings and respects `display` properties. For a builder where the user sees what they type, `innerText` is correct.

### 6. Paste stripping

`contentEditable` accepts rich HTML from the clipboard by default. Pasting from Word, Google Docs, or a browser tab would inject `<b>`, `<span style>`, etc. We strip to plain text on paste using the Selection API (`range.insertNode(document.createTextNode(text))`). `execCommand('insertText')` is deprecated and not used.

### 7. Escape cancels; Enter submits for single-line elements

- `Escape`: restore `originalText` (captured on `EDIT_START`) via `innerText` assignment, then blur without saving.
- `Enter` (no Shift) on `heading` and `button` types: `e.preventDefault()` + `.blur()` to submit. These are single-line by design.
- `Enter` on `text` type: allowed (paragraph line breaks).

A `isCancellingRef` guard prevents the blur handler from saving when Escape triggers programmatic blur.

## Consequences

- `editing` state added to XState machine — all interaction constraints are declarative.
- 4 new props thread through the canvas → section → layout chain: `editingElementId`, `onEditStart`, `onEditEnd`, `onInlineSave`.
- Only `heading`, `text`, `button` content types support inline editing. `image` and `icon` do not (no `text` field).
- Undo is a single entry per blur-save commit — mid-edit keystrokes are not undoable, consistent with native text inputs.
