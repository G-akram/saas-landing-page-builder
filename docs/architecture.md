# Architecture

## Overview

(to be filled in Phase 1 once the scaffold is in place)

## Module structure

```
src/
  shared/       # types, utils, logger — no dependencies on other modules
  auth/         # NextAuth.js config, session helpers
  editor/       # drag-and-drop editor, Zustand store, block components
  publishing/   # static HTML generation, CDN serving
  dashboard/    # page list, analytics panel
  app/          # Next.js routes only — no business logic
```

Dependency direction: `shared` → `auth` → `editor` → `publishing` → `dashboard` → `app/`

See `decisions/009-folder-structure.md` for rationale.

## Data model

```
User
└── Page
    └── Variant[]
        └── Section[]
            └── Element[]
```

See `decisions/005-block-schema.md` for the full schema and field definitions.

## Key decisions

| Decision | ADR |
|---|---|
| Tech stack (Next.js monolith) | `decisions/003-tech-stack.md` |
| State management (Zustand for UI, React Query for server) | `decisions/004-state-management.md` |
| Block schema | `decisions/005-block-schema.md` |
| Styling (Tailwind + shadcn/ui) | `decisions/006-styling.md` |
| Database + auth (Neon + Drizzle + NextAuth.js) | `decisions/007-database-auth.md` |
| Publishing pipeline (static HTML, same app) | `decisions/008-publishing-pipeline.md` |
| Key libraries (dnd-kit, Zod, RHF, TanStack Query, Lucide) | `decisions/010-key-libraries.md` |
