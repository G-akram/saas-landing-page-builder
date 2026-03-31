import Link from 'next/link'

export function MarketingCta(): React.JSX.Element {
  return (
    <section className="relative overflow-hidden bg-[#030712] py-28 px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600/15 blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-3xl text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-5xl">
          Start building something{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            beautiful
          </span>
        </h2>
        <p className="mt-5 text-lg text-white/50">
          No credit card required. Get your first page live in minutes.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-500/30 transition-all hover:shadow-indigo-500/50 hover:opacity-90"
          >
            Start building free →
          </Link>
          <Link
            href="/login"
            className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-white/80 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
          >
            Sign in
          </Link>
        </div>

        {/* Trust signals */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-white/30">
          <TrustSignal icon="shield" label="No lock-in" />
          <TrustSignal icon="bolt" label="Ships in seconds" />
          <TrustSignal icon="chart" label="A/B testing included" />
        </div>
      </div>
    </section>
  )
}

interface TrustSignalProps {
  icon: 'shield' | 'bolt' | 'chart'
  label: string
}

function TrustSignal({ icon, label }: TrustSignalProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-1.5">
      <TrustIcon type={icon} />
      <span>{label}</span>
    </div>
  )
}

function TrustIcon({ type }: { type: 'shield' | 'bolt' | 'chart' }): React.JSX.Element {
  if (type === 'shield') {
    return (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
      </svg>
    )
  }
  if (type === 'bolt') {
    return (
      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
      </svg>
    )
  }
  return (
    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
    </svg>
  )
}
