'use server'

import { auth } from '@/shared/lib/auth'
import { logger } from '@/shared/lib/logger'
import { getStripe, getOrCreateStripeCustomer } from '@/shared/lib/stripe'
import { getPriceId, type PricingInterval } from '@/modules/billing/lib/stripe-products'

interface CheckoutResult {
  success: boolean
  url?: string
  error?: string
}

export async function createCheckoutAction(interval: PricingInterval): Promise<CheckoutResult> {
  const session = await auth()
  if (!session?.user?.id || !session.user.email) {
    return { success: false, error: 'Not authenticated' }
  }

  const { id: userId, email } = session.user
  const customerId = await getOrCreateStripeCustomer(userId, email)
  const priceId = getPriceId(interval)

  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.VERCEL_URL ?? 'http://localhost:3000'

  const stripe = getStripe()
  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${baseUrl}/dashboard?upgraded=true`,
    cancel_url: `${baseUrl}/dashboard`,
    metadata: { userId },
  })

  if (!checkoutSession.url) {
    logger.error('Stripe checkout session created without URL', {
      sessionId: checkoutSession.id,
    })
    return { success: false, error: 'Failed to create checkout session' }
  }

  logger.info('Stripe checkout session created', {
    userId,
    interval,
    sessionId: checkoutSession.id,
  })

  return { success: true, url: checkoutSession.url }
}
