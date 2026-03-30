import { z } from 'zod'

import { logger } from '@/shared/lib/logger'
import { type PageDocument, PageDocumentSchema } from '@/shared/types'

import {
  type PageAnalyticsRow,
  type PageSummaryRow,
  type PageVariantAnalyticsSummary,
} from './page-query-types'

interface VariantAnalyticsRecord {
  variantId: string
  views: number
  conversions: number
}

export function buildAnalyticsByPageId(
  pagesByUser: PageSummaryRow[],
  analyticsRows: PageAnalyticsRow[],
): Map<string, PageVariantAnalyticsSummary[]> {
  const variantNameMaps = new Map(
    pagesByUser.map((page) => [page.id, createVariantNameMap(page.document, page.id)]),
  )
  const analyticsMap = new Map<string, Map<string, VariantAnalyticsRecord>>()

  for (const analyticsRow of analyticsRows) {
    const pageAnalytics = ensurePageAnalyticsMap(analyticsMap, analyticsRow.pageId)
    const variantAnalytics = ensureVariantAnalytics(pageAnalytics, analyticsRow.variantId)
    const eventCount = analyticsRow.eventCount

    if (analyticsRow.eventType === 'view') {
      variantAnalytics.views = eventCount
      continue
    }

    variantAnalytics.conversions = eventCount
  }

  return new Map(
    pagesByUser.map((page) => {
      const variantOrder = variantNameMaps.get(page.id) ?? new Map<string, string>()
      const orderedVariantIds = Array.from(variantOrder.keys())
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
            .sort((left, right) => compareVariantAnalytics(left, right, orderedVariantIds))
        : []

      return [page.id, summaries] as const
    }),
  )
}

function ensurePageAnalyticsMap(
  analyticsMap: Map<string, Map<string, VariantAnalyticsRecord>>,
  pageId: string,
): Map<string, VariantAnalyticsRecord> {
  const existing = analyticsMap.get(pageId)
  if (existing) {
    return existing
  }

  const created = new Map<string, VariantAnalyticsRecord>()
  analyticsMap.set(pageId, created)
  return created
}

function ensureVariantAnalytics(
  pageAnalytics: Map<string, VariantAnalyticsRecord>,
  variantId: string,
): VariantAnalyticsRecord {
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

function createVariantNameMap(document: PageDocument, pageId: string): Map<string, string> {
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
