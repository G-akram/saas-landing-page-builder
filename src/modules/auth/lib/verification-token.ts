import { and, eq, gt } from 'drizzle-orm'

import { db } from '@/shared/db'
import { verificationTokens } from '@/shared/db/schema'

const TOKEN_EXPIRY_MS = 24 * 60 * 60 * 1000 // 24 hours

interface VerificationToken {
  token: string
  expires: Date
}

export async function generateVerificationToken(email: string): Promise<VerificationToken> {
  // Delete any existing tokens for this email
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, email))

  const token = crypto.randomUUID()
  const expires = new Date(Date.now() + TOKEN_EXPIRY_MS)

  await db.insert(verificationTokens).values({
    identifier: email,
    token,
    expires,
  })

  return { token, expires }
}

export async function consumeVerificationToken(
  email: string,
  token: string,
): Promise<boolean> {
  const rows = await db
    .delete(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, email),
        eq(verificationTokens.token, token),
        gt(verificationTokens.expires, new Date()),
      ),
    )
    .returning({ identifier: verificationTokens.identifier })

  return rows.length > 0
}
