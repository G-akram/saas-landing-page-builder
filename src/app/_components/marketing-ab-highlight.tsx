export function MarketingAbHighlight(): React.JSX.Element {
  return (
    <section id="ab-testing" className="relative overflow-hidden bg-[#050a14] py-28 px-6">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[500px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600/10 blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">
        <div className="grid items-center gap-16 lg:grid-cols-2">
          {/* Left: copy */}
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-4 py-1.5">
              <span className="size-1.5 rounded-full bg-violet-400" />
              <span className="text-xs font-medium text-violet-300 uppercase tracking-wider">
                Unique differentiator
              </span>
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              A/B testing that actually works — built right in
            </h2>
            <p className="mt-5 text-white/50 leading-relaxed">
              Most page builders make you export and use a separate testing tool. PageForge has it
              built into the editor. Create a variant, adjust the traffic split, and the analytics
              start flowing immediately.
            </p>

            <ul className="mt-8 space-y-4">
              {[
                ['Cookie-based sticky sessions', 'Visitors stay on their assigned variant across refreshes'],
                ['Per-variant conversion tracking', 'Track clicks on your primary goal element automatically'],
                ['One-slider traffic control', 'Go from 50/50 to 100% winner instantly'],
              ].map(([title, desc]) => (
                <li key={title} className="flex gap-3">
                  <div className="mt-0.5 size-5 shrink-0 rounded-full bg-violet-500/20 flex items-center justify-center">
                    <div className="size-1.5 rounded-full bg-violet-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{title}</p>
                    <p className="text-xs text-white/40 mt-0.5">{desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Right: analytics UI mockup */}
          <div className="relative">
            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117] shadow-2xl">
              {/* Panel header */}
              <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
                <p className="text-sm font-semibold text-white">A/B Test — Homepage v2</p>
                <span className="rounded-full bg-green-500/20 px-2.5 py-0.5 text-xs font-medium text-green-400">
                  Live
                </span>
              </div>

              {/* Variant rows */}
              <div className="p-5 space-y-4">
                <VariantRow
                  label="Variant A"
                  subtitle="Original — Blue hero gradient"
                  weight={60}
                  views={1284}
                  conversions={89}
                  rate="6.9%"
                  isWinning={false}
                  color="indigo"
                />
                <VariantRow
                  label="Variant B"
                  subtitle="Test — Violet hero gradient"
                  weight={40}
                  views={856}
                  conversions={72}
                  rate="8.4%"
                  isWinning
                  color="violet"
                />
              </div>

              {/* Traffic slider mockup */}
              <div className="border-t border-white/[0.06] px-5 py-4">
                <p className="mb-2 text-xs text-white/30">Traffic split</p>
                <div className="flex items-center gap-3">
                  <span className="w-8 text-right text-xs font-mono text-white/50">60%</span>
                  <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div className="h-full w-3/5 rounded-full bg-gradient-to-r from-indigo-500 to-violet-500" />
                  </div>
                  <span className="w-8 text-xs font-mono text-white/50">40%</span>
                </div>
              </div>
            </div>

            {/* Glow accent */}
            <div className="absolute -right-8 -bottom-8 size-32 rounded-full bg-violet-500/20 blur-3xl" />
          </div>
        </div>
      </div>
    </section>
  )
}

interface VariantRowProps {
  label: string
  subtitle: string
  weight: number
  views: number
  conversions: number
  rate: string
  isWinning: boolean
  color: 'indigo' | 'violet'
}

function VariantRow({ label, subtitle, weight, views, conversions, rate, isWinning, color }: VariantRowProps): React.JSX.Element {
  const dotColor = color === 'indigo' ? 'bg-indigo-400' : 'bg-violet-400'
  const rateColor = color === 'indigo' ? 'text-indigo-400' : 'text-violet-400'

  return (
    <div className={`rounded-xl border p-4 ${isWinning ? 'border-violet-500/30 bg-violet-500/[0.06]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`size-2 rounded-full ${dotColor}`} />
          <div>
            <p className="text-sm font-medium text-white">{label}</p>
            <p className="text-xs text-white/35">{subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isWinning && (
            <span className="rounded-full bg-violet-500/20 px-2 py-0.5 text-[10px] font-semibold text-violet-300">
              Winning
            </span>
          )}
          <span className="text-xs text-white/30">{weight}% traffic</span>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-3 text-center">
        <StatCell label="Views" value={views.toLocaleString()} />
        <StatCell label="Conversions" value={conversions.toString()} />
        <StatCell label="Rate" value={rate} highlight={isWinning} rateColor={rateColor} />
      </div>
    </div>
  )
}

interface StatCellProps {
  label: string
  value: string
  highlight?: boolean
  rateColor?: string
}

function StatCell({ label, value, highlight = false, rateColor = 'text-white' }: StatCellProps): React.JSX.Element {
  return (
    <div>
      <p className="text-[10px] text-white/30 mb-0.5">{label}</p>
      <p className={`text-sm font-semibold ${highlight ? rateColor : 'text-white'}`}>{value}</p>
    </div>
  )
}
