import { servePublishedPage } from '@/modules/publishing'
import { logger } from '@/shared/lib/logger'

const HTML_CONTENT_TYPE = 'text/html; charset=utf-8'
const CACHE_CONTROL_VALUE = 'private, no-store, max-age=0'
const NO_STORE_CACHE_CONTROL_VALUE = 'no-store'
const X_CONTENT_TYPE_OPTIONS_VALUE = 'nosniff'

export const runtime = 'nodejs'

interface PublishedPageRouteContext {
  params: Promise<{ slug: string }>
}

export async function GET(request: Request, context: PublishedPageRouteContext): Promise<Response> {
  const { slug: rawSlug } = await context.params
  const slug = rawSlug.trim()

  if (slug.length === 0) {
    return createNotFoundResponse()
  }

  try {
    const serveResult = await servePublishedPage({
      slug,
      cookieHeader: request.headers.get('cookie'),
    })
    if (!serveResult.success) {
      return createNotFoundResponse()
    }

    const successHeaders = createSuccessHeaders()
    if (serveResult.assignmentCookie) {
      successHeaders.set(
        'Set-Cookie',
        buildAssignmentCookieHeader(
          serveResult.assignmentCookie.name,
          serveResult.assignmentCookie.value,
        ),
      )
    }

    successHeaders.set('Content-Type', HTML_CONTENT_TYPE)
    successHeaders.set('X-Content-Type-Options', X_CONTENT_TYPE_OPTIONS_VALUE)

    return new Response(serveResult.page.html, {
      status: 200,
      headers: successHeaders,
    })
  } catch (error) {
    logger.error('Unexpected error while serving published page', {
      slug,
      error: getReadableErrorMessage(error),
    })

    return new Response('Internal Server Error', { status: 500 })
  }
}

function createSuccessHeaders(): Headers {
  const headers = new Headers()
  headers.set('Cache-Control', CACHE_CONTROL_VALUE)
  return headers
}

function createNotFoundResponse(): Response {
  return new Response('Not Found', {
    status: 404,
    headers: {
      'Cache-Control': NO_STORE_CACHE_CONTROL_VALUE,
    },
  })
}

function buildAssignmentCookieHeader(name: string, value: string): string {
  const segments = [`${name}=${value}`, 'Path=/', 'HttpOnly', 'SameSite=Lax']

  if (process.env.NODE_ENV === 'production') {
    segments.push('Secure')
  }

  return segments.join('; ')
}

function getReadableErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'unknown error'
}
