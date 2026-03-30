# ADR-034: Subdomain Middleware Rewrite

**Status:** Accepted  
**Date:** 2026-03-28  
**Context:** This decision introduces host-based routing so published pages are reachable through subdomains (`[slug].app.com`) while `/p/[slug]` remains the serving boundary.

## The Problem

We need subdomain URLs without duplicating serving logic.

If subdomain handling is bolted directly into route handlers or mixed with auth implicitly, we risk:

- serving behavior drift between `/p/[slug]` and subdomain URLs,
- accidental auth redirects on public published traffic,
- fragile hostname parsing that breaks across local/dev/prod environments.

Step 6 needs a clear routing contract that preserves Step 5 as the single public artifact endpoint.

## Decision

### 1) Middleware performs host rewrite, serving remains `/p/[slug]`

Requests to the subdomain root (`https://{slug}.{root-domain}/`) are rewritten to `/p/{slug}`.

**Why:**

- keeps rendering/serving logic centralized in the existing Step 5 route,
- avoids branching public behavior by hostname,
- makes subdomain support a transport concern, not a content concern.

### 2) Root domain is configured via `PUBLISH_ROOT_DOMAIN`

Subdomain extraction is driven by environment configuration, not hardcoded domains.

**Why:**

- allows safe environment-specific behavior (local, preview, production),
- removes coupling to a single deployment hostname.

### 3) Rewrite is guarded by strict host/slug checks

A rewrite happens only when all checks pass:

- request path is `/`,
- hostname is a **single-label** subdomain of `PUBLISH_ROOT_DOMAIN`,
- slug matches strict slug pattern,
- slug is not in reserved set (`www`, `app`, `api`, `dashboard`, `editor`, `p`).

**Why:**

- prevents accidental rewrite of app/control hosts,
- blocks malformed host labels from becoming route input.

### 4) Auth middleware remains scoped to protected app routes

`/dashboard` and `/editor` continue to be guarded through auth middleware.  
Public subdomain root rewrite executes before that protected-route check.

**Why:**

- preserves existing security behavior,
- prevents public published traffic from being redirected to login.

## Alternatives Considered

### A) Duplicate serving logic by host in middleware/route

**Pros:** direct handling of subdomain requests without rewrite step.  
**Cons:** two serving paths to maintain (`/p/[slug]` and subdomain branch), higher drift risk.

**Rejected:** violates Step 5 boundary and increases maintenance overhead.

### B) Rewrite every pathname on subdomain host

**Pros:** subdomain URLs appear to support arbitrary paths.  
**Cons:** ambiguous behavior for non-root requests and higher risk of intercepting paths that should remain app/platform-level.

**Rejected for Step 6:** root-path rewrite is a safer MVP boundary.

### C) Global auth middleware plus permissive callback logic

**Pros:** one middleware wrapper for all paths.  
**Cons:** auth behavior for public routes becomes callback-coupled and easier to regress.

**Rejected:** explicit protected-route delegation is clearer and lower-risk.

## Edge Cases

- `host` includes port (`acme.app.com:3000`).
- `PUBLISH_ROOT_DOMAIN` includes scheme or wildcard prefix (`https://*.app.com`).
- Nested subdomains (`blog.acme.app.com`) should not map to a slug.
- Reserved subdomains should never route to published pages.
- Missing or invalid `PUBLISH_ROOT_DOMAIN` should disable rewrite (safe fallback).

## Tradeoffs

| Decision                                       | Upside                                | Downside                                             |
| ---------------------------------------------- | ------------------------------------- | ---------------------------------------------------- |
| Rewrite only subdomain root path               | Predictable, low-risk routing surface | Non-root subdomain paths are not mapped in Step 6    |
| Single-label slug extraction                   | Prevents ambiguous host parsing       | No nested subdomain tenant model in this step        |
| Env-driven root domain                         | Deploy-time flexibility               | Misconfiguration can silently disable rewrite        |
| Keep `/p/[slug]` as canonical serving boundary | One serving contract, easier testing  | Temporary dual URL model (`/p/[slug]` and subdomain) |

## Consequences

- Step 7 publish UX can safely display both path URL and subdomain URL intent.
- Step 8 hardening can focus on deploy/docs/testing without touching serving logic.
- Future custom-domain support can reuse the same rewrite-to-serving-boundary strategy.
