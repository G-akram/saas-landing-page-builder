import { type CSSProperties } from 'react'

import {
  type Element as PageElement,
  type LinkConfig,
  type Section,
} from '@/shared/types'

import {
  type BuildSeoMetadataInput,
  type PublishedSeoMetadata,
} from '../types'

const MAX_META_DESCRIPTION_LENGTH = 160
const DEFAULT_SECTION_HORIZONTAL_PADDING_PX = 24

const ALIGNMENT_STYLE: Record<
  Section['layout']['align'],
  Pick<CSSProperties, 'alignItems' | 'textAlign'>
> = {
  left: { alignItems: 'flex-start', textAlign: 'left' },
  center: { alignItems: 'center', textAlign: 'center' },
  right: { alignItems: 'flex-end', textAlign: 'right' },
}

const VERTICAL_ALIGNMENT_STYLE: Record<
  Section['layout']['verticalAlign'],
  Pick<CSSProperties, 'justifyContent'>
> = {
  top: { justifyContent: 'flex-start' },
  center: { justifyContent: 'center' },
  bottom: { justifyContent: 'flex-end' },
}

const ALLOWED_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])
const ALLOWED_IMAGE_PROTOCOLS = new Set(['http:', 'https:'])

export const PUBLISHED_PAGE_BASE_CSS = `
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: #ffffff;
  color: #111827;
  line-height: 1.5;
}
main { width: 100%; }
h1, h2, h3, h4, p { margin: 0; }
a { color: inherit; }
img { display: block; max-width: 100%; height: auto; }
.pb-section {
  position: relative;
  width: 100%;
  overflow: hidden;
}
.pb-overlay {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
.pb-content {
  position: relative;
  z-index: 1;
  margin: 0 auto;
  width: 100%;
  max-width: 1120px;
}
.pb-stack {
  display: flex;
  flex-direction: column;
}
.pb-grid {
  display: grid;
  grid-template-columns: repeat(var(--pb-columns, 1), minmax(0, 1fr));
}
.pb-slot {
  display: flex;
  flex-direction: column;
}
.pb-image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 180px;
  border: 1px dashed #d1d5db;
  background: #f9fafb;
  color: #6b7280;
  font-size: 14px;
}
@media (max-width: 768px) {
  .pb-section {
    padding-left: ${String(DEFAULT_SECTION_HORIZONTAL_PADDING_PX)}px !important;
    padding-right: ${String(DEFAULT_SECTION_HORIZONTAL_PADDING_PX)}px !important;
  }
  .pb-grid {
    grid-template-columns: 1fr;
  }
}
`

function toPx(value: number | undefined): string | undefined {
  return value !== undefined ? `${String(value)}px` : undefined
}

function trimToNull(value: string | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function normalizeTextForMeta(value: string): string {
  const collapsed = value.replace(/\s+/g, ' ').trim()
  if (collapsed.length <= MAX_META_DESCRIPTION_LENGTH) return collapsed
  return `${collapsed.slice(0, MAX_META_DESCRIPTION_LENGTH - 3).trim()}...`
}

function buildBackgroundStyle(background: Section['background']): CSSProperties {
  switch (background.type) {
    case 'color':
      return { backgroundColor: background.value }
    case 'gradient':
      return { background: background.value }
    case 'image':
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
  }
}

function expandHexColor(hex: string): string | null {
  const normalized = hex.replace('#', '').trim()
  if (normalized.length === 3) {
    return normalized
      .split('')
      .map((char) => `${char}${char}`)
      .join('')
  }

  if (normalized.length === 6) return normalized
  return null
}

export function isDarkBackground(section: Section): boolean {
  if (section.background.type !== 'color') return false

  const expanded = expandHexColor(section.background.value)
  if (!expanded) return false

  const red = Number.parseInt(expanded.slice(0, 2), 16)
  const green = Number.parseInt(expanded.slice(2, 4), 16)
  const blue = Number.parseInt(expanded.slice(4, 6), 16)

  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255
  return luminance < 0.5
}

export function resolveDefaultTextColor(section: Section): string {
  return isDarkBackground(section) ? '#ffffff' : '#111827'
}

export function buildSectionStyle(section: Section): CSSProperties {
  return {
    ...buildBackgroundStyle(section.background),
    paddingTop: `${String(section.padding.top)}px`,
    paddingBottom: `${String(section.padding.bottom)}px`,
    paddingLeft: `${String(section.padding.left)}px`,
    paddingRight: `${String(section.padding.right)}px`,
  }
}

export function buildSlotStyle(layout: Section['layout']): CSSProperties {
  return {
    ...ALIGNMENT_STYLE[layout.align],
    ...VERTICAL_ALIGNMENT_STYLE[layout.verticalAlign],
    gap: `${String(Math.max(8, Math.round(layout.gap * 0.5)))}px`,
  }
}

export function buildStackLayoutStyle(layout: Section['layout']): CSSProperties {
  return {
    ...ALIGNMENT_STYLE[layout.align],
    ...VERTICAL_ALIGNMENT_STYLE[layout.verticalAlign],
    gap: `${String(layout.gap)}px`,
  }
}

export function buildGridLayoutStyle(columns: number, gap: number): CSSProperties {
  const style: CSSProperties = {
    gap: `${String(gap)}px`,
  }

  ;(style as CSSProperties & Record<'--pb-columns', string>)['--pb-columns'] =
    String(columns)

  return style
}

export function buildBaseElementStyle(styles: PageElement['styles']): CSSProperties {
  return {
    fontSize: toPx(styles.fontSize),
    fontWeight: styles.fontWeight ?? undefined,
    fontFamily: styles.fontFamily ?? undefined,
    color: styles.color ?? undefined,
    textAlign: styles.textAlign ?? undefined,
    lineHeight: styles.lineHeight ?? undefined,
    width: styles.width ?? undefined,
    maxWidth: styles.maxWidth ?? undefined,
    marginTop: toPx(styles.marginTop),
    marginBottom: toPx(styles.marginBottom),
  }
}

export function buildButtonStyle(styles: PageElement['styles']): CSSProperties {
  return {
    ...buildBaseElementStyle(styles),
    display: 'inline-block',
    textDecoration: 'none',
    backgroundColor: styles.backgroundColor ?? undefined,
    borderRadius: toPx(styles.borderRadius),
    paddingTop: styles.padding ? `${String(styles.padding.top)}px` : undefined,
    paddingBottom: styles.padding ? `${String(styles.padding.bottom)}px` : undefined,
    paddingLeft: styles.padding ? `${String(styles.padding.left)}px` : undefined,
    paddingRight: styles.padding ? `${String(styles.padding.right)}px` : undefined,
  }
}

export function buildImageStyle(styles: PageElement['styles']): CSSProperties {
  return {
    maxWidth: styles.maxWidth ?? '100%',
    width: styles.width ?? undefined,
    borderRadius: toPx(styles.borderRadius),
    marginTop: toPx(styles.marginTop),
    marginBottom: toPx(styles.marginBottom),
  }
}

export function sanitizeSectionId(rawId: string): string {
  const cleaned = rawId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_.:]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return cleaned.length > 0 ? cleaned : 'section'
}

export function groupElementsBySlot(elements: PageElement[]): Map<number, PageElement[]> {
  const sorted = [...elements].sort((left, right) => left.slot - right.slot)
  const grouped = new Map<number, PageElement[]>()

  for (const element of sorted) {
    const group = grouped.get(element.slot)
    if (group) {
      group.push(element)
      continue
    }

    grouped.set(element.slot, [element])
  }

  return grouped
}

function normalizeUrlCandidate(url: string, allowedProtocols: Set<string>): string | null {
  if (url.startsWith('/') || url.startsWith('#')) return url

  try {
    const parsed = new URL(url)
    if (!allowedProtocols.has(parsed.protocol)) return null
    return parsed.toString()
  } catch {
    return null
  }
}

export function resolvePublishedHref(link: LinkConfig | undefined): string | null {
  if (!link) return null
  const value = trimToNull(link.value)
  if (!value) return null

  switch (link.type) {
    case 'section':
      return `#${sanitizeSectionId(value)}`
    case 'variant':
      return null
    case 'url':
      return normalizeUrlCandidate(value, ALLOWED_LINK_PROTOCOLS)
  }
}

export function isExternalHttpLink(href: string): boolean {
  return href.startsWith('http://') || href.startsWith('https://')
}

function resolveFirstTextDescription(sections: Section[]): string | null {
  for (const section of sections) {
    const sorted = [...section.elements].sort((left, right) => left.slot - right.slot)
    for (const element of sorted) {
      if (element.content.type === 'heading' || element.content.type === 'text') {
        const text = trimToNull(element.content.text)
        if (text) return normalizeTextForMeta(text)
      }

      if (element.content.type === 'button') {
        const text = trimToNull(element.content.text)
        if (text) return normalizeTextForMeta(text)
      }
    }
  }

  return null
}

function resolveFirstImageSource(sections: Section[]): string | null {
  for (const section of sections) {
    for (const element of section.elements) {
      if (element.content.type !== 'image') continue
      const source = trimToNull(element.content.src)
      if (!source) continue

      const normalized = normalizeUrlCandidate(source, ALLOWED_IMAGE_PROTOCOLS)
      if (normalized) return normalized
    }
  }

  return null
}

export function buildPublishedSeoMetadata(
  input: BuildSeoMetadataInput,
): PublishedSeoMetadata {
  const resolvedTitle =
    (trimToNull(input.seo?.title) ?? input.pageName.trim()) || 'Published page'

  const descriptionFromInput = trimToNull(input.seo?.description)
  const resolvedDescription = descriptionFromInput
    ? normalizeTextForMeta(descriptionFromInput)
    : resolveFirstTextDescription(input.sections) ??
      `Published page for ${resolvedTitle}.`

  const canonicalCandidate = trimToNull(input.liveUrl)
  const canonicalUrl = canonicalCandidate
    ? normalizeUrlCandidate(canonicalCandidate, ALLOWED_IMAGE_PROTOCOLS)
    : null

  const ogImageCandidate = trimToNull(input.seo?.ogImage)
  const resolvedOgImage = ogImageCandidate
    ? normalizeUrlCandidate(ogImageCandidate, ALLOWED_IMAGE_PROTOCOLS)
    : resolveFirstImageSource(input.sections)

  return {
    title: resolvedTitle,
    description: resolvedDescription,
    canonicalUrl,
    ogImage: resolvedOgImage,
  }
}
