import { type Section } from '@/shared/types'

import { type BuildSeoMetadataInput, type PublishedSeoMetadata } from '../types'

const ALLOWED_IMAGE_PROTOCOLS = new Set(['http:', 'https:'])
const MAX_META_DESCRIPTION_LENGTH = 160

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

export function buildPublishedSeoMetadata(input: BuildSeoMetadataInput): PublishedSeoMetadata {
  const resolvedTitle = (trimToNull(input.seo?.title) ?? input.pageName.trim()) || 'Published page'

  const descriptionFromInput = trimToNull(input.seo?.description)
  const resolvedDescription = descriptionFromInput
    ? normalizeTextForMeta(descriptionFromInput)
    : (resolveFirstTextDescription(input.sections) ?? `Published page for ${resolvedTitle}.`)

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
