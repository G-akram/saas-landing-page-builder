import { eq, and, count } from 'drizzle-orm'

import { db, pages } from '@/shared/db'
import { subscriptions } from '@/shared/db/schema'
import { type SubscriptionStatus, getTierLimits } from '@/shared/lib/tier'

interface TierGateResult {
  allowed: boolean
  reason?: string
}

const ALLOWED: TierGateResult = { allowed: true }

async function getStatus(userId: string): Promise<SubscriptionStatus> {
  const [row] = await db
    .select({ status: subscriptions.status })
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId))
    .limit(1)

  if (!row) return 'free'
  return row.status as SubscriptionStatus
}

export async function checkPageCreationAllowed(userId: string): Promise<TierGateResult> {
  const status = await getStatus(userId)
  const limits = getTierLimits(status)

  if (limits.maxPages === Infinity) return ALLOWED

  const [result] = await db
    .select({ total: count() })
    .from(pages)
    .where(eq(pages.userId, userId))

  const total = result?.total ?? 0
  if (total >= limits.maxPages) {
    return {
      allowed: false,
      reason: `Free plan allows up to ${String(limits.maxPages)} pages. Upgrade to Pro for unlimited pages.`,
    }
  }

  return ALLOWED
}

export async function checkPublishAllowed(userId: string): Promise<TierGateResult> {
  const status = await getStatus(userId)
  const limits = getTierLimits(status)

  if (limits.maxPublished === Infinity) return ALLOWED

  const [result] = await db
    .select({ total: count() })
    .from(pages)
    .where(and(eq(pages.userId, userId), eq(pages.status, 'published')))

  const total = result?.total ?? 0
  if (total >= limits.maxPublished) {
    return {
      allowed: false,
      reason: `Free plan allows up to ${String(limits.maxPublished)} published page. Upgrade to Pro for unlimited publishing.`,
    }
  }

  return ALLOWED
}

export async function checkVariantAllowed(
  userId: string,
  currentVariantCount: number,
): Promise<TierGateResult> {
  const status = await getStatus(userId)
  const limits = getTierLimits(status)

  if (currentVariantCount >= limits.maxVariantsPerPage) {
    return {
      allowed: false,
      reason: `Free plan does not support A/B testing. Upgrade to Pro to create up to ${String(limits.maxVariantsPerPage)} variants.`,
    }
  }

  return ALLOWED
}
