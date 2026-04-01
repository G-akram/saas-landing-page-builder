'use server'

import { eq } from 'drizzle-orm'

import { db } from '@/shared/db'
import { users } from '@/shared/db/schema'
import { logger } from '@/shared/lib/logger'
import { verifyPassword } from '@/shared/lib/password'
import { createDatabaseSession, setSessionCookie } from '@/shared/lib/session'
import { loginSchema } from '@/modules/auth/lib/auth-validation'

interface LoginResult {
  success: boolean
  error?: string
  redirectTo?: string
}

export async function loginAction(formData: FormData): Promise<LoginResult> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return { success: false, error: firstIssue?.message ?? 'Invalid input' }
  }

  const { email, password } = parsed.data

  const [user] = await db
    .select({
      id: users.id,
      passwordHash: users.passwordHash,
      emailVerified: users.emailVerified,
    })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (!user) {
    return { success: false, error: 'Invalid email or password' }
  }

  // OAuth-only user trying credential login
  if (!user.passwordHash) {
    return {
      success: false,
      error:
        'This email is registered via a social account. Use the GitHub or Google button to sign in.',
    }
  }

  const isPasswordValid = await verifyPassword(password, user.passwordHash)
  if (!isPasswordValid) {
    return { success: false, error: 'Invalid email or password' }
  }

  if (!user.emailVerified) {
    return {
      success: false,
      error:
        'Please verify your email before signing in. Check your inbox for the verification link.',
      redirectTo: `/verify-email?email=${encodeURIComponent(email)}`,
    }
  }

  const { sessionToken, expires } = await createDatabaseSession(user.id)
  await setSessionCookie(sessionToken, expires)

  logger.info('User logged in via credentials', { userId: user.id })

  return { success: true, redirectTo: '/dashboard' }
}
