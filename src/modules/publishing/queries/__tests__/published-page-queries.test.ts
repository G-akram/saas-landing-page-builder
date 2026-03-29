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
  getPublishedPageMetadataBySlug,
  readPublishedPageBySlug,
} from '../published-page-queries'

interface MockPublishedPageRow {
  pageId: string
  slug: string
  variantId: string
  storageProvider: 'local'
  storageKey: string
  contentHash: string
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
    publishedAt: new Date('2026-03-28T21:20:00.000Z'),
    ...overrides,
  }
}

function mockSelectRows(rows: MockPublishedPageRow[]): void {
  const limitMock = vi.fn().mockResolvedValue(rows)
  const orderByMock = vi.fn().mockReturnValue({ limit: limitMock })
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
