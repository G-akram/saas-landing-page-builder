import {
  PublishedVariantAssignmentSchema,
  type PublishedVariantAssignment,
} from './ab-testing-contracts'

const ASSIGNMENT_COOKIE_PREFIX = 'pb-assignment-'

interface ReadPublishedAssignmentFromCookieHeaderInput {
  slug: string
  cookieHeader: string | null
}

export function getPublishedAssignmentCookieName(slug: string): string {
  return `${ASSIGNMENT_COOKIE_PREFIX}${slug}`
}

export function encodePublishedAssignmentCookieValue(
  assignment: PublishedVariantAssignment,
): string {
  return Buffer.from(JSON.stringify(assignment), 'utf8').toString('base64url')
}

export function readPublishedAssignmentFromCookieHeader({
  slug,
  cookieHeader,
}: ReadPublishedAssignmentFromCookieHeaderInput): PublishedVariantAssignment | null {
  const cookieValue = getCookieValue(cookieHeader, getPublishedAssignmentCookieName(slug))
  if (!cookieValue) {
    return null
  }

  return decodePublishedAssignmentCookieValue(cookieValue)
}

function decodePublishedAssignmentCookieValue(value: string): PublishedVariantAssignment | null {
  try {
    const parsed = JSON.parse(Buffer.from(value, 'base64url').toString('utf8')) as unknown
    const result = PublishedVariantAssignmentSchema.safeParse(parsed)

    return result.success ? result.data : null
  } catch {
    return null
  }
}

function getCookieValue(cookieHeader: string | null, name: string): string | null {
  if (!cookieHeader) {
    return null
  }

  const cookieEntries = cookieHeader.split(';')

  for (const entry of cookieEntries) {
    const trimmedEntry = entry.trim()
    const separatorIndex = trimmedEntry.indexOf('=')
    if (separatorIndex === -1) {
      continue
    }

    if (trimmedEntry.slice(0, separatorIndex) !== name) {
      continue
    }

    return trimmedEntry.slice(separatorIndex + 1)
  }

  return null
}
