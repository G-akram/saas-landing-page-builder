import { redirect } from 'next/navigation'
import Link from 'next/link'

import { auth, signOut } from '@/shared/lib/auth'
import {
  CreatePageDialog,
  EmptyState,
  getPaginatedPagesByUser,
  PageCard,
} from '@/modules/dashboard'
import { getUserTier, UpgradeBanner, UpgradeSuccessModal } from '@/modules/billing'

interface DashboardPageProps {
  searchParams?: Promise<{ cursor?: string; upgraded?: string }>
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps): Promise<React.JSX.Element> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const resolvedParams = searchParams ? await searchParams : undefined
  const currentCursor = resolvedParams?.cursor ?? null
  const isUpgraded = resolvedParams?.upgraded === 'true'
  const [{ pages: userPages, nextCursor }, tier] = await Promise.all([
    getPaginatedPagesByUser(session.user.id, { cursor: currentCursor }),
    getUserTier(session.user.id),
  ])

  const isFreeTier = tier === 'free'
  const publishedCount = userPages.filter((p) => p.status === 'published').length

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0f1a]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <DashboardLogoIcon />
            </div>
            <span className="text-sm font-semibold text-white">PageForge</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/settings"
              className="text-sm text-white/40 transition-colors hover:text-white/70"
            >
              Settings
            </Link>
            <span className="hidden text-sm text-white/40 sm:block">{session.user.email}</span>
            <form
              action={async () => {
                'use server'
                await signOut({ redirectTo: '/login' })
              }}
            >
              <button
                type="submit"
                className="rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs text-white/60 transition-all hover:border-white/15 hover:bg-white/[0.08] hover:text-white"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <UpgradeSuccessModal isOpen={isUpgraded} />

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-10">
        {isFreeTier && (
          <div className="mb-6">
            <UpgradeBanner />
          </div>
        )}

        {/* Section header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">My Pages</h1>
            {userPages.length > 0 ? (
              <div className="mt-2 flex items-center gap-3 text-sm text-white/40">
                <span>
                  {userPages.length} {userPages.length === 1 ? 'page' : 'pages'}
                </span>
                <span className="size-1 rounded-full bg-white/20" />
                <span>{publishedCount} published</span>
              </div>
            ) : null}
          </div>
          <CreatePageDialog />
        </div>

        {/* Page grid or empty state */}
        {userPages.length === 0 ? (
          <EmptyState createButton={<CreatePageDialog />} />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {userPages.map((page) => (
                <PageCard
                  key={page.id}
                  id={page.id}
                  name={page.name}
                  slug={page.slug}
                  status={page.status}
                  updatedAt={page.updatedAt}
                  analytics={page.analytics}
                />
              ))}
            </div>

            {nextCursor ? (
              <div className="mt-8 flex justify-center">
                <Link
                  href={`/dashboard?cursor=${encodeURIComponent(nextCursor)}`}
                  className="rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-2.5 text-sm text-white/60 transition-all hover:border-white/15 hover:text-white"
                >
                  Load more pages
                </Link>
              </div>
            ) : null}
          </>
        )}
      </main>
    </div>
  )
}

function DashboardLogoIcon(): React.JSX.Element {
  return (
    <svg
      className="size-3.5 text-white"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 0 1 6 3.75h2.25A2.25 2.25 0 0 1 10.5 6v2.25a2.25 2.25 0 0 1-2.25 2.25H6a2.25 2.25 0 0 1-2.25-2.25V6ZM3.75 15.75A2.25 2.25 0 0 1 6 13.5h2.25a2.25 2.25 0 0 1 2.25 2.25V18a2.25 2.25 0 0 1-2.25 2.25H6A2.25 2.25 0 0 1 3.75 18v-2.25ZM13.5 6a2.25 2.25 0 0 1 2.25-2.25H18A2.25 2.25 0 0 1 20.25 6v2.25A2.25 2.25 0 0 1 18 10.5h-2.25a2.25 2.25 0 0 1-2.25-2.25V6ZM13.5 15.75a2.25 2.25 0 0 1 2.25-2.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-2.25A2.25 2.25 0 0 1 13.5 18v-2.25Z"
      />
    </svg>
  )
}
