# ADR-008: Publishing Pipeline — Explicit Build-on-Publish, Same App, Static HTML

**Status:** Accepted
**Date:** 2026-03-25
**Context:** Define how page JSON (ADR-005) becomes a live, visitable URL. Must support: one-click publish (ADR-001), subdomain hosting (ADR-001), SEO-friendly output, and Vercel serverless deployment (ADR-003). The page document lives as a JSONB column in Neon Postgres (ADR-007).

## The Problem

A user clicks "Publish." A stranger visits a URL. The stranger needs to see a fully rendered HTML page — fast, crawlable by Google, and independent of the editor.

The page data is JSON in a database (ADR-005 schema, ADR-007 storage). The publishing pipeline is the bridge between that JSON and the visitor's browser.

### What publishing must do

| Step | What happens |
|---|---|
| **Convert** | Page JSON → static HTML + CSS |
| **Store** | Save the generated HTML somewhere retrievable |
| **Serve** | Visitor hits a URL → gets the HTML |
| **Update** | Creator re-publishes → visitor sees the new version |
| **SEO** | Google can crawl and index the page, social previews work |

## How JSON Becomes HTML — Three Approaches

There are three fundamental strategies for turning stored data into HTML a visitor can see. Everything in web development is a variation of one of these.

### Approach 1: Render on every visit (SSR — Server-Side Rendering)

```
Visitor hits URL → Server reads JSON from DB → Renders HTML → Sends to visitor
```

- Every visitor triggers a database read and a render
- Always up-to-date — no stale content possible
- Slower — visitor waits for the server to do work
- Cost scales linearly with traffic: 10,000 visitors = 10,000 DB reads + 10,000 renders

**Good for:** Data that changes constantly (social feeds, dashboards, search results).
**Bad for:** Content that changes rarely and gets read a lot — like a published landing page.

### Approach 2: Build once, serve the file (Static / pre-build)

```
Creator clicks Publish → Server renders HTML → Stores the HTML
Visitor hits URL → Gets the pre-built file instantly (no DB, no rendering)
```

- Publish takes a moment (building HTML), but it's a one-time cost
- Visits are **fast** — just serving a file, like loading an image
- Zero database load from visitors
- Must re-build when creator re-publishes

**Good for:** Content that changes on explicit user action and gets read many times between changes.
**Bad for:** Frequently changing data where "stale for a few seconds" is unacceptable.

### Approach 3: Build on first visit, cache it (ISR — Incremental Static Regeneration)

```
Creator clicks Publish → Cache is invalidated
First visitor after publish → Server renders HTML → Caches it → Serves it
Next visitors → Get the cached version instantly
```

- Hybrid of 1 and 2
- First visitor after each publish pays the rendering cost
- Next.js has this built in — `revalidatePath()` invalidates, next request rebuilds
- The "build" is invisible — no way to confirm to the creator what went live

**Good for:** Large sites with thousands of pages where pre-building all of them would be slow.
**Bad for:** Small-scale apps where explicit builds are cheap and the invisible caching adds mystery.

### Why Approach 2 — explicit build-on-publish

| Factor | SSR (every visit) | Static (pre-build) | ISR (cache) |
|---|---|---|---|
| **Visitor speed** | Slowest (~200-500ms) | Fastest (~50ms) | Fast after first visit |
| **DB load from visitors** | Every visit | Zero | Rare (cache miss only) |
| **Creator feedback** | N/A | Immediate — "Published!" means it's built | Delayed — cache rebuilds lazily |
| **Predictability** | Consistent (always slow) | Consistent (always fast) | Inconsistent (first visit slow) |
| **Complexity** | Simplest code | Store HTML somewhere | Invisible caching layer |
| **Debugging** | Read DB → render | Read stored HTML | Where is the cached version? When did it rebuild? |
| **Scales to 10k visitors** | 10k DB reads | Zero DB reads | ~1 DB read |

**Landing pages are the textbook case for static pre-building:**
- Content changes rarely (only on explicit re-publish)
- Gets read many times between changes (every visitor)
- The build is cheap — one page, milliseconds of rendering
- The creator expects explicit control — "I clicked Publish, it's live"

**Why not ISR?** ISR is designed for sites with thousands of pages where pre-building all of them at deploy time would be impractical (think: e-commerce with 50,000 product pages). We're building one page at a time on a user's explicit action. The caching layer adds indirection without benefit:

- The creator can't see what's cached or confirm the build succeeded
- First visitor after re-publish gets a slower response (cache miss)
- Debugging "why is the old version still showing?" is harder with invisible caching
- We'd need `revalidatePath()` calls anyway — so we're still reacting to publish events

Pre-building on publish is **simpler, faster for all visitors, and gives the creator immediate feedback.**

## The Publish Flow

```
Creator clicks "Publish" in editor
  │
  ├─ 1. Server Action: publishPage(pageId)
  │     ├─ auth() → verify session
  │     └─ Read page document from DB (JSONB)
  │
  ├─ 2. Render HTML
  │     ├─ renderToString(<PublishedPage page={document} />)
  │     ├─ Inject SEO meta tags, Open Graph tags
  │     ├─ Inject inline CSS (element styles from schema)
  │     └─ Wrap in full HTML document (<!DOCTYPE html>...)
  │
  ├─ 3. Store result
  │     └─ Upsert into publishedPages table:
  │           { pageId, slug, html, seoMeta, publishedAt }
  │
  ├─ 4. Update page status
  │     └─ pages.status = 'published', pages.publishedAt = now()
  │
  └─ 5. Return confirmation to creator
        └─ "Published! Live at yoursite.ourapp.com"

Visitor hits yoursite.ourapp.com
  │
  ├─ 1. Next.js route resolves slug
  ├─ 2. Read pre-built HTML from publishedPages table
  └─ 3. Return HTML directly — no rendering, no JSON processing
```

### Re-publish flow

```
Creator edits page → clicks "Publish" again
  │
  ├─ Same flow as above — render new HTML, upsert into publishedPages
  └─ Next visitor gets the new version immediately (no cache to bust)
```

No cache invalidation. No stale content. The HTML in the database is always the latest published version.

## Where Published Pages Live

### MVP: Same Next.js app, path-based URLs

```
ourapp.com/p/my-startup → serves pre-built HTML from publishedPages table
```

- Zero extra infrastructure
- One dynamic route: `app/p/[slug]/page.tsx`
- The route handler reads HTML from DB and returns it directly
- Published pages and editor share the same deployment

### MVP+: Subdomain routing (ADR-001 requirement)

```
my-startup.ourapp.com → same Next.js app, wildcard subdomain
```

- ADR-001 specifies subdomain hosting as an MVP feature
- Vercel supports wildcard subdomains — `*.ourapp.com` resolves to our app
- Next.js middleware reads the subdomain, extracts the slug, serves the HTML
- Same pre-built HTML, different URL pattern

```
// Middleware (simplified)
const hostname = request.headers.get('host')
const subdomain = hostname.replace('.ourapp.com', '')

if (subdomain && subdomain !== 'www') {
  // Rewrite to the published page route
  return NextResponse.rewrite(new URL(`/p/${subdomain}`, request.url))
}
```

### v1.1: Custom domains

```
mycoolstartup.com → DNS points to our app → serves pre-built HTML
```

- Requires DNS verification (user adds CNAME record)
- Requires SSL certificate provisioning (Vercel handles this automatically for custom domains)
- Same serving logic — just a different hostname resolution step
- Deferred per ADR-001 (complexity without new architectural learning)

## SEO — What Published Pages Need

Search engines and social platforms read specific HTML elements to understand, rank, and preview pages. Our renderer must generate all of these.

### Why SEO matters for a landing page builder

A landing page that Google can't index or that shows a blank preview on LinkedIn is broken. Users build landing pages specifically to be found and shared. SEO isn't a feature — it's a baseline requirement.

### What we generate

| Element | Purpose | Source |
|---|---|---|
| `<title>` | Browser tab, search result headline | Creator-defined SEO title, or fallback to `page.name` |
| `<meta name="description">` | Search result snippet text | Creator-defined, or auto-extract from first text element |
| `<meta name="viewport">` | Correct mobile rendering | Hardcoded — always `width=device-width, initial-scale=1` |
| `<meta property="og:title">` | Social preview title (Twitter, LinkedIn, Slack) | Same as `<title>` |
| `<meta property="og:description">` | Social preview description | Same as meta description |
| `<meta property="og:image">` | Social preview image | Creator-defined, or first image element in hero section |
| `<meta property="og:url">` | Canonical URL for social shares | Published page URL |
| `<link rel="canonical">` | Tells Google the "real" URL (prevents duplicate content) | Published page URL |
| Semantic HTML | Helps Google understand page structure | `<h1>` for headings, `<section>` for sections, `<nav>` for footer, `<img alt>` for images |
| Fast load time | Google ranking signal | Pre-built HTML, no JS needed to see content — as fast as it gets |

### Schema addition — SEO metadata

The Page schema (ADR-005) needs a small extension for creator-controlled SEO fields:

```typescript
interface PageSEO {
  title?: string          // <title> — defaults to page.name
  description?: string    // meta description — defaults to first text element
  ogImage?: string        // social preview image — defaults to first image in hero
}
```

This lives on the Page object (not per-variant — SEO metadata is the same regardless of which A/B variant a visitor sees):

```typescript
interface Page {
  // ... existing fields from ADR-005
  seo?: PageSEO           // optional — sensible defaults if not set
}
```

### What the generated HTML looks like

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>My Startup — Build Landing Pages Fast</title>
  <meta name="description" content="No code required. Just drag, drop, and publish." />
  <meta property="og:title" content="My Startup — Build Landing Pages Fast" />
  <meta property="og:description" content="No code required. Just drag, drop, and publish." />
  <meta property="og:image" content="https://ourapp.com/images/hero-preview.jpg" />
  <meta property="og:url" content="https://my-startup.ourapp.com" />
  <link rel="canonical" href="https://my-startup.ourapp.com" />
  <style>
    /* Reset + section/element styles inlined from schema */
  </style>
</head>
<body>
  <section style="...">
    <h1 style="...">Build landing pages fast</h1>
    <p style="...">No code required. Just drag, drop, and publish.</p>
    <a href="#pricing" style="...">Get Started</a>
  </section>
  <!-- ... more sections -->
</body>
</html>
```

**Key properties:**
- Zero JavaScript — pure HTML + CSS. Nothing to parse, nothing to execute.
- Semantic tags — `<h1>`, `<section>`, `<p>`, `<a>`, `<img>` with `alt` text.
- Inline styles from the schema's `ElementStyles` — no external stylesheet to fetch.
- Complete `<head>` with all SEO and social meta tags.

This is the fastest, most SEO-friendly output possible. Google sees the full page on first byte. No client-side rendering, no hydration, no loading spinners.

## A/B Variants and Publishing

When a page has multiple variants, the publish flow needs to decide which HTML to serve:

### MVP: Publish the active variant only

The creator picks which variant to publish. One HTML file is generated and stored. Simple, predictable.

```
publishPage(pageId)
  → read page.activeVariantId
  → render only that variant's sections to HTML
  → store in publishedPages
```

### MVP (traffic splitting): Serve variants by weight

ADR-005 defines `trafficWeight` on each variant. To split traffic:

```
Visitor hits URL
  → Read all published variants for this page
  → Random number 0-100 → pick variant based on weight
  → Serve that variant's pre-built HTML
```

This requires storing **one HTML file per variant** in `publishedPages`:

```typescript
// publishedPages table (updated from ADR-007 sketch)
publishedPages: (id, pageId, variantId, slug, html, publishedAt)
```

The publish action renders all variants and stores them all. The serving route rolls the dice and picks one.

**Note:** This means the serving route has logic (random selection), so it's not purely serving a static file. But it's still fast — read two HTML blobs from DB, pick one, return it. No JSON processing, no rendering.

## When This Approach Must Change

The pre-built HTML in the database approach works well within specific bounds. Here's what would push us to evolve:

### Trigger 1: Published pages need dynamic content

| Situation | Example | Why pre-built breaks |
|---|---|---|
| **Personalization** | "Hello {visitor_name}" in the hero | Can't bake dynamic values into static HTML |
| **Live data** | Pricing that changes based on API, countdown timers | Stale the moment it's built |
| **CMS content** | Blog-style dynamic content in sections | Changes independently of publish action |

**What to do:** Add a thin JS runtime to published pages — hydrate specific "dynamic slots" with client-side fetches. The rest stays static HTML.

### Trigger 2: Thousands of pages, DB reads become a bottleneck

| Situation | Why it matters |
|---|---|
| 10,000+ published pages, all getting traffic | Reading HTML from Postgres on every visit adds latency and DB load |

**What to do:** Move published HTML to object storage (Vercel Blob, S3) or a CDN. The publish action uploads the HTML file; the serving route redirects to the CDN URL. The `publishedPages` table stores the CDN URL instead of the HTML itself.

```
Current:  visitor → Next.js route → DB read → return HTML
Upgraded: visitor → CDN edge → return HTML (DB is never touched)
```

### Trigger 3: Build time becomes slow

| Situation | Why it matters |
|---|---|
| Pages with hundreds of sections, complex rendering | `renderToString()` takes seconds instead of milliseconds |

**What to do:** Move rendering to a background job. Publish action enqueues a build task, creator sees "Publishing..." status, build worker renders and stores, creator gets notified when done. This is the "publish worker" extraction from ADR-003's migration path.

### Trigger 4: Need to serve pages without our app running

| Situation | Why it matters |
|---|---|
| Full isolation — published pages must survive editor downtime | Same Next.js app means one deployment, one failure domain |

**What to do:** Publish HTML files to a separate static host (Vercel Blob + CDN, or a separate Vercel project). Published pages become truly independent — no shared infrastructure with the editor.

### None of these apply at MVP scale

A single user publishing a 6-section landing page:
- Render time: <50ms
- HTML size: 5-20 KB
- DB read on visit: <5ms
- Traffic: low (personal project / portfolio demo)

The simplest approach (render on publish, store in DB, serve from same app) handles this trivially.

## Combined Architecture — How Publishing Fits

```
Editor (Client Components)
  │
  └─ "Publish" button
       │
       └─ Server Action: publishPage(pageId)
             │
             ├─ auth() → verify session
             ├─ Read page JSON from pages table (JSONB)
             ├─ For each variant:
             │    ├─ renderToString(<PublishedPage sections={variant.sections} seo={page.seo} />)
             │    └─ Upsert into publishedPages (pageId, variantId, slug, html)
             ├─ Update pages.status = 'published'
             └─ Return "Published at {url}"

Visitor
  │
  └─ hits my-startup.ourapp.com
       │
       ├─ Middleware: extract subdomain → rewrite to /p/my-startup
       ├─ Route handler: /p/[slug]
       │    ├─ Read publishedPages WHERE slug = 'my-startup'
       │    ├─ If multiple variants → pick by traffic weight
       │    └─ Return pre-built HTML (Content-Type: text/html)
       └─ Visitor sees the page — no JS, no hydration, no loading
```

## Interactive Elements — JS Strategy

MVP published pages ship zero JavaScript. But post-MVP element types (video embeds, email forms, carousels) will need interactivity. This section documents the architectural approach so the publishing pipeline accommodates it without redesign.

### The principle: JS is additive, not baseline

A published page with only static elements (heading, text, button, image, icon) ships **zero JS** — exactly as described above. JavaScript is only emitted when the page contains an element type that requires it. A page that doesn't use a carousel never downloads carousel code.

### What needs JS and what doesn't

| Element | Needs JS? | Rendering strategy |
|---|---|---|
| Heading, Text, Icon | No | Pure HTML |
| Button | No | `<a>` tag — links are native HTML |
| Image | No | `<img>` tag |
| Video | No | `<iframe>` embed (YouTube/Vimeo) — the third-party player handles everything |
| Email form | Yes | Vanilla JS for validation, async submit, success/error message without page reload |
| Carousel / Slider | Yes | Vanilla JS for slide transitions, navigation, auto-play |
| Scroll animations | Yes | Vanilla JS using Intersection Observer API |
| Countdown timer | Yes | Vanilla JS updating the DOM on interval |

### The approach: inline vanilla `<script>` blocks

When the renderer encounters an interactive element type, it appends a small self-contained `<script>` block to the HTML output. No framework, no bundler, no hydration.

```html
<!-- Only present if the page contains a carousel -->
<script>
  (function() {
    document.querySelectorAll('[data-carousel]').forEach(function(el) {
      // ~30 lines of vanilla slide logic
    });
  })();
</script>
```

**Why vanilla JS, not React hydration:**

| Factor | Inline vanilla JS | React partial hydration |
|---|---|---|
| **Baseline cost** | 0 KB (no framework) | ~40 KB gzipped (React runtime) |
| **Per-element cost** | 1-3 KB per interactive type | Similar component size + hydration overhead |
| **Complexity** | Script runs immediately, no build step | Needs bundler, code splitting, hydration boundaries |
| **Independence** | Published page is fully self-contained | Published page depends on a JS bundle |
| **Debugging** | View source → read the script | React DevTools, source maps, etc. |

For a landing page with 1-2 interactive elements, shipping 40 KB of React to run 30 lines of carousel logic is unjustifiable.

**Why not third-party embeds for everything:**

Embeds (like Formspree `<iframe>` for forms) seem simpler but have real downsides:
- Can't style to match the page — the embed has its own CSS
- User depends on a third-party service's availability and pricing
- Data (form submissions) lives outside our system — harder to build analytics on

Third-party embeds make sense for **video** (YouTube/Vimeo already handle playback, DRM, adaptive streaming — reimplementing this would be absurd). They don't make sense for forms or carousels where we control the experience.

### How this affects the renderer

The renderer stays a pure function: `(pageJSON) → HTML string`. The only change is that it conditionally appends `<script>` blocks:

```
renderPage(page)
  → render sections and elements to HTML (existing flow)
  → collect which interactive element types are used
  → if any: append their corresponding <script> blocks before </body>
  → return complete HTML string
```

Each interactive element type has a corresponding JS module — a plain `.js` file containing the vanilla script. The renderer reads it and inlines it. One script per element **type**, not per element **instance** (a page with 3 carousels gets one carousel script that targets all `[data-carousel]` elements).

### Schema impact

New interactive element types are additions to ADR-005's `ElementType` union and `ElementContent` discriminated union:

```typescript
// Post-MVP additions
type ElementType =
  | 'heading' | 'text' | 'button' | 'image' | 'icon'  // MVP
  | 'video' | 'form' | 'carousel'                       // post-MVP

type ElementContent =
  | { type: 'video'; provider: 'youtube' | 'vimeo'; videoId: string }
  | { type: 'form'; fields: FormField[]; submitUrl: string; successMessage: string }
  | { type: 'carousel'; slides: CarouselSlide[] }
  // ... existing types
```

The schema extension pattern is the same as adding any new element type — no structural change to the 2-level hierarchy (ADR-005).

### Timeline

None of this is MVP. The MVP element set (`heading | text | button | image | icon`) is fully static. This section exists so that when we add interactive elements post-MVP, the publishing pipeline doesn't need redesigning — it just needs a conditional `<script>` append step.

## Consequences

- **`publishedPages` table** stores rendered HTML — one row per variant per page. This is the published artifact, not the source (source is `pages.document` JSONB).
- **No JavaScript in published pages** at MVP. Pure HTML + inline CSS. Post-MVP interactive elements (forms, carousels) use inline vanilla `<script>` blocks — see "Interactive Elements — JS Strategy" section above.
- **SEO metadata** (`PageSEO`) is a small schema addition to ADR-005's Page interface. Optional fields with sensible auto-generated defaults.
- **Subdomain routing** requires Vercel wildcard domain config and Next.js middleware. This is configuration, not architectural complexity.
- **The renderer is a plain function** — takes page JSON, returns HTML string. Not coupled to Next.js. This matters for the ADR-003 migration path: if we later extract publishing to a worker, the render function moves with zero changes.
- **Re-publish overwrites** the HTML in `publishedPages`. No version history at MVP. Version history (ADR-001 v1.1) would add a `publishedVersions` table — the pipeline doesn't change, it just stops deleting old rows.
