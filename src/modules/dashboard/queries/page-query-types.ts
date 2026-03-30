import { type PageDocument } from '@/shared/types'

export interface PageVariantAnalyticsSummary {
  variantId: string
  variantName: string
  views: number
  conversions: number
  conversionRate: number
}

export interface PageSummary {
  id: string
  name: string
  slug: string
  status: 'draft' | 'published'
  createdAt: Date
  updatedAt: Date
  analytics: PageVariantAnalyticsSummary[]
}

export interface PageWithDocument extends PageSummary {
  document: PageDocument
}

export interface PageSummaryRow {
  id: string
  name: string
  slug: string
  status: 'draft' | 'published'
  document: PageDocument
  createdAt: Date
  updatedAt: Date
}

export interface PageAnalyticsRow {
  pageId: string
  variantId: string
  eventType: 'view' | 'conversion'
  eventCount: number
}

export interface PaginatedPageSummaries {
  pages: PageSummary[]
  nextCursor: string | null
}
