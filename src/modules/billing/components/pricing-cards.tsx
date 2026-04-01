'use client'

import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/utils'
import { PRO_MONTHLY_PRICE, PRO_ANNUAL_PRICE } from '@/shared/lib/tier'

import { createCheckoutAction } from '../actions/create-checkout-action'
import { type PricingInterval } from '../lib/stripe-products'

const FREE_FEATURES = [
  'Up to 3 pages',
  '1 published page',
  '2 starter templates',
  'Default theme',
  '"Built with PageForge" badge',
] as const

const PRO_FEATURES = [
  'Unlimited pages',
  'Unlimited publishing',
  'All templates & themes',
  'A/B testing (up to 4 variants)',
  'Remove branding badge',
  'Webhook delivery',
  '50 AI credits/month',
] as const

export function PricingCards(): React.JSX.Element {
  const [interval, setInterval] = useState<PricingInterval>('monthly')
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const price = interval === 'monthly' ? PRO_MONTHLY_PRICE : PRO_ANNUAL_PRICE
  const priceLabel = interval === 'monthly' ? '/mo' : '/yr'
  const savings = PRO_MONTHLY_PRICE * 12 - PRO_ANNUAL_PRICE

  function handleUpgrade(): void {
    setError(null)
    startTransition(async () => {
      const result = await createCheckoutAction(interval)
      if (result.success && result.url) {
        window.location.href = result.url
      } else {
        setError(result.error ?? 'Failed to start checkout')
      }
    })
  }

  return (
    <div className="space-y-8">
      {/* Interval toggle */}
      <div className="flex items-center justify-center gap-2">
        <button
          type="button"
          onClick={() => { setInterval('monthly') }}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            interval === 'monthly'
              ? 'bg-white/10 text-white'
              : 'text-white/50 hover:text-white/70',
          )}
        >
          Monthly
        </button>
        <button
          type="button"
          onClick={() => { setInterval('annual') }}
          className={cn(
            'rounded-lg px-4 py-2 text-sm font-medium transition-colors',
            interval === 'annual'
              ? 'bg-white/10 text-white'
              : 'text-white/50 hover:text-white/70',
          )}
        >
          Annual
          <span className="ml-1.5 rounded bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-400">
            Save ${String(savings)}
          </span>
        </button>
      </div>

      {/* Cards */}
      <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-2">
        {/* Free tier */}
        <div className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white">Free</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">$0</span>
              <span className="text-sm text-white/40">/forever</span>
            </div>
            <p className="mt-2 text-sm text-white/50">Get started building pages</p>
          </div>

          <div className="mb-6 h-px bg-white/[0.06]" />

          <ul className="space-y-3">
            {FREE_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-white/60">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-white/30" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <Button
              variant="outline"
              className="w-full border-white/[0.08] bg-white/[0.04] text-white/60"
              disabled
            >
              Current plan
            </Button>
          </div>
        </div>

        {/* Pro tier */}
        <div className="relative rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/[0.08] to-transparent p-6">
          <div className="absolute -top-3 right-6 rounded-full bg-indigo-500 px-3 py-0.5 text-[11px] font-semibold text-white">
            Recommended
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white">Pro</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-3xl font-bold text-white">${String(price)}</span>
              <span className="text-sm text-white/40">{priceLabel}</span>
            </div>
            <p className="mt-2 text-sm text-white/50">Everything you need to ship</p>
          </div>

          <div className="mb-6 h-px bg-white/[0.06]" />

          <ul className="space-y-3">
            {PRO_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-white/80">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-indigo-400" />
                {feature}
              </li>
            ))}
          </ul>

          <div className="mt-6">
            <Button
              onClick={handleUpgrade}
              disabled={isPending}
              className="w-full bg-indigo-600 text-white hover:bg-indigo-500"
            >
              {isPending ? 'Redirecting...' : 'Upgrade to Pro'}
            </Button>
          </div>

          {error && <p className="mt-2 text-center text-xs text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  )
}
