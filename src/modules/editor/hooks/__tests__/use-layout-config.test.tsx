/**
 * @vitest-environment jsdom
 */

import React from 'react'
import { act, renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { EditorActorProvider, useEditorActor } from '../../context'
import { useLayoutConfig } from '../use-layout-config'

describe('useLayoutConfig', () => {
  it('maps preview mode to a chrome-light layout and restores edit mode', async () => {
    const wrapper = ({ children }: React.PropsWithChildren): React.JSX.Element =>
      React.createElement(EditorActorProvider, null, children)

    const { result } = renderHook(
      () => {
        const actor = useEditorActor()
        const layout = useLayoutConfig()

        return { actor, layout }
      },
      { wrapper },
    )

    expect(result.current.layout).toMatchObject({
      showSidebar: true,
      showTopBar: true,
      showRightPanel: true,
      canvasMode: 'edit',
    })

    act(() => {
      result.current.actor.send({ type: 'TOGGLE_PREVIEW' })
    })

    await waitFor(() => {
      expect(result.current.layout).toMatchObject({
        showSidebar: false,
        showTopBar: true,
        showRightPanel: false,
        canvasMode: 'preview',
      })
    })

    act(() => {
      result.current.actor.send({ type: 'TOGGLE_PREVIEW' })
    })

    await waitFor(() => {
      expect(result.current.layout.canvasMode).toBe('edit')
      expect(result.current.layout.showSidebar).toBe(true)
      expect(result.current.layout.showRightPanel).toBe(true)
    })
  })
})
