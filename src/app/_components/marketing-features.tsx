export function MarketingFeatures(): React.JSX.Element {
  return (
    <section id="features" className="bg-[#030712] py-28 px-6">
      <div className="mx-auto max-w-6xl">
        {/* Section header */}
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium text-indigo-400 uppercase tracking-wider">
            Everything you need
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            Built for speed, designed to convert
          </h2>
          <p className="mt-4 text-white/50 max-w-xl mx-auto">
            Every feature was chosen to get you from idea to live page as fast as possible.
          </p>
        </div>

        {/* Feature grid */}
        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<EditorIcon />}
            gradient="from-indigo-500/20 to-indigo-500/5"
            iconColor="text-indigo-400"
            title="Drag & Drop Editor"
            description="Section-based canvas with 6 block types, inline text editing, and a right-sidebar property panel. No code, no friction."
            bullets={['Hero, Features, Pricing, Testimonials, CTA, Forms', 'Click to edit text inline', '3–4 visual variants per block']}
          />
          <FeatureCard
            icon={<ABIcon />}
            gradient="from-violet-500/20 to-violet-500/5"
            iconColor="text-violet-400"
            title="Built-in A/B Testing"
            description="Create multiple variants of any page, split traffic with a slider, and see which version drives more conversions."
            bullets={['Cookie-based sticky assignment', 'Per-variant view + conversion tracking', 'Set any variant to 100% to declare a winner']}
          />
          <FeatureCard
            icon={<PublishIcon />}
            gradient="from-teal-500/20 to-teal-500/5"
            iconColor="text-teal-400"
            title="One-Click Publishing"
            description="Hit publish and your page is live on a public URL in seconds. Pure static HTML — fast by default."
            bullets={['Subdomain or custom domain', 'Auto-saved as you edit', 'CDN-ready cache headers']}
          />
        </div>
      </div>
    </section>
  )
}

interface FeatureCardProps {
  icon: React.ReactNode
  gradient: string
  iconColor: string
  title: string
  description: string
  bullets: string[]
}

function FeatureCard({ icon, gradient, iconColor, title, description, bullets }: FeatureCardProps): React.JSX.Element {
  return (
    <div className="group relative rounded-2xl border border-white/[0.08] bg-white/[0.03] p-6 transition-all hover:border-white/[0.15] hover:bg-white/[0.05]">
      {/* Icon */}
      <div className={`mb-5 inline-flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${gradient}`}>
        <span className={iconColor}>{icon}</span>
      </div>

      <h3 className="mb-2 text-lg font-semibold text-white">{title}</h3>
      <p className="mb-4 text-sm leading-relaxed text-white/50">{description}</p>

      <ul className="space-y-2">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2 text-xs text-white/40">
            <span className="mt-1 size-1 shrink-0 rounded-full bg-indigo-400/60" />
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  )
}

function EditorIcon(): React.JSX.Element {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 4.5v15m6-15v15m-10.875 0h15.75c.621 0 1.125-.504 1.125-1.125V5.625c0-.621-.504-1.125-1.125-1.125H4.125C3.504 4.5 3 5.004 3 5.625v12.75c0 .621.504 1.125 1.125 1.125Z" />
    </svg>
  )
}

function ABIcon(): React.JSX.Element {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21 3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
    </svg>
  )
}

function PublishIcon(): React.JSX.Element {
  return (
    <svg className="size-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
    </svg>
  )
}
