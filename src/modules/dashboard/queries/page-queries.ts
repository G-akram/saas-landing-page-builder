import { and, desc, eq } from 'drizzle-orm'

import { db, pages } from '@/shared/db'
import { z } from 'zod'

import { type PageDocument, PageDocumentSchema } from '@/shared/types'
import { logger } from '@/shared/lib/logger'

interface PageSummary {
  id: string
  name: string
  slug: string
  status: 'draft' | 'published'
  createdAt: Date
  updatedAt: Date
}

interface PageWithDocument extends PageSummary {
  document: PageDocument
}

export async function getPagesByUser(userId: string): Promise<PageSummary[]> {
  return db
    .select({
      id: pages.id,
      name: pages.name,
      slug: pages.slug,
      status: pages.status,
      createdAt: pages.createdAt,
      updatedAt: pages.updatedAt,
    })
    .from(pages)
    .where(eq(pages.userId, userId))
    .orderBy(desc(pages.updatedAt))
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
  }
}
