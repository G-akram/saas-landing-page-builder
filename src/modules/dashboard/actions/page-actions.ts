'use server'

import { revalidatePath } from 'next/cache'
import { and, eq, like } from 'drizzle-orm'

import { auth } from '@/shared/lib/auth'
import { createDefaultDocument } from '@/shared/lib/default-document'
import { createRateLimiter } from '@/shared/lib/rate-limiter'
import { logger } from '@/shared/lib/logger'
import { db, pages } from '@/shared/db'

const createLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 })
const deleteLimiter = createRateLimiter({ maxRequests: 10, windowMs: 60_000 })

const SLUG_MAX_LENGTH = 80

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, SLUG_MAX_LENGTH)
}

async function generateUniqueSlug(baseName: string): Promise<string> {
  const baseSlug = slugify(baseName) || 'untitled'

  const existing = await db
    .select({ slug: pages.slug })
    .from(pages)
    .where(like(pages.slug, `${baseSlug}%`))

  const existingSlugs = new Set(existing.map((p) => p.slug))

  if (!existingSlugs.has(baseSlug)) return baseSlug

  let counter = 2
  while (existingSlugs.has(`${baseSlug}-${String(counter)}`)) {
    counter++
  }
  return `${baseSlug}-${String(counter)}`
}

function isUniqueConstraintError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    err.code === '23505'
  )
}

interface ActionResult {
  error?: string
}

export async function createPage(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  const { isAllowed } = createLimiter.check(session.user.id)
  if (!isAllowed) {
    return { error: 'Too many requests. Please wait a moment.' }
  }

  const name = formData.get('name')
  if (typeof name !== 'string' || name.trim().length === 0) {
    return { error: 'Page name is required' }
  }

  const trimmedName = name.trim()
  if (trimmedName.length > 100) {
    return { error: 'Page name must be 100 characters or less' }
  }

  const document = createDefaultDocument()
  const maxInsertRetries = 3

  for (let attempt = 0; attempt < maxInsertRetries; attempt++) {
    const slug = await generateUniqueSlug(trimmedName)

    try {
      await db.insert(pages).values({
        userId: session.user.id,
        name: trimmedName,
        slug,
        document,
      })

      revalidatePath('/dashboard')
      return {}
    } catch (err) {
      if (isUniqueConstraintError(err) && attempt < maxInsertRetries - 1) {
        continue
      }
      logger.error('Failed to create page', { error: String(err), userId: session.user.id })
      return { error: 'Failed to create page. Please try again.' }
    }
  }

  return { error: 'Failed to create a unique slug. Please try again.' }
}

export async function deletePage(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  const { isAllowed } = deleteLimiter.check(session.user.id)
  if (!isAllowed) {
    return { error: 'Too many requests. Please wait a moment.' }
  }

  const pageId = formData.get('pageId')
  if (typeof pageId !== 'string') {
    return { error: 'Page ID is required' }
  }

  // Ownership check: only delete if page belongs to the user
  const result = await db
    .delete(pages)
    .where(and(eq(pages.id, pageId), eq(pages.userId, session.user.id)))

  if (result.rowCount === 0) {
    return { error: 'Page not found or already deleted' }
  }

  revalidatePath('/dashboard')
  return {}
}
