import { type LinkConfig } from '@/shared/types'

const ALLOWED_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:'])

function trimToNull(value: string | undefined): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
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

export function sanitizeSectionId(rawId: string): string {
  const cleaned = rawId
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_.:]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  return cleaned.length > 0 ? cleaned : 'section'
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

