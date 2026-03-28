import { type NextFetchEvent, NextRequest } from 'next/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocked = vi.hoisted(() => {
  const protectedRouteAuthMiddleware = vi.fn()

  return {
    protectedRouteAuthMiddleware,
    auth: vi.fn(() => protectedRouteAuthMiddleware),
    resolvePublishedSubdomainSlug: vi.fn(),
  }
})

vi.mock('@/shared/lib/auth', () => ({
  auth: mocked.auth,
}))

vi.mock('@/modules/publishing/routing', () => ({
  resolvePublishedSubdomainSlug: mocked.resolvePublishedSubdomainSlug,
}))

import middleware, { config } from './middleware'

function createRequest(url: string, hostHeader: string): NextRequest {
  return new NextRequest(url, {
    headers: {
      host: hostHeader,
    },
  })
}

function createFetchEvent(): NextFetchEvent {
  return {
    waitUntil: vi.fn(),
    passThroughOnException: vi.fn(),
  } as unknown as NextFetchEvent
}

describe('middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocked.resolvePublishedSubdomainSlug.mockReturnValue(null)
  })

  it('rewrites matching subdomain root request to /p/[slug]', async () => {
    process.env.PUBLISH_ROOT_DOMAIN = 'app.com'
    mocked.resolvePublishedSubdomainSlug.mockReturnValue('acme')

    const response = await middleware(
      createRequest('https://acme.app.com/?preview=1', 'acme.app.com'),
      createFetchEvent(),
    )

    expect(mocked.resolvePublishedSubdomainSlug).toHaveBeenCalledWith({
      hostHeader: 'acme.app.com',
      rootDomain: 'app.com',
    })
    expect(response.headers.get('x-middleware-rewrite')).toBe('https://acme.app.com/p/acme?preview=1')
    expect(mocked.protectedRouteAuthMiddleware).not.toHaveBeenCalled()
  })

  it('delegates protected routes to auth middleware', async () => {
    mocked.protectedRouteAuthMiddleware.mockResolvedValue(
      new Response(null, {
        status: 307,
        headers: {
          location: '/login',
        },
      }),
    )

    const response = await middleware(
      createRequest('https://app.com/dashboard', 'app.com'),
      createFetchEvent(),
    )

    expect(mocked.protectedRouteAuthMiddleware).toHaveBeenCalledTimes(1)
    expect(response.headers.get('location')).toBe('/login')
  })

  it('returns next response when request is not rewritten or protected', async () => {
    const response = await middleware(
      createRequest('https://app.com/', 'app.com'),
      createFetchEvent(),
    )

    expect(mocked.protectedRouteAuthMiddleware).not.toHaveBeenCalled()
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })

  it('does not attempt subdomain rewrite for non-root pathnames', async () => {
    const response = await middleware(
      createRequest('https://acme.app.com/pricing', 'acme.app.com'),
      createFetchEvent(),
    )

    expect(mocked.resolvePublishedSubdomainSlug).not.toHaveBeenCalled()
    expect(mocked.protectedRouteAuthMiddleware).not.toHaveBeenCalled()
    expect(response.headers.get('x-middleware-next')).toBe('1')
  })

  it('keeps matcher scoped to root and protected editor surfaces', () => {
    expect(config).toEqual({
      matcher: ['/', '/dashboard/:path*', '/editor/:path*'],
    })
  })
})
