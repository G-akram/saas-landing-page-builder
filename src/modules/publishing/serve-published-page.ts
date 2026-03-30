import { logger } from '@/shared/lib/logger'

import { type PublishedVariantAssignment } from './ab-testing-contracts'
import {
  encodePublishedAssignmentCookieValue,
  getPublishedAssignmentCookieName,
  readPublishedAssignmentFromCookieHeader,
} from './published-assignment-cookie'
import { recordPublishedPageView } from './published-page-events'
import {
  getPublishedPageMetadataListBySlug,
  readPublishedPageByMetadata,
  type PublishedPageMetadata,
  type PublishedPageSnapshot,
} from './queries'

const MAX_RANDOM_VALUE = 0.999999999999

export interface PublishedAssignmentCookie {
  name: string
  value: string
}

type ServePublishedPageErrorCode = 'NOT_FOUND' | 'ARTIFACT_UNAVAILABLE'

interface ServePublishedPageErrorResult {
  success: false
  errorCode: ServePublishedPageErrorCode
}

interface ServePublishedPageSuccessResult {
  success: true
  page: PublishedPageSnapshot
  assignment: PublishedVariantAssignment
  assignmentCookie: PublishedAssignmentCookie | null
  isNewAssignment: boolean
}

export type ServePublishedPageResult =
  | ServePublishedPageErrorResult
  | ServePublishedPageSuccessResult

interface ServePublishedPageInput {
  slug: string
  cookieHeader: string | null
  now?: Date
  randomValue?: number
}

export async function servePublishedPage({
  slug,
  cookieHeader,
  now = new Date(),
  randomValue = Math.random(),
}: ServePublishedPageInput): Promise<ServePublishedPageResult> {
  const publishedVariants = await getPublishedPageMetadataListBySlug(slug)
  if (publishedVariants.length === 0) {
    return { success: false, errorCode: 'NOT_FOUND' }
  }

  const assignmentCookieName = getPublishedAssignmentCookieName(slug)
  const existingAssignment = resolveExistingAssignment({
    slug,
    cookieHeader,
    publishedVariants,
  })

  if (existingAssignment) {
    const pageResult = await readPublishedPageByMetadata(existingAssignment.metadata)
    if (!pageResult.success) {
      return pageResult
    }

    return {
      success: true,
      page: pageResult.page,
      assignment: existingAssignment.assignment,
      assignmentCookie: null,
      isNewAssignment: false,
    }
  }

  const selectedVariant = selectPublishedVariantForAssignment(publishedVariants, randomValue)
  const assignment: PublishedVariantAssignment = {
    assignmentId: crypto.randomUUID(),
    pageId: selectedVariant.pageId,
    variantId: selectedVariant.variantId,
    contentHash: selectedVariant.contentHash,
    assignedAt: now.toISOString(),
  }
  const pageResult = await readPublishedPageByMetadata(selectedVariant)
  if (!pageResult.success) {
    return pageResult
  }

  await recordPublishedPageView(assignment)

  return {
    success: true,
    page: pageResult.page,
    assignment,
    assignmentCookie: {
      name: assignmentCookieName,
      value: encodePublishedAssignmentCookieValue(assignment),
    },
    isNewAssignment: true,
  }
}

function resolveExistingAssignment({
  slug,
  cookieHeader,
  publishedVariants,
}: {
  slug: string
  cookieHeader: string | null
  publishedVariants: PublishedPageMetadata[]
}): { assignment: PublishedVariantAssignment; metadata: PublishedPageMetadata } | null {
  const assignment = readPublishedAssignmentFromCookieHeader({
    slug,
    cookieHeader,
  })
  if (!assignment) {
    return null
  }

  const metadata = publishedVariants.find(
    (variant) =>
      variant.pageId === assignment.pageId &&
      variant.variantId === assignment.variantId &&
      variant.contentHash === assignment.contentHash,
  )

  if (!metadata) {
    return null
  }

  return { assignment, metadata }
}

function selectPublishedVariantForAssignment(
  publishedVariants: PublishedPageMetadata[],
  randomValue: number,
): PublishedPageMetadata {
  const eligibleVariants = publishedVariants.filter((variant) => variant.trafficWeight > 0)
  if (eligibleVariants.length === 0) {
    logger.warn('Published variants have no positive traffic weight; falling back to latest', {
      slug: publishedVariants[0]?.slug,
      variantCount: publishedVariants.length,
    })

    return publishedVariants[0] as PublishedPageMetadata
  }

  const totalWeight = eligibleVariants.reduce((sum, variant) => sum + variant.trafficWeight, 0)
  let threshold = clampRandomValue(randomValue) * totalWeight

  for (const variant of eligibleVariants) {
    if (threshold < variant.trafficWeight) {
      return variant
    }

    threshold -= variant.trafficWeight
  }

  return eligibleVariants[eligibleVariants.length - 1] as PublishedPageMetadata
}

function clampRandomValue(value: number): number {
  if (!Number.isFinite(value)) {
    return 0
  }

  return Math.min(Math.max(value, 0), MAX_RANDOM_VALUE)
}
