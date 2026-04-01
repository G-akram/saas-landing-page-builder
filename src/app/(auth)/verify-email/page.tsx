'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

import { resendEmailAction } from '@/modules/auth/actions/resend-email-action'

export default function VerifyEmailPage(): React.JSX.Element {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') ?? ''

  const [isResending, setIsResending] = useState(false)
  const [resendMessage, setResendMessage] = useState<{
    type: 'success' | 'error'
    text: string
  } | null>(null)

  const handleResend = async (): Promise<void> => {
    if (!email) {
      setResendMessage({ type: 'error', text: 'Email address not found. Please register again.' })
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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0f1a]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117]/80 p-8 text-center shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="mb-4 flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-indigo-500/10">
              <MailIcon />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="mt-3 text-sm leading-relaxed text-white/40">
            We sent a verification link to your email address. Click the link to activate your
            account and start building.
          </p>

          {email && <p className="mt-2 text-xs break-all text-white/50">{email}</p>}

          {resendMessage && (
            <div
              className={`mt-4 rounded-lg border px-4 py-3 text-sm ${
                resendMessage.type === 'success'
                  ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                  : 'border-red-500/20 bg-red-500/10 text-red-300'
              }`}
            >
              {resendMessage.text}
            </div>
          )}

          <div className="mt-6 space-y-3">
            <button
              onClick={() => { void handleResend() }}
              disabled={isResending}
              className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend verification email'}
            </button>

            <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
              <p className="text-xs text-white/30">
                Didn&apos;t receive the email? Check your spam folder.{' '}
                <Link
                  href="/register"
                  className="text-indigo-400 transition-colors hover:text-indigo-300"
                >
                  Create new account
                </Link>
                .
              </p>
            </div>
          </div>

          <Link
            href="/login"
            className="mt-6 inline-block text-sm text-white/40 transition-colors hover:text-white/60"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

function MailIcon(): React.JSX.Element {
  return (
    <svg
      className="size-7 text-indigo-400"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
      />
    </svg>
  )
}
