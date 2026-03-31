import { type PageDocument, type Section, type Element as PageElement } from '@/shared/types'

import { type ColorToken, type ThemeDefinition, getTheme } from './design-tokens'

// ── Single-value resolution ───────────────────────────────────────────────

function resolveColorToken(token: string | undefined, theme: ThemeDefinition): string | undefined {
  if (!token) return undefined
  return theme.colors[token as ColorToken]
}

// ── Element resolution ────────────────────────────────────────────────────

function resolveElementStyles(element: PageElement, theme: ThemeDefinition): PageElement {
  const { styles } = element
  const hasColorToken = styles.colorToken !== undefined
  const hasBgToken = styles.backgroundColorToken !== undefined

  if (!hasColorToken && !hasBgToken) return element

  const resolvedColor = resolveColorToken(styles.colorToken, theme)
  const resolvedBg = resolveColorToken(styles.backgroundColorToken, theme)

  return {
    ...element,
    styles: {
      ...styles,
      ...(hasColorToken && resolvedColor !== undefined ? { color: resolvedColor } : {}),
      ...(hasBgToken && resolvedBg !== undefined ? { backgroundColor: resolvedBg } : {}),
    },
  }
}

// ── Section resolution ────────────────────────────────────────────────────

function resolveSectionBackground(section: Section, theme: ThemeDefinition): Section {
  const { background } = section
  if (!background.valueToken) return section

  const resolved = resolveColorToken(background.valueToken, theme)
  if (resolved === undefined) return section

  return {
    ...section,
    background: { ...background, value: resolved },
  }
}

function resolveSection(section: Section, theme: ThemeDefinition): Section {
  const withBackground = resolveSectionBackground(section, theme)
  const resolvedElements = withBackground.elements.map((el) =>
    resolveElementStyles(el, theme),
  )

  const elementsChanged = resolvedElements.some(
    (el, i) => el !== withBackground.elements[i],
  )

  if (withBackground === section && !elementsChanged) return section

  return { ...withBackground, elements: resolvedElements }
}

// ── Document-level resolution ─────────────────────────────────────────────

/**
 * Resolves token keys in a single newly-created section against the given theme.
 * Used when adding a section so its colors match the active page theme immediately.
 */
export function resolveNewSection(section: Section, themeId: string): Section {
  const theme = getTheme(themeId)
  return resolveSection(section, theme)
}

/**
 * Resolves all token keys in a document to concrete values using the given theme.
 * Returns a new document if anything changed, or the same reference if nothing to resolve.
 */
export function resolveDocumentTheme(
  document: PageDocument,
  themeId: string,
): PageDocument {
  const theme = getTheme(themeId)

  const variants = document.variants.map((variant) => {
    const sections = variant.sections.map((section) => resolveSection(section, theme))
    return sections.some((s, i) => s !== variant.sections[i])
      ? { ...variant, sections }
      : variant
  })

  const variantsChanged = variants.some((v, i) => v !== document.variants[i])

  if (!variantsChanged && document.themeId === themeId) return document

  return { ...document, themeId, variants }
}

/**
 * Applies font families from a theme to all text elements that don't have
 * a manually set fontFamily. Call after resolveDocumentTheme if you want
 * font pairing applied.
 */
export function applyThemeFonts(
  document: PageDocument,
  themeId: string,
): PageDocument {
  const theme = getTheme(themeId)

  const variants = document.variants.map((variant) => {
    const sections = variant.sections.map((section) => {
      const elements = section.elements.map((element) => {
        // Only apply fonts to text-bearing elements
        if (element.type === 'image' || element.type === 'icon') return element

        const isHeading = element.type === 'heading'
        const targetFont = isHeading ? theme.fonts.heading : theme.fonts.body

        if (element.styles.fontFamily === targetFont) return element

        return {
          ...element,
          styles: { ...element.styles, fontFamily: targetFont },
        }
      })
      return elements.some((el, i) => el !== section.elements[i])
        ? { ...section, elements }
        : section
    })
    return sections.some((s, i) => s !== variant.sections[i])
      ? { ...variant, sections }
      : variant
  })

  const variantsChanged = variants.some((v, i) => v !== document.variants[i])

  if (!variantsChanged) return document
  return { ...document, variants }
}
