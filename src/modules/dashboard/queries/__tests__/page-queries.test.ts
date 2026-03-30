import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocked = vi.hoisted(() => ({
  select: vi.fn(),
  loggerError: vi.fn(),
  loggerWarn: vi.fn(),
  pagesTable: {
    id: Symbol('pages.id'),
    userId: Symbol('pages.userId'),
    name: Symbol('pages.name'),
    slug: Symbol('pages.slug'),
    document: Symbol('pages.document'),
    status: Symbol('pages.status'),
    createdAt: Symbol('pages.createdAt'),
    updatedAt: Symbol('pages.updatedAt'),
  },
  publishedPageEventsTable: {
    pageId: Symbol('publishedPageEvents.pageId'),
    variantId: Symbol('publishedPageEvents.variantId'),
    eventType: Symbol('publishedPageEvents.eventType'),
  },
}))

vi.mock('@/shared/db', () => ({
  db: {
    select: mocked.select,
  },
  pages: mocked.pagesTable,
  publishedPageEvents: mocked.publishedPageEventsTable,
}))

vi.mock('@/shared/lib/logger', () => ({
  logger: {
    error: mocked.loggerError,
    warn: mocked.loggerWarn,
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

import { getPagesByUser } from '../page-queries'

function createDocument() {
  return {
    activeVariantId: 'variant-a',
    variants: [
      {
        id: 'variant-a',
        name: 'Control',
        trafficWeight: 50,
        sections: [],
      },
      {
        id: 'variant-b',
        name: 'Challenger',
        trafficWeight: 50,
        sections: [],
      },
    ],
  }
}

function mockPageRows(rows: unknown[]): void {
  const orderByMock = vi.fn().mockResolvedValue(rows)
  const whereMock = vi.fn().mockReturnValue({ orderBy: orderByMock })
  const fromMock = vi.fn().mockReturnValue({ where: whereMock })

  mocked.select.mockReturnValueOnce({ from: fromMock })
}

function mockAnalyticsRows(rows: unknown[]): void {
  const groupByMock = vi.fn().mockResolvedValue(rows)
  const whereMock = vi.fn().mockReturnValue({ groupBy: groupByMock })
  const innerJoinMock = vi.fn().mockReturnValue({ where: whereMock })
  const fromMock = vi.fn().mockReturnValue({ innerJoin: innerJoinMock })

  mocked.select.mockReturnValueOnce({ from: fromMock })
}

describe('getPagesByUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('merges per-variant analytics into dashboard page summaries', async () => {
    mockPageRows([
      {
        id: 'page-1',
        name: 'Acme',
        slug: 'acme',
        status: 'published',
        document: createDocument(),
        createdAt: new Date('2026-03-30T14:00:00.000Z'),
        updatedAt: new Date('2026-03-30T14:30:00.000Z'),
      },
    ])
    mockAnalyticsRows([
      {
        pageId: 'page-1',
        variantId: 'variant-a',
        eventType: 'view',
        eventCount: 10,
      },
      {
        pageId: 'page-1',
        variantId: 'variant-a',
        eventType: 'conversion',
        eventCount: 2,
      },
      {
        pageId: 'page-1',
        variantId: 'variant-b',
        eventType: 'view',
        eventCount: 20,
      },
      {
        pageId: 'page-1',
        variantId: 'variant-b',
        eventType: 'conversion',
        eventCount: 5,
      },
    ])

    const result = await getPagesByUser('user-1')

    expect(result).toHaveLength(1)
    expect(result[0]?.analytics).toEqual([
      {
        variantId: 'variant-a',
        variantName: 'Control',
        views: 10,
        conversions: 2,
        conversionRate: 20,
      },
      {
        variantId: 'variant-b',
        variantName: 'Challenger',
        views: 20,
        conversions: 5,
        conversionRate: 25,
      },
    ])
  })

  it('falls back to the variant id when the current document no longer has that variant', async () => {
    mockPageRows([
      {
        id: 'page-1',
        name: 'Acme',
        slug: 'acme',
        status: 'published',
        document: {
          activeVariantId: 'variant-a',
          variants: [
            {
              id: 'variant-a',
              name: 'Control',
              trafficWeight: 100,
              sections: [],
            },
          ],
        },
        createdAt: new Date('2026-03-30T14:00:00.000Z'),
        updatedAt: new Date('2026-03-30T14:30:00.000Z'),
      },
    ])
    mockAnalyticsRows([
      {
        pageId: 'page-1',
        variantId: 'variant-z',
        eventType: 'view',
        eventCount: 4,
      },
    ])

    const result = await getPagesByUser('user-1')

    expect(result[0]?.analytics).toEqual([
      {
        variantId: 'variant-z',
        variantName: 'variant-z',
        views: 4,
        conversions: 0,
        conversionRate: 0,
      },
    ])
  })
})
