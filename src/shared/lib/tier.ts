export type SubscriptionStatus = 'free' | 'active' | 'canceled' | 'past_due'

export type TierName = 'free' | 'pro'

export interface TierLimits {
  maxPages: number
  maxPublished: number
  maxVariantsPerPage: number
  hasWebhookDelivery: boolean
  hasBadgeRemoval: boolean
  hasAllTemplates: boolean
  hasAllThemes: boolean
  monthlyAiCredits: number
}

const FREE_TIER_LIMITS: TierLimits = {
  maxPages: 3,
  maxPublished: 1,
  maxVariantsPerPage: 1,
  hasWebhookDelivery: false,
  hasBadgeRemoval: false,
  hasAllTemplates: false,
  hasAllThemes: false,
  monthlyAiCredits: 0,
}

const PRO_TIER_LIMITS: TierLimits = {
  maxPages: Infinity,
  maxPublished: Infinity,
  maxVariantsPerPage: 4,
  hasWebhookDelivery: true,
  hasBadgeRemoval: true,
  hasAllTemplates: true,
  hasAllThemes: true,
  monthlyAiCredits: 50,
}

export function getTierName(status: SubscriptionStatus): TierName {
  return status === 'active' ? 'pro' : 'free'
}

export function getTierLimits(status: SubscriptionStatus): TierLimits {
  return status === 'active' ? PRO_TIER_LIMITS : FREE_TIER_LIMITS
}

export const PRO_MONTHLY_PRICE = 12
export const PRO_ANNUAL_PRICE = 99
export const CREDIT_PACK_PRICE = 5
export const CREDIT_PACK_AMOUNT = 100
