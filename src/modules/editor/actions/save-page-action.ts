'use server'

import { and, eq } from 'drizzle-orm'

import { auth } from '@/shared/lib/auth'
import { db, pages } from '@/shared/db'
import { PageDocumentSchema, type PageDocument } from '@/shared/types'

// ── Types ────────────────────────────────────────────────────────────────────

export interface SavePageResult {
  success: boolean
  error?: string
}

// ── Action ───────────────────────────────────────────────────────────────────

export async function savePage(
  pageId: string,
  document: PageDocument,
): Promise<SavePageResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' }
  }

  // Validate at the server boundary — client types are not a trust boundary
  const parsed = PageDocumentSchema.safeParse(document)
  if (!parsed.success) {
    return { success: false, error: 'Invalid document structure' }
  }

  await db
    .update(pages)
    .set({ document: parsed.data, updatedAt: new Date() })
    .where(and(eq(pages.id, pageId), eq(pages.userId, session.user.id)))

  return { success: true }
}
