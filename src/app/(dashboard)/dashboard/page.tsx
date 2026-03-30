import { redirect } from 'next/navigation'
import Link from 'next/link'

import { auth, signOut } from '@/shared/lib/auth'
import {
  CreatePageDialog,
  EmptyState,
  getPaginatedPagesByUser,
  PageCard,
} from '@/modules/dashboard'
import { Button } from '@/components/ui/button'

interface DashboardPageProps {
  searchParams?: Promise<{
    cursor?: string
  }>
}

export default async function DashboardPage({
  searchParams,
}: DashboardPageProps): Promise<React.JSX.Element> {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const resolvedSearchParams = searchParams ? await searchParams : undefined
  const currentCursor = resolvedSearchParams?.cursor ?? null
  const { pages: userPages, nextCursor } = await getPaginatedPagesByUser(session.user.id, {
    cursor: currentCursor,
  })

  return (
    <div className="mx-auto min-h-screen max-w-4xl px-6 py-10">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-muted-foreground text-sm">{session.user.email}</p>
        </div>
        <div className="flex items-center gap-3">
          <CreatePageDialog />
          <form
            action={async () => {
              'use server'
              await signOut({ redirectTo: '/login' })
            }}
          >
            <Button type="submit" variant="ghost" size="sm">
              Sign out
            </Button>
          </form>
        </div>
      </div>

      {/* Page list */}
      <div className="mt-8">
        {userPages.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2">
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
              <div className="mt-6 flex justify-center">
                <Link href={`/dashboard?cursor=${encodeURIComponent(nextCursor)}`}>
                  <Button variant="outline">Load more pages</Button>
                </Link>
              </div>
            ) : null}
          </>
        )}
      </div>
    </div>
  )
}
