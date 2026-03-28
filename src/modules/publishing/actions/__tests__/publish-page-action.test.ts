import { beforeEach, describe, expect, it, vi } from 'vitest'

import { type PageDocument } from '@/shared/types'

const mocked = vi.hoisted(() => ({
  auth: vi.fn(),
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  revalidatePath: vi.fn(),
  renderPublishedPage: vi.fn(),
  writeArtifact: vi.fn(),
  loggerError: vi.fn(),
  loggerWarn: vi.fn(),
  pagesTable: {
    id: Symbol('pages.id'),
    userId: Symbol('pages.userId'),
    name: Symbol('pages.name'),
    slug: Symbol('pages.slug'),
    document: Symbol('pages.document'),
    status: Symbol('pages.status'),
    updatedAt: Symbol('pages.updatedAt'),
  },
  publishedPagesTable: {
    pageId: Symbol('publishedPages.pageId'),
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: mocked.revalidatePath,
}))

vi.mock('@/shared/lib/auth', () => ({
  auth: mocked.auth,
}))

vi.mock('@/shared/db', () => ({
  db: {
    select: mocked.select,
    insert: mocked.insert,
    update: mocked.update,
  },
  pages: mocked.pagesTable,
  publishedPages: mocked.publishedPagesTable,
}))

vi.mock('@/shared/lib/logger', () => ({
  logger: {
    error: mocked.loggerError,
    warn: mocked.loggerWarn,
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

vi.mock('@/modules/publishing/utils/render-published-page', () => ({
  renderPublishedPage: mocked.renderPublishedPage,
}))

vi.mock('@/modules/publishing/storage', () => ({
  createPublishStorageAdapter: vi.fn(() => ({
    provider: 'local',
    writeArtifact: mocked.writeArtifact,
    readArtifact: vi.fn(),
  })),
}))

import { publishPage } from '../publish-page-action'

interface MockPageRow {
  id: string
  userId: string
  name: string
  slug: string
  document: PageDocument
}

function createDocument(): PageDocument {
  return {
    activeVariantId: 'variant-a',
    variants: [
      {
        id: 'variant-a',
        name: 'Primary',
        trafficWeight: 100,
        sections: [
          {
            id: 'hero-1',
            type: 'hero',
            variantStyleId: 'hero-1',
            layout: {
              type: 'stack',
              gap: 24,
              align: 'center',
              verticalAlign: 'center',
            },
            background: { type: 'color', value: '#ffffff' },
            padding: { top: 80, bottom: 80, left: 24, right: 24 },
            elements: [],
          },
        ],
      },
    ],
  }
}

function createPageRow(overrides: Partial<MockPageRow> = {}): MockPageRow {
  return {
    id: 'page-1',
    userId: 'user-1',
    name: 'Acme Page',
    slug: 'acme-page',
    document: createDocument(),
    ...overrides,
  }
}

function mockSelectRows(rows: MockPageRow[]): void {
  const limitMock = vi.fn().mockResolvedValue(rows)
  const whereMock = vi.fn().mockReturnValue({ limit: limitMock })
  const fromMock = vi.fn().mockReturnValue({ where: whereMock })

  mocked.select.mockReturnValue({ from: fromMock })
}

function mockPersistenceSuccess(): void {
  mocked.insert.mockReturnValue({
    values: vi.fn().mockReturnValue({
      onConflictDoUpdate: vi.fn().mockResolvedValue(undefined),
    }),
  })

  mocked.update.mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    }),
  })
}

describe('publishPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    process.env.PUBLISH_BASE_URL = 'https://builder.example.com'

    mocked.auth.mockResolvedValue({ user: { id: 'user-1' } })
    mockSelectRows([createPageRow()])

    mocked.renderPublishedPage.mockResolvedValue({
      success: true,
      html: '<!DOCTYPE html><html><body>Hello</body></html>',
      contentHash: 'a'.repeat(64),
      variantId: 'variant-a',
      metadata: {
        title: 'Acme Page',
        description: 'Acme description',
        canonicalUrl: 'https://builder.example.com/p/acme-page',
        ogImage: null,
      },
    })

    mocked.writeArtifact.mockResolvedValue({
      success: true,
      storageProvider: 'local',
      storageKey: 'pages/page-1/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.html',
      bytes: 44,
    })

    mockPersistenceSuccess()
  })

  it('returns NOT_AUTHENTICATED when session is missing', async () => {
    mocked.auth.mockResolvedValue(null)

    const result = await publishPage({ pageId: 'page-1' })

    expect(result).toEqual({
      success: false,
      errorCode: 'NOT_AUTHENTICATED',
      message: 'Not authenticated',
    })
  })

  it('returns PAGE_NOT_FOUND for pages outside the caller scope', async () => {
    mockSelectRows([])

    const result = await publishPage({ pageId: 'page-1' })

    expect(result).toEqual({
      success: false,
      errorCode: 'PAGE_NOT_FOUND',
      message: 'Page not found',
    })
  })

  it('maps renderer failures to INVALID_DOCUMENT', async () => {
    mocked.renderPublishedPage.mockResolvedValue({
      success: false,
      errorCode: 'ACTIVE_VARIANT_NOT_FOUND',
      message: 'Active variant not found',
    })

    const result = await publishPage({ pageId: 'page-1' })

    expect(result).toEqual({
      success: false,
      errorCode: 'INVALID_DOCUMENT',
      message: 'Active variant not found',
    })
  })

  it('maps storage write failures to STORAGE_WRITE_FAILED', async () => {
    mocked.writeArtifact.mockResolvedValue({
      success: false,
      errorCode: 'WRITE_FAILED',
      message: 'failed to write',
    })

    const result = await publishPage({ pageId: 'page-1' })

    expect(result).toEqual({
      success: false,
      errorCode: 'STORAGE_WRITE_FAILED',
      message: 'Failed to persist published artifact',
    })
  })

  it('publishes successfully and returns live URL + artifact metadata', async () => {
    const result = await publishPage({ pageId: 'page-1' })

    expect(result.success).toBe(true)
    if (!result.success) {
      return
    }

    expect(result.liveUrl).toBe('https://builder.example.com/p/acme-page')
    expect(result.artifact.pageId).toBe('page-1')
    expect(result.artifact.slug).toBe('acme-page')
    expect(result.artifact.storageProvider).toBe('local')
    expect(result.artifact.storageKey).toContain('pages/page-1/')
    expect(result.artifact.contentHash).toBe('a'.repeat(64))

    expect(mocked.revalidatePath).toHaveBeenCalledWith('/dashboard')
    expect(mocked.revalidatePath).toHaveBeenCalledWith('/editor/page-1')
  })
})



