export const PUBLISH_STORAGE_PROVIDERS = ['local', 'object-storage'] as const
export type PublishStorageProvider = (typeof PUBLISH_STORAGE_PROVIDERS)[number]

export const PUBLISH_ERROR_CODES = [
  'NOT_AUTHENTICATED',
  'PAGE_NOT_FOUND',
  'PAGE_ACCESS_DENIED',
  'INVALID_DOCUMENT',
  'RENDER_FAILED',
  'STORAGE_WRITE_FAILED',
  'PUBLISH_CONFLICT',
  'RATE_LIMITED',
  'TIER_LIMIT',
  'UNKNOWN_ERROR',
] as const
export type PublishErrorCode = (typeof PUBLISH_ERROR_CODES)[number]

export interface PublishInput {
  pageId: string
}

export interface PublishedArtifact {
  pageId: string
  slug: string
  variantId: string
  storageProvider: PublishStorageProvider
  storageKey: string
  contentHash: string
  trafficWeight: number
  primaryGoalElementId: string | null
  publishedAt: Date
}

export interface PublishSuccessResult {
  success: true
  liveUrl: string
  artifacts: PublishedArtifact[]
}

export interface PublishErrorResult {
  success: false
  errorCode: PublishErrorCode
  message: string
}

export type PublishResult = PublishSuccessResult | PublishErrorResult
