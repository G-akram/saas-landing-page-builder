# ADR-039: Design Tokens System

**Status:** accepted
**Phase:** 7.1

## Context

All block styles are hardcoded hex values scattered across 6+ template files. No shared palette, no font system, no spacing scale. Switching visual identity requires editing every template manually. Phase 7 needs a theming foundation before block redesign (Step 2) and templates (Step 3).

## Decision

**Hybrid token resolution (Approach C).**

Each element stores both a token key (`colorToken: "primary"`) and a resolved value (`color: "#2563eb"`). Theme switch re-resolves all token keys to new concrete values.

### Why hybrid over alternatives

| Approach | Rejected because |
|----------|-----------------|
| **CSS Variables only** | Published output currently uses inline styles; injecting CSS vars is a larger migration. Property panel can't show exact colors without extra resolution. |
| **Resolve-on-apply only** | No way to know which elements were "primary" vs manually set to the same hex. Theme switch becomes lossy. |
| **Hybrid** | Chosen. Zero regression risk (inline styles still work), token keys enable lossless theme switching, published output unchanged for now. |

### Theme scope

**Page-level.** Each page stores a `themeId` on its document. Different pages can use different themes. Users building pages for different brands/audiences aren't forced into one look.

### Token categories

1. **Colors** — primary, secondary, accent, background, surface, text-primary, text-secondary, text-muted, border
2. **Fonts** — heading font family, body font family
3. **Spacing scale** — section padding presets (compact, default, spacious)
4. **Border radius scale** — none, sm, md, lg, full

### Preset themes (initial)

- **Starter** — clean blue/white (current default colors, normalized)
- **Startup** — vibrant gradients, indigo/purple
- **Agency** — dark/bold, high contrast
- **SaaS Dark** — dark backgrounds, accent greens/teals

### Schema changes

- `PageDocument` gains `themeId: string` (defaults to `"starter"`)
- `ElementStyles` gains optional `colorToken`, `backgroundColorToken` fields
- `SectionBackground` gains optional `valueToken` field
- Token definitions live in `shared/lib/design-tokens.ts` (runtime, not DB)

### What this does NOT change (yet)

- Published output still uses resolved inline styles (CSS var emission is a later optimization)
- Property panel gets token-aware swatches but full redesign is Step 2
- No new style properties added to ElementStyles (shadow, border, etc. come in Step 2)

## Consequences

- Block templates reference token keys; "Apply theme" resolves to concrete values
- Adding a new theme = adding one object to the tokens file
- Theme switch walks all sections + elements and re-resolves token fields
- Future: published output can optionally emit CSS variables for client-side theming
