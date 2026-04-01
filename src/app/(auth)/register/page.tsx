import { redirect } from 'next/navigation'
import Link from 'next/link'

import { auth } from '@/shared/lib/auth'
import { OAuthButtons, AuthDivider } from '@/modules/auth/components/oauth-buttons'
import { RegisterForm } from '@/modules/auth/components/register-form'

export default async function RegisterPage(): Promise<React.JSX.Element> {
  const session = await auth()

  if (session?.user) {
    redirect('/dashboard')
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0f1a]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 h-[300px] w-[300px] rounded-full bg-violet-600/8 blur-[80px]" />
      </div>

      {/* Grid texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo */}
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <LogoIcon />
          </div>
          <span className="text-xl font-bold text-white">PageForge</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117]/80 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl">
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-white">Create your account</h1>
            <p className="mt-1.5 text-sm text-white/40">
              Start building stunning landing pages for free
            </p>
          </div>

          <OAuthButtons />

          <AuthDivider label="or sign up with email" />

          <RegisterForm />
        </div>

        <p className="mt-6 text-center text-xs text-white/20">
          By continuing, you agree to our{' '}
          <span className="text-white/40 underline underline-offset-2 cursor-pointer hover:text-white/60">
            Terms of Service
          </span>{' '}
          and{' '}
          <span className="text-white/40 underline underline-offset-2 cursor-pointer hover:text-white/60">
            Privacy Policy
          </span>
        </p>
      </div>
    </div>
  )
}

function LogoIcon(): React.JSX.Element {
  return (
    <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
      />
    </svg>
  )
}
