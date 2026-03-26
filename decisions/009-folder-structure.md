# ADR-009: Folder Structure — Module-Based Architecture

**Status:** Accepted
**Date:** 2026-03-26
**Context:** Define how the codebase is organized. Must support: clear boundaries between features, scalable module additions, enforced dependency direction, and clean imports. Informed by ADR-001 (MVP features), ADR-003 (Next.js App Router), ADR-004 (Zustand state), ADR-006 (Tailwind + shadcn/ui).

## Decision

**Module-based architecture with strict boundaries.** Each domain feature is a self-contained module with a public API (`index.ts`). Cross-module imports only go through public APIs. Dependency direction is enforced top-down.

## Why Module-Based Over Feature-Based

Both approaches group files by domain. The difference is boundary enforcement:

| Factor | Feature-based | Module-based |
|---|---|---|
| **Cross-feature imports** | Any file can import any file | Only through `index.ts` barrel |
| **Enforcement** | Developer discipline | ESLint import boundaries |
| **Coupling risk** | High — easy to create spaghetti | Low — public API forces conscious decisions |
| **Refactoring cost** | High — imports scattered | Low — change internals, keep API stable |
| **API design skill** | Not exercised | Exercised on every module |

Module-based is feature-based with guardrails. Same organization, stricter contracts.

## Folder Structure

```
src/
  app/                          # Next.js App Router — thin route layer
    (auth)/                     # Auth route group (login, register)
      login/page.tsx
      register/page.tsx
    (dashboard)/                # Dashboard route group
      dashboard/page.tsx
      dashboard/[pageId]/page.tsx
    (editor)/                   # Editor route group
      editor/[pageId]/page.tsx
    p/[slug]/route.ts           # Published page serving
    layout.tsx
    globals.css

  modules/
    editor/                     # Drag-and-drop page editor
      components/               # Editor-specific UI (canvas, toolbar, block panels)
      hooks/                    # Editor-specific hooks
      store/                    # Zustand editor slice
      utils/                    # Editor-specific helpers (render, transform)
      types.ts                  # Editor types
      index.ts                  # Public API

    publishing/                 # HTML generation + serving
      components/               # Published page renderer components
      utils/                    # HTML rendering, SEO generation
      types.ts
      index.ts

    auth/                       # Authentication + session
      components/               # Login/register forms
      utils/                    # Auth helpers
      types.ts
      index.ts

    dashboard/                  # Page management + overview
      components/               # Page list, page cards, stats
      hooks/
      types.ts
      index.ts

  shared/
    components/                 # Reusable UI — shadcn/ui components live here
      ui/                       # shadcn/ui primitives (Button, Input, Dialog, etc.)
    hooks/                      # Generic hooks (useDebounce, useMediaQuery, useLocalStorage)
    lib/                        # Utilities (cn(), formatDate, validators)
    types/                      # App-wide types (Page, Block, Element schemas from ADR-005)
    db/                         # Drizzle schema, client, migrations
    config/                     # App config, env validation
```

### Key Rules

1. **`app/` routes are thin.** They import from modules, compose them, and pass props. Zero business logic in route files.
2. **Modules export through `index.ts` only.** No deep imports like `@/modules/editor/components/Canvas`. Import `{ Canvas } from '@/modules/editor'`.
3. **`shared/` has zero imports from any module.** It's the base layer.
4. **`shared/types/` holds the canonical data schemas** (Page, Section, Element from ADR-005). Modules import these, never redefine them.
5. **Drizzle schema lives in `shared/db/`** — it's shared infrastructure, not owned by any single module.

## Dependency Direction

Imports flow downward only. A module can import from modules below it and from `shared/`. Never upward, never sideways at the same level.

```
app/ routes (compose modules)
  ↓
dashboard        (imports from editor, publishing, auth)
  ↓
publishing       (imports from editor, auth)
  ↓
editor           (imports from auth)
  ↓
auth             (imports from shared only)
  ↓
shared           (imports from nothing — base layer)
```

### Preventing Circular Dependencies

| Scenario | Wrong approach | Correct approach |
|---|---|---|
| Editor needs "is published?" status | Editor imports from publishing | Move `PublishStatus` type to `shared/types/` |
| Publishing needs block data | Publishing imports editor types | Publishing imports `Block` type from `shared/types/` |
| Dashboard needs editor + publishing | Dashboard imports both | Allowed — dashboard is above both in the hierarchy |
| Two modules need to trigger each other | Circular import | App route layer passes callbacks as props |

**Enforcement:** `eslint-plugin-boundaries` or `eslint-plugin-import` with custom rules. Configured when we scaffold the project.

## Path Aliases

```json
// tsconfig.json paths
{
  "@/*": ["./src/*"],
  "@/modules/*": ["./src/modules/*"],
  "@/shared/*": ["./src/shared/*"]
}
```

All imports use `@/` prefix. No relative imports crossing module boundaries.

## How Modules Scale

Adding a new module (e.g., `analytics/`, `templates/`, `billing/`):

1. Create `src/modules/<name>/` with components, hooks, types, `index.ts`
2. Decide where it sits in the dependency hierarchy
3. Add ESLint boundary rule
4. Import from `app/` routes — no existing module changes unless it consumes the new module

This is the Open/Closed Principle applied to folder structure.

## Consequences

- **More files upfront** — even a small module needs `index.ts`. This is intentional: it forces API design thinking from day one.
- **Barrel exports require maintenance** — when you add a component to a module, you must also export it from `index.ts`. This is a feature, not overhead — it's a conscious decision about what's public.
- **`shared/types/` is the contract layer** — the canonical data shapes that all modules agree on. Changing a shared type is a cross-cutting change (intentionally visible).
- **App Router route groups** (`(auth)`, `(dashboard)`, `(editor)`) keep the URL structure clean while grouping related routes with shared layouts.
- **shadcn/ui components** go in `shared/components/ui/` — they're design system primitives, not module-specific.
