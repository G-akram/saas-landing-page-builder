import { resolvePublishedSubdomainSlug } from '@/modules/publishing/routing'
import { auth } from '@/shared/lib/auth'
import {
  NextResponse,
  type NextFetchEvent,
  type NextMiddleware,
  type NextRequest,
} from 'next/server'

const ROOT_PATHNAME = '/'
const PUBLISH_ROUTE_PREFIX = '/p'
const PUBLISH_ROOT_DOMAIN_ENV_KEY = 'PUBLISH_ROOT_DOMAIN'
const PROTECTED_ROUTE_PREFIXES = ['/dashboard', '/editor', '/settings']

const protectedRoutePassThrough: NextMiddleware = (_request, _event) => NextResponse.next()

const protectedRouteAuthMiddleware = auth(protectedRoutePassThrough)

export async function middleware(request: NextRequest, event: NextFetchEvent): Promise<Response> {
  const rewriteResponse = createSubdomainRewriteResponse(request)
  if (rewriteResponse) {
    return rewriteResponse
  }

  if (isProtectedRoutePath(request.nextUrl.pathname)) {
    const authResponse = await protectedRouteAuthMiddleware(request, event)
    if (authResponse) {
      return authResponse
    }

    return NextResponse.next()
  }

  return NextResponse.next()
}

export default middleware

export const config = {
  matcher: ['/', '/dashboard/:path*', '/editor/:path*', '/settings/:path*'],
}

function createSubdomainRewriteResponse(request: NextRequest): Response | null {
  if (request.nextUrl.pathname !== ROOT_PATHNAME) {
    return null
  }

  const slug = resolvePublishedSubdomainSlug({
    hostHeader: request.headers.get('host'),
    rootDomain: process.env[PUBLISH_ROOT_DOMAIN_ENV_KEY],
  })

  if (!slug) {
    return null
  }

  const rewriteUrl = request.nextUrl.clone()
  rewriteUrl.pathname = `${PUBLISH_ROUTE_PREFIX}/${slug}`

  return NextResponse.rewrite(rewriteUrl)
}

function isProtectedRoutePath(pathname: string): boolean {
  return PROTECTED_ROUTE_PREFIXES.some((prefix) => {
    return pathname === prefix || pathname.startsWith(`${prefix}/`)
  })
}
