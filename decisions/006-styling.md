# ADR-006: Styling — Tailwind CSS + shadcn/ui

**Status:** Accepted
**Date:** 2026-03-24
**Context:** Choose how to style the editor application UI (sidebar, toolbar, panels, modals, property inspector). This is about the app chrome — not user-created landing pages (those use inline styles per ADR-005). Informed by ADR-001 (dark theme by default, light toggle), ADR-003 (Next.js monolith), and ADR-005 (preview must be isolated from editor styles).

## The Problem

The editor UI is component-heavy: resizable panels, dropdowns, modals, popovers, drag handles, color pickers, property inspectors, keyboard-navigable menus. We need a styling approach that:

| Requirement | Why |
| --- | --- |
| **Handles complex components** | Editor has dozens of interactive components with accessibility needs |
| **Supports theming** | Dark by default + light toggle (ADR-001) via design tokens |
| **Doesn't leak into preview** | User's landing page must render exactly as published, not inherit editor styles |
| **Customizable** | Editor-specific components (section toolbar, layer list) need custom interaction patterns |
| **Fast to build** | Portfolio project — time on infrastructure is time not on features |

## Options Considered

### A: Tailwind + shadcn/ui (chosen)

Copy-paste Radix-based components into the repo, styled with Tailwind. Full ownership of component code.

### B: Tailwind + headless Radix primitives (no shadcn)

Use Radix primitives directly with Tailwind. Same foundation as shadcn, but without the pre-built component layer.

### C: Tailwind + full component library (Ant Design, Mantine)

Pre-built, pre-styled component library with Tailwind for custom pieces.

## Comparison

| Factor | A: Tailwind + shadcn | B: Tailwind + Radix | C: Tailwind + full library |
| --- | --- | --- | --- |
| **Setup speed** | Fast — `npx shadcn add button` | Slower — wire each component | Fastest — import and use |
| **Customizability** | Full — you own every file | Full — you write every file | Limited — fighting library styles |
| **Accessibility** | Radix handles it | Radix handles it | Library handles it |
| **Bundle size** | Small — only what you use | Small | Large — ships entire component set |
| **Dark mode** | Built-in via CSS variables | Manual | Varies by library |
| **Editor-specific components** | Build custom on same Radix + Tailwind stack | Same | Mismatch between library patterns and custom code |
| **Portfolio signal** | Modern, industry-standard | Shows deeper understanding | Seen as shortcut |

## Decision

**Tailwind CSS + shadcn/ui.** shadcn for standard UI components, Radix primitives + Tailwind for editor-specific components, micro-libs for specialized gaps.

### What shadcn covers (standard UI)

Dialogs, dropdowns, tooltips, tabs, toasts, popovers, context menus, switches, sliders, inputs — the editor chrome that behaves like any app UI.

### What we build custom (editor-specific)

Section toolbar, element selection overlay, layer/section list with drag handles, property inspector panels, inline text editing overlay — these have interaction patterns that don't map to standard components.

### What micro-libs fill (specialized gaps)

| Gap | Library | Size | Why not build it |
| --- | --- | --- | --- |
| **Color picker** | `react-colorful` | ~2 KB | Color space math, accessibility, gradient support |
| **Resizable panels** | `react-resizable-panels` | ~5 KB | Keyboard accessible, persist sizes, nested splits |
| **Drag-and-drop** | `@dnd-kit` | ~10 KB | Touch support, collision detection, accessibility |

**Rule: one micro-lib per gap.** No Swiss-army-knife UI libraries. Each must be <10 KB and do one thing well.

## Theming — Dark by Default

Per ADR-001: dark theme by default, light toggle included.

### Implementation

- **CSS custom properties** (design tokens) define all colors — shadcn already uses this pattern
- **Tailwind `dark:` variants** are inverted: `dark:` is the default, light mode is the override
- **Theme context** — a React context + `<ThemeProvider>` toggles a class on `<html>`, Tailwind + CSS variables handle the rest
- shadcn components already ship with dark mode classes — no extra work per component

### What this proves in interviews

Design token system, CSS custom properties, theme context pattern, class-based theme switching — demonstrates understanding of scalable theming, not just "I added dark mode."

## Preview Isolation — iframe Boundary

**The editor canvas renders the user's landing page inside an `<iframe>`.**

Why this matters for styling:

- Editor Tailwind utilities cannot leak into the iframe — complete CSS isolation
- The iframe loads only the published page's styles (inline styles from ADR-005)
- Responsive preview = resize the iframe, not the browser window
- What you see in the editor = exactly what gets published

This is how Framer, Webflow, and every serious page builder handles it. Without iframe isolation, editor styles (dark theme, utility classes, component styles) would corrupt the user's page preview.

## Tradeoffs and Mitigations

### 1. Tailwind utility classes get verbose

An editor panel can accumulate 10+ utilities per element.

**Mitigation:**
- `cn()` utility (included with shadcn) for conditional class merging
- Extract components after 2-3 duplications — `<PanelContainer>`, `<ToolbarButton>`
- Don't extract prematurely — duplicate is better than wrong abstraction

### 2. shadcn won't fit every editor component

Standard dialog/dropdown patterns don't cover inline editing, drag handles, or live preview property panels.

**Mitigation:**
- Use shadcn for standard UI (dialogs, dropdowns, tooltips, tabs, toasts)
- Build editor-specific components from Radix primitives + Tailwind
- **Rule: never fork a shadcn component.** Either use it as-is, or build your own. Forked components lose the upgrade path and become maintenance debt.

### 3. Missing specialized components

No color picker, resizable panels, or rich property editors in shadcn.

**Mitigation:**
- One micro-lib per gap (see table above)
- Each under 10 KB, single-purpose, framework-agnostic

### 4. Dark mode as default + light toggle

Doubles visual testing surface.

**Mitigation:**
- shadcn components already include dark mode variants — no per-component work
- CSS custom properties mean one token change flips every color
- Test dark first (default), verify light before shipping

## Boundary Rules

- **Editor styles stay in the editor.** Tailwind and shadcn never enter the preview iframe.
- **User page styles stay inline.** Per ADR-005, element styles are inline — no Tailwind in published pages.
- **shadcn components are not forked.** Use as-is or build custom. No middle ground.
- **Micro-libs are isolated.** Color picker, resizable panels, and dnd-kit don't depend on each other.

## Consequences

- Tailwind + shadcn must be configured at project init (Step 4) — `tailwind.config.ts`, `components.json`, CSS variables for design tokens.
- iframe preview architecture must be designed alongside the editor layout — not bolted on later.
- The theming system (design tokens + CSS variables + theme context) should be set up before building any editor components.
- Drag-and-drop (`@dnd-kit`) integration is a separate implementation concern — this ADR only confirms it as the tool choice.
