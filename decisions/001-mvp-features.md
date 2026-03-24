# ADR-001: MVP Feature Set

**Status:** Accepted
**Date:** 2026-03-24
**Context:** Define what ships in MVP vs later. Informed by competitive research (`research/competitive-analysis.md`).

## Decision

### MVP Features

**Editor**
- Section-based editor (page = vertical stack of sections) — see ADR-002
- Drag-to-reorder sections
- Pre-built block library: Hero, Features, CTA, Pricing, Testimonials, Footer (6 types)
- Block variants (e.g. "Hero style 1/2/3") — key differentiator vs Carrd
- Inline text editing
- Right sidebar property panel
- Dark theme by default (editor chrome only — canvas is isolated, always shows real design)
- Light theme toggle (design tokens / CSS custom properties enable swapping)

**Customization**
- Per-element styles (colors, fonts, spacing, backgrounds)
- Image upload/selection

**Responsive**
- Desktop-first with auto-stack (2 breakpoints: desktop + mobile)
- Mobile preview toggle in editor

**A/B Testing**
- Variant-aware schema from day 1 (page → variants[] → sections[] → elements[])
- Variant creation UI (create/duplicate/delete variants)
- Traffic splitting + basic analytics (views, conversions per variant)

**Publishing**
- One-click publish
- Subdomain hosting (yoursite.app.com)
- Static HTML generation + CDN serving

**Auth & Persistence**
- User accounts (signup/login)
- Save/load pages
- Dashboard (list my pages)

### v1.1 (post-MVP)

- Custom domains (DNS verification, SSL)
- Icon library
- Per-breakpoint style overrides (beyond auto-stack)
- Version history
- Starter templates (pre-built full pages)
- Smart Traffic (AI-driven variant routing)
- Editor i18n (no hardcoded strings from day 1, implement translations in v1.1)

### Later

- Custom CSS per section
- CMS / dynamic content
- Popups + sticky bars
- Team collaboration
- Code export
- Published page i18n (locale variants — complex interaction with A/B variants)

## Rationale

- **A/B testing in MVP, not later:** Schema must be variant-aware from the start. Retrofitting variants into a flat page schema would require migration + rewrite. Clean start > fast messy one.
- **6 block types, not fewer:** 3 blocks feels like a toy. 6 covers a real landing page (hero → features → testimonials → pricing → CTA → footer).
- **Real publishing in MVP:** Portfolio project needs full build → publish → serve flow. Demonstrates backend architecture (static gen, CDN, subdomain routing). Preview-only is a half-product. Custom domains deferred — complexity (DNS, SSL) without much new learning.
- **Auth in MVP:** Multi-user product from day 1. Removes "how do we add users later?" concern. Needed for dashboard, page ownership, and publishing.
- **Per-element styles over class-based:** Simpler to implement, easier for users (see research). No CSS knowledge required.
- **Desktop-first + auto-stack:** Covers 80% of responsive needs. Per-breakpoint overrides add complexity — deferred to v1.1.
- **Dark theme by default:** Framer uses dark-only. Modern dev/design tools trend dark. Signals senior styling skills (design tokens, CSS custom properties, theme context, canvas isolation). Light toggle included — proves the system works both ways.
- **Editor i18n in v1.1, not MVP:** i18n is a real senior skill worth demonstrating. No architectural cost if we avoid hardcoded strings from day 1. Actual translations deferred to v1.1.
- **No published site themes:** Landing pages aren't apps — visitors don't need dark mode. Users already control every color via per-element styles. No competitor does this.
- **No published page i18n in MVP:** Locale × A/B variant = combinatorial explosion. Deferred, but schema should not block it.

## Consequences

- MVP scope is ambitious — editor + A/B + publishing + auth. Will need careful phasing in the roadmap (Step 5).
- Variant-aware schema adds data model complexity but prevents painful migration later.
- Publishing requires backend infrastructure decisions (Step 3: tech stack).
