Recap

- Fixed color palette lag and the "Maximum update depth exceeded" path.
  - Color controls now preview live while dragging.
  - Undo history is pushed once at the start of color-drag, then preview updates skip history churn.
  - Hex colors are normalized before saving.
  - Store updates now skip no-op patches to avoid unnecessary re-renders/history churn.
- Fixed editor reload hydration mismatch.
  - Added a hydration-safe initial render in EditorShell before mounting the full editor UI.
- Fixed inline editing keyboard behavior.
  - Section key handlers now ignore events coming from nested editable elements.
  - Single-line elements: Enter commits.
  - Multi-line text elements: Enter commits, Shift+Enter inserts a new line.

Result

- Color changes are smoother and no longer trigger the update-depth error flow.
- Color updates are visible live while dragging, without the previous lag.
- Editor reload no longer shows the previous hydration mismatch behavior.
- Inline editing supports normal spaces and proper multi-line authoring with Shift+Enter.

Validation output

- npm run lint: passed
- npm run typecheck: passed
- npx vitest run: passed (58/58)

Manual test checklist

- Start app: `npm run dev`
- Open an editor page and keep browser console open.

- Test 1: color controls + lag/error
  - Select a button element, then drag the color picker in Typography and Appearance controls.
  - Expected: smooth updates, no heavy lag, no "Maximum update depth exceeded" error.
  - Also type a color manually (for example `#ff0000`) and blur input.
  - Expected: value applies correctly.

- Test 2: hydration on reload
  - Open `/editor/{pageId}` and hard refresh the page.
  - Expected: no hydration mismatch warning in console.
  - Expected: editor loads normally after the short loading state.

- Test 3: inline editing behavior
  - Double-click a text paragraph element to edit.
  - Press `Space` while typing.
  - Expected: inserts a normal space (does not behave like section select/enter).
  - Press `Shift+Enter`.
  - Expected: inserts a new line.
  - Press `Enter`.
  - Expected: commits edit and exits editing mode.

- Optional quick regression check
  - Reorder a section and edit text/color, wait for autosave, then refresh.
  - Expected: changes persist and no new console errors.
