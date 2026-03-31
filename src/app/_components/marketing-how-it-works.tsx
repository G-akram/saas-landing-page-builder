export function MarketingHowItWorks(): React.JSX.Element {
  return (
    <section id="how-it-works" className="relative bg-[#030712] py-28 px-6">
      {/* Subtle divider gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="mx-auto max-w-6xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium text-indigo-400 uppercase tracking-wider">
            Simple by design
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            From blank canvas to live page in minutes
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Step
            number="01"
            title="Pick a template"
            description="Start from one of 5 full-page templates — SaaS, Agency, Startup, Minimal, or SaaS Dark. Every section pre-built with real content."
            color="indigo"
          />
          <Step
            number="02"
            title="Customize your blocks"
            description="Click any element to edit text, colors, images, and spacing in the property panel. Switch themes to change the whole look instantly."
            color="violet"
          />
          <Step
            number="03"
            title="Publish and optimize"
            description="Hit publish and share your live URL. Add a second variant, split traffic 50/50, and let the analytics tell you which version wins."
            color="teal"
          />
        </div>

        {/* Connector line (desktop) */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block" />
      </div>
    </section>
  )
}

interface StepProps {
  number: string
  title: string
  description: string
  color: 'indigo' | 'violet' | 'teal'
}

const COLOR_MAP = {
  indigo: {
    number: 'text-indigo-400',
    border: 'border-indigo-500/30',
    bg: 'bg-indigo-500/10',
    dot: 'bg-indigo-400',
    text: 'text-indigo-400',
  },
  violet: {
    number: 'text-violet-400',
    border: 'border-violet-500/30',
    bg: 'bg-violet-500/10',
    dot: 'bg-violet-400',
    text: 'text-violet-400',
  },
  teal: {
    number: 'text-teal-400',
    border: 'border-teal-500/30',
    bg: 'bg-teal-500/10',
    dot: 'bg-teal-400',
    text: 'text-teal-400',
  },
} as const

function Step({ number, title, description, color }: StepProps): React.JSX.Element {
  const c = COLOR_MAP[color]
  return (
    <div className="relative flex flex-col gap-4">
      {/* Step number badge */}
      <div className={`inline-flex w-fit items-center rounded-full border ${c.border} ${c.bg} px-3 py-1`}>
        <span className={`text-xs font-bold font-mono ${c.number}`}>{number}</span>
      </div>

      <h3 className="text-xl font-semibold text-white">{title}</h3>
      <p className="text-sm leading-relaxed text-white/50">{description}</p>

      {/* Step visual */}
      <div className="mt-2 overflow-hidden rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <StepVisual step={number} color={c} />
      </div>
    </div>
  )
}

interface StepVisualColors {
  dot: string
  bg: string
  text: string
}

function StepVisual({ step, color }: { step: string; color: StepVisualColors }): React.JSX.Element {
  if (step === '01') {
    return (
      <div className="grid grid-cols-2 gap-2">
        {['SaaS', 'Agency', 'Startup', 'Minimal'].map((name) => (
          <div key={name} className="flex flex-col gap-1 rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
            <div className={`h-1.5 w-full rounded ${color.dot} opacity-60`} />
            <div className="h-1 w-2/3 rounded bg-white/10" />
            <p className="mt-1 text-[9px] text-white/30">{name}</p>
          </div>
        ))}
      </div>
    )
  }
  if (step === '02') {
    return (
      <div className="flex gap-2">
        <div className="flex flex-1 flex-col gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
          <div className={`h-2 w-full rounded ${color.dot} opacity-60`} />
          <div className="h-1.5 w-4/5 rounded bg-white/15" />
          <div className="h-4 w-14 rounded-md bg-white/20" />
        </div>
        <div className="flex w-20 flex-col gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
          <div className="h-1 w-full rounded bg-white/10" />
          <div className="h-3 w-full rounded bg-white/[0.06]" />
          <div className="h-3 w-full rounded bg-white/[0.06]" />
        </div>
      </div>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
        <div className={`size-2 rounded-full ${color.dot}`} />
        <div className="h-1.5 flex-1 rounded bg-white/10" />
        <div className="text-[9px] text-white/30">Live</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {[['Variant A', '62%'], ['Variant B', '38%']].map(([label, pct]) => (
          <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2">
            <p className="text-[9px] text-white/30">{label}</p>
            <p className={`text-sm font-bold ${color.text}`}>{pct}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
