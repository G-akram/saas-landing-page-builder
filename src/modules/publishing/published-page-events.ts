import { db, publishedPageEvents } from '@/shared/db'
import { logger } from '@/shared/lib/logger'

import { type PublishedVariantAssignment } from './ab-testing-contracts'
import { readPublishedAssignmentFromCookieHeader } from './published-assignment-cookie'
import { getPublishedPageMetadataListBySlug } from './queries'

type TrackConversionErrorCode =
  | 'ASSIGNMENT_NOT_FOUND'
  | 'PUBLISHED_VARIANT_NOT_FOUND'
  | 'GOAL_MISMATCH'

interface TrackConversionErrorResult {
  success: false
  errorCode: TrackConversionErrorCode
}

interface TrackConversionSuccessResult {
  success: true
}

export type TrackConversionResult = TrackConversionErrorResult | TrackConversionSuccessResult

interface TrackConversionInput {
  slug: string
  goalElementId: string
  cookieHeader: string | null
  occurredAt?: Date
}

export async function recordPublishedPageView(
  assignment: PublishedVariantAssignment,
  occurredAt: Date = new Date(),
): Promise<void> {
  await insertPublishedPageEvent({
    pageId: assignment.pageId,
    variantId: assignment.variantId,
    assignmentId: assignment.assignmentId,
    contentHash: assignment.contentHash,
    eventType: 'view',
    occurredAt,
  })
}

export async function recordPublishedPageConversion({
  slug,
  goalElementId,
  cookieHeader,
  occurredAt = new Date(),
}: TrackConversionInput): Promise<TrackConversionResult> {
  const assignment = readPublishedAssignmentFromCookieHeader({ slug, cookieHeader })
  if (!assignment) {
    return {
      success: false,
      errorCode: 'ASSIGNMENT_NOT_FOUND',
    }
  }

  const publishedVariants = await getPublishedPageMetadataListBySlug(slug)
  const publishedVariant = publishedVariants.find(
    (variant) =>
      variant.pageId === assignment.pageId &&
      variant.variantId === assignment.variantId &&
      variant.contentHash === assignment.contentHash,
  )
  if (!publishedVariant) {
    return {
      success: false,
      errorCode: 'PUBLISHED_VARIANT_NOT_FOUND',
    }
  }

  if (publishedVariant.primaryGoalElementId !== goalElementId) {
    return {
      success: false,
      errorCode: 'GOAL_MISMATCH',
    }
  }

  await insertPublishedPageEvent({
    pageId: assignment.pageId,
    variantId: assignment.variantId,
    assignmentId: assignment.assignmentId,
    contentHash: assignment.contentHash,
    eventType: 'conversion',
    goalElementId,
    occurredAt,
  })

  return { success: true }
}

interface InsertPublishedPageEventInput {
  pageId: string
  variantId: string
  assignmentId: string
  contentHash: string
  eventType: 'view' | 'conversion'
  goalElementId?: string
  occurredAt: Date
}

async function insertPublishedPageEvent({
  pageId,
  variantId,
  assignmentId,
  contentHash,
  eventType,
  goalElementId,
  occurredAt,
}: InsertPublishedPageEventInput): Promise<void> {
  try {
    await db
      .insert(publishedPageEvents)
      .values({
        pageId,
        variantId,
        assignmentId,
        contentHash,
        eventType,
        goalElementId: goalElementId ?? null,
        occurredAt,
      })
      .onConflictDoNothing({
        target: [publishedPageEvents.assignmentId, publishedPageEvents.eventType],
      })
  } catch (error) {
    logger.error('Published page event insert failed', {
      pageId,
      variantId,
      assignmentId,
      eventType,
      error: getReadableErrorMessage(error),
    })
  }
}

function getReadableErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'unknown error'
}
