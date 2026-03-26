# Code standards

## TypeScript

- `strict: true` — no exceptions.
- Explicit return types on exported functions. Inferred types for internal/private.
- No `any`. Use `unknown` + type guards when the type is truly unknown.
- Shared data shapes (Page, Section, Element) live in `shared/types/`. Modules never redefine them.

## Naming

- **Files:** `kebab-case.ts`, `kebab-case.tsx` — no exceptions.
- **Components:** `PascalCase` — file `block-toolbar.tsx` exports `BlockToolbar`.
- **Hooks:** `useCamelCase` — file `use-editor-state.ts` exports `useEditorState`.
- **Types/Interfaces:** `PascalCase`. Prefer `interface` for object shapes, `type` for unions/intersections.
- **Constants:** `UPPER_SNAKE_CASE` for true constants. `camelCase` for derived values.
- **Boolean props/vars:** prefix with `is`, `has`, `should`, `can` — e.g., `isPublished`, `hasChanges`.

## Components

- Server Components by default. Add `'use client'` only when you need interactivity, hooks, or browser APIs.
- One exported component per file. Co-located helpers/sub-components are fine if unexported.
- Props defined as `interface ComponentNameProps` directly above the component.

## Imports

- Use `@/` path aliases. No relative imports crossing module boundaries.
- Module imports through `index.ts` barrel only — never deep imports.
- Dependency direction: `shared` → `auth` → `editor` → `publishing` → `dashboard` → `app/`.

## Linting & formatting

- ESLint: strict config with `@typescript-eslint/strict-type-checked`.
- Prettier: default config, single quotes, no semicolons (or configure once and forget).
- `eslint-plugin-boundaries`: enforce module dependency direction.
- No lint disables without a comment explaining why.
