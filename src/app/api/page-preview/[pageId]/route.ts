import { auth } from '@/shared/lib/auth'
import { getPageById } from '@/modules/dashboard'
import { renderPublishedPage } from '@/modules/publishing'

export const runtime = 'nodejs'

const MAX_PREVIEW_SECTIONS = 3

interface PagePreviewRouteContext {
  params: Promise<{ pageId: string }>
}

export async function GET(_req: Request, context: PagePreviewRouteContext): Promise<Response> {
  const session = await auth()
  if (!session?.user?.id) {
    return new Response('Unauthorized', { status: 401 })
  }

  const { pageId } = await context.params
  const page = await getPageById(pageId, session.user.id)
  if (!page) {
    return new Response('Not Found', { status: 404 })
  }

  const activeVariant = page.document.variants.find(
    (v) => v.id === page.document.activeVariantId,
  )
  if (!activeVariant) {
    return new Response('Not Found', { status: 404 })
  }

  const previewDocument = {
    ...page.document,
    variants: [
      {
        ...activeVariant,
        sections: activeVariant.sections.slice(0, MAX_PREVIEW_SECTIONS),
      },
    ],
  }

  const result = await renderPublishedPage({
    pageId: page.id,
    pageName: page.name,
    slug: page.slug,
    variantId: activeVariant.id,
    document: previewDocument,
  })

  if (!result.success) {
    return new Response('Render failed', { status: 500 })
  }

  return new Response(result.html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, max-age=60',
      'X-Frame-Options': 'SAMEORIGIN',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
