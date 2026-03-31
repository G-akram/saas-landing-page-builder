import Link from 'next/link'

export function MarketingFooter(): React.JSX.Element {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t border-white/[0.06] bg-[#030712] px-6 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          {/* Brand */}
          <div className="flex flex-col gap-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
                <svg className="size-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z" />
                </svg>
              </div>
              <span className="text-sm font-semibold text-white">PageForge</span>
            </Link>
            <p className="text-xs text-white/30 max-w-xs">
              Build, publish, and A/B test landing pages — no code required.
            </p>
          </div>

          {/* Nav columns */}
          <div className="flex flex-wrap gap-12">
            <FooterColumn
              title="Product"
              links={[
                { label: 'Features', href: '#features' },
                { label: 'How it works', href: '#how-it-works' },
                { label: 'A/B Testing', href: '#ab-testing' },
              ]}
            />
            <FooterColumn
              title="Account"
              links={[
                { label: 'Sign in', href: '/login' },
                { label: 'Dashboard', href: '/dashboard' },
              ]}
            />
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/[0.06] pt-6 text-xs text-white/25 sm:flex-row">
          <span>&copy; {currentYear} PageForge. All rights reserved.</span>
          <span>Built with Next.js, Tailwind CSS, and Drizzle ORM.</span>
        </div>
      </div>
    </footer>
  )
}

interface FooterLink {
  label: string
  href: string
}

interface FooterColumnProps {
  title: string
  links: FooterLink[]
}

function FooterColumn({ title, links }: FooterColumnProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-white/30">{title}</p>
      {links.map(({ label, href }) => (
        <Link key={href} href={href} className="text-sm text-white/50 transition-colors hover:text-white">
          {label}
        </Link>
      ))}
    </div>
  )
}
