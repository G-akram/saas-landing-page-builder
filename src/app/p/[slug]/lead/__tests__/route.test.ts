import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocked = vi.hoisted(() => ({
  capturePublishedLead: vi.fn(),
  loggerError: vi.fn(),
}))

vi.mock('@/modules/publishing', () => ({
  capturePublishedLead: mocked.capturePublishedLead,
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

describe('POST /p/[slug]/lead', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('captures lead data for a valid request', async () => {
    mocked.capturePublishedLead.mockResolvedValue({ success: true, deliveryStatus: 'stored' })

    const response = await POST(
      new Request('https://builder.example.com/p/acme/lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          cookie: 'pb-assignment-acme=encoded-cookie',
        },
        body: JSON.stringify({
          elementId: 'lead-form-1',
          email: 'user@example.com',
          name: 'Jane',
          message: 'Need demo',
        }),
      }),
      createRouteContext('acme'),
    )

    expect(response.status).toBe(204)
    expect(mocked.capturePublishedLead).toHaveBeenCalledWith({
      slug: 'acme',
      elementId: 'lead-form-1',
      email: 'user@example.com',
      name: 'Jane',
      message: 'Need demo',
      cookieHeader: 'pb-assignment-acme=encoded-cookie',
    })
  })

  it('returns 400 when payload shape is invalid', async () => {
    const response = await POST(
      new Request('https://builder.example.com/p/acme/lead', {
        method: 'POST',
        body: JSON.stringify({ email: '' }),
      }),
      createRouteContext('acme'),
    )

    expect(response.status).toBe(400)
    expect(mocked.capturePublishedLead).not.toHaveBeenCalled()
  })

  it('returns 404 when form lookup fails', async () => {
    mocked.capturePublishedLead.mockResolvedValue({
      success: false,
      errorCode: 'FORM_NOT_FOUND',
    })

    const response = await POST(
      new Request('https://builder.example.com/p/acme/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elementId: 'missing', email: 'user@example.com' }),
      }),
      createRouteContext('acme'),
    )

    expect(response.status).toBe(404)
  })

  it('returns 500 when lead capture throws', async () => {
    mocked.capturePublishedLead.mockRejectedValue(new Error('boom'))

    const response = await POST(
      new Request('https://builder.example.com/p/acme/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ elementId: 'lead-form-1', email: 'user@example.com' }),
      }),
      createRouteContext('acme'),
    )

    expect(response.status).toBe(500)
    expect(mocked.loggerError).toHaveBeenCalledWith('Published lead submission route failed', {
      slug: 'acme',
      error: 'boom',
    })
  })
})
