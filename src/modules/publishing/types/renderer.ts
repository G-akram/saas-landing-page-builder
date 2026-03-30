import { type Section, type PageDocument } from '@/shared/types'

export const RENDER_PUBLISH_ERROR_CODES = ['INVALID_DOCUMENT', 'VARIANT_NOT_FOUND'] as const

export type RenderPublishErrorCode = (typeof RENDER_PUBLISH_ERROR_CODES)[number]

export interface PageSEOInput {
  title?: string
  description?: string
  ogImage?: string
}

export interface RenderPublishedPageInput {
  pageId: string
  pageName: string
  slug: string
  variantId: string
  document: PageDocument
  seo?: PageSEOInput
  liveUrl?: string
}

export interface PublishedSeoMetadata {
  title: string
  description: string
  canonicalUrl: string | null
  ogImage: string | null
}

export interface RenderPublishedPageSuccess {
  success: true
  html: string
  contentHash: string
  variantId: string
  metadata: PublishedSeoMetadata
}

export interface RenderPublishedPageError {
  success: false
  errorCode: RenderPublishErrorCode
  message: string
}

export type RenderPublishedPageResult = RenderPublishedPageSuccess | RenderPublishedPageError

export interface BuildSeoMetadataInput {
  pageName: string
  slug: string
  liveUrl?: string
  seo?: PageSEOInput
  sections: Section[]
}
