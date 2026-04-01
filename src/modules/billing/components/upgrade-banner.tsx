'use client'

import { useTransition, useState } from 'react'
import { Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'

import { createCheckoutAction } from '../actions/create-checkout-action'

export function UpgradeBanner(): React.JSX.Element {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleUpgrade(): void {
    setError(null)
    startTransition(async () => {
      const result = await createCheckoutAction('monthly')
      if (result.success && result.url) {
        window.location.href = result.url
      } else {
        setError(result.error ?? 'Failed to start checkout')
      }
    })
  }

  return (
    <div className="rounded-xl border border-indigo-500/20 bg-gradient-to-r from-indigo-500/[0.08] via-violet-500/[0.06] to-transparent p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-indigo-500/15">
            <Sparkles className="h-4 w-4 text-indigo-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Unlock unlimited pages & publishing</p>
            <p className="text-xs text-white/40">
              Upgrade to Pro for A/B testing, all templates, and more.
            </p>
          </div>
        </div>
        <Button
          onClick={handleUpgrade}
          disabled={isPending}
          size="sm"
          className="bg-indigo-600 text-white hover:bg-indigo-500"
        >
          {isPending ? 'Redirecting...' : 'Upgrade to Pro'}
        </Button>
      </div>
      {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
    </div>
  )
}
