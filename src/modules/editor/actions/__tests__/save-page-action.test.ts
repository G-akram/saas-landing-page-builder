import { beforeEach, describe, expect, it, vi } from 'vitest'

const mocked = vi.hoisted(() => ({
  auth: vi.fn(),
  update: vi.fn(),
  loggerError: vi.fn(),
  pagesTable: {
    id: Symbol('pages.id'),
    userId: Symbol('pages.userId'),
    updatedAt: Symbol('pages.updatedAt'),
  },
}))

vi.mock('@/shared/lib/auth', () => ({
  auth: mocked.auth,
}))

vi.mock('@/shared/db', () => ({
  db: {
    update: mocked.update,
  },
  pages: mocked.pagesTable,
}))

vi.mock('@/shared/lib/logger', () => ({
  logger: {
    error: mocked.loggerError,
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
  },
}))

import { type PageDocument } from '@/shared/types'

import { savePage } from '../save-page-action'

function createValidDocument(): PageDocument {
  return {
    activeVariantId: 'variant-1',
    variants: [
      {
        id: 'variant-1',
        name: 'Default',
        trafficWeight: 100,
        sections: [
          {
            id: 'section-1',
            type: 'hero',
            variantStyleId: 'hero-1',
            layout: {
              type: 'stack',
              gap: 24,
              align: 'center',
              verticalAlign: 'center',
            },
            background: { type: 'color', value: '#ffffff' },
            padding: { top: 80, bottom: 80, left: 24, right: 24 },
            elements: [],
          },
        ],
      },
    ],
  }
}

describe('savePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocked.auth.mockResolvedValue({ user: { id: 'user-1' } })
  })

  it('rejects invalid documents when activeVariantId does not exist in variants', async () => {
    const document = createValidDocument()
    document.activeVariantId = 'missing-variant'

    const result = await savePage('page-1', document)

    expect(result).toEqual({
      success: false,
      error: 'Invalid document structure',
    })
    expect(mocked.update).not.toHaveBeenCalled()
  })

  it('saves valid documents and returns updatedAt timestamp', async () => {
    const returning = vi.fn().mockResolvedValue([
      { updatedAt: new Date('2026-03-28T23:40:00.000Z') },
    ])
    const where = vi.fn().mockReturnValue({ returning })
    const set = vi.fn().mockReturnValue({ where })
    mocked.update.mockReturnValue({ set })

    const result = await savePage('page-1', createValidDocument())

    expect(result).toEqual({
      success: true,
      updatedAt: '2026-03-28T23:40:00.000Z',
    })
    expect(mocked.update).toHaveBeenCalledTimes(1)
  })
})

