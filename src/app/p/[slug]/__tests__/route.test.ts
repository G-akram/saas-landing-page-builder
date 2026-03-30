import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocked = vi.hoisted(() => ({
  servePublishedPage: vi.fn(),
  loggerError: vi.fn(),
}))

vi.mock('@/modules/publishing', () => ({
  servePublishedPage: mocked.servePublishedPage,
}))

vi.mock('@/shared/lib/logger', () => ({
  logger: {
    error: mocked.loggerError,
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

import { GET } from '../route'

interface RouteContext {
  params: Promise<{ slug: string }>
}

function createRouteContext(slug: string): RouteContext {
  return {
    params: Promise.resolve({ slug }),
  }
}

describe('GET /p/[slug]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('serves published HTML with strict headers', async () => {
    mocked.servePublishedPage.mockResolvedValue({
      success: true,
      page: {
        pageId: 'page-1',
        slug: 'acme',
        variantId: 'variant-a',
        storageProvider: 'local',
        storageKey: `pages/page-1/${'a'.repeat(64)}.html`,
        contentHash: 'a'.repeat(64),
        trafficWeight: 100,
        primaryGoalElementId: 'cta-button',
        publishedAt: new Date('2026-03-28T21:00:00.000Z'),
        html: '<!DOCTYPE html><html><body><h1>Published</h1></body></html>',
      },
      assignment: {
        assignmentId: 'assignment-1',
        pageId: 'page-1',
        variantId: 'variant-a',
        contentHash: 'a'.repeat(64),
        assignedAt: '2026-03-28T21:00:00.000Z',
      },
      assignmentCookie: {
        name: 'pb-assignment-acme',
        value: 'encoded-cookie',
      },
      isNewAssignment: true,
    })

    const response = await GET(
      new Request('https://builder.example.com/p/acme'),
      createRouteContext('acme'),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8')
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('Cache-Control')).toBe('private, no-store, max-age=0')
    expect(response.headers.get('Set-Cookie')).toContain('pb-assignment-acme=encoded-cookie')
    expect(await response.text()).toContain('<h1>Published</h1>')
  })

  it('does not set a cookie when an existing assignment is reused', async () => {
    mocked.servePublishedPage.mockResolvedValue({
      success: true,
      page: {
        pageId: 'page-2',
        slug: 'beta',
        variantId: 'variant-b',
        storageProvider: 'local',
        storageKey: `pages/page-2/${'b'.repeat(64)}.html`,
        contentHash: 'b'.repeat(64),
        trafficWeight: 50,
        primaryGoalElementId: null,
        publishedAt: new Date('2026-03-28T21:10:00.000Z'),
        html: '<!DOCTYPE html><html><body><h1>Beta</h1></body></html>',
      },
      assignment: {
        assignmentId: 'assignment-existing',
        pageId: 'page-2',
        variantId: 'variant-b',
        contentHash: 'b'.repeat(64),
        assignedAt: '2026-03-28T21:10:00.000Z',
      },
      assignmentCookie: null,
      isNewAssignment: false,
    })

    const response = await GET(
      new Request('https://builder.example.com/p/beta'),
      createRouteContext('beta'),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Set-Cookie')).toBeNull()
  })

  it('returns 404 when slug has no published artifact', async () => {
    mocked.servePublishedPage.mockResolvedValue({
      success: false,
      errorCode: 'NOT_FOUND',
    })

    const response = await GET(
      new Request('https://builder.example.com/p/missing'),
      createRouteContext('missing'),
    )

    expect(response.status).toBe(404)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })

  it('returns 404 when published metadata exists but artifact is unavailable', async () => {
    mocked.servePublishedPage.mockResolvedValue({
      success: false,
      errorCode: 'ARTIFACT_UNAVAILABLE',
    })

    const response = await GET(
      new Request('https://builder.example.com/p/acme'),
      createRouteContext('acme'),
    )

    expect(response.status).toBe(404)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
  })

  it('returns 404 for empty slug after trimming', async () => {
    const response = await GET(
      new Request('https://builder.example.com/p/%20'),
      createRouteContext('   '),
    )

    expect(response.status).toBe(404)
    expect(mocked.servePublishedPage).not.toHaveBeenCalled()
  })
})

