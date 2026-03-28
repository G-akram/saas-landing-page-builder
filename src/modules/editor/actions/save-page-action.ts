'use server'

import { and, eq } from 'drizzle-orm'

import { auth } from '@/shared/lib/auth'
import { db, pages } from '@/shared/db'
import { createRateLimiter } from '@/shared/lib/rate-limiter'
import { PageDocumentSchema, type PageDocument } from '@/shared/types'

const saveLimiter = createRateLimiter({ maxRequests: 20, windowMs: 60_000 })

// ── Types ────────────────────────────────────────────────────────────────────

export interface SavePageResult {
  success: boolean
  error?: string
  updatedAt?: string
}

// ── Action ───────────────────────────────────────────────────────────────────

export async function savePage(
  pageId: string,
  document: PageDocument,
  expectedUpdatedAt?: string,
): Promise<SavePageResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' }
  }

  const { isAllowed } = saveLimiter.check(session.user.id)
  if (!isAllowed) {
    return { success: false, error: 'Too many save requests. Please wait a moment.' }
  }

  // Validate at the server boundary — client types are not a trust boundary
  const parsed = PageDocumentSchema.safeParse(document)
  if (!parsed.success) {
    return { success: false, error: 'Invalid document structure' }
  }

  let expectedUpdatedAtDate: Date | null = null
  if (expectedUpdatedAt !== undefined) {
    expectedUpdatedAtDate = new Date(expectedUpdatedAt)
    if (Number.isNaN(expectedUpdatedAtDate.getTime())) {
      return { success: false, error: 'Invalid page version' }
    }
  }

  const whereClause = expectedUpdatedAtDate
    ? and(
      eq(pages.id, pageId),
      eq(pages.userId, session.user.id),
      eq(pages.updatedAt, expectedUpdatedAtDate),
    )
    : and(eq(pages.id, pageId), eq(pages.userId, session.user.id))

  const updatedRows = await db
    .update(pages)
    .set({ document: parsed.data, updatedAt: new Date() })
    .where(whereClause)
    .returning({ updatedAt: pages.updatedAt })

  const updatedRow = updatedRows[0]
  if (!updatedRow) {
    return expectedUpdatedAtDate
      ? { success: false, error: 'Save conflict: page changed in another session. Refresh and try again.' }
      : { success: false, error: 'Page not found or access denied' }
  }

  return { success: true, updatedAt: updatedRow.updatedAt.toISOString() }
}
