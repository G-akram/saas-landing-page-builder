# Incident Log

This file records non-trivial implementation issues, their fixes, and impact.

Use this log for:
- runtime/build failures and data consistency issues,
- cross-module integration regressions,
- operational constraints discovered during implementation.

If an incident changes long-term architecture, also add/update an ADR in `decisions/` and link it here.

---

## 2026-03-28 - Publish action failed on Neon HTTP driver transactions

### Symptoms
- `POST /api/publish` failed with:
  - `No transactions support in neon-http driver`

### Root cause
- Publish orchestration attempted DB transaction flow on a driver path that does not support transactions.

### Fix
- Reworked publish persistence to sequential idempotent operations:
  1. upsert `publishedPages`,
  2. update `pages.status`.
- Added conflict/error handling around the persistence step.

### Impact
- Existing features:
  - publish works on current Neon HTTP setup.
- Incoming features:
  - flow is not fully atomic; if strict atomicity is needed later, move to a transaction-capable DB driver/session strategy.

### Related decision
- `decisions/032-phase4-step4-publish-action-orchestration.md`

---

## 2026-03-28 - Immediate `Save failed` on new/existing pages

### Symptoms
- New page opened with immediate `Save failed`, even before manual edits.
- Existing pages could also show immediate save errors.
- Publish became blocked by save gate (`Fix save errors before publishing`).

### Root causes
- Optimistic lock timestamp handling was brittle under DB/client timestamp precision differences.
- A `date_trunc` SQL variant introduced ambiguous typed-parameter behavior in Neon.
- Autosave could start before the current page document initialization finished, allowing stale baseline behavior on page transitions.

### Fix
- Replaced fragile lock expression with millisecond-window optimistic lock:
  - `updatedAt >= expectedUpdatedAt`
  - `updatedAt < expectedUpdatedAt + 1ms`
- Added safe DB error handling in `savePage`.
- Gated autosave until page initialization is complete in `EditorShell` + `useAutoSave`.
- Added mutation-state reset behavior across page switches.
- Set `createdAt/updatedAt` explicitly during page creation to keep timestamp initialization consistent.

### Impact
- Existing features:
  - autosave is stable for both new and existing pages,
  - publish gating now reflects real save state instead of false errors.
- Incoming features:
  - any new save path must preserve `expectedUpdatedAt` lock semantics,
  - tests should keep explicit coverage for first-save and page-switch autosave behavior.

### Related decisions
- `decisions/018-auto-save.md`
- `decisions/035-phase4-step7-publish-ux-orchestration.md`

---

## 2026-03-28 - Publish render crashed on icon elements

### Symptoms
- Publish failed on some existing pages with:
  - `Attempted to call ... lucide-react ... from the server`

### Root cause
- Server-side publish renderer imported `lucide-react` icon components in static render path.
- That crossed client/server boundaries during server rendering.

### Fix
- Removed `lucide-react` from publish renderer path.
- Replaced published icon rendering with a server-safe fallback badge (monogram derived from icon name).

### Impact
- Existing features:
  - pages containing icon elements can publish successfully.
- Incoming features:
  - if production requires exact icon visuals in published output, add a server-safe SVG mapping layer (not client component imports).

### Related decisions
- `decisions/030-phase4-step2-renderer-boundary.md`
- `decisions/035-phase4-step7-publish-ux-orchestration.md`
