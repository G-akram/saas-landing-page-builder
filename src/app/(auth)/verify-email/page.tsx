import Link from 'next/link'

export default function VerifyEmailPage(): React.JSX.Element {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#0a0f1a]">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-600/10 blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0d1117]/80 p-8 shadow-2xl shadow-black/50 backdrop-blur-xl text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex size-14 items-center justify-center rounded-full bg-indigo-500/10">
              <MailIcon />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-white">Check your email</h1>
          <p className="mt-3 text-sm text-white/40 leading-relaxed">
            We sent a verification link to your email address.
            Click the link to activate your account and start building.
          </p>

          <div className="mt-6 rounded-lg border border-white/[0.06] bg-white/[0.03] p-4">
            <p className="text-xs text-white/30">
              Didn&apos;t receive the email? Check your spam folder or{' '}
              <Link
                href="/register"
                className="text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                try again
              </Link>
              .
            </p>
          </div>

          <Link
            href="/login"
            className="mt-6 inline-block text-sm text-white/40 hover:text-white/60 transition-colors"
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
