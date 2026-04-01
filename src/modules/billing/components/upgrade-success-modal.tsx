'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Zap, Globe, BarChart3, GitBranch, X } from 'lucide-react'

interface UpgradeSuccessModalProps {
  isOpen: boolean
}

const PRO_FEATURES = [
  { icon: Globe, label: 'Unlimited published pages', soon: false },
  { icon: BarChart3, label: 'Analytics & visitor insights', soon: false },
  { icon: GitBranch, label: 'A/B testing (up to 4 variants)', soon: false },
  { icon: Zap, label: 'AI-powered block generation', soon: true },
] as const

export function UpgradeSuccessModal({ isOpen }: UpgradeSuccessModalProps): React.JSX.Element | null {
  const router = useRouter()
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Small delay lets the page paint first
      const t = setTimeout(() => setVisible(true), 120)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  function dismiss(): void {
    setVisible(false)
    // Remove the query param so refresh doesn't re-show
    router.replace('/dashboard', { scroll: false })
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center px-4 transition-all duration-300 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={dismiss}
        aria-hidden="true"
      />

      {/* Card */}
      <div
        className={`relative w-full max-w-sm rounded-2xl border border-white/[0.1] bg-[#0d1424] p-8 shadow-2xl transition-all duration-300 ${
          visible ? 'translate-y-0 scale-100' : 'translate-y-4 scale-95'
        }`}
      >
        {/* Glow ring */}
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10" />

        {/* Close */}
        <button
          onClick={dismiss}
          className="absolute right-4 top-4 cursor-pointer rounded-lg p-1 text-white/30 transition-colors hover:text-white/60"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon */}
        <div className="mb-5 flex justify-center">
          <div className="relative flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
            <Sparkles className="h-7 w-7 text-white" />
            <div className="absolute -right-1 -top-1 size-3 rounded-full bg-emerald-400 ring-2 ring-[#0d1424]" />
          </div>
        </div>

        {/* Heading */}
        <div className="mb-1 text-center text-2xl font-bold text-white">
          You&apos;re now on Pro
        </div>
        <p className="mb-6 text-center text-sm text-white/50">
          Your upgrade is confirmed. Here&apos;s what you just unlocked:
        </p>

        {/* Features */}
        <ul className="mb-7 space-y-3">
          {PRO_FEATURES.map(({ icon: Icon, label, soon }) => (
            <li key={label} className="flex items-center gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-indigo-500/15">
                <Icon className="h-3.5 w-3.5 text-indigo-400" />
              </div>
              <span className="text-sm text-white/70">{label}</span>
              {soon && (
                <span className="ml-auto rounded-full bg-amber-500/20 px-2.5 py-1 text-xs font-semibold text-amber-400">
                  Coming soon
                </span>
              )}
            </li>
          ))}
        </ul>

        {/* CTA */}
        <button
          onClick={dismiss}
          className="w-full cursor-pointer rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-opacity hover:opacity-90"
        >
          Start building
        </button>
      </div>
    </div>
  )
}
