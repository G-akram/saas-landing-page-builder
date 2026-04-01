import { eq } from 'drizzle-orm'
import { redirect } from 'next/navigation'
import type { NextRequest } from 'next/server'

import { db } from '@/shared/db'
import { users } from '@/shared/db/schema'
import { logger } from '@/shared/lib/logger'
import { consumeVerificationToken } from '@/modules/auth/lib/verification-token'

export async function GET(request: NextRequest): Promise<never> {
  const { searchParams } = request.nextUrl
  const token = searchParams.get('token')
  const email = searchParams.get('email')

  if (!token || !email) {
    logger.warn('Verification attempt with missing params', { hasToken: !!token, hasEmail: !!email })
    redirect('/login?error=invalid-link')
  }

  const isValid = await consumeVerificationToken(email, token)

  if (!isValid) {
    logger.warn('Invalid or expired verification token', { email })
    redirect('/login?error=expired-link')
  }

  await db.update(users).set({ emailVerified: new Date() }).where(eq(users.email, email))

  logger.info('Email verified successfully', { email })
  redirect('/login?verified=true')
}
