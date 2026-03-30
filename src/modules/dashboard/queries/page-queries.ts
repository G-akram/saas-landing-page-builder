import { and, desc, eq, inArray, lt, or, sql } from 'drizzle-orm'
import { z } from 'zod'

import { db, pages, publishedPageEvents } from '@/shared/db'
import { PageDocumentSchema } from '@/shared/types'
import { logger } from '@/shared/lib/logger'

import { buildAnalyticsByPageId } from './page-analytics'
import { decodePageCursor, encodePageCursor } from './page-pagination'
import {
  type PageAnalyticsRow,
  type PageSummary,
  type PageWithDocument,
  type PaginatedPageSummaries,
} from './page-query-types'

const DEFAULT_PAGE_SIZE = 12
const MAX_PAGE_SIZE = 24

export async function getPagesByUser(userId: string): Promise<PageSummary[]> {
  const result = await getPaginatedPagesByUser(userId, { pageSize: MAX_PAGE_SIZE })
  return result.pages
}

export async function getPaginatedPagesByUser(
  userId: string,
  options: {
    cursor?: string | null
    pageSize?: number
  } = {},
): Promise<PaginatedPageSummaries> {
  const pageSize = normalizePageSize(options.pageSize)
  const decodedCursor = decodePageCursor(options.cursor)
  const cursorDate = decodedCursor ? new Date(decodedCursor.updatedAt) : null

  const pageRows = await db
    .select({
      id: pages.id,
      name: pages.name,
      slug: pages.slug,
      status: pages.status,
      document: pages.document,
      createdAt: pages.createdAt,
      updatedAt: pages.updatedAt,
    })
    .from(pages)
    .where(
      decodedCursor && cursorDate
        ? and(
            eq(pages.userId, userId),
            or(
              lt(pages.updatedAt, cursorDate),
              and(eq(pages.updatedAt, cursorDate), lt(pages.id, decodedCursor.id)),
            ),
          )
        : eq(pages.userId, userId),
    )
    .orderBy(desc(pages.updatedAt), desc(pages.id))
    .limit(pageSize + 1)

  const hasNextPage = pageRows.length > pageSize
  const visiblePages = hasNextPage ? pageRows.slice(0, pageSize) : pageRows

  if (visiblePages.length === 0) {
    return {
      pages: [],
      nextCursor: null,
    }
  }

  const analyticsRows = await getAnalyticsRowsByPageIds(visiblePages.map((page) => page.id))
  const analyticsByPageId = buildAnalyticsByPageId(visiblePages, analyticsRows)
  const lastPage = visiblePages[visiblePages.length - 1]

  return {
    pages: visiblePages.map((page) => ({
      id: page.id,
      name: page.name,
      slug: page.slug,
      status: page.status,
      createdAt: page.createdAt,
      updatedAt: page.updatedAt,
      analytics: analyticsByPageId.get(page.id) ?? [],
    })),
    nextCursor: hasNextPage && lastPage ? encodePageCursor(lastPage.updatedAt, lastPage.id) : null,
  }
}

export async function getPageById(
  pageId: string,
  userId: string,
): Promise<PageWithDocument | null> {
  const rows = await db
    .select()
    .from(pages)
    .where(and(eq(pages.id, pageId), eq(pages.userId, userId)))
    .limit(1)

  const row = rows[0]
  if (!row) return null

  const parsed = PageDocumentSchema.safeParse(row.document)
  if (!parsed.success) {
    logger.error('Invalid page document in DB', {
      pageId,
      errors: z.treeifyError(parsed.error),
    })
    return null
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    status: row.status,
    document: parsed.data,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    analytics: [],
  }
}

async function getAnalyticsRowsByPageIds(pageIds: string[]): Promise<PageAnalyticsRow[]> {
  if (pageIds.length === 0) {
    return []
  }

  return db
    .select({
      pageId: publishedPageEvents.pageId,
      variantId: publishedPageEvents.variantId,
      eventType: publishedPageEvents.eventType,
      eventCount: sql<number>`count(*)`,
    })
    .from(publishedPageEvents)
    .where(inArray(publishedPageEvents.pageId, pageIds))
    .groupBy(
      publishedPageEvents.pageId,
      publishedPageEvents.variantId,
      publishedPageEvents.eventType,
    )
}

function normalizePageSize(pageSize: number | undefined): number {
  if (!pageSize || pageSize < 1) {
    return DEFAULT_PAGE_SIZE
  }

  return Math.min(pageSize, MAX_PAGE_SIZE)
}
