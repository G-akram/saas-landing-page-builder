'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

import { registerAction } from '@/modules/auth/actions/register-action'

interface RegisterFormState {
  success: boolean
  error?: string
  email?: string
}

const INITIAL_STATE: RegisterFormState = { success: false }

export function RegisterForm(): React.JSX.Element {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    async (_prev: RegisterFormState, formData: FormData) => registerAction(formData),
    INITIAL_STATE,
  )

  useEffect(() => {
    if (state.success && state.email) {
      router.push(`/verify-email?email=${encodeURIComponent(state.email)}`)
    }
  }, [state.success, state.email, router])

  if (state.success) {
    return (
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
            <MailIcon />
          </div>
        </div>
        <h2 className="text-lg font-semibold text-white">Check your email</h2>
        <p className="mt-2 text-sm text-white/40">
          We sent a verification link to your email address. Click it to activate your account.
        </p>
      </div>
    )
  }

  return (
    <form action={formAction} className="space-y-4">
      {state.error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-white/60">
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="name"
          className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/25 transition-colors outline-none focus:border-indigo-500/50 focus:bg-white/[0.07]"
          placeholder="Your name"
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/60">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/25 transition-colors outline-none focus:border-indigo-500/50 focus:bg-white/[0.07]"
          placeholder="you@example.com"
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-white/60">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/25 transition-colors outline-none focus:border-indigo-500/50 focus:bg-white/[0.07]"
          placeholder="At least 8 characters"
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-white/60">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/25 transition-colors outline-none focus:border-indigo-500/50 focus:bg-white/[0.07]"
          placeholder="Repeat your password"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-full rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-90 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Creating account...' : 'Create account'}
      </button>

      <p className="text-center text-sm text-white/30">
        Already have an account?{' '}
        <Link href="/login" className="text-indigo-400 transition-colors hover:text-indigo-300">
          Sign in
        </Link>
      </p>
    </form>
  )
}

function MailIcon(): React.JSX.Element {
  return (
    <svg
      className="size-6 text-emerald-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  )
}
