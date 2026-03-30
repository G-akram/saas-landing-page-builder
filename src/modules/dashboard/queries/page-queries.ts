import { and, desc, eq, sql } from 'drizzle-orm'

import { db, pages, publishedPageEvents } from '@/shared/db'
import { z } from 'zod'

import { type PageDocument, PageDocumentSchema } from '@/shared/types'
import { logger } from '@/shared/lib/logger'

export interface PageVariantAnalyticsSummary {
  variantId: string
  variantName: string
  views: number
  conversions: number
  conversionRate: number
}

interface PageSummary {
  id: string
  name: string
  slug: string
  status: 'draft' | 'published'
  createdAt: Date
  updatedAt: Date
  analytics: PageVariantAnalyticsSummary[]
}

interface PageWithDocument extends PageSummary {
  document: PageDocument
}

export async function getPagesByUser(userId: string): Promise<PageSummary[]> {
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
    .where(eq(pages.userId, userId))
    .orderBy(desc(pages.updatedAt))

  const analyticsRows = await db
    .select({
      pageId: publishedPageEvents.pageId,
      variantId: publishedPageEvents.variantId,
      eventType: publishedPageEvents.eventType,
      eventCount: sql<number>`count(*)`,
    })
    .from(publishedPageEvents)
    .innerJoin(pages, eq(publishedPageEvents.pageId, pages.id))
    .where(eq(pages.userId, userId))
    .groupBy(
      publishedPageEvents.pageId,
      publishedPageEvents.variantId,
      publishedPageEvents.eventType,
    )

  const analyticsByPageId = buildAnalyticsByPageId(pageRows, analyticsRows)

  return pageRows.map((page) => ({
    id: page.id,
    name: page.name,
    slug: page.slug,
    status: page.status,
    createdAt: page.createdAt,
    updatedAt: page.updatedAt,
    analytics: analyticsByPageId.get(page.id) ?? [],
  }))
}

export async function getPageById(pageId: string, userId: string): Promise<PageWithDocument | null> {
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

interface PageSummaryRow {
  id: string
  name: string
  slug: string
  status: 'draft' | 'published'
  document: PageDocument
  createdAt: Date
  updatedAt: Date
}

interface PageAnalyticsRow {
  pageId: string
  variantId: string
  eventType: 'view' | 'conversion'
  eventCount: number
}

function buildAnalyticsByPageId(
  pagesByUser: PageSummaryRow[],
  analyticsRows: PageAnalyticsRow[],
): Map<string, PageVariantAnalyticsSummary[]> {
  const variantNameMaps = new Map(
    pagesByUser.map((page) => [page.id, createVariantNameMap(page.document, page.id)]),
  )
  const analyticsMap = new Map<
    string,
    Map<string, { variantId: string; views: number; conversions: number }>
  >()

  for (const analyticsRow of analyticsRows) {
    const pageAnalytics = ensurePageAnalyticsMap(analyticsMap, analyticsRow.pageId)
    const variantAnalytics = ensureVariantAnalytics(pageAnalytics, analyticsRow.variantId)
    const eventCount = Number(analyticsRow.eventCount)

    if (analyticsRow.eventType === 'view') {
      variantAnalytics.views = eventCount
      continue
    }

    variantAnalytics.conversions = eventCount
  }

  return new Map(
    pagesByUser.map((page) => {
      const variantOrder = variantNameMaps.get(page.id) ?? new Map()
      const pageAnalytics = analyticsMap.get(page.id)

      const summaries = pageAnalytics
        ? Array.from(pageAnalytics.values())
            .map((variantAnalytics) => ({
              variantId: variantAnalytics.variantId,
              variantName:
                variantOrder.get(variantAnalytics.variantId) ?? variantAnalytics.variantId,
              views: variantAnalytics.views,
              conversions: variantAnalytics.conversions,
              conversionRate: calculateConversionRate(
                variantAnalytics.views,
                variantAnalytics.conversions,
              ),
            }))
            .sort((left, right) =>
              compareVariantAnalytics(
                left,
                right,
                Array.from(variantOrder.keys()),
              ),
            )
        : []

      return [page.id, summaries]
    }),
  )
}

function ensurePageAnalyticsMap(
  analyticsMap: Map<string, Map<string, { variantId: string; views: number; conversions: number }>>,
  pageId: string,
): Map<string, { variantId: string; views: number; conversions: number }> {
  const existing = analyticsMap.get(pageId)
  if (existing) {
    return existing
  }

  const created = new Map<string, { variantId: string; views: number; conversions: number }>()
  analyticsMap.set(pageId, created)
  return created
}

function ensureVariantAnalytics(
  pageAnalytics: Map<string, { variantId: string; views: number; conversions: number }>,
  variantId: string,
): { variantId: string; views: number; conversions: number } {
  const existing = pageAnalytics.get(variantId)
  if (existing) {
    return existing
  }

  const created = {
    variantId,
    views: 0,
    conversions: 0,
  }
  pageAnalytics.set(variantId, created)
  return created
}

function createVariantNameMap(
  document: PageDocument,
  pageId: string,
): Map<string, string> {
  const parsed = PageDocumentSchema.safeParse(document)
  if (!parsed.success) {
    logger.warn('Invalid page document while building dashboard analytics labels', {
      pageId,
      errors: z.treeifyError(parsed.error),
    })

    return new Map()
  }

  return new Map(parsed.data.variants.map((variant) => [variant.id, variant.name]))
}

function calculateConversionRate(views: number, conversions: number): number {
  if (views <= 0 || conversions <= 0) {
    return 0
  }

  return Number(((conversions / views) * 100).toFixed(1))
}

function compareVariantAnalytics(
  left: PageVariantAnalyticsSummary,
  right: PageVariantAnalyticsSummary,
  variantOrder: string[],
): number {
  const leftIndex = variantOrder.indexOf(left.variantId)
  const rightIndex = variantOrder.indexOf(right.variantId)

  if (leftIndex !== -1 || rightIndex !== -1) {
    if (leftIndex === -1) {
      return 1
    }

    if (rightIndex === -1) {
      return -1
    }

    return leftIndex - rightIndex
  }

  return left.variantId.localeCompare(right.variantId)
}
