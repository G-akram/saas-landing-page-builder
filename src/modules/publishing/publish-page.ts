'use server'

import { revalidatePath } from 'next/cache'
import { and, eq, ne } from 'drizzle-orm'

import { db, pages, publishedPages } from '@/shared/db'
import { auth } from '@/shared/lib/auth'
import { logger } from '@/shared/lib/logger'
import { createRateLimiter } from '@/shared/lib/rate-limiter'
import { type PageDocument } from '@/shared/types'

import { createPublishStorageAdapter } from './storage'
import {
  type PublishErrorCode,
  type PublishErrorResult,
  type PublishInput,
  type PublishResult,
  type RenderPublishErrorCode,
} from './types'
import { renderPublishedPage } from './utils/render-published-page'

const publishLimiter = createRateLimiter({ maxRequests: 6, windowMs: 60_000 })
const DEFAULT_PUBLISH_BASE_URL = 'http://localhost:3000'
const PUBLISH_BASE_URL_ENV_KEYS = [
  'PUBLISH_BASE_URL',
  'NEXT_PUBLIC_APP_URL',
  'AUTH_URL',
  'NEXTAUTH_URL',
] as const

interface PageForPublish {
  id: string
  name: string
  slug: string
  document: PageDocument
}

export async function publishPage(input: PublishInput): Promise<PublishResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return createPublishError('NOT_AUTHENTICATED', 'Not authenticated')
  }

  const { isAllowed } = publishLimiter.check(session.user.id)
  if (!isAllowed) {
    return createPublishError('RATE_LIMITED', 'Too many publish requests. Please wait a moment.')
  }

  const page = await getPageForPublish(input.pageId, session.user.id)
  if (!page) {
    return createPublishError('PAGE_NOT_FOUND', 'Page not found')
  }

  if (page.document.variants.length > 1) {
    return createPublishError('INVALID_DOCUMENT', 'Multi-variant publish is not available yet')
  }

  const liveUrl = buildLiveUrl(page.slug)
  const renderResult = await renderPublishedPage({
    pageId: page.id,
    pageName: page.name,
    slug: page.slug,
    document: page.document,
    liveUrl,
  })

  if (!renderResult.success) {
    return mapRenderError(renderResult.errorCode, renderResult.message)
  }

  const storageAdapter = createPublishStorageAdapter()
  const writeResult = await storageAdapter.writeArtifact({
    pageId: page.id,
    contentHash: renderResult.contentHash,
    html: renderResult.html,
  })

  if (!writeResult.success) {
    logger.warn('Publish storage write failed', {
      pageId: page.id,
      userId: session.user.id,
      errorCode: writeResult.errorCode,
    })

    return createPublishError('STORAGE_WRITE_FAILED', 'Failed to persist published artifact')
  }

  const publishedAt = new Date()

  try {
    // Transitional compatibility: keep one live published row per page until
    // Phase 5 multi-variant publish fan-out is implemented.
    await db
      .delete(publishedPages)
      .where(
        and(
          eq(publishedPages.pageId, page.id),
          ne(publishedPages.variantId, renderResult.variantId),
        ),
      )

    await db
      .insert(publishedPages)
      .values({
        pageId: page.id,
        slug: page.slug,
        variantId: renderResult.variantId,
        storageProvider: writeResult.storageProvider,
        storageKey: writeResult.storageKey,
        contentHash: renderResult.contentHash,
        publishedAt,
      })
      .onConflictDoUpdate({
        target: [publishedPages.pageId, publishedPages.variantId],
        set: {
          slug: page.slug,
          variantId: renderResult.variantId,
          storageProvider: writeResult.storageProvider,
          storageKey: writeResult.storageKey,
          contentHash: renderResult.contentHash,
          publishedAt,
        },
      })

    await db.update(pages).set({ status: 'published' }).where(eq(pages.id, page.id))
  } catch (error) {
    const databaseCode = getDatabaseErrorCode(error)
    if (databaseCode === '23505') {
      return createPublishError(
        'PUBLISH_CONFLICT',
        'Publish conflict detected. Try publishing again.',
      )
    }

    logger.error('Publish persistence failed', {
      pageId: page.id,
      userId: session.user.id,
      error: getReadableErrorMessage(error),
    })

    return createPublishError('UNKNOWN_ERROR', 'Failed to publish page')
  }

  revalidatePath('/dashboard')
  revalidatePath(`/editor/${page.id}`)

  return {
    success: true,
    liveUrl,
    artifact: {
      pageId: page.id,
      slug: page.slug,
      variantId: renderResult.variantId,
      storageProvider: writeResult.storageProvider,
      storageKey: writeResult.storageKey,
      contentHash: renderResult.contentHash,
      publishedAt,
    },
  }
}

async function getPageForPublish(pageId: string, userId: string): Promise<PageForPublish | null> {
  const rows = await db
    .select({
      id: pages.id,
      name: pages.name,
      slug: pages.slug,
      document: pages.document,
    })
    .from(pages)
    .where(and(eq(pages.id, pageId), eq(pages.userId, userId)))
    .limit(1)

  return rows[0] ?? null
}

function mapRenderError(_errorCode: RenderPublishErrorCode, message: string): PublishErrorResult {
  return createPublishError('INVALID_DOCUMENT', message)
}

function createPublishError(errorCode: PublishErrorCode, message: string): PublishErrorResult {
  return {
    success: false,
    errorCode,
    message,
  }
}

function buildLiveUrl(slug: string): string {
  const baseUrl = resolvePublishBaseUrl()
  return new URL(`/p/${slug}`, baseUrl).toString()
}

function resolvePublishBaseUrl(): string {
  for (const envKey of PUBLISH_BASE_URL_ENV_KEYS) {
    const rawValue = process.env[envKey]
    if (!rawValue) {
      continue
    }

    try {
      return normalizeBaseUrl(rawValue)
    } catch {
      logger.warn('Invalid publish base URL env value, falling back', { envKey })
    }
  }

  return DEFAULT_PUBLISH_BASE_URL
}

function normalizeBaseUrl(rawValue: string): string {
  const url = new URL(rawValue)
  return `${url.origin}/`
}

function getDatabaseErrorCode(error: unknown): string | null {
  if (typeof error !== 'object' || error === null) {
    return null
  }

  if (!('code' in error)) {
    return null
  }

  const value = error.code

  return typeof value === 'string' ? value : null
}

function getReadableErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'unknown error'
}
