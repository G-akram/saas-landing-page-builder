import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocked = vi.hoisted(() => ({
  dbSelect: vi.fn(),
  dbInsert: vi.fn(),
  getPublishedPageMetadataListBySlug: vi.fn(),
  readPublishedAssignmentFromCookieHeader: vi.fn(),
  loggerWarn: vi.fn(),
  pagesTable: {
    id: Symbol('pages.id'),
    document: Symbol('pages.document'),
  },
}))

vi.mock('@/shared/db', () => ({
  db: {
    select: mocked.dbSelect,
    insert: mocked.dbInsert,
  },
  pages: mocked.pagesTable,
  leadSubmissions: {},
}))

vi.mock('@/modules/publishing/queries', () => ({
  getPublishedPageMetadataListBySlug: mocked.getPublishedPageMetadataListBySlug,
}))

vi.mock('@/modules/publishing/published-assignment-cookie', () => ({
  readPublishedAssignmentFromCookieHeader: mocked.readPublishedAssignmentFromCookieHeader,
}))

vi.mock('@/shared/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    warn: mocked.loggerWarn,
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

import { capturePublishedLead } from '../lead-capture'

function createPageDocument(submitTarget: 'database' | 'webhook' = 'database'): unknown {
  return {
    activeVariantId: 'variant-a',
    variants: [
      {
        id: 'variant-a',
        name: 'Primary',
        trafficWeight: 100,
        primaryGoal: null,
        sections: [
          {
            id: 'section-1',
            type: 'form',
            variantStyleId: 'form-1',
            layout: { type: 'stack', gap: 16, align: 'center', verticalAlign: 'center' },
            background: { type: 'color', value: '#ffffff' },
            padding: { top: 64, bottom: 64, left: 24, right: 24 },
            elements: [
              {
                id: 'lead-form-1',
                type: 'form',
                slot: 0,
                content: {
                  type: 'form',
                  variant: 'email',
                  submitLabel: 'Submit',
                  successMessage: 'Done',
                  submitTarget,
                  webhookUrl: submitTarget === 'webhook' ? 'https://example.com/webhook' : undefined,
                },
                styles: {},
              },
            ],
          },
        ],
      },
    ],
  }
}

function mockPageLookup(document: unknown): void {
  mocked.dbSelect.mockReturnValue({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue([{ id: 'page-1', document }]),
      }),
    }),
  })
}

describe('capturePublishedLead', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('fetch', vi.fn())

    mocked.dbInsert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    })

    mocked.readPublishedAssignmentFromCookieHeader.mockReturnValue({
      assignmentId: 'assignment-1',
      pageId: 'page-1',
      variantId: 'variant-a',
      contentHash: 'a'.repeat(64),
      assignedAt: '2026-03-31T11:00:00.000Z',
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
        primaryGoalElementId: null,
        publishedAt: new Date('2026-03-31T11:00:00.000Z'),
      },
    ])
  })

  it('returns ASSIGNMENT_NOT_FOUND without a sticky assignment cookie', async () => {
    mocked.readPublishedAssignmentFromCookieHeader.mockReturnValue(null)

    const result = await capturePublishedLead({
      slug: 'acme',
      elementId: 'lead-form-1',
      email: 'user@example.com',
      cookieHeader: null,
    })

    expect(result).toEqual({ success: false, errorCode: 'ASSIGNMENT_NOT_FOUND' })
  })

  it('stores a lead in the database for the database target', async () => {
    mockPageLookup(createPageDocument('database'))

    const result = await capturePublishedLead({
      slug: 'acme',
      elementId: 'lead-form-1',
      email: 'user@example.com',
      cookieHeader: 'pb-assignment-acme=encoded',
    })

    expect(result).toEqual({ success: true, deliveryStatus: 'stored' })
    expect(mocked.dbInsert).toHaveBeenCalledTimes(1)
  })

  it('delivers to webhook when configured', async () => {
    mockPageLookup(createPageDocument('webhook'))
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }))

    const result = await capturePublishedLead({
      slug: 'acme',
      elementId: 'lead-form-1',
      email: 'user@example.com',
      cookieHeader: 'pb-assignment-acme=encoded',
    })

    expect(result).toEqual({ success: true, deliveryStatus: 'delivered' })
    expect(fetch).toHaveBeenCalledTimes(1)
  })

  it('rejects invalid email payloads', async () => {
    mockPageLookup(createPageDocument('database'))

    const result = await capturePublishedLead({
      slug: 'acme',
      elementId: 'lead-form-1',
      email: 'not-an-email',
      cookieHeader: 'pb-assignment-acme=encoded',
    })

    expect(result).toEqual({ success: false, errorCode: 'INVALID_PAYLOAD' })
  })
})
