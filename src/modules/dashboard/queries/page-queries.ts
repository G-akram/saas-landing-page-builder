import { desc, eq } from 'drizzle-orm'

import { db, pages } from '@/shared/db'

export async function getPagesByUser(userId: string) {
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
