'use server'

import { eq } from 'drizzle-orm'
import { cookies } from 'next/headers'

import { db } from '@/shared/db'
import { users } from '@/shared/db/schema'
import { auth } from '@/shared/lib/auth'
import { logger } from '@/shared/lib/logger'

interface DeleteResult {
  success: boolean
  error?: string
}

export async function deleteAccountAction(formData: FormData): Promise<DeleteResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' }
  }

  const confirmation = formData.get('confirmation')
  if (confirmation !== 'DELETE') {
    return { success: false, error: 'Please type DELETE to confirm' }
  }

  // Cascade deletes handle pages, sessions, accounts, subscriptions, credits
  await db.delete(users).where(eq(users.id, session.user.id))

  // Clear session cookie
  const cookieStore = await cookies()
  cookieStore.delete('authjs.session-token')
  cookieStore.delete('__Secure-authjs.session-token')

  logger.info('Account deleted', { userId: session.user.id })

  return { success: true }
}
