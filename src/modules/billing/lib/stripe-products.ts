function requireEnv(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

export function getProMonthlyPriceId(): string {
  return requireEnv('STRIPE_PRO_MONTHLY_PRICE_ID')
}

export function getProAnnualPriceId(): string {
  return requireEnv('STRIPE_PRO_ANNUAL_PRICE_ID')
}

export function getCreditPackPriceId(): string {
  return requireEnv('STRIPE_CREDIT_PACK_PRICE_ID')
}

export type PricingInterval = 'monthly' | 'annual'

export function getPriceId(interval: PricingInterval): string {
  return interval === 'monthly' ? getProMonthlyPriceId() : getProAnnualPriceId()
}
