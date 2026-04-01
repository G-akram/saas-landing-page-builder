'use server'

import { eq } from 'drizzle-orm'

import { db } from '@/shared/db'
import { subscriptions } from '@/shared/db/schema'
import { auth } from '@/shared/lib/auth'
import { logger } from '@/shared/lib/logger'
import { getStripe } from '@/shared/lib/stripe'

interface PortalResult {
  success: boolean
  url?: string
  error?: string
}

export async function createPortalAction(): Promise<PortalResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' }
  }

  const { id: userId } = session.user

  const [subscription] = await db
    .select({ stripeCustomerId: subscriptions.stripeCustomerId })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1)

  if (!subscription) {
    return { success: false, error: 'No billing account found' }
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL ?? 'http://localhost:3000'

  const stripe = getStripe()
  const portalSession = await stripe.billingPortal.sessions.create({
    customer: subscription.stripeCustomerId,
    return_url: `${baseUrl}/settings`,
  })

  logger.info('Stripe portal session created', { userId })

  return { success: true, url: portalSession.url }
}
