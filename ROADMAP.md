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

**Status: complete**

**Why now:** MVP is functional but visually basic. The highest-leverage move is making the product look and feel premium — Excellent visual quality in block design, richer templates, and a polished first impression.

**What we build:**

- Design tokens system for cohesive theming across all blocks and templates
- Excellent block library with gradients, glassmorphism, depth, and transitions
- Full-page templates gallery so users start from beauty, not a blank canvas
- Form / lead-capture block type (highest-value new content capability)
- Marketing page that sells the product convincingly
- Scoped AI assistant for copy generation and variant suggestions
- Editor UX micro-polish (animations, shortcuts, empty states)

**Steps:**

- [x] **Design tokens system** — global color palettes, font pairings, spacing scale, with preset themes ("Startup", "Agency", "SaaS Dark"). Tokens feed into block rendering and published output. See `decisions/039-design-tokens-system.md`.
- [x] **Redesign block library to Excellent quality** — gradient backgrounds, glassmorphism cards, richer typography, depth/shadow system, smooth CSS transitions, 3-4 variants per block type, `SlotStyle` for card grids, `badge()` eyebrow factory, new style fields (boxShadow, border, backdropFilter, letterSpacing, textTransform, backgroundGradient, opacity). Published icons render as inline SVGs via a curated path map.
- [x] **Block library follow-up fixes** — published icon rendering (full Lucide icon support via CJS-compatible renderer, replacing the 15-icon curated map), gradient tokens (theme switching updates gradients alongside colors), blank section + element picker (custom section type with in-canvas element add UI).
- [x] **Container element system (compound components)** — `container` element type holding atomic children (1 level of nesting). Schema: `ContainerElement` with `children: AtomicElement[]`, `containerStyle`, `containerLayout`. Store gains deep lookup. Editor renders styled card wrappers with selectable children and in-container element picker. Published output renders compound cards. Templates rewritten: feature cards, pricing tiers, testimonials use real containers. See `decisions/040-container-element-type.md`.
- [x] **Redo page templates gallery with containers** — 5 full-page templates (SaaS, Agency, Startup, Minimal, SaaS Dark) fully rewritten with container-based card sections. Moved from `shared/lib` to `dashboard/lib` to allow factory imports. Testimonials block template card variants (testimonials-1, testimonials-3) upgraded from `slotStyle` to real container elements.
- [x] **Form / lead-capture block** — email input, contact form, newsletter signup variants with a simple submission handler (store to DB or webhook).
- [x] **Upgrade marketing/home page** — showcase the product using its own
- [x] **Editor UX micro-polish** — element hover/select animations, transition on panel open/close, keyboard shortcuts (Ctrl+Z, Del), better empty states, improved microcopy.blocks, real copy, social proof section, live demo embed or screenshots.

**Deliverables:**

- Block library looks commercially competitive, not prototype-grade
- New users can start from polished full-page templates
- Published pages have transitions, gradients, depth — not flat inline styles
- AI helps generate copy and suggest variants without leaving the editor
- Marketing page sells the product convincingly

---

## Phase 8 — Auth + Payments

**Status: complete**

**Why now:** The app is a polished demo, but it can't acquire real users or generate revenue. Email/password auth removes the OAuth-only barrier. Stripe payments enable a sustainable business model. Together, they convert a portfolio project into a launchable product.

**What we build:**

- Email/password sign-in with email verification (alongside existing OAuth)
- Stripe subscriptions: Free tier with limits, Pro tier ($12/mo or $99/yr) unlocks everything
- One-time credit pack purchases (AI credits for Phase 9)
- Stripe Customer Portal for self-service billing
- Webhook-driven subscription lifecycle management
- Free/Pro tier gating on server actions (page limits, publish limits, variant limits)
- User settings page (profile, subscription management, account deletion)
- Upgrade prompts and pricing UI in dashboard

**Implementation approach:** See `decisions/042-email-password-auth-strategy.md` and `decisions/043-stripe-billing-architecture.md` for rationale.

**Steps:**

- [x] **Lock architecture + write ADRs** — document email/password auth strategy (custom credential routes alongside NextAuth OAuth, avoiding Credentials provider's JWT-only limitation) and Stripe billing architecture (subscription model, webhook events, tier gating, credit system). See `decisions/042-email-password-auth-strategy.md`, `decisions/043-stripe-billing-architecture.md`.
- [x] **Schema changes + password/email infrastructure** — add `passwordHash` column to `users`, create `subscriptions`, `creditBalances`, `creditTransactions`, `stripeEvents` tables. Create `password.ts` (bcrypt hash/verify), `email.ts` (Resend in prod, logger in dev), `session.ts` (manual database session creation matching NextAuth cookie format). Install `bcryptjs`, `resend`, `stripe`.
- [x] **Registration flow** — Zod validation schemas for register/login, verification token generation/consumption via existing `verificationTokens` table, register server action (validate, hash, insert user, send verification email), `RegisterForm` client component, `/register` page, extract `OAuthButtons` from login page.
- [x] **Email verification + credential login** — GET route handler for verification link callback (`/api/auth/verify-email`), verification info page, login server action (verify password, check email verified, create database session, set cookie), `LoginForm` client component, update `/login` page to compose LoginForm + OAuthButtons.
- [x] **Stripe foundation** — Stripe client singleton, `getOrCreateStripeCustomer` helper, tier limit constants, price ID configuration from env vars, `createCheckoutAction` (subscription mode), `purchaseCreditsAction` (payment mode), `createPortalAction` (Customer Portal).
- [x] **Stripe webhook handler** — POST route at `/api/stripe/webhook` with signature verification, `stripeEvents` idempotency dedup, handlers for `checkout.session.completed`, `customer.subscription.updated/deleted`, `invoice.payment_failed`, `invoice.paid`. Raw body parsing for signature verification.
- [x] **Tier gating** — `tier-gate.ts` with `checkPageCreationAllowed`, `checkPublishAllowed`, `checkVariantAllowed` utilities. Subscription query helpers. Modify `createPage`, `publishPage`, and variant creation server actions to enforce limits. Clear error messages directing users to upgrade.
- [x] **Pricing UI + upgrade prompts** — `PricingCards` component (Free vs Pro comparison with checkout CTA), `UpgradeBanner` for dashboard (contextual "X of Y pages used"), `SubscriptionStatus` component, dashboard integration showing upgrade prompts for free-tier users.
- [x] **Settings page** — `settings` module with profile section (name, email, avatar, auth provider), subscription section (plan info, manage billing via Stripe Portal, credit balance), danger zone section (delete account with cascade). Route at `/settings`, add to middleware protected routes.
- [x] **Hardening + polish** — resend verification action (rate-limited), error states (expired tokens, OAuth-user-trying-password, already-verified), "Built with PageForge" badge removal in published pages based on tier, typecheck + lint + format pass.

**Deliverables:**

- Users can register with email/password, verify email, and log in
- OAuth login continues to work unchanged
- Free-tier users hit limits (3 pages, 1 published) with clear upgrade prompts
- Clicking "Upgrade" opens Stripe Checkout, webhook syncs subscription status
- Pro users get unlimited pages, all templates/themes, A/B testing, no badge
- Settings page shows profile, billing management, and account deletion
- Credit system is schema-ready for Phase 9 AI features

**You have:** A monetizable product with real auth and billing. Users can sign up, evaluate for free, and pay to unlock the full experience.

---

## Phase 9 — Production Deployment

**Status: not started**

**Why now:** The product is feature-complete through Phase 8. Auth, billing, and publishing all work locally. Before sharing a portfolio URL, the app must run on real infrastructure: a stateless host (Vercel), cloud artifact storage for published pages (Vercel Blob), a live domain with wildcard subdomain routing, and all third-party services (Stripe, Resend, OAuth) wired to production credentials.

**What we build:**

- Vercel Blob storage adapter — replaces the local FS adapter so published HTML artifacts survive deployments and work across serverless instances
- Vercel project setup and deployment pipeline (auto-deploy on `main` push)
- Custom domain with wildcard DNS so `[slug].yourdomain.com` serves published pages
- Full production environment variable configuration in Vercel dashboard
- Stripe production mode: live keys, webhook endpoint registered, smoke-tested checkout
- Resend sender domain verified so verification and notification emails deliver
- OAuth apps updated with production callback URLs (GitHub + Google)
- End-to-end smoke test: register → verify email → build page → publish → share subdomain URL → upgrade to Pro

**Steps:**

- [x] **Implement Vercel Blob storage adapter** — install `@vercel/blob`, implement `PublishStorageAdapter` for `object-storage` provider (`writeArtifact` → `put`, `readArtifact` → `fetch` from the blob URL stored as `storageKey`). Wire into `createPublishStorageAdapter`. Set `PUBLISH_STORAGE_PROVIDER=object-storage` in Vercel env vars.
- [x] **Deploy to Vercel** — create Vercel project linked to the repo, confirm build passes (`npm run build` clean), enable auto-deploy on `main`. Set `NODE_ENV=production`.
- [x] **Configure custom domain + wildcard subdomain** — register or point a domain to Vercel, add both the root domain and a `*.yourdomain.com` wildcard entry in Vercel's Domains panel, configure the DNS records (A/CNAME for root, CNAME for wildcard). Set `PUBLISH_ROOT_DOMAIN` and `PUBLISH_BASE_URL` env vars.
- [x] **Set all production env vars** — fill the full set in Vercel dashboard: `AUTH_SECRET`, `AUTH_GITHUB_ID/SECRET`, `AUTH_GOOGLE_ID/SECRET`, `DATABASE_URL` (Neon prod branch), `PUBLISH_ROOT_DOMAIN`, `PUBLISH_BASE_URL`, `PUBLISH_STORAGE_PROVIDER=object-storage`, `RATE_LIMIT_STORAGE=database`, Stripe keys + price IDs, `RESEND_API_KEY`, `NEXT_PUBLIC_APP_URL`.
- [x] **Stripe production setup** — keeping test mode for demo/portfolio purposes. Registered test webhook endpoint at `https://pageforge.akram-ghomari.com/api/stripe/webhook` with 5 events, updated `STRIPE_WEBHOOK_SECRET` in Vercel env vars.
- [x] **Resend sender domain** — add and verify the sending domain in Resend dashboard (`mail.yourdomain.com` or root), update `FROM_EMAIL` / sender address in the email module if needed, send a test verification email end-to-end.
- [x] **Update OAuth callback URLs** — add production callback URLs alongside dev ones in GitHub OAuth app and Google Cloud Console (see `docs/deployment.md` for exact URLs). Copy production client IDs/secrets to Vercel env vars.
- [ ] **Smoke test the full flow** — register with email/password → receive and click verification email → log in → create a page from a template → publish → open `[slug].yourdomain.com` in incognito → confirm published page loads with correct styles → click "Upgrade" → complete Stripe checkout → confirm Pro tier unlocks → log into Stripe portal → cancel to confirm portal works.

**Deliverables:**

- `https://yourdomain.com` loads the marketing page
- Registration, email verification, and OAuth login all work in production
- Build + publish + serve pipeline works end-to-end with cloud artifact storage
- `[slug].yourdomain.com` serves published pages from Vercel edge
- Stripe checkout and Customer Portal work with live keys
- All quality checks (`lint`, `typecheck`, `build`) pass in CI

**You have:** A live, shareable URL. Portfolio-ready — every feature from Phase 1 through Phase 8 is demonstrable on real infrastructure.

---

## Later

Custom domains per-page, per-breakpoint style overrides, version history, starter templates marketplace, Smart Traffic (AI-driven routing), AI copy/variant assistant, broader component library, editor i18n.

See `decisions/001-mvp-features.md` for the full deferred feature list and rationale.
