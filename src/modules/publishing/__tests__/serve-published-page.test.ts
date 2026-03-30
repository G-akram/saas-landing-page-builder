import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocked = vi.hoisted(() => ({
  getPublishedPageMetadataListBySlug: vi.fn(),
  readPublishedPageByMetadata: vi.fn(),
  recordPublishedPageView: vi.fn(),
  loggerWarn: vi.fn(),
}))

vi.mock('@/modules/publishing/queries', () => ({
  getPublishedPageMetadataListBySlug: mocked.getPublishedPageMetadataListBySlug,
  readPublishedPageByMetadata: mocked.readPublishedPageByMetadata,
}))

vi.mock('@/modules/publishing/published-page-events', () => ({
  recordPublishedPageView: mocked.recordPublishedPageView,
}))

vi.mock('@/shared/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: mocked.loggerWarn,
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

import { servePublishedPage } from '../serve-published-page'

function createPublishedVariant(overrides: Partial<{
  pageId: string
  slug: string
  variantId: string
  storageProvider: 'local'
  storageKey: string
  contentHash: string
  trafficWeight: number
  primaryGoalElementId: string | null
  publishedAt: Date
}> = {}) {
  return {
    pageId: 'page-1',
    slug: 'acme',
    variantId: 'variant-a',
    storageProvider: 'local' as const,
    storageKey: `pages/page-1/${'a'.repeat(64)}.html`,
    contentHash: 'a'.repeat(64),
    trafficWeight: 60,
    primaryGoalElementId: 'cta-button',
    publishedAt: new Date('2026-03-30T12:00:00.000Z'),
    ...overrides,
  }
}

function createSnapshot(variantId: string) {
  return {
    ...createPublishedVariant({ variantId }),
    html: `<!DOCTYPE html><html><body>${variantId}</body></html>`,
  }
}

describe('servePublishedPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(globalThis.crypto, 'randomUUID').mockReturnValue('assignment-1')
  })

  it('reuses a valid sticky assignment cookie', async () => {
    const variant = createPublishedVariant()
    const cookiePayload = Buffer.from(
      JSON.stringify({
        assignmentId: 'assignment-existing',
        pageId: variant.pageId,
        variantId: variant.variantId,
        contentHash: variant.contentHash,
        assignedAt: '2026-03-30T12:10:00.000Z',
      }),
      'utf8',
    ).toString('base64url')

    mocked.getPublishedPageMetadataListBySlug.mockResolvedValue([variant])
    mocked.readPublishedPageByMetadata.mockResolvedValue({
      success: true,
      page: createSnapshot(variant.variantId),
    })

    const result = await servePublishedPage({
      slug: 'acme',
      cookieHeader: `pb-assignment-acme=${cookiePayload}`,
    })

    expect(result.success).toBe(true)
    if (!result.success) {
      return
    }

    expect(result.isNewAssignment).toBe(false)
    expect(result.assignment.assignmentId).toBe('assignment-existing')
    expect(result.assignmentCookie).toBeNull()
    expect(mocked.readPublishedPageByMetadata).toHaveBeenCalledWith(variant)
  })

  it('creates a new weighted assignment cookie when none exists', async () => {
    const firstVariant = createPublishedVariant({
      variantId: 'variant-a',
      contentHash: 'a'.repeat(64),
      trafficWeight: 60,
    })
    const secondVariant = createPublishedVariant({
      variantId: 'variant-b',
      contentHash: 'b'.repeat(64),
      trafficWeight: 40,
      storageKey: `pages/page-1/${'b'.repeat(64)}.html`,
    })

    mocked.getPublishedPageMetadataListBySlug.mockResolvedValue([
      firstVariant,
      secondVariant,
    ])
    mocked.readPublishedPageByMetadata.mockResolvedValue({
      success: true,
      page: createSnapshot(firstVariant.variantId),
    })

    const result = await servePublishedPage({
      slug: 'acme',
      cookieHeader: null,
      now: new Date('2026-03-30T12:15:00.000Z'),
      randomValue: 0.2,
    })

    expect(result.success).toBe(true)
    if (!result.success) {
      return
    }

    expect(result.isNewAssignment).toBe(true)
    expect(result.assignment.variantId).toBe('variant-a')
    expect(result.assignmentCookie).toEqual({
      name: 'pb-assignment-acme',
      value: expect.any(String),
    })
    expect(mocked.recordPublishedPageView).toHaveBeenCalledWith(
      expect.objectContaining({ assignmentId: 'assignment-1' }),
    )
  })

  it('reassigns when the cookie points to stale published content', async () => {
    const currentVariant = createPublishedVariant({
      contentHash: 'c'.repeat(64),
      storageKey: `pages/page-1/${'c'.repeat(64)}.html`,
    })
    const staleCookie = Buffer.from(
      JSON.stringify({
        assignmentId: 'assignment-stale',
        pageId: currentVariant.pageId,
        variantId: currentVariant.variantId,
        contentHash: 'd'.repeat(64),
        assignedAt: '2026-03-30T12:10:00.000Z',
      }),
      'utf8',
    ).toString('base64url')

    mocked.getPublishedPageMetadataListBySlug.mockResolvedValue([currentVariant])
    mocked.readPublishedPageByMetadata.mockResolvedValue({
      success: true,
      page: {
        ...createSnapshot(currentVariant.variantId),
        contentHash: currentVariant.contentHash,
      },
    })

    const result = await servePublishedPage({
      slug: 'acme',
      cookieHeader: `pb-assignment-acme=${staleCookie}`,
      now: new Date('2026-03-30T12:20:00.000Z'),
    })

    expect(result.success).toBe(true)
    if (!result.success) {
      return
    }

    expect(result.isNewAssignment).toBe(true)
    expect(result.assignment.assignmentId).toBe('assignment-1')
    expect(result.assignment.contentHash).toBe(currentVariant.contentHash)
    expect(result.assignmentCookie?.name).toBe('pb-assignment-acme')
  })

  it('falls back to the latest published variant when all weights are zero', async () => {
    const latestVariant = createPublishedVariant({
      variantId: 'variant-b',
      contentHash: 'b'.repeat(64),
      trafficWeight: 0,
      publishedAt: new Date('2026-03-30T12:20:00.000Z'),
      storageKey: `pages/page-1/${'b'.repeat(64)}.html`,
    })
    const olderVariant = createPublishedVariant({
      variantId: 'variant-a',
      contentHash: 'a'.repeat(64),
      trafficWeight: 0,
      publishedAt: new Date('2026-03-30T12:10:00.000Z'),
    })

    mocked.getPublishedPageMetadataListBySlug.mockResolvedValue([
      latestVariant,
      olderVariant,
    ])
    mocked.readPublishedPageByMetadata.mockResolvedValue({
      success: true,
      page: createSnapshot(latestVariant.variantId),
    })

    const result = await servePublishedPage({
      slug: 'acme',
      cookieHeader: null,
    })

    expect(result.success).toBe(true)
    if (!result.success) {
      return
    }

    expect(result.assignment.variantId).toBe('variant-b')
    expect(mocked.loggerWarn).toHaveBeenCalled()
  })
})
