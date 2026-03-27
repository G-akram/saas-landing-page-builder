'use client'

import { useSelector } from '@xstate/react'

import { useEditorActor } from '../context/editor-actor-context'
import { type EditorMode } from '../machines/editor-machine'

// ── Types ────────────────────────────────────────────────────────────────────

export interface LayoutConfig {
  showSidebar: boolean
  showTopBar: boolean
  canvasMode: 'edit' | 'preview'
}

// ── Mode → layout mapping ───────────────────────────────────────────────────

const LAYOUT_BY_MODE: Record<EditorMode, LayoutConfig> = {
  idle: { showSidebar: true, showTopBar: true, canvasMode: 'edit' },
  selected: { showSidebar: true, showTopBar: true, canvasMode: 'edit' },
  dragging: { showSidebar: true, showTopBar: true, canvasMode: 'edit' },
  previewing: { showSidebar: false, showTopBar: true, canvasMode: 'preview' },
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useLayoutConfig(): LayoutConfig {
  const actor = useEditorActor()
  const mode = useSelector(actor, (state) => state.value as EditorMode)
  return LAYOUT_BY_MODE[mode]
}
