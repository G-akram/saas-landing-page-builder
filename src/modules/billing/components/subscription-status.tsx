'use client'

import { useTransition, useState } from 'react'
import { CreditCard, ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { type TierName } from '@/shared/lib/tier'

import { createPortalAction } from '../actions/create-portal-action'

interface SubscriptionStatusProps {
  tier: TierName
  periodEnd: string | null
  cancelAtPeriodEnd: boolean
  creditBalance: number
}

export function SubscriptionStatus({
  tier,
  periodEnd,
  cancelAtPeriodEnd,
  creditBalance,
}: SubscriptionStatusProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleManageBilling(): void {
    setError(null)
    startTransition(async () => {
      const result = await createPortalAction()
      if (result.success && result.url) {
        window.location.href = result.url
      } else {
        setError(result.error ?? 'Failed to open billing portal')
      }
    })
  }

  const isPro = tier === 'pro'

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-5">
      <div className="flex items-center gap-2 text-sm text-white/40">
        <CreditCard className="h-4 w-4" />
        <span>Subscription</span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <span className="text-lg font-semibold text-white">{isPro ? 'Pro' : 'Free'}</span>
        <span
          className={
            isPro
              ? 'rounded-full bg-indigo-500/15 px-2 py-0.5 text-[11px] font-medium text-indigo-400'
              : 'rounded-full bg-white/[0.06] px-2 py-0.5 text-[11px] font-medium text-white/50'
          }
        >
          {isPro ? 'Active' : 'No billing'}
        </span>
      </div>

      {isPro && periodEnd && (
        <p className="mt-2 text-xs text-white/40">
          {cancelAtPeriodEnd
            ? `Cancels on ${periodEnd}`
            : `Renews on ${periodEnd}`}
        </p>
      )}

      {creditBalance > 0 && (
        <p className="mt-2 text-xs text-white/50">
          <span className="font-medium text-white/70">{String(creditBalance)}</span> AI credits remaining
        </p>
      )}

      {isPro && (
        <div className="mt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleManageBilling}
            disabled={isPending}
            className="border-white/[0.08] bg-transparent text-white/60 hover:bg-white/[0.05] hover:text-white"
          >
            {isPending ? 'Opening...' : 'Manage billing'}
            <ExternalLink className="ml-1.5 h-3 w-3" />
          </Button>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>
      )}
    </div>
  )
}
