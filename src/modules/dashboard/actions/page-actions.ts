'use server'

import { revalidatePath } from 'next/cache'
import { and, eq } from 'drizzle-orm'

import { auth } from '@/shared/lib/auth'
import { createDefaultDocument } from '@/shared/lib/default-document'
import { db, pages } from '@/shared/db'

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

async function generateUniqueSlug(baseName: string, userId: string): Promise<string> {
  const baseSlug = slugify(baseName) || 'untitled'

  const userPages = await db
    .select({ slug: pages.slug })
    .from(pages)
    .where(eq(pages.userId, userId))

  const existingSlugs = new Set(userPages.map((p) => p.slug))

  if (!existingSlugs.has(baseSlug)) return baseSlug

  let counter = 2
  while (existingSlugs.has(`${baseSlug}-${String(counter)}`)) {
    counter++
  }
  return `${baseSlug}-${String(counter)}`
}

interface ActionResult {
  error?: string
}

export async function createPage(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name')
  if (typeof name !== 'string' || name.trim().length === 0) {
    return { error: 'Page name is required' }
  }

  const trimmedName = name.trim()
  if (trimmedName.length > 100) {
    return { error: 'Page name must be 100 characters or less' }
  }

  const slug = await generateUniqueSlug(trimmedName, session.user.id)
  const document = createDefaultDocument()

  await db.insert(pages).values({
    userId: session.user.id,
    name: trimmedName,
    slug,
    document,
  })

  revalidatePath('/dashboard')
  return {}
}

export async function deletePage(formData: FormData): Promise<ActionResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { error: 'Not authenticated' }
  }

  const pageId = formData.get('pageId')
  if (typeof pageId !== 'string') {
    return { error: 'Page ID is required' }
  }

  // Ownership check: only delete if page belongs to the user
  await db
    .delete(pages)
    .where(and(eq(pages.id, pageId), eq(pages.userId, session.user.id)))

  revalidatePath('/dashboard')
  return {}
}
