# Architecture

## Overview

This is a Next.js monolith for a SaaS landing-page builder. It currently supports:

- Auth (GitHub + Google)
- Dashboard CRUD for pages
- Editor with drag-and-drop sections
- Block variants and inline editing
- Debounced autosave to PostgreSQL
- Local image upload for editor usage
- Publish pipeline (server render + storage + public route + subdomain rewrite + editor publish UX)

Phase 4 is complete. Phase 5 is in progress: editor variant UX and multi-variant publish fan-out are complete, while sticky serving and analytics are still pending.

## Module structure

```text
src/
  app/                  # Route handlers and server components
  modules/
    auth/               # Auth-domain exports (minimal at current phase)
    dashboard/          # Dashboard queries/actions/components
    editor/             # Editor runtime (XState, Zustand, dnd-kit, UI)
    publishing/         # Publish domain (render, storage, routes, actions)
  shared/
    db/                 # Drizzle schema + DB client
    lib/                # cross-module services/utilities
    types/              # Zod schemas + inferred TS types
  components/ui/        # shared UI primitives
```

Dependency direction (enforced by lint boundaries):

`shared -> modules/* -> app`

## Data model

```text
User
└── Page
    ├── metadata columns (name, slug, status, timestamps)
    └── document (JSONB)
        └── Variant[]
            └── Section[]
                └── Element[]
```

Core tables:

- `users`, `accounts`, `sessions`, `verificationTokens` (Auth.js adapter)
- `pages` (draft editor source of truth)
- `publishedPages` (published artifact metadata index)
- `publishedPageEvents` (append-only published traffic analytics for Phase 5)

## Runtime flow

1. Server component route loads session + page data (`auth()` + DB query).
2. `EditorShell` crosses into client boundary and initializes stores.
3. XState machine manages interaction modes and selection state.
4. Zustand document store applies structural/content mutations with undo/redo.
5. Autosave hook debounces writes through `savePage` server action.

## State boundaries

- XState: editor interaction state (`idle`, `selected`, `editing`, `dragging`, `previewing`).
- Zustand `documentStore`: mutable page document + undo/redo history.
- Zustand `uiStore`: lightweight editor UI preferences (active panel, viewport).
- React Query: mutation lifecycle for autosave.

## Security and validation boundaries

- Server actions are auth-gated and validate document payloads with Zod.
- Upload route is auth-gated and validates file bytes before writing.
- DB ownership checks are enforced in page queries/mutations (`userId` filters).

## Key decisions

See `decisions/` ADRs, especially:

- `003-tech-stack.md`
- `004-state-management.md`
- `005-block-schema.md`
- `007-database-auth.md`
- `014-editor-core-approach.md`
- `021-block-library-approach.md`
- `028-publishing-pipeline-approach.md`
- `035-publish-ux-orchestration.md`

Operational issue history and mitigations:
- `docs/incident-log.md`
