import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocked = vi.hoisted(() => ({
  select: vi.fn(),
  createPublishStorageAdapter: vi.fn(),
  readArtifact: vi.fn(),
  loggerError: vi.fn(),
  publishedPagesTable: {
    pageId: Symbol('publishedPages.pageId'),
    slug: Symbol('publishedPages.slug'),
    variantId: Symbol('publishedPages.variantId'),
    storageProvider: Symbol('publishedPages.storageProvider'),
    storageKey: Symbol('publishedPages.storageKey'),
    contentHash: Symbol('publishedPages.contentHash'),
    trafficWeight: Symbol('publishedPages.trafficWeight'),
    primaryGoalElementId: Symbol('publishedPages.primaryGoalElementId'),
    publishedAt: Symbol('publishedPages.publishedAt'),
  },
}))

vi.mock('@/shared/db', () => ({
  db: {
    select: mocked.select,
  },
  publishedPages: mocked.publishedPagesTable,
}))

vi.mock('@/modules/publishing/storage', () => ({
  createPublishStorageAdapter: mocked.createPublishStorageAdapter,
}))

vi.mock('@/shared/lib/logger', () => ({
  logger: {
    error: mocked.loggerError,
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

import {
  getPublishedPageMetadataListBySlug,
  getPublishedPageMetadataBySlug,
  readPublishedPageByMetadata,
  readPublishedPageBySlug,
} from '../published-page-queries'

interface MockPublishedPageRow {
  pageId: string
  slug: string
  variantId: string
  storageProvider: 'local'
  storageKey: string
  contentHash: string
  trafficWeight: number
  primaryGoalElementId: string | null
  publishedAt: Date
}

function createPublishedRow(overrides: Partial<MockPublishedPageRow> = {}): MockPublishedPageRow {
  return {
    pageId: 'page-1',
    slug: 'acme',
    variantId: 'variant-a',
    storageProvider: 'local',
    storageKey: `pages/page-1/${'a'.repeat(64)}.html`,
    contentHash: 'a'.repeat(64),
    trafficWeight: 100,
    primaryGoalElementId: null,
    publishedAt: new Date('2026-03-28T21:20:00.000Z'),
    ...overrides,
  }
}

function mockSelectRows(rows: MockPublishedPageRow[]): void {
  const orderByMock = vi.fn().mockResolvedValue(rows)
  const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock })
  const fromMock = vi.fn().mockReturnValue({ where: whereMock })

  mocked.select.mockReturnValue({ from: fromMock })
}

describe('published-page queries', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocked.createPublishStorageAdapter.mockReturnValue({
      provider: 'local',
      writeArtifact: vi.fn(),
      readArtifact: mocked.readArtifact,
    })
  })

  it('returns metadata when slug exists', async () => {
    mockSelectRows([createPublishedRow()])

    const result = await getPublishedPageMetadataBySlug('acme')

    expect(result).not.toBeNull()
    expect(result?.pageId).toBe('page-1')
    expect(result?.slug).toBe('acme')
    expect(result?.variantId).toBe('variant-a')
    expect(result?.trafficWeight).toBe(100)
  })

  it('returns all published metadata rows for a slug', async () => {
    mockSelectRows([
      createPublishedRow(),
      createPublishedRow({
        variantId: 'variant-b',
        contentHash: 'b'.repeat(64),
        storageKey: `pages/page-1/${'b'.repeat(64)}.html`,
      }),
    ])

    const result = await getPublishedPageMetadataListBySlug('acme')

    expect(result).toHaveLength(2)
  })

  it('returns NOT_FOUND when metadata does not exist', async () => {
    mockSelectRows([])

    const result = await readPublishedPageBySlug('missing')

    expect(result).toEqual({
      success: false,
      errorCode: 'NOT_FOUND',
    })
  })

  it('returns ARTIFACT_UNAVAILABLE when storage read fails', async () => {
    mockSelectRows([createPublishedRow()])
    mocked.readArtifact.mockResolvedValue({
      success: false,
      errorCode: 'NOT_FOUND',
      message: 'artifact missing',
    })

    const result = await readPublishedPageBySlug('acme')

    expect(result).toEqual({
      success: false,
      errorCode: 'ARTIFACT_UNAVAILABLE',
    })
    expect(mocked.loggerError).toHaveBeenCalled()
  })

  it('returns published HTML snapshot when storage read succeeds', async () => {
    const row = createPublishedRow()
    mockSelectRows([row])
    mocked.readArtifact.mockResolvedValue({
      success: true,
      html: '<!DOCTYPE html><html><body><h1>Acme</h1></body></html>',
      bytes: 54,
    })

    const result = await readPublishedPageBySlug('acme')

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.page.pageId).toBe(row.pageId)
    expect(result.page.slug).toBe(row.slug)
    expect(result.page.variantId).toBe(row.variantId)
    expect(result.page.contentHash).toBe(row.contentHash)
    expect(result.page.html).toContain('<h1>Acme</h1>')
  })

  it('reads a published page directly from metadata', async () => {
    const row = createPublishedRow()
    mocked.readArtifact.mockResolvedValue({
      success: true,
      html: '<!DOCTYPE html><html><body><h1>Acme</h1></body></html>',
      bytes: 54,
    })

    const result = await readPublishedPageByMetadata(row)

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.page.variantId).toBe(row.variantId)
    expect(result.page.trafficWeight).toBe(row.trafficWeight)
  })

  it('returns ARTIFACT_UNAVAILABLE when storage adapter throws', async () => {
    mockSelectRows([createPublishedRow()])
    mocked.createPublishStorageAdapter.mockImplementation(() => {
      throw new Error('provider not implemented')
    })

    const result = await readPublishedPageBySlug('acme')

    expect(result).toEqual({
      success: false,
      errorCode: 'ARTIFACT_UNAVAILABLE',
    })
    expect(mocked.loggerError).toHaveBeenCalled()
  })
})
