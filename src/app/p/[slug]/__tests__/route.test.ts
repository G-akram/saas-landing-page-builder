import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocked = vi.hoisted(() => ({
  readPublishedPageBySlug: vi.fn(),
  loggerError: vi.fn(),
}))

vi.mock('@/modules/publishing', () => ({
  readPublishedPageBySlug: mocked.readPublishedPageBySlug,
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
    const publishedAt = new Date('2026-03-28T21:00:00.000Z')
    const contentHash = 'a'.repeat(64)

    mocked.readPublishedPageBySlug.mockResolvedValue({
      success: true,
      page: {
        pageId: 'page-1',
        slug: 'acme',
        variantId: 'variant-a',
        storageProvider: 'local',
        storageKey: `pages/page-1/${contentHash}.html`,
        contentHash,
        publishedAt,
        html: '<!DOCTYPE html><html><body><h1>Published</h1></body></html>',
      },
    })

    const response = await GET(
      new Request('https://builder.example.com/p/acme'),
      createRouteContext('acme'),
    )

    expect(response.status).toBe(200)
    expect(response.headers.get('Content-Type')).toBe('text/html; charset=utf-8')
    expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff')
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=0, must-revalidate')
    expect(response.headers.get('ETag')).toBe(`"${contentHash}"`)
    expect(response.headers.get('Last-Modified')).toBe(publishedAt.toUTCString())
    expect(await response.text()).toContain('<h1>Published</h1>')
  })

  it('returns 304 when If-None-Match matches current content hash', async () => {
    const contentHash = 'b'.repeat(64)

    mocked.readPublishedPageBySlug.mockResolvedValue({
      success: true,
      page: {
        pageId: 'page-2',
        slug: 'beta',
        variantId: 'variant-b',
        storageProvider: 'local',
        storageKey: `pages/page-2/${contentHash}.html`,
        contentHash,
        publishedAt: new Date('2026-03-28T21:10:00.000Z'),
        html: '<!DOCTYPE html><html><body><h1>Beta</h1></body></html>',
      },
    })

    const response = await GET(
      new Request('https://builder.example.com/p/beta', {
        headers: { 'if-none-match': `"${contentHash}"` },
      }),
      createRouteContext('beta'),
    )

    expect(response.status).toBe(304)
    expect(response.headers.get('Cache-Control')).toBe('public, max-age=0, must-revalidate')
    expect(response.headers.get('ETag')).toBe(`"${contentHash}"`)
    expect(response.headers.get('Content-Type')).toBeNull()
    expect(await response.text()).toBe('')
  })

  it('returns 404 when slug has no published artifact', async () => {
    mocked.readPublishedPageBySlug.mockResolvedValue({
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
    mocked.readPublishedPageBySlug.mockResolvedValue({
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
    expect(mocked.readPublishedPageBySlug).not.toHaveBeenCalled()
  })
})

