import { notFound, redirect } from 'next/navigation'

import { getPageById } from '@/modules/dashboard/queries/page-queries'
import { auth } from '@/shared/lib/auth'

import { EditorPageClient } from './editor-page-client'

interface EditorPageProps {
  params: Promise<{ pageId: string }>
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
    <EditorPageClient
      pageId={page.id}
      pageName={page.name}
      pageSlug={page.slug}
      pageStatus={page.status}
      pageUpdatedAt={page.updatedAt.toISOString()}
      document={page.document}
    />
  )
}
