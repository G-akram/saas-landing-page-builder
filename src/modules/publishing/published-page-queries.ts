import { desc, eq } from 'drizzle-orm'

import { db, publishedPages } from '@/shared/db'
import { logger } from '@/shared/lib/logger'

import { createPublishStorageAdapter } from './storage'
import { type PublishStorageProvider } from './types'

export interface PublishedPageMetadata {
  pageId: string
  slug: string
  variantId: string
  storageProvider: PublishStorageProvider
  storageKey: string
  contentHash: string
  publishedAt: Date
}

export interface PublishedPageSnapshot extends PublishedPageMetadata {
  html: string
}

type ReadPublishedPageBySlugErrorCode = 'NOT_FOUND' | 'ARTIFACT_UNAVAILABLE'

interface ReadPublishedPageBySlugErrorResult {
  success: false
  errorCode: ReadPublishedPageBySlugErrorCode
}

interface ReadPublishedPageBySlugSuccessResult {
  success: true
  page: PublishedPageSnapshot
}

export type ReadPublishedPageBySlugResult =
  | ReadPublishedPageBySlugErrorResult
  | ReadPublishedPageBySlugSuccessResult

export async function getPublishedPageMetadataBySlug(
  slug: string,
): Promise<PublishedPageMetadata | null> {
  const rows = await db
    .select({
      pageId: publishedPages.pageId,
      slug: publishedPages.slug,
      variantId: publishedPages.variantId,
      storageProvider: publishedPages.storageProvider,
      storageKey: publishedPages.storageKey,
      contentHash: publishedPages.contentHash,
      publishedAt: publishedPages.publishedAt,
    })
    .from(publishedPages)
    .where(eq(publishedPages.slug, slug))
    .orderBy(desc(publishedPages.publishedAt))
    .limit(1)

  return rows[0] ?? null
}

export async function readPublishedPageBySlug(
  slug: string,
): Promise<ReadPublishedPageBySlugResult> {
  const metadata = await getPublishedPageMetadataBySlug(slug)

  if (!metadata) {
    return { success: false, errorCode: 'NOT_FOUND' }
  }

  try {
    const storageAdapter = createPublishStorageAdapter({
      provider: metadata.storageProvider,
    })
    const artifactResult = await storageAdapter.readArtifact({
      storageKey: metadata.storageKey,
    })

    if (!artifactResult.success) {
      logger.error('Published artifact read failed for slug', {
        slug,
        pageId: metadata.pageId,
        variantId: metadata.variantId,
        storageProvider: metadata.storageProvider,
        storageKey: metadata.storageKey,
        errorCode: artifactResult.errorCode,
      })

      return { success: false, errorCode: 'ARTIFACT_UNAVAILABLE' }
    }

    return {
      success: true,
      page: {
        ...metadata,
        html: artifactResult.html,
      },
    }
  } catch (error) {
    logger.error('Published artifact adapter failed for slug', {
      slug,
      pageId: metadata.pageId,
      variantId: metadata.variantId,
      storageProvider: metadata.storageProvider,
      storageKey: metadata.storageKey,
      error: getReadableErrorMessage(error),
    })

    return { success: false, errorCode: 'ARTIFACT_UNAVAILABLE' }
  }
}

function getReadableErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'unknown error'
}
