# Competitive Analysis — Landing Page Builders

Completed: 2026-03-24

## Carrd

- **Target:** Solo creators, freelancers, indie hackers. One-page sites only.
- **Editor:** Section-based. Page = vertical stack of sections. No free-form canvas. Add a section → pick a template → customize.
- **Customization:** Click element → right sidebar panel shows properties (text, colors, fonts, spacing, background). Simple property controls, not CSS. Inline text editing.
- **Block types:** Hero, content (text + image), features grid, pricing table, testimonials, CTA, contact form, gallery, countdown timer, profile/avatar, icons, dividers, embed (HTML/video).
- **Publishing:** One-click publish to `yoursite.carrd.co` or custom domain (Pro). Near-instant.
- **Pricing:** Free (3 sites, carrd.co subdomain, limited elements). Pro Lite ~$9/yr, Pro Standard ~$19/yr, Pro Plus ~$49/yr.
- **Strengths:** Extremely fast to ship. Dead simple UX — zero learning curve. Incredibly cheap.
- **Weaknesses:** One-page only. No CMS, no multi-page, no blog. Very limited design control. No component reuse. No A/B testing. Basic responsive.
- **Schema (inferred):** Flat ordered array of sections. Each section has a `type` and flat properties bag. Simplest model of all four.

## Framer

- **Target:** Designers who want production sites without handoff. Startups, freelancers, agencies.
- **Editor:** Full canvas-based (Figma-like). Everything is a "Frame" (div). Supports flex, grid, and absolute positioning. Layers panel + zoom/pan.
- **Customization:** Hybrid — inline text editing + right-side properties panel (layout, style, typography, effects, responsive overrides). Component variants with props. Code overrides (TSX).
- **Block types:** Composed from primitives. Common sections via templates: hero, navbar, features, pricing, testimonials, CTA, footer, FAQ, forms, media galleries, CMS listings.
- **Publishing:** Auto-save → Preview → Publish (near-instant). Free subdomain or custom domain (paid). Staging URLs. Version history.
- **Pricing:** Free ($0, 2 pages, 1k visitors). Mini ~$5/mo. Basic ~$15/mo. Pro ~$30/mo.
- **Strengths:** Best design fidelity. Best-in-class animations. Great responsive breakpoints. Figma copy-paste. Component system with variants. Localization.
- **Weaknesses:** Steep learning curve. Basic CMS. No e-commerce. Basic forms. Full vendor lock-in. Desktop-only editor.
- **Schema (inferred):** Tree of Frame nodes. Each node has type, children[], layout mode, style properties, responsive breakpoint overrides. Styles inline per-node. Page = root Frame.

## Webflow

- **Target:** Designers and design-savvy devs who want full CSS control without code. Agencies, freelancers, marketing teams.
- **Editor:** Canvas-based with DOM structure. Elements snap into DOM hierarchy (flex/grid flow). Structure-aware guides. Navigator panel.
- **Customization:** Right sidebar = full CSS property control (class-based). Typography, spacing, position, display, backgrounds, shadows, filters, transitions. Timeline-based animations. Inline text editing. Breakpoint cascade.
- **Block types:** Low-level HTML primitives. Pre-built section layouts via component library. CMS collection lists. E-commerce elements.
- **Publishing:** Auto-save → Publish to staging or production. Near-instant CDN deployment. Code export on paid plans.
- **Pricing:** Free (1 page, branding). Basic ~$18/mo. CMS ~$29/mo. Business ~$49/mo.
- **Strengths:** Full CSS control — unmatched precision. Clean semantic HTML. Powerful CMS. Best-in-class timeline animations. Proper responsive cascade. Code export.
- **Weaknesses:** Steepest learning curve. CMS capped at 10k items. Heavy JS. Vendor lock-in for dynamic features. No component props/variants.
- **Schema (inferred):** Tree of DOM nodes with type, tag, classes[], children[]. Styles stored separately by class name with breakpoint overrides. Interactions as separate objects.

## Unbounce

- **Target:** Marketers running paid ad campaigns. Growth teams. Agencies managing client campaigns.
- **Editor:** Classic (free-form absolute positioning) and Smart Builder (section-based grid). Smart Builder: page = vertical stack of sections, elements in grid cells.
- **Customization:** Right sidebar properties panel (simple, not CSS). Inline text editing. Per-element styles. Separate desktop/mobile layouts. Form builder with integrations.
- **Block types:** Hero, features, benefits, social proof, pricing, FAQ, CTA, team, stats, footer. Also popups and sticky bars.
- **Publishing:** Build → Set URL → Publish. A/B testing: create variants, set traffic split. Smart Traffic (AI) auto-routes to best variant.
- **Pricing:** No free tier. Build ~$99/mo. Experiment ~$149/mo. Optimize ~$249/mo.
- **Strengths:** A/B testing is first-class. Smart Traffic AI. Speed to publish. Dynamic Text Replacement for PPC. Deep marketing integrations. Popups + sticky bars.
- **Weaknesses:** Single landing pages only. Very expensive. Visitor-based pricing. Limited design control. No code export. Classic Builder responsive is painful.
- **Schema (inferred):** Page → Variants[] → Sections[] → Elements[]. A/B variants first-class in schema. Per-element styles. Conversion-specific properties baked in.

## Cross-tool comparison

| Dimension          | Carrd             | Framer               | Webflow               | Unbounce          |
| ------------------ | ----------------- | -------------------- | --------------------- | ----------------- |
| **Complexity**     | Minimal           | High                 | Highest               | Medium            |
| **Editor model**   | Section stack     | Canvas + layers      | DOM-structured canvas | Section grid      |
| **Style system**   | Per-element props | Per-node inline      | Class-based CSS       | Per-element props |
| **Responsive**     | Auto-stack        | Breakpoint overrides | Breakpoint cascade    | Separate layouts  |
| **Learning curve** | Minutes           | Hours-days           | Days-weeks            | ~1 hour           |
| **A/B testing**    | No                | No                   | No                    | Core feature      |
| **CMS**            | No                | Basic                | Powerful              | No                |
| **Free tier**      | Yes               | Yes                  | Yes                   | No                |

## Key insights for our builder

1. **Section-based is the sweet spot** — Carrd and Unbounce Smart Builder prove section-based editors are fast for users and simpler to build.
2. **Per-element styles > class-based** — Simpler to implement and easier for users.
3. **Pre-built block variants win** — Users want "Hero style 3" not build from primitives.
4. **Responsive can be simple** — Desktop-first + auto-stack + optional mobile overrides. 2 breakpoints max.
5. **A/B testing is a differentiator** — Design the schema for variants early.
6. **Our gap:** Fast like Carrd + better design than Carrd + A/B testing from Unbounce.
