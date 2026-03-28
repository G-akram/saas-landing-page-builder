# ADR-035: Phase 4 Step 7 - Publish UX Orchestration and Autosave Gating

**Status:** Accepted  
**Date:** 2026-03-28  
**Context:** Phase 4 Step 7 wires editor publish UX on top of completed contracts/action/serving/routing (ADR-029 through ADR-034).

## The Problem

Step 7 must connect editor UI to `publishPage` without breaking module boundaries or publishing stale data.
If we wire this naively, we risk:
- `editor -> publishing` dependency violations,
- publishing outdated DB snapshots while autosave is still pending,
- runtime/build failures from `react-dom/server` constraints in app-router reachable modules,
- inconsistent user feedback for publish failures.

## Decisions

### 1) Use app-layer API bridge for publish UX (`POST /api/publish`)

Editor client UI calls a publish API route, and that route calls `publishPage`.

**Why:**
- preserves dependency direction (`editor` module does not import `publishing`),
- avoids importing publish orchestration directly into app page/client graphs that trigger `react-dom/server` app-router constraints,
- keeps existing `publishPage` orchestration as the single publish source of truth.

### 2) Use strict publish gating against unsaved editor state

Publish is disabled when:
- autosave is currently running,
- autosave is in error state,
- document is dirty (unsaved changes).

**Why:**
- `publishPage` renders from persisted DB state, not transient client state,
- strict gating prevents "I clicked publish but old content went live" behavior.

### 3) Keep publish UX state local to editor shell/top bar

Track publish UI state (`idle | publishing | published | error`), last live URL, and latest publish message inside editor shell scope.

**Why:**
- smallest state surface for current step,
- no new global store required for a single-screen concern.

### 4) Map publish error codes to stable user-facing copy

UI maps backend error codes to deterministic messages before rendering.

**Why:**
- stable, testable feedback contract,
- avoids leaking low-level infra wording directly to users.

## Alternatives Considered

### A) Import publishing action directly inside editor module

**Pros:** fewer layers.  
**Cons:** violates module dependency rules and couples editor runtime to publishing domain.

**Rejected:** conflicts with architecture constraints.

### B) Pass server action callback directly from editor page component

**Pros:** no extra HTTP route, direct server action flow.  
**Cons:** app-router build/runtime path still becomes sensitive to `react-dom/server` constraints for publish renderer dependencies.

**Rejected for current setup:** unstable in this codebase/runtime combination.

### C) Auto-save immediately and then publish in one click

**Pros:** faster perceived UX in some cases.  
**Cons:** combines two failure paths into one operation and complicates user feedback/retry semantics.

**Rejected for Step 7:** higher orchestration complexity; strict gating is safer and clearer now.

## Edge Cases

- User clicks Publish while autosave debounce has pending unsaved edits.
- Autosave fails; publish should remain blocked with actionable message.
- Page is already published when editor loads (URL feedback should still be available).
- Publish succeeds, then next publish attempt fails (keep previous live URL visible but show error).
- Double-click publish while request in-flight (must remain single in-flight action).
- API route receives malformed payload (`pageId` missing/invalid).

## Tradeoffs

| Decision | Upside | Downside |
|---|---|---|
| API bridge (`/api/publish`) | Stable app-router integration, clear boundary | Extra network hop in same app |
| Strict save/dirty gating | Prevents stale publish output | User may need to wait before publish |
| Local publish UI state | Simple and contained | Not reusable outside editor shell |
| Error-code mapping | Predictable UX + tests | Additional mapping maintenance |

## Consequences

- Step 7 ships publish UX without changing core publish orchestration contracts.
- Editor module stays domain-agnostic regarding publishing internals.
- Step 8 can harden tests/docs around this bridge without reopening core publish flow.
