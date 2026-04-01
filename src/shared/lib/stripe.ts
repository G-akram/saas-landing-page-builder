import Stripe from 'stripe'
import { eq } from 'drizzle-orm'

import { db } from '@/shared/db'
import { subscriptions } from '@/shared/db/schema'
import { logger } from '@/shared/lib/logger'

let stripeInstance: Stripe | null = null

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set')
    }
    stripeInstance = new Stripe(secretKey, { apiVersion: '2026-03-25.dahlia' })
  }
  return stripeInstance
}

export async function getOrCreateStripeCustomer(
  userId: string,
  email: string,
): Promise<string> {
  // Check for existing subscription row with a Stripe customer
  const [existing] = await db
    .select({ stripeCustomerId: subscriptions.stripeCustomerId })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1)

  if (existing) {
    return existing.stripeCustomerId
  }

  // Create a new Stripe customer
  const stripe = getStripe()
  const customer = await stripe.customers.create({
    email,
    metadata: { userId },
  })

  // Insert subscription row in free state
  await db.insert(subscriptions).values({
    userId,
    stripeCustomerId: customer.id,
    status: 'free',
  })

  logger.info('Stripe customer created', { userId, stripeCustomerId: customer.id })

  return customer.id
}
