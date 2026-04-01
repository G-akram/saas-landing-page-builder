'use server'

import { eq } from 'drizzle-orm'

import { db } from '@/shared/db'
import { users } from '@/shared/db/schema'
import { auth } from '@/shared/lib/auth'

interface ProfileResult {
  success: boolean
  error?: string
}

export async function updateProfileAction(formData: FormData): Promise<ProfileResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' }
  }

  const name = formData.get('name')
  if (typeof name !== 'string' || name.trim().length === 0) {
    return { success: false, error: 'Name is required' }
  }

  const trimmedName = name.trim()
  if (trimmedName.length > 100) {
    return { success: false, error: 'Name must be 100 characters or less' }
  }

  await db
    .update(users)
    .set({ name: trimmedName })
    .where(eq(users.id, session.user.id))

  return { success: true }
}
