# ADR-030: Pure HTML Renderer Boundary and Fidelity

**Status:** Accepted  
**Date:** 2026-03-28  
**Context:** This decision requires a deterministic renderer that converts `page + active variant` into a full publishable HTML document. This renderer is the core dependency for storage, publish orchestration, and public serving. Builds on ADR-008, ADR-028, and ADR-029.

## The Problem

If rendering is coupled to editor UI components or route handlers, Phase 4 will accumulate hidden dependencies and regressions:
- publishing output inherits client-only editor behavior,
- storage/action steps must compensate for inconsistent renderer output,
- future routing changes (path and subdomain) can force renderer rewrites.

We need a clear renderer boundary and an explicit fidelity policy before wiring publish flow.

## Decisions

### 1) Renderer is a publishing-domain, server-only primitive

Create a dedicated renderer in `modules/publishing` with this contract shape:
- input: page metadata + `PageDocument` + optional SEO/live URL context
- output: typed success/error result with `html`, `contentHash`, and resolved SEO metadata

**Why:** keeps publish behavior independent from editor runtime and route implementation details.

### 2) Use `renderToStaticMarkup`, not manual string templating

Render structured React components to static HTML and prepend document doctype.

**Why:** better composability, safer escaping defaults, and easier refactors than string concatenation.

### 3) Published artifact must be self-contained

Output includes:
- full HTML document (`<html><head><body>...`)
- semantic section/element markup
- inline base CSS + inline element/section styles

No dependency on editor classes, app chrome, hydration, or external runtime assets.

**Why:** publishing must remain portable and deterministic across storage/serving layers.

### 4) Deterministic fallback and error policy

- Hard error when document is invalid or active variant cannot be resolved.
- Graceful fallback for non-critical gaps (missing image src, unknown icon, missing optional SEO fields).
- SEO fallback order is explicit and deterministic.

**Why:** publish action needs predictable failure modes and reliable UX messaging.

### 5) Keep link handling explicit and safe

Support `url` and `section` links with sanitization.
Reject unsupported/unsafe link targets rather than emitting ambiguous hrefs.

**Why:** prevents unsafe publish output and avoids hidden runtime assumptions.

## Alternatives Considered

### A) Reuse editor renderers directly

**Pros:** lower initial implementation effort.  
**Cons:** editor components include selection/interaction concerns and visual debugging affordances not meant for public pages.

**Rejected:** tight coupling and higher regression risk.

### B) Manual HTML string builder

**Pros:** no React dependency for renderer.  
**Cons:** more escaping risks, lower maintainability, weaker component-level reuse/testing.

**Rejected:** higher correctness risk for little practical gain.

### C) Tailwind-dependent published output

**Pros:** stylistic parity with editor previews.  
**Cons:** published pages become dependent on app CSS/runtime assumptions and deployment wiring.

**Rejected:** violates self-contained artifact goal.

## Edge Cases

- `activeVariantId` points to a missing variant.
- Variant exists but has empty sections/elements.
- Section backgrounds are gradients/images with optional overlay.
- Image elements with empty `src`.
- Unknown icon names.
- Multiline text that must preserve line breaks.
- Unsafe or malformed URLs in link config.

## Tradeoffs

| Decision | Upside | Downside |
|---|---|---|
| Dedicated publishing renderer | Strong isolation, fewer side effects | Some duplication vs editor rendering helpers |
| Static markup + inline styles | Portable and deterministic artifacts | Slightly larger HTML payload |
| Strict typed renderer errors | Predictable publish behavior | Publish can fail on malformed documents |
| Safe link sanitization | Better security posture | Some user-provided links are dropped if invalid |

## Consequences

- Step 3/4 can consume renderer output as a stable primitive.
- Public serving route can remain thin (`slug -> artifact -> response`).
- Future Phase 5 variant-serving changes can extend around this renderer without redesigning Step 2.

