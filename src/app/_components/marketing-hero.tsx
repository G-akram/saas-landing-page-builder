import Link from 'next/link'

export function MarketingHero(): React.JSX.Element {
  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#030712] px-6 pt-16 text-center">
      {/* Background gradient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-indigo-600/20 blur-[128px]" />
        <div className="absolute top-1/4 -left-32 h-[400px] w-[400px] rounded-full bg-violet-600/15 blur-[96px]" />
        <div className="absolute top-1/3 -right-32 h-[400px] w-[400px] rounded-full bg-indigo-500/10 blur-[96px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        {/* Eyebrow badge */}
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5">
          <span className="size-1.5 rounded-full bg-indigo-400" />
          <span className="text-xs font-medium text-indigo-300 uppercase tracking-wider">
            Drag. Test. Ship.
          </span>
        </div>

        {/* Headline */}
        <h1 className="max-w-3xl text-5xl font-bold leading-[1.1] tracking-tight text-white md:text-6xl lg:text-7xl">
          Build landing pages that{' '}
          <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
            actually convert
          </span>
        </h1>

        {/* Sub-copy */}
        <p className="mt-6 max-w-xl text-lg text-white/60 md:text-xl">
          Drag-and-drop editor, built-in A/B testing, and one-click publishing — everything
          you need to build and optimize landing pages without touching code.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 px-7 py-3.5 text-[15px] font-semibold text-white shadow-xl shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:opacity-90"
          >
            Start building free →
          </Link>
          <Link
            href="#how-it-works"
            className="rounded-xl border border-white/10 bg-white/5 px-7 py-3.5 text-[15px] font-medium text-white/80 backdrop-blur-sm transition-all hover:border-white/20 hover:bg-white/10"
          >
            See how it works
          </Link>
        </div>

        {/* Stat strip */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-white/40">
          <span>No credit card required</span>
          <span className="hidden size-1 rounded-full bg-white/20 sm:block" />
          <span>5 beautiful templates</span>
          <span className="hidden size-1 rounded-full bg-white/20 sm:block" />
          <span>Publish in seconds</span>
        </div>
      </div>

      {/* Browser / editor mockup */}
      <div className="relative z-10 mt-16 w-full max-w-5xl">
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1117] shadow-2xl shadow-black/60">
          {/* Browser chrome */}
          <div className="flex items-center gap-3 border-b border-white/[0.06] bg-[#0d1117] px-4 py-3">
            <div className="flex gap-1.5">
              <div className="size-3 rounded-full bg-red-500/70" />
              <div className="size-3 rounded-full bg-yellow-500/70" />
              <div className="size-3 rounded-full bg-green-500/70" />
            </div>
            <div className="mx-auto flex h-6 items-center rounded-md border border-white/[0.06] bg-white/[0.04] px-3 text-xs text-white/30">
              localhost:3000/editor/my-landing-page
            </div>
          </div>
          {/* Editor layout */}
          <div className="flex h-[340px]">
            <EditorSidebar />
            <EditorCanvas />
            <EditorPropertiesPanel />
          </div>
        </div>
        {/* Glow under mockup */}
        <div className="absolute -bottom-8 left-1/2 h-24 w-2/3 -translate-x-1/2 rounded-full bg-indigo-600/20 blur-3xl" />
      </div>
    </section>
  )
}

function EditorSidebar(): React.JSX.Element {
  const sections = ['Hero', 'Features', 'Pricing', 'CTA']
  return (
    <div className="flex w-44 shrink-0 flex-col gap-1 border-r border-white/[0.06] bg-[#0d1117] p-3">
      <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-widest text-white/30">
        Sections
      </p>
      {sections.map((name, i) => (
        <div
          key={name}
          className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs ${i === 0 ? 'bg-indigo-500/20 text-indigo-300' : 'text-white/40 hover:text-white/60'}`}
        >
          <div className={`size-1.5 rounded-sm ${i === 0 ? 'bg-indigo-400' : 'bg-white/20'}`} />
          {name}
        </div>
      ))}
      <div className="mt-2 flex items-center gap-2 rounded-md border border-dashed border-white/10 px-2 py-1.5 text-xs text-white/25">
        + Add section
      </div>
    </div>
  )
}

function EditorCanvas(): React.JSX.Element {
  return (
    <div className="flex flex-1 flex-col gap-2 overflow-hidden bg-[#111827] p-3">
      {/* Hero block */}
      <div className="rounded-lg p-4" style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
        <div className="mb-1 h-3 w-2/3 rounded bg-white/80" />
        <div className="mb-3 h-2 w-1/2 rounded bg-white/50" />
        <div className="h-6 w-24 rounded-md bg-white/90" />
      </div>
      {/* Features block */}
      <div className="rounded-lg border border-white/[0.06] bg-[#0d1117] p-3">
        <div className="mb-2 h-2 w-1/3 rounded bg-white/20" />
        <div className="grid grid-cols-3 gap-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-md bg-white/[0.04] p-2">
              <div className="mb-1 size-3 rounded bg-indigo-400/60" />
              <div className="h-1.5 w-3/4 rounded bg-white/20" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function EditorPropertiesPanel(): React.JSX.Element {
  return (
    <div className="flex w-48 shrink-0 flex-col gap-3 border-l border-white/[0.06] bg-[#0d1117] p-3">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Style</p>
      {[['Background', 'Gradient'], ['Font', 'Inter'], ['Padding', '80px']].map(([label, value]) => (
        <div key={label}>
          <p className="mb-1 text-[10px] text-white/30">{label}</p>
          <div className="rounded-md border border-white/[0.06] bg-white/[0.04] px-2 py-1 text-xs text-white/50">
            {value}
          </div>
        </div>
      ))}
      <div>
        <p className="mb-1 text-[10px] text-white/30">Color</p>
        <div className="flex gap-1.5">
          {['#6366f1', '#8b5cf6', '#14b8a6', '#f97316'].map((color) => (
            <div key={color} className="size-5 rounded-full ring-1 ring-white/10" style={{ backgroundColor: color }} />
          ))}
        </div>
      </div>
    </div>
  )
}
