import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocked = vi.hoisted(() => ({
  recordPublishedPageConversion: vi.fn(),
  loggerError: vi.fn(),
}))

vi.mock('@/modules/publishing', () => ({
  recordPublishedPageConversion: mocked.recordPublishedPageConversion,
}))

vi.mock('@/shared/lib/logger', () => ({
  logger: {
    error: mocked.loggerError,
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

import { POST } from '../route'

interface RouteContext {
  params: Promise<{ slug: string }>
}

function createRouteContext(slug: string): RouteContext {
  return {
    params: Promise.resolve({ slug }),
  }
}

describe('POST /p/[slug]/conversion', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('records a conversion beacon for a valid request', async () => {
    mocked.recordPublishedPageConversion.mockResolvedValue(undefined)

    const response = await POST(
      new Request('https://builder.example.com/p/acme/conversion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: 'pb-assignment-acme=encoded-cookie',
        },
        body: JSON.stringify({ goalElementId: 'cta-button' }),
      }),
      createRouteContext('acme'),
    )

    expect(response.status).toBe(204)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(mocked.recordPublishedPageConversion).toHaveBeenCalledWith({
      slug: 'acme',
      goalElementId: 'cta-button',
      cookieHeader: 'pb-assignment-acme=encoded-cookie',
    })
  })

  it('returns 404 for an empty slug after trimming', async () => {
    const response = await POST(
      new Request('https://builder.example.com/p/%20/conversion', {
        method: 'POST',
        body: JSON.stringify({ goalElementId: 'cta-button' }),
      }),
      createRouteContext('   '),
    )

    expect(response.status).toBe(404)
    expect(mocked.recordPublishedPageConversion).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid json', async () => {
    const response = await POST(
      new Request('https://builder.example.com/p/acme/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{bad-json',
      }),
      createRouteContext('acme'),
    )

    expect(response.status).toBe(400)
    expect(mocked.recordPublishedPageConversion).not.toHaveBeenCalled()
  })

  it('returns 400 for an invalid payload shape', async () => {
    const response = await POST(
      new Request('https://builder.example.com/p/acme/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalElementId: '' }),
      }),
      createRouteContext('acme'),
    )

    expect(response.status).toBe(400)
    expect(mocked.recordPublishedPageConversion).not.toHaveBeenCalled()
  })

  it('returns 500 when conversion capture throws', async () => {
    mocked.recordPublishedPageConversion.mockRejectedValue(new Error('boom'))

    const response = await POST(
      new Request('https://builder.example.com/p/acme/conversion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalElementId: 'cta-button' }),
      }),
      createRouteContext('acme'),
    )

    expect(response.status).toBe(500)
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(mocked.loggerError).toHaveBeenCalledWith('Published conversion route failed', {
      slug: 'acme',
      error: 'boom',
    })
  })
})
