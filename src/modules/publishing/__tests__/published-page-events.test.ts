import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocked = vi.hoisted(() => ({
  insert: vi.fn(),
  getPublishedPageMetadataListBySlug: vi.fn(),
  publishedPageEventsTable: {
    assignmentId: Symbol('publishedPageEvents.assignmentId'),
    eventType: Symbol('publishedPageEvents.eventType'),
  },
}))

vi.mock('@/shared/db', () => ({
  db: {
    insert: mocked.insert,
  },
  publishedPageEvents: mocked.publishedPageEventsTable,
}))

vi.mock('@/modules/publishing/queries', () => ({
  getPublishedPageMetadataListBySlug: mocked.getPublishedPageMetadataListBySlug,
}))

vi.mock('@/shared/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

import { encodePublishedAssignmentCookieValue } from '../published-assignment-cookie'
import {
  recordPublishedPageConversion,
  recordPublishedPageView,
} from '../published-page-events'

function mockInsertSuccess(): void {
  mocked.insert.mockReturnValue({
    values: vi.fn().mockReturnValue({
      onConflictDoNothing: vi.fn().mockResolvedValue(undefined),
    }),
  })
}

describe('published-page events', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockInsertSuccess()
  })

  it('records a view event with assignment attribution', async () => {
    await recordPublishedPageView({
      assignmentId: 'assignment-1',
      pageId: 'page-1',
      variantId: 'variant-a',
      contentHash: 'a'.repeat(64),
      assignedAt: '2026-03-30T13:00:00.000Z',
    })

    expect(mocked.insert).toHaveBeenCalledTimes(1)
  })

  it('returns ASSIGNMENT_NOT_FOUND when the sticky cookie is missing', async () => {
    const result = await recordPublishedPageConversion({
      slug: 'acme',
      goalElementId: 'cta-button',
      cookieHeader: null,
    })

    expect(result).toEqual({
      success: false,
      errorCode: 'ASSIGNMENT_NOT_FOUND',
    })
  })

  it('records a conversion when the cookie and primary goal match', async () => {
    const assignmentCookie = encodePublishedAssignmentCookieValue({
      assignmentId: 'assignment-1',
      pageId: 'page-1',
      variantId: 'variant-a',
      contentHash: 'a'.repeat(64),
      assignedAt: '2026-03-30T13:00:00.000Z',
    })

    mocked.getPublishedPageMetadataListBySlug.mockResolvedValue([
      {
        pageId: 'page-1',
        slug: 'acme',
        variantId: 'variant-a',
        storageProvider: 'local',
        storageKey: `pages/page-1/${'a'.repeat(64)}.html`,
        contentHash: 'a'.repeat(64),
        trafficWeight: 100,
        primaryGoalElementId: 'cta-button',
        publishedAt: new Date('2026-03-30T13:00:00.000Z'),
      },
    ])

    const result = await recordPublishedPageConversion({
      slug: 'acme',
      goalElementId: 'cta-button',
      cookieHeader: `pb-assignment-acme=${assignmentCookie}`,
    })

    expect(result).toEqual({ success: true })
    expect(mocked.insert).toHaveBeenCalledTimes(1)
  })

  it('returns GOAL_MISMATCH when the clicked element is not the published goal', async () => {
    const assignmentCookie = encodePublishedAssignmentCookieValue({
      assignmentId: 'assignment-1',
      pageId: 'page-1',
      variantId: 'variant-a',
      contentHash: 'a'.repeat(64),
      assignedAt: '2026-03-30T13:00:00.000Z',
    })

    mocked.getPublishedPageMetadataListBySlug.mockResolvedValue([
      {
        pageId: 'page-1',
        slug: 'acme',
        variantId: 'variant-a',
        storageProvider: 'local',
        storageKey: `pages/page-1/${'a'.repeat(64)}.html`,
        contentHash: 'a'.repeat(64),
        trafficWeight: 100,
        primaryGoalElementId: 'hero-button',
        publishedAt: new Date('2026-03-30T13:00:00.000Z'),
      },
    ])

    const result = await recordPublishedPageConversion({
      slug: 'acme',
      goalElementId: 'cta-button',
      cookieHeader: `pb-assignment-acme=${assignmentCookie}`,
    })

    expect(result).toEqual({
      success: false,
      errorCode: 'GOAL_MISMATCH',
    })
  })
})
