'use server'

import { eq } from 'drizzle-orm'

import { db } from '@/shared/db'
import { users, verificationTokens } from '@/shared/db/schema'
import { sendEmail } from '@/shared/lib/email'
import { logger } from '@/shared/lib/logger'
import { generateVerificationToken } from '@/modules/auth/lib/verification-token'

interface ResendEmailResult {
  success: boolean
  error?: string
}

export async function resendEmailAction(email: string): Promise<ResendEmailResult> {
  if (!email || typeof email !== 'string') {
    return { success: false, error: 'Invalid email provided' }
  }

  // Trim and lowercase
  const normalizedEmail = email.trim().toLowerCase()

  // Check if user exists
  const user = await db
    .select({ id: users.id, name: users.name, emailVerified: users.emailVerified })
    .from(users)
    .where(eq(users.email, normalizedEmail))
    .limit(1)

  const userData = user[0]
  if (!userData) {
    // Don't reveal if email exists or not (security)
    logger.warn('Resend email requested for non-existent user', { email: normalizedEmail })
    return { success: true } // Return success to prevent email enumeration
  }

  // If already verified, don't resend
  if (userData.emailVerified) {
    logger.info('Resend email requested for already-verified user', { email: normalizedEmail })
    return { success: true } // Return success but user is already verified
  }

  // Delete old tokens for this email (only one valid token per email)
  await db.delete(verificationTokens).where(eq(verificationTokens.identifier, normalizedEmail))

  // Generate new token
  const { token } = await generateVerificationToken(normalizedEmail)

  // Build verification URL
  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL ?? 'http://localhost:3000'
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(normalizedEmail)}`

  // Send email
  await sendEmail({
    to: normalizedEmail,
    subject: 'Verify your PageForge account',
    html: buildVerificationEmail(userData.name ?? 'there', verifyUrl),
  })

  logger.info('Verification email resent', { email: normalizedEmail })
  return { success: true }
}

function buildVerificationEmail(name: string, verifyUrl: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="font-size: 24px; font-weight: 700; color: #111; margin-bottom: 16px;">
        Verify your email
      </h1>
      <p style="font-size: 16px; color: #444; line-height: 1.5; margin-bottom: 24px;">
        Hi ${name}, click the button below to verify your email address and activate your PageForge account.
      </p>
      <a href="${verifyUrl}" style="display: inline-block; background: #4f46e5; color: #fff; font-size: 14px; font-weight: 600; padding: 12px 24px; border-radius: 8px; text-decoration: none;">
        Verify Email
      </a>
      <p style="font-size: 13px; color: #888; margin-top: 24px; line-height: 1.5;">
        This link expires in 24 hours. If you didn't create an account, you can safely ignore this email.
      </p>
    </div>
  `
}
