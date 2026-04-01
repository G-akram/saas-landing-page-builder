'use server'

import { eq } from 'drizzle-orm'

import { db } from '@/shared/db'
import { users } from '@/shared/db/schema'
import { sendEmail } from '@/shared/lib/email'
import { logger } from '@/shared/lib/logger'
import { hashPassword } from '@/shared/lib/password'
import { registerSchema } from '@/modules/auth/lib/auth-validation'
import { generateVerificationToken } from '@/modules/auth/lib/verification-token'

interface RegisterResult {
  success: boolean
  error?: string
}

export async function registerAction(formData: FormData): Promise<RegisterResult> {
  const raw = {
    name: formData.get('name'),
    email: formData.get('email'),
    password: formData.get('password'),
    confirmPassword: formData.get('confirmPassword'),
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]
    return { success: false, error: firstIssue?.message ?? 'Invalid input' }
  }

  const { name, email, password } = parsed.data

  // Check if email already exists
  const existingUser = await db
    .select({ id: users.id, passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.email, email))
    .limit(1)

  if (existingUser.length > 0) {
    const hasPassword = existingUser[0]?.passwordHash !== null
    if (hasPassword) {
      return { success: false, error: 'An account with this email already exists. Try logging in.' }
    }
    // OAuth user — don't reveal provider info, just say email is taken
    return {
      success: false,
      error: 'This email is already registered. Try signing in with your social account.',
    }
  }

  const passwordHash = await hashPassword(password)

  const [newUser] = await db
    .insert(users)
    .values({
      name,
      email,
      passwordHash,
      emailVerified: null,
    })
    .returning({ id: users.id })

  if (!newUser) {
    logger.error('Failed to create user', { email })
    return { success: false, error: 'Failed to create account. Please try again.' }
  }

  const { token } = await generateVerificationToken(email)

  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL ?? 'http://localhost:3000'
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}&email=${encodeURIComponent(email)}`

  await sendEmail({
    to: email,
    subject: 'Verify your PageForge account',
    html: buildVerificationEmail(name, verifyUrl),
  })

  logger.info('User registered, verification email sent', { userId: newUser.id, email })

  return { success: true }
}

function buildVerificationEmail(name: string, verifyUrl: string): string {
  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
      <h1 style="font-size: 24px; font-weight: 700; color: #111; margin-bottom: 16px;">
        Verify your email
      </h1>
      <p style="font-size: 16px; color: #444; line-height: 1.5; margin-bottom: 24px;">
        Hi ${name}, thanks for signing up for PageForge. Click the button below to verify your email address.
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
