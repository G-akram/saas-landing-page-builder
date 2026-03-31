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

**Implementation approach:** See `decisions/011-foundation-approach.md` for rationale.

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

**Implementation approach:** See `decisions/014-editor-core-approach.md` for rationale.

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

**Implementation approach:** See `decisions/021-block-library-approach.md` for rationale.

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

**Status: complete**

**Why fifth:** You need real content to publish. Publishing before Phase 3 means publishing placeholder blocks — useless as an integration test and as a demo.

**What we build:**

- "Publish" button triggers server action
- Server renders the active variant's sections to static HTML (`renderToStaticMarkup`)
- Published HTML + assets written to storage (local FS in dev, object storage in prod)
- Subdomain routing: `[slug].app.com` serves the static file
- CDN headers set (cache-control, immutable assets)

**Implementation approach:** See `decisions/028-publishing-pipeline-approach.md` for rationale.

**Readiness:**

- [x] Phase 4 architecture decisions locked (artifact storage strategy, variant scope, routing rollout, step order)
- [x] Step 1 scope locked (contracts + schema changes)

**Steps:**

- [x] Lock contracts and schema changes (publishing contracts + `publishedPages` metadata/index shape) - see `decisions/029-publishing-contracts-schema.md`
- [x] Build pure HTML renderer (page + active variant -> full HTML document) - see `decisions/030-publish-renderer-boundary.md`
- [x] Add publish storage adapter (local FS in dev, object storage boundary for prod) - see `decisions/031-publish-storage-adapter.md`
- [x] Implement `publishPage` server action (auth/ownership, render, persist, upsert metadata, status update) - see `decisions/032-publish-action-orchestration.md`
- [x] Add public serving route (`/p/[slug]`) with strict content/cache headers - see `decisions/033-public-serving-route.md`
- [x] Add subdomain middleware rewrite (`[slug].app.com` → `/p/[slug]`) - see `decisions/034-subdomain-middleware-rewrite.md`
- [x] Wire editor publish UX (publish state + live URL feedback) - see `decisions/035-publish-ux-orchestration.md`
- [x] Hardening: tests + docs updates (`docs/api.md`, `docs/deployment.md`)

**Deliverables:**

- Click Publish → get a real URL → open in a new tab → see the live page
- Page loads without the editor runtime (pure static HTML + CSS)
- Sharing the URL with anyone works

**You have:** A full build → publish → serve pipeline. The app is a real product, not just a builder.

---

## Phase 5 — A/B Testing

**Status: complete**

**Why last in MVP:** The schema supports variants from day 1 (Phase 1), but the UI is built last because it requires the editor (to create/edit variants) and the publishing pipeline (to serve split traffic) to already exist.

**What we build:**

- Variant tabs in the editor: create, duplicate, delete, switch variants
- Each variant is a full independent section stack
- Traffic split config: 50/50 default, adjustable per variant
- Visitor assignment: cookie-based, sticky per session
- Conversion goal: explicit primary goal on a linked element per variant
- Tracking: raw view + conversion events per variant
- Analytics panel in dashboard: views, conversions, conversion rate per variant

**Implementation approach:** See `decisions/036-ab-testing-approach.md` for rationale.

**Readiness:**

- [x] Phase 5 architecture decisions locked (published variant storage, sticky serving, analytics model, conversion model, step order)

**Steps:**

- [x] Lock contracts and schema (published variant metadata/index shape, analytics event storage, conversion-goal contracts) - see `decisions/037-ab-testing-contracts-schema.md`
- [x] Add variant store actions and invariants (create, duplicate, delete, switch, traffic-weight normalization, goal invariants)
- [x] Ship editor variant UX (variant tabs, management flows, traffic split controls, link + primary goal UI)
- [x] Extend publishing to publish all variants (render/persist every variant artifact, one `publishedPages` row per variant)
- [x] Add weighted serving with sticky assignment (`/p/[slug]` loads all variants, reuses or creates assignment cookie, serves assigned artifact, private/no-store cache policy)
- [x] Add analytics capture (`view` on first assignment, `conversion` via small POST beacon on primary goal click)
- [x] Add dashboard analytics (server-rendered aggregates by `pageId` + `variantId`)
- [x] Hardening: tests + docs updates

**Execution plan for remaining work:** See `decisions/038-serving-analytics-runtime.md`

1. **Add the missing published runtime metadata**
   - Scope: extend `publishedPages` so publish persists the live `trafficWeight` and live `primaryGoalElementId` snapshot for each published variant.
   - Why first: weighted serving and conversion validation cannot stay inside the published domain without these fields.
   - Done when: `/p/[slug]` can make assignment decisions and validate conversions without reading `pages.document`.

2. **Implement sticky weighted serving**
   - Scope: replace the current "latest artifact by slug" public read path with "load all published variants -> validate/reuse/create assignment cookie -> read assigned artifact".
   - Key considerations: cookie contract, stale assignment recovery, zero-weight behavior, deterministic fallback, and the cache-policy switch from shared revalidation to private/no-store.
   - Done when: incognito traffic lands on different variants by weight, refresh stays sticky, and stale cookies are safely reassigned.

3. **Add analytics capture on top of assignment**
   - Scope: write `view` on first assignment and `conversion` through a tiny primary-goal beacon with DB-level dedupe.
   - Key considerations: one view max per assignment, one conversion max per assignment, sendBeacon navigation timing, and validating goal clicks against published metadata rather than draft state.
   - Done when: new assignments create one `view`, repeated refreshes do not inflate views, and repeated goal clicks do not double-count conversions.

4. **Build dashboard analytics**
   - Scope: add aggregate query helpers plus a dashboard panel that shows per-variant views, conversions, and conversion rate.
   - Key considerations: owner scoping, empty states, zero-division handling, and fallback labels when a draft variant was later removed.
   - Done when: a published A/B page shows stable per-variant stats in the dashboard with no client-side analytics dependency.

5. **Harden and close the phase**
   - Scope: route tests, cookie/assignment tests, analytics capture tests, dashboard aggregate tests, and docs updates.
   - Key considerations: malformed cookies, republish content-hash drift, zero-weight variants, duplicate beacons, and roadmap/docs alignment.
   - Done when: Phase 5 behavior is covered by targeted tests and the project docs match the shipped runtime.

**Deliverables:**

- Create two variants → publish → open in incognito → land on variant A or B per traffic split
- Dashboard shows per-variant stats
- Can set one variant to 100% traffic to declare a winner

**You have:** Complete MVP — editor + A/B testing + publishing + auth + analytics.

---

## Phase 6 - MVP Hardening

**Status: complete**

**Why now:** Feature scope is complete, but the MVP should not be considered truly closed until the repo is green, the docs match the shipped product, and the highest-risk production gaps are tightened. This phase is intentionally short and focused: no major new surface area, just finish quality work properly.

**What we build:**

- Green quality gates (lint + format + typecheck + tests + build)
- Doc and product copy alignment with Phase 5 reality
- Focused cleanup of the largest/riskiest files
- Missing MVP hardening from the existing tech debt list
- Deployment-ready publish/storage/rate-limit follow-through where it matters

**Steps:**

- [x] Fix current ESLint failures and restore `npm run lint` to green
- [x] Restore `npm run format:check` to green across code + docs
- [x] Update stale copy/docs (`src/app/page.tsx`, getting-started/deployment env vars, roadmap alignment)
- [x] Decide the fate of the editor light-theme toggle: officially descoped from MVP docs; editor remains dark-first for MVP
- [x] Add the missing direct hook/component integration tests called out in the debt list
- [x] Clean obvious duplication and split oversized hot-spot files where it improves maintainability
- [x] Add dashboard pagination and improve `deletePage` success feedback
- [x] Follow through on practical deployability hardening: added shared database-backed distributed rate limiting; publish storage remains explicitly documented as local-only in the current MVP state

**Deliverables:**

- All standard quality checks pass cleanly
- Docs and product messaging match the shipped app
- No obvious "known red" items remain for MVP-quality standards
- MVP can be closed as a finished milestone, not just a feature-complete one

**You have:** A fully closed MVP, not just complete in scope, but hardened enough to stand behind.

---

## Phase 7 - Wow Factor

**Status: in progress**

**Why next:** MVP is functional but visually basic. The highest-leverage move is making the product look and feel premium — Creative Tim-level visual quality in block design, richer templates, and a polished first impression. AI assists the creative process rather than replacing it.

**Design references:** Creative Tim UI kits and premium template galleries for composition, color, and polish quality. Adapt the visual language, don't copy layouts directly.

**What we build:**

- Design tokens system for cohesive theming across all blocks and templates
- Creative Tim-quality block library with gradients, glassmorphism, depth, and transitions
- Full-page templates gallery so users start from beauty, not a blank canvas
- Form / lead-capture block type (highest-value new content capability)
- Marketing page that sells the product convincingly
- Scoped AI assistant for copy generation and variant suggestions
- Editor UX micro-polish (animations, shortcuts, empty states)

**Steps:**

1. [x] **Design tokens system** — global color palettes, font pairings, spacing scale, with preset themes (e.g., "Startup", "Agency", "SaaS Dark"). Tokens feed into block rendering and published output. Done when: switching a theme re-skins all blocks on a page. See `decisions/039-design-tokens-system.md`.
2. [x] **Redesign block library to Creative Tim quality** — gradient backgrounds, glassmorphism cards, richer typography, depth/shadow system, smooth CSS transitions, 3-4 variants per block type, `SlotStyle` for card grids, `badge()` eyebrow factory, new style fields (boxShadow, border, backdropFilter, letterSpacing, textTransform, backgroundGradient, opacity). Published icons now render as inline SVGs via a curated path map.
2b. [x] **Block library follow-up fixes** — three known issues discovered during manual testing of Step 2. Must be resolved before Step 3 because they affect publishing reliability and theme coherence:

   **Problem A — Published icon rendering (regression):**
   The current fix uses a curated 15-icon SVG path map. Any icon a user enters manually that is not in this map degrades to a gray circle in the published page. Root cause: `published-page-element.ts` added an `import { icons } from 'lucide-react'` (ESM), but the publishing pipeline renders via `require('react-dom/server.node')` (CJS). Two separate React instances cause `renderToStaticMarkup` to throw when invoking the ESM Lucide component. The correct fix is a `publish-lucide-icon-renderer.ts` module that uses `createRequire(import.meta.url)` + `require('react-dom/server.node').renderToStaticMarkup` to render each Lucide icon component via the **same CJS React instance** as the page renderer, then injects the resulting SVG string via `dangerouslySetInnerHTML`. This makes all ~1400 lucide icons work in published output without a curated map. Delete `publish-icon-utils.ts` once this is working. Done when: any valid Lucide icon name added via the property panel renders correctly in the published page.

   **Problem B — Theme switching destroys gradient-based designs:**
   The hybrid token system resolves `colorToken` → `color` and `backgroundColorToken` → `backgroundColor` on theme switch, but has no concept of a gradient token. Template elements that use `backgroundGradient: 'linear-gradient(135deg, #2563eb, #4f46e5)'` keep their original blue gradient after switching to e.g. the "Startup" (indigo/purple) or "Agency" (orange) theme, while text colors and solid backgrounds update. This creates mismatched palettes. Fix: add `gradientToken: z.string().optional()` to `ElementStylesSchema`. Add `gradients` record to `ThemeDefinition` with keys like `primary-gradient`, `accent-gradient`, `dark-gradient`. Each preset theme defines its gradient values. The `resolveDocumentTheme` theme resolver handles `gradientToken` → `backgroundGradient` the same way it handles `colorToken`. Update all templates that use `backgroundGradient` to also carry a `gradientToken`. Done when: switching any preset theme produces a visually coherent page — gradients, text, and backgrounds all update together.

   **Problem C — No way to add isolated components (blank section + element picker):**
   Every section must be created from a pre-built template variant. There is no "blank section" option and no UI to add individual elements (heading, text, button, image, icon) to an existing section. The `addElement` store action exists but has no UI surface. Fix: add a `custom` section type with a blank template, add an element picker panel (accessible from the section toolbar or a + button within the section canvas), and add a basic layout type selector (stack vs grid) for custom sections. Done when: a user can create a blank section and build it from scratch by adding individual elements without picking a template variant.

3. [x] **Page templates gallery** — 4-6 full-page templates (SaaS, Agency, Portfolio, etc.) assembled from the redesigned blocks, selectable at page creation. Done when: "Create page" offers template selection and the result looks polished out of the box.
4. [ ] **Form / lead-capture block** — email input, contact form, newsletter signup variants, with a simple submission handler (store to DB or webhook). Done when: users can add a working contact form to a published page.
5. [ ] **Upgrade marketing/home page** — showcase the product using its own blocks, real copy, social proof section, live demo embed or screenshots. Done when: the home page looks like a real SaaS product page.
6. [ ] **AI assistant (scoped)** — copy generation for headlines/CTAs/descriptions, template suggestions by industry, A/B variant copy ideas. Claude API, surfaced as inline suggestions in the property panel. Done when: user can generate/refine copy for any text element from within the editor.
7. [ ] **Editor UX micro-polish** — element hover/select animations, transition on panel open/close, keyboard shortcuts (Ctrl+Z, Del), better empty states, improved microcopy. Done when: editor interactions feel smooth and discoverable.

**Execution strategy:**

Steps are not strictly sequential — some can be parallelized. Here are the dependency groups:

- **Group A (foundation, do first):** Step 1 (design tokens). Everything else looks better when theming exists.
- **Group B (parallel, after Group A):** Steps 2 + 4. Block redesign and form block are independent of each other, both consume design tokens.
- **Group B2 (must precede Group C):** Step 2b. Fixes publishing reliability (Problem A), theme coherence (Problem B), and editor flexibility (Problem C). Step 3 depends on all three being solid.
- **Group C (parallel, after Step 2b):** Steps 3 + 5. Templates and marketing page both depend on the redesigned blocks being done.
- **Group D (independent, anytime after Group A):** Step 6 (AI assistant). Only needs the property panel and Claude API — no dependency on block redesign.
- **Group E (last):** Step 7 (editor micro-polish). Final pass after all new surface area is built.

```
Group A:   [1 Design Tokens]
                |
          ┌─────┴─────┐
Group B:   [2 Blocks]  [4 Forms]     Group D: [6 AI] (anytime after A)
                |
Group B2:  [2b Fixes: icons + gradients + blank sections]
                |
          ┌─────┴─────┐
Group C:   [3 Templates] [5 Marketing]
                |
Group E:   [7 Editor Polish]
```

**Deliverables:**

- Block library looks commercially competitive, not prototype-grade
- New users can start from polished full-page templates
- Published pages have transitions, gradients, depth — not flat inline styles
- AI helps generate copy and suggest variants without leaving the editor
- Marketing page sells the product convincingly

**You have:** A portfolio-worthy product with Creative Tim-level visual quality, AI-assisted content creation, and stronger "wow" appeal.

---

## Later

Custom domains, per-breakpoint style overrides, version history, starter templates marketplace, Smart Traffic (AI-driven routing), payments/subscriptions, free/premium content tiers (needs billing first), broader component system, editor i18n.

See `decisions/001-mvp-features.md` for the full deferred feature list and rationale.
