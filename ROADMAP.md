# Roadmap

## How phases are ordered

The order follows a strict dependency chain: **decisions → data → interaction → content → delivery → intelligence**.

Each phase produces a working vertical slice. You can demo something real at the end of every phase — not just scaffolding.

---

## Phase 0 — Research & Decisions

**Status: complete**

**Why first:** No code before architecture. The block schema must be variant-aware from day 1 — retrofitting `variants[]` into a flat schema later means a DB migration + state management rewrite. Same for the module structure: getting import direction wrong early means circular deps at scale.

**Steps:**
- [x] Competitive Research → `research/competitive-analysis.md`
- [x] MVP Feature Set → `decisions/001-mvp-features.md`
- [x] Tech Stack + Architecture → `decisions/003` through `decisions/010`
- [x] Folder Structure + Code Standards + Git Rules → `decisions/009-folder-structure.md`, `.claude/rules/`
- [x] Roadmap → `ROADMAP.md`

**Deliverables:**
- Competitive analysis done
- MVP feature set locked
- Tech stack, DB, auth, styling, state, block schema, publishing pipeline, folder structure, key libraries — all decided and documented
- Code standards + git rules in place
- Roadmap written

**You have:** A full architecture blueprint. Zero ambiguity when coding starts.

---

## Phase 1 — Foundation

**Status: complete**

**Why second:** Everything else depends on this. You can't build the editor without a DB to save to. You can't test saving without auth. The schema must be migrated before any editor state is designed, because the shape of `Page → Variants → Sections → Elements` drives every other data structure.

**What we build:**
- Next.js app bootstrapped (TypeScript, Tailwind, shadcn/ui, ESLint/Prettier, path aliases)
- Drizzle schema for users, pages, variants, sections, elements — migrated to Neon
- NextAuth.js: sign up, log in, session, protected routes
- Dashboard: create page, list pages, delete page
- Pages save to and load from DB (no editor yet — just raw JSON round-trip)

**Implementation approach:** See `decisions/011-phase1-approach.md` for rationale.

**Steps:**
- [x] Scaffold: Next.js + TypeScript + Tailwind + shadcn/ui + ESLint strict + Prettier + path aliases
- [x] Folder structure per ADR-009 (module dirs, barrel exports, shared/)
- [x] Drizzle schema + Neon migration (users, accounts, sessions, pages, publishedPages)
- [x] Zod schemas in `shared/types/` (Page → Variant → Section → Element per ADR-005)
- [x] NextAuth.js v5 (Google + GitHub OAuth, Drizzle adapter, middleware, protected routes)
- [x] Dashboard: create page, list pages, delete page
- [x] Page round-trip: load from DB, display document (proves full data path)

**Deliverables:**
- Sign up, log in, create a named page, see it in the dashboard, delete it
- DB schema matches the variant-aware shape from ADR-005
- Auth gates the dashboard and editor routes

**You have:** A real multi-user app with persistence. The skeleton every other phase plugs into.

---

## Phase 2 — Editor Core

**Status: complete**

**Why third:** Shell before content. State management and the drag-and-drop runtime must be proven before adding 6 complex block types. Building blocks first means constantly refactoring around a moving editor foundation.

**What we build:**
- Editor route loads a page from DB
- Canvas renders sections as a vertical stack
- dnd-kit: drag to reorder sections
- Add section / delete section
- Zustand store: `activePage`, `activeSection`, `selectedElement`
- Auto-save: debounced write-back to DB on every change
- XState editor mode machine (idle, selected, dragging)
- Editor chrome: dark theme, top bar, section list panel

**Implementation approach:** See `decisions/014-phase2-approach.md` for rationale.

**Steps:**
- [x] Zustand stores (`useDocumentStore` + `useUIStore`) with undo/redo
- [x] Editor route + canvas rendering (Server Component → client `EditorShell` → section stack)
- [x] dnd-kit: drag to reorder sections (with undo/redo integration)
- [x] Add section (type picker) + delete section (with undo/redo)
- [x] Auto-save: debounced write-back to DB via TanStack Query mutation + status indicator
- [x] XState editor mode machine (idle ↔ selected ↔ dragging ↔ previewing)
- [x] Editor chrome: dark theme, top bar, section list panel, layout shell

**Deliverables:**
- Open a page → see a canvas → drag sections around → changes persist on reload
- Zustand store shape matches ADR-004 (no server state in Zustand)
- Auto-save works without user intervention

**You have:** A working editor shell. Blocks slot in without touching state or DnD again.

---

## Production Readiness — Tech Debt & Gaps

Items discovered during the Phase 2 audit (2026-03-27). Not blocking Phase 3, but must be addressed before any real deployment. Review this list at each phase boundary.

### Server-side

- [x] **Baseline rate limiting on server actions** - `savePage`, `createPage`, `deletePage` now have per-user in-memory throttling.
- [ ] **Distributed rate limiting for production scale** - replace in-memory limiter with Redis/Upstash (or equivalent) so limits apply across instances.
- [x] **Optimistic locking on save** - `savePage` now checks client `updatedAt` against DB before writing and returns a conflict error on mismatch.
- [ ] **Dashboard pagination** — `getPagesByUser` fetches all pages in one query. Fine for <50 pages, breaks at scale. Add cursor-based pagination.
- [ ] **`deletePage` feedback** — Currently returns void on success. Client can't distinguish "page deleted" from "page didn't exist". Return affected row count.

### Client-side

- [ ] **Hook test coverage** - add direct hook tests for `useAutoSave` debounce/timer behavior and `useLayoutConfig` mode mapping.
- [ ] **Integration tests** — No tests verify store + XState machine working together in a component context. Add React Testing Library tests for `EditorCanvas` and `EditorShell`.

### Dependencies

- [ ] **Upgrade `next-auth` to stable** — Currently on `5.0.0-beta.30`. Track the v5 stable release and upgrade immediately when available.

### Performance (monitor, fix if needed)

- [ ] Memoize `sectionIds` array in `EditorCanvas` (`useMemo`)
- [ ] Memoize `sortedElements` in `SectionRenderer` (`useMemo`)
- [ ] Consider combining multiple individual Zustand selectors in `EditorTopBar` into a single selector

---

## Phase 3 — Block Library

**Status: complete**

**Why fourth:** Blocks plug into an existing system. Building blocks without the editor means building in a vacuum — no way to test selection, inline editing, or property panels in real conditions.

**What we build:**
- All 6 block types: Hero, Features, CTA, Pricing, Testimonials, Footer
- 2–3 variants per block (different layouts/styles)
- Inline text editing (click to edit text in-canvas)
- Right sidebar property panel: colors, fonts, spacing, backgrounds per element
- Image upload/selection
- Mobile preview toggle
- Block picker UI (add section → choose block type + variant)

**Implementation approach:** See `decisions/021-phase3-approach.md` for rationale.

**Steps:**
- [x] Document store element actions (`updateElement`, `addElement`, `deleteElement`, `updateSectionStyles`) + block template definitions (6 types × 2-3 variants)
- [x] Visual element rendering — upgrade SectionRenderer from text previews to styled elements (hybrid Tailwind + inline styles)
- [x] Element selection + visual highlight — click element → XState `SELECT_ELEMENT` → highlight ring
- [x] Property panel (right sidebar) — accordion sections for content, typography, colors, spacing, background
- [x] Inline text editing — double-click → `contentEditable` → blur-to-save
- [x] Block picker with variant previews — upgrade add-section dialog with live mini-renders
- [x] Image upload/selection — local storage in dev, abstracted for future cloud swap
- [x] Mobile preview toggle — container queries, responsive reflow

**Deliverables:**
- Build a complete, realistic landing page end-to-end in the editor
- Every block is editable (text, colors, images) via the sidebar
- Mobile preview shows the responsive layout

**You have:** A fully functional page builder. The product is demonstrable as a product.

---

## Phase 4 — Publishing Pipeline

**Status: in progress (Steps 1-5 complete)**

**Why fifth:** You need real content to publish. Publishing before Phase 3 means publishing placeholder blocks — useless as an integration test and as a demo.

**What we build:**
- "Publish" button triggers server action
- Server renders the active variant's sections to static HTML (`renderToStaticMarkup`)
- Published HTML + assets written to storage (local FS in dev, object storage in prod)
- Subdomain routing: `[slug].app.com` serves the static file
- CDN headers set (cache-control, immutable assets)

**Implementation approach:** See `decisions/028-phase4-approach.md` for rationale.

**Readiness:**
- [x] Phase 4 architecture decisions locked (artifact storage strategy, variant scope, routing rollout, step order)
- [x] Step 1 scope locked (contracts + schema changes)

**Steps:**
- [x] Lock contracts and schema changes (publishing contracts + `publishedPages` metadata/index shape) - see `decisions/029-phase4-step1-contracts-schema.md`
- [x] Build pure HTML renderer (page + active variant -> full HTML document) - see `decisions/030-phase4-step2-renderer-boundary.md`
- [x] Add publish storage adapter (local FS in dev, object storage boundary for prod) - see `decisions/031-phase4-step3-storage-adapter.md`
- [x] Implement `publishPage` server action (auth/ownership, render, persist, upsert metadata, status update) - see `decisions/032-phase4-step4-publish-action-orchestration.md`
- [x] Add public serving route (`/p/[slug]`) with strict content/cache headers - see `decisions/033-phase4-step5-public-serving-route.md`
- [ ] Add subdomain middleware rewrite (`[slug].app.com` → `/p/[slug]`)
- [ ] Wire editor publish UX (publish state + live URL feedback)
- [ ] Hardening: tests + docs updates (`docs/api.md`, `docs/deployment.md`)

**Deliverables:**
- Click Publish → get a real URL → open in a new tab → see the live page
- Page loads without the editor runtime (pure static HTML + CSS)
- Sharing the URL with anyone works

**You have:** A full build → publish → serve pipeline. The app is a real product, not just a builder.

---

## Phase 5 — A/B Testing

**Status: not started**

**Why last in MVP:** The schema supports variants from day 1 (Phase 1), but the UI is built last because it requires the editor (to create/edit variants) and the publishing pipeline (to serve split traffic) to already exist.

**What we build:**
- Variant tabs in the editor: create, duplicate, delete, switch variants
- Each variant is a full independent section stack
- Traffic split config: 50/50 default, adjustable per variant
- Visitor assignment: cookie-based, sticky per session
- Tracking: view + conversion events per variant
- Analytics panel in dashboard: views, conversions, conversion rate per variant

**Deliverables:**
- Create two variants → publish → open in incognito → land on variant A or B per traffic split
- Dashboard shows per-variant stats
- Can set one variant to 100% traffic to declare a winner

**You have:** Complete MVP — editor + A/B testing + publishing + auth + analytics.

---

## Post-MVP (v1.1)

Custom domains, per-breakpoint style overrides, version history, starter templates, Smart Traffic (AI-driven routing), editor i18n.

See `decisions/001-mvp-features.md` for the full deferred feature list and rationale.




