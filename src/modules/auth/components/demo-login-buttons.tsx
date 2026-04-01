'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { loginAction } from '@/modules/auth/actions/login-action'

const DEMO_USERS = [
  {
    label: 'Free account',
    email: 'demo@pageforge.com',
    password: 'Demo1234!',
    description: 'Explore the editor with free-tier limits',
  },
  {
    label: 'Pro account',
    email: 'pro@pageforge.com',
    password: 'Pro1234!',
    description: 'Full access — all templates, A/B testing, no limits',
  },
] as const

export function DemoLoginButtons(): React.JSX.Element {
  const router = useRouter()
  const [pendingIndex, setPendingIndex] = useState<number | null>(null)

  async function handleDemoLogin(index: number, email: string, password: string): Promise<void> {
    setPendingIndex(index)
    try {
      const formData = new FormData()
      formData.set('email', email)
      formData.set('password', password)
      const result = await loginAction(formData)
      if (result.success && result.redirectTo) {
        router.push(result.redirectTo)
      }
    } finally {
      setPendingIndex(null)
    }
  }

  return (
    <div className="mb-6 rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
      <p className="mb-3 text-center text-xs font-medium uppercase tracking-wider text-indigo-400/70">
        Try a demo account
      </p>
      <div className="grid grid-cols-2 gap-2">
        {DEMO_USERS.map((user, i) => (
          <button
            key={user.email}
            type="button"
            disabled={pendingIndex !== null}
            onClick={() => { void handleDemoLogin(i, user.email, user.password) }}
            className="group flex cursor-pointer flex-col items-start rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 text-left transition-colors hover:border-indigo-500/30 hover:bg-indigo-500/10 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-xs font-semibold text-white">
              {pendingIndex === i ? 'Signing in...' : user.label}
            </span>
            <span className="mt-0.5 text-[10px] leading-tight text-white/40">
              {user.description}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
