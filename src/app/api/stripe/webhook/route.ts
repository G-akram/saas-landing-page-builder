import type Stripe from 'stripe'
import { eq, sql } from 'drizzle-orm'
import { NextResponse } from 'next/server'

import { db } from '@/shared/db'
import {
  creditBalances,
  creditTransactions,
  stripeEvents,
  subscriptions,
} from '@/shared/db/schema'
import { logger } from '@/shared/lib/logger'
import { getStripe } from '@/shared/lib/stripe'
import { CREDIT_PACK_AMOUNT } from '@/shared/lib/tier'

export async function POST(request: Request): Promise<NextResponse> {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    logger.error('STRIPE_WEBHOOK_SECRET is not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  let event: Stripe.Event
  try {
    const stripe = getStripe()
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
  } catch (err) {
    logger.warn('Webhook signature verification failed', { error: String(err) })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Idempotency check
  const [existing] = await db
    .select({ id: stripeEvents.id })
    .from(stripeEvents)
    .where(eq(stripeEvents.id, event.id))
    .limit(1)

  if (existing) {
    logger.debug('Duplicate webhook event skipped', { eventId: event.id })
    return NextResponse.json({ received: true })
  }

  try {
    await handleEvent(event)
  } catch (err) {
    logger.error('Webhook event processing failed', {
      eventId: event.id,
      eventType: event.type,
      error: String(err),
    })
    return NextResponse.json({ error: 'Processing failed' }, { status: 500 })
  }

  // Mark event as processed
  await db.insert(stripeEvents).values({
    id: event.id,
    eventType: event.type,
  })

  return NextResponse.json({ received: true })
}

async function handleEvent(event: Stripe.Event): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object)
      break
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object)
      break
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object)
      break
    case 'invoice.payment_failed':
      await handlePaymentFailed(event.data.object)
      break
    case 'invoice.paid':
      await handleInvoicePaid(event.data.object)
      break
    default:
      logger.debug('Unhandled webhook event type', { type: event.type })
  }
}

function getSubscriptionPeriod(sub: Stripe.Subscription): {
  start: Date
  end: Date
} {
  const firstItem = sub.items.data[0]
  return {
    start: new Date((firstItem?.current_period_start ?? sub.created) * 1000),
    end: new Date((firstItem?.current_period_end ?? sub.created) * 1000),
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
  const userId = session.metadata?.userId
  if (!userId) {
    logger.warn('Checkout session missing userId metadata', { sessionId: session.id })
    return
  }

  if (session.mode === 'subscription' && session.subscription) {
    const subscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription.id

    const stripe = getStripe()
    const sub = await stripe.subscriptions.retrieve(subscriptionId)
    const period = getSubscriptionPeriod(sub)

    await db
      .update(subscriptions)
      .set({
        stripeSubscriptionId: sub.id,
        stripePriceId: sub.items.data[0]?.price.id ?? null,
        status: 'active',
        currentPeriodStart: period.start,
        currentPeriodEnd: period.end,
        cancelAtPeriodEnd: sub.cancel_at_period_end,
        updatedAt: new Date(),
      })
      .where(eq(subscriptions.userId, userId))

    logger.info('Subscription activated via checkout', { userId, subscriptionId: sub.id })
  }

  if (session.mode === 'payment' && session.metadata?.type === 'credit_pack') {
    const paymentIntentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? null
    await grantCredits(userId, CREDIT_PACK_AMOUNT, 'pack_purchase', paymentIntentId)
    logger.info('Credit pack purchased', { userId, amount: CREDIT_PACK_AMOUNT })
  }
}

async function handleSubscriptionUpdated(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id
  const period = getSubscriptionPeriod(sub)

  await db
    .update(subscriptions)
    .set({
      stripePriceId: sub.items.data[0]?.price.id ?? null,
      status: sub.status === 'active' ? 'active' : 'past_due',
      currentPeriodStart: period.start,
      currentPeriodEnd: period.end,
      cancelAtPeriodEnd: sub.cancel_at_period_end,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeCustomerId, customerId))

  logger.info('Subscription updated', { customerId, status: sub.status })
}

async function handleSubscriptionDeleted(sub: Stripe.Subscription): Promise<void> {
  const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer.id

  await db
    .update(subscriptions)
    .set({
      stripeSubscriptionId: null,
      stripePriceId: null,
      status: 'canceled',
      cancelAtPeriodEnd: false,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.stripeCustomerId, customerId))

  logger.info('Subscription canceled', { customerId })
}

function getInvoiceSubscriptionId(invoice: Stripe.Invoice): string | null {
  if (invoice.parent?.subscription_details?.subscription) {
    const sub = invoice.parent.subscription_details.subscription
    return typeof sub === 'string' ? sub : sub.id
  }
  return null
}

function getInvoiceCustomerId(invoice: Stripe.Invoice): string | null {
  if (!invoice.customer) return null
  return typeof invoice.customer === 'string' ? invoice.customer : invoice.customer.id
}

async function handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
  if (!getInvoiceSubscriptionId(invoice)) return

  const customerId = getInvoiceCustomerId(invoice)
  if (!customerId) return

  await db
    .update(subscriptions)
    .set({ status: 'past_due', updatedAt: new Date() })
    .where(eq(subscriptions.stripeCustomerId, customerId))

  logger.warn('Payment failed, subscription set to past_due', { customerId })
}

async function handleInvoicePaid(invoice: Stripe.Invoice): Promise<void> {
  if (!getInvoiceSubscriptionId(invoice)) return

  // Only grant monthly credits on renewal, not the initial payment
  const isRenewal = invoice.billing_reason === 'subscription_cycle'
  if (!isRenewal) return

  const customerId = getInvoiceCustomerId(invoice)
  if (!customerId) return

  const [sub] = await db
    .select({ userId: subscriptions.userId })
    .from(subscriptions)
    .where(eq(subscriptions.stripeCustomerId, customerId))
    .limit(1)

  if (!sub) return

  const MONTHLY_AI_CREDITS = 50
  await grantCredits(sub.userId, MONTHLY_AI_CREDITS, 'monthly_grant', null)
  logger.info('Monthly AI credits granted on renewal', {
    userId: sub.userId,
    amount: MONTHLY_AI_CREDITS,
  })
}

async function grantCredits(
  userId: string,
  amount: number,
  reason: 'monthly_grant' | 'pack_purchase',
  stripePaymentIntentId: string | null,
): Promise<void> {
  // Upsert credit balance
  await db
    .insert(creditBalances)
    .values({ userId, balance: amount })
    .onConflictDoUpdate({
      target: creditBalances.userId,
      set: {
        balance: sql`${creditBalances.balance} + ${amount}`,
        updatedAt: new Date(),
      },
    })

  // Record transaction
  await db.insert(creditTransactions).values({
    userId,
    amount,
    reason,
    stripePaymentIntentId,
  })
}
