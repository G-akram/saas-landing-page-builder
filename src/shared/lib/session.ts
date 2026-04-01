import { cookies } from 'next/headers'

import { db } from '@/shared/db'
import { sessions } from '@/shared/db/schema'

const SESSION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000 // 30 days

const DEV_COOKIE_NAME = 'authjs.session-token'
const PROD_COOKIE_NAME = '__Secure-authjs.session-token'

function getSessionCookieName(): string {
  return process.env.NODE_ENV === 'production' ? PROD_COOKIE_NAME : DEV_COOKIE_NAME
}

interface DatabaseSession {
  sessionToken: string
  expires: Date
}

export async function createDatabaseSession(userId: string): Promise<DatabaseSession> {
  const sessionToken = crypto.randomUUID()
  const expires = new Date(Date.now() + SESSION_MAX_AGE_MS)

  await db.insert(sessions).values({
    sessionToken,
    userId,
    expires,
  })

  return { sessionToken, expires }
}

export async function setSessionCookie(sessionToken: string, expires: Date): Promise<void> {
  const cookieStore = await cookies()
  const isProduction = process.env.NODE_ENV === 'production'

  cookieStore.set(getSessionCookieName(), sessionToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    path: '/',
    expires,
  })
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(getSessionCookieName())
}
