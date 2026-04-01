import { eq } from 'drizzle-orm'

import { db } from '@/shared/db'
import { creditBalances, subscriptions } from '@/shared/db/schema'
import { type SubscriptionStatus, type TierName, getTierName } from '@/shared/lib/tier'

interface SubscriptionInfo {
  status: SubscriptionStatus
  tier: TierName
  stripeCustomerId: string | null
  stripeSubscriptionId: string | null
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
}

const FREE_SUBSCRIPTION: SubscriptionInfo = {
  status: 'free',
  tier: 'free',
  stripeCustomerId: null,
  stripeSubscriptionId: null,
  currentPeriodEnd: null,
  cancelAtPeriodEnd: false,
}

export async function getSubscription(userId: string): Promise<SubscriptionInfo> {
  const [row] = await db
    .select({
      status: subscriptions.status,
      stripeCustomerId: subscriptions.stripeCustomerId,
      stripeSubscriptionId: subscriptions.stripeSubscriptionId,
      currentPeriodEnd: subscriptions.currentPeriodEnd,
      cancelAtPeriodEnd: subscriptions.cancelAtPeriodEnd,
    })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1)

  if (!row) {
    return FREE_SUBSCRIPTION
  }

  const status = row.status as SubscriptionStatus

  return {
    status,
    tier: getTierName(status),
    stripeCustomerId: row.stripeCustomerId,
    stripeSubscriptionId: row.stripeSubscriptionId,
    currentPeriodEnd: row.currentPeriodEnd,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
  }
}

export async function getUserTier(userId: string): Promise<TierName> {
  const subscription = await getSubscription(userId)
  return subscription.tier
}

export async function getCreditBalance(userId: string): Promise<number> {
  const [row] = await db
    .select({ balance: creditBalances.balance })
    .from(creditBalances)
    .where(eq(creditBalances.userId, userId))
    .limit(1)

  return row?.balance ?? 0
}
