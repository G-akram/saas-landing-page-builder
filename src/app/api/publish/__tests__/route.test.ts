import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocked = vi.hoisted(() => ({
  publishPage: vi.fn(),
  loggerError: vi.fn(),
}))

vi.mock('@/modules/publishing', () => ({
  publishPage: mocked.publishPage,
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

describe('POST /api/publish', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 400 for invalid JSON payload', async () => {
    const response = await POST(
      new Request('https://builder.example.com/api/publish', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: '{invalid-json',
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Invalid JSON request' })
    expect(mocked.publishPage).not.toHaveBeenCalled()
  })

  it('returns 400 for invalid publish payload', async () => {
    const response = await POST(
      new Request('https://builder.example.com/api/publish', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({}),
      }),
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({ error: 'Invalid publish payload' })
    expect(mocked.publishPage).not.toHaveBeenCalled()
  })

  it('returns publish success payload as 200', async () => {
    mocked.publishPage.mockResolvedValue({
      success: true,
      liveUrl: 'https://builder.example.com/p/acme',
      artifacts: [
        {
          pageId: 'page-1',
          slug: 'acme',
          variantId: 'variant-1',
          storageProvider: 'local',
          storageKey: 'pages/page-1/hash.html',
          contentHash: 'a'.repeat(64),
          publishedAt: new Date('2026-03-28T23:00:00.000Z'),
        },
      ],
    })

    const response = await POST(
      new Request('https://builder.example.com/api/publish', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ pageId: 'page-1' }),
      }),
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      liveUrl: 'https://builder.example.com/p/acme',
    })
    expect(mocked.publishPage).toHaveBeenCalledWith({ pageId: 'page-1' })
  })

  it('maps known publish error codes to expected HTTP status codes', async () => {
    const cases = [
      { errorCode: 'NOT_AUTHENTICATED', status: 401 },
      { errorCode: 'PAGE_ACCESS_DENIED', status: 403 },
      { errorCode: 'PAGE_NOT_FOUND', status: 404 },
      { errorCode: 'RATE_LIMITED', status: 429 },
      { errorCode: 'PUBLISH_CONFLICT', status: 409 },
      { errorCode: 'INVALID_DOCUMENT', status: 422 },
    ] as const

    for (const testCase of cases) {
      mocked.publishPage.mockResolvedValueOnce({
        success: false,
        errorCode: testCase.errorCode,
        message: 'failure',
      })

      const response = await POST(
        new Request('https://builder.example.com/api/publish', {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({ pageId: 'page-1' }),
        }),
      )

      expect(response.status).toBe(testCase.status)
      await expect(response.json()).resolves.toMatchObject({
        success: false,
        errorCode: testCase.errorCode,
      })
    }
  })

  it('maps unknown publish error codes to 500', async () => {
    mocked.publishPage.mockResolvedValue({
      success: false,
      errorCode: 'SOMETHING_NEW',
      message: 'unexpected',
    })

    const response = await POST(
      new Request('https://builder.example.com/api/publish', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ pageId: 'page-1' }),
      }),
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      errorCode: 'SOMETHING_NEW',
    })
  })

  it('returns safe 500 payload when publish action throws', async () => {
    mocked.publishPage.mockRejectedValue(new Error('boom'))

    const response = await POST(
      new Request('https://builder.example.com/api/publish', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({ pageId: 'page-1' }),
      }),
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      success: false,
      errorCode: 'UNKNOWN_ERROR',
      message: 'Publish failed. Try again.',
    })
    expect(mocked.loggerError).toHaveBeenCalledTimes(1)
  })
})

