/**
 * @vitest-environment jsdom
 */

import React from 'react'
import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'

import { type PageDocument } from '@/shared/types'

import { EditorActorProvider } from '../../context'
import { useDocumentStore } from '../../store'
import { EditorCanvas } from '../editor-canvas'

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
          {
            id: 'section-2',
            type: 'cta',
            variantStyleId: 'cta-1',
            layout: {
              type: 'stack',
              gap: 16,
              align: 'center',
              verticalAlign: 'center',
            },
            background: { type: 'color', value: '#2563eb' },
            padding: { top: 64, bottom: 64, left: 24, right: 24 },
            elements: [],
          },
        ],
      },
    ],
  }
}

describe('EditorCanvas', () => {
  beforeEach(() => {
    useDocumentStore.getState().initializeDocument(createDocument())
  })

  it('removes a section through the canvas delete action and updates the store', async () => {
    render(React.createElement(EditorActorProvider, null, React.createElement(EditorCanvas)))

    expect(screen.getByText('Hero')).toBeTruthy()
    expect(screen.getByText('Call to Action')).toBeTruthy()

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete section' })
    const firstDeleteButton = deleteButtons[0]
    expect(firstDeleteButton).toBeTruthy()
    if (!firstDeleteButton) {
      return
    }

    fireEvent.click(firstDeleteButton)

    await waitFor(() => {
      expect(useDocumentStore.getState().document?.variants[0]?.sections).toHaveLength(1)
    })

    expect(screen.queryByText('Hero')).toBeNull()
    expect(screen.getByText('Call to Action')).toBeTruthy()
  })
})
