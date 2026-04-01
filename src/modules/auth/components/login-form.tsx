'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import Link from 'next/link'

import { loginAction } from '@/modules/auth/actions/login-action'
import { resendEmailAction } from '@/modules/auth/actions/resend-email-action'

interface LoginFormState {
  success: boolean
  error?: string
  redirectTo?: string
}

const INITIAL_STATE: LoginFormState = { success: false }

export function LoginForm(): React.JSX.Element {
  const router = useRouter()
  const emailInputRef = useRef<HTMLInputElement>(null)

  const [state, formAction, isPending] = useActionState(
    async (_prev: LoginFormState, formData: FormData) => loginAction(formData),
    INITIAL_STATE,
  )

  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const isEmailNotVerifiedError =
    (state.error?.includes('verify your email') ?? false) ||
    (state.error?.includes('verification link') ?? false)

  const handleResendEmail = async (): Promise<void> => {
    const email = emailInputRef.current?.value.trim()
    if (!email) {
      setResendMessage({ type: 'error', text: 'Please enter your email address' })
      return
    }

    setIsResending(true)
    setResendMessage(null)

    try {
      const result = await resendEmailAction(email)
      if (result.success) {
        setResendMessage({ type: 'success', text: 'Verification email sent! Check your inbox.' })
      } else {
        setResendMessage({
          type: 'error',
          text: result.error ?? 'Failed to resend email. Try again.',
        })
      }
    } catch {
      setResendMessage({ type: 'error', text: 'An error occurred. Please try again.' })
    } finally {
      setIsResending(false)
    }
  }

  useEffect(() => {
    if (state.success && state.redirectTo) {
      router.push(state.redirectTo)
    }
  }, [state.success, state.redirectTo, router])

  return (
    <form action={formAction} className="space-y-4">
       {state.error && (
        <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {state.error}
        </div>
      )}

      {resendMessage && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            resendMessage.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
              : 'border-red-500/20 bg-red-500/10 text-red-300'
          }`}
        >
          {resendMessage.text}
        </div>
      )}

      <div>
        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white/60">
          Email
        </label>
        <input
          ref={emailInputRef}
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
          autoComplete="current-password"
          className="w-full rounded-xl border border-white/[0.1] bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/25 transition-colors outline-none focus:border-indigo-500/50 focus:bg-white/[0.07]"
          placeholder="Your password"
        />
      </div>

      {isEmailNotVerifiedError && (
        <button
          type="button"
          onClick={() => { void handleResendEmail() }}
          disabled={isResending}
          className="w-full cursor-pointer rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isResending ? 'Sending...' : 'Resend verification email'}
        </button>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="mt-2 w-full cursor-pointer rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:opacity-90 hover:shadow-indigo-500/40 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isPending ? 'Signing in...' : 'Sign in'}
      </button>

      <p className="text-center text-sm text-white/30">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-indigo-400 transition-colors hover:text-indigo-300">
          Create one
        </Link>
      </p>
    </form>
  )
}
