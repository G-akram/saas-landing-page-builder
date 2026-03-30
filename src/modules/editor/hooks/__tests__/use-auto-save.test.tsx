/**
 * @vitest-environment jsdom
 */

import React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { type PageDocument } from '@/shared/types'

import { useDocumentStore } from '../../store/document-store'
import { useAutoSave } from '../use-auto-save'

const mocked = vi.hoisted(() => ({
  savePage: vi.fn(),
}))

vi.mock('../../actions/save-page-action', () => ({
  savePage: mocked.savePage,
}))

function createTestDocument(variantId = 'variant-1'): PageDocument {
  return {
    activeVariantId: variantId,
    variants: [
      {
        id: variantId,
        name: 'Default',
        trafficWeight: 100,
        primaryGoal: null,
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

function createQueryClientWrapper(): (props: React.PropsWithChildren) => React.JSX.Element {
  const queryClient = new QueryClient({
    defaultOptions: {
      mutations: {
        retry: false,
      },
      queries: {
        retry: false,
      },
    },
  })

  return function QueryClientWrapper({ children }: React.PropsWithChildren): React.JSX.Element {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mocked.savePage.mockReset()
    mocked.savePage.mockResolvedValue({
      success: true,
      updatedAt: '2026-03-30T12:05:00.000Z',
    })
    useDocumentStore.getState().initializeDocument(createTestDocument())
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
  })

  it('debounces automatic saves until the document has been stable for 2 seconds', async () => {
    renderHook(() => useAutoSave('page-1', '2026-03-30T12:00:00.000Z'), {
      wrapper: createQueryClientWrapper(),
    })

    act(() => {
      useDocumentStore.getState().addSection('variant-1', 'cta')
    })

    act(() => {
      vi.advanceTimersByTime(1999)
    })

    expect(mocked.savePage).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })

    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })

    expect(mocked.savePage).toHaveBeenCalledTimes(1)
    expect(mocked.savePage).toHaveBeenCalledWith(
      'page-1',
      expect.objectContaining({
        activeVariantId: 'variant-1',
      }),
      '2026-03-30T12:00:00.000Z',
    )
  })

  it('exposes manual save only when the document is dirty and saves immediately', async () => {
    const { result } = renderHook(() => useAutoSave('page-1', '2026-03-30T12:00:00.000Z'), {
      wrapper: createQueryClientWrapper(),
    })

    expect(result.current.canManualSave).toBe(false)

    act(() => {
      useDocumentStore.getState().addSection('variant-1', 'features')
    })

    expect(result.current.canManualSave).toBe(true)

    await act(async () => {
      await result.current.triggerManualSave()
    })

    expect(mocked.savePage).toHaveBeenCalledTimes(1)
    expect(useDocumentStore.getState().isDirty).toBe(false)
  })

  it('stays idle and never saves when disabled', () => {
    const { result } = renderHook(
      () =>
        useAutoSave('page-1', '2026-03-30T12:00:00.000Z', {
          enabled: false,
        }),
      { wrapper: createQueryClientWrapper() },
    )

    act(() => {
      useDocumentStore.getState().addSection('variant-1', 'pricing')
      vi.advanceTimersByTime(5000)
    })

    expect(result.current.status).toBe('idle')
    expect(result.current.canManualSave).toBe(false)
    expect(mocked.savePage).not.toHaveBeenCalled()
  })
})
