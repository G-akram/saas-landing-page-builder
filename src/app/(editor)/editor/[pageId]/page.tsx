import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { auth } from '@/shared/lib/auth'
import { getPageById } from '@/modules/dashboard/queries/page-queries'

interface EditorPageProps {
  params: Promise<{ pageId: string }>
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function EditorPage({ params }: EditorPageProps): Promise<React.JSX.Element> {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const { pageId } = await params
  const page = await getPageById(pageId, session.user.id)

  if (!page) {
    notFound()
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      {/* Metadata header — survives into Phase 2 as editor top bar */}
      <div className="mb-8 space-y-4">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground text-sm transition-colors">
            ← Back
          </Link>
        </div>

        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold">{page.name}</h1>
            <p className="text-muted-foreground text-sm">/{page.slug}</p>
          </div>
          <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
            {page.status}
          </span>
        </div>

        <div className="text-muted-foreground flex gap-4 text-xs">
          <span>Created {formatDate(page.createdAt)}</span>
          <span>Updated {formatDate(page.updatedAt)}</span>
        </div>
      </div>

      {/* Document JSON — temporary, replaced by editor canvas in Phase 2 */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium">Document</h2>
        <pre className="bg-muted overflow-auto rounded-lg border p-4 text-xs leading-relaxed">
          {JSON.stringify(page.document, null, 2)}
        </pre>
      </div>
    </div>
  )
}
