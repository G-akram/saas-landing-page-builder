/**
 * @vitest-environment jsdom
 */

import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { type PageDocument } from '@/shared/types'

import { EditorShell } from '../editor-shell'

vi.mock('../../hooks/use-auto-save', () => ({
  useAutoSave: () => ({
    status: 'idle',
    canManualSave: false,
    triggerManualSave: vi.fn(),
  }),
}))

vi.mock('../../hooks/use-publish', () => ({
  usePublish: () => ({
    publishState: { status: 'idle', liveUrl: null },
    publishGate: { canPublish: true, reason: null },
    triggerPublish: vi.fn(),
  }),
}))

function createDocument(): PageDocument {
  return {
    activeVariantId: 'variant-1',
    variants: [
      {
        id: 'variant-1',
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

describe('EditorShell', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('toggles preview mode and hides the side panels', async () => {
    render(
      React.createElement(EditorShell, {
        pageId: 'page-1',
        pageName: 'Acme',
        pageUpdatedAt: '2026-03-30T12:00:00.000Z',
        document: createDocument(),
      }),
    )

    await waitFor(() => {
      expect(screen.getByText('Sections')).toBeTruthy()
      expect(screen.getByText('Properties')).toBeTruthy()
    })

    fireEvent.click(screen.getByRole('button', { name: 'Preview page' }))

    await waitFor(() => {
      expect(screen.queryByText('Sections')).toBeNull()
      expect(screen.queryByText('Properties')).toBeNull()
      expect(screen.getByRole('button', { name: 'Exit preview' })).toBeTruthy()
    })
  })
})
