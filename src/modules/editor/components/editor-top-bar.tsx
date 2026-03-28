'use client'

import Link from 'next/link'
import { ArrowLeft, Eye, Monitor, Redo2, Smartphone, Undo2 } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { useDocumentStore, useUIStore } from '@/modules/editor'
import { useEditorActor } from '@/modules/editor'

import { type SaveStatus } from '../hooks/use-auto-save'
import { SaveStatusIndicator } from './save-status-indicator'

// ── Props ────────────────────────────────────────────────────────────────────

interface EditorTopBarProps {
  pageName: string
  saveStatus: SaveStatus
  isPreviewMode: boolean
}

// ── Component ────────────────────────────────────────────────────────────────

export function EditorTopBar({
  pageName,
  saveStatus,
  isPreviewMode,
}: EditorTopBarProps): React.JSX.Element {
  const undo = useDocumentStore((s) => s.undo)
  const redo = useDocumentStore((s) => s.redo)
  const hasUndo = useDocumentStore((s) => s.undoStack.length > 0)
  const hasRedo = useDocumentStore((s) => s.redoStack.length > 0)
  const previewViewport = useUIStore((s) => s.previewViewport)
  const setPreviewViewport = useUIStore((s) => s.setPreviewViewport)
  const actor = useEditorActor()

  function handleTogglePreview(): void {
    actor.send({ type: 'TOGGLE_PREVIEW' })
  }

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
      {/* Left — navigation + page name */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>
        <div className="h-4 w-px bg-white/10" />
        <h1 className="text-sm font-medium text-white">{pageName}</h1>
      </div>

      {/* Center — undo/redo + viewport toggle */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={!hasUndo}
            aria-label="Undo"
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!hasRedo}
            aria-label="Redo"
            className="rounded p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        <div className="h-4 w-px bg-white/10" />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => { setPreviewViewport('desktop') }}
            aria-label="Desktop view"
            className={cn(
              'rounded p-1.5 transition-colors',
              previewViewport === 'desktop'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-white',
            )}
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => { setPreviewViewport('mobile') }}
            aria-label="Mobile view"
            className={cn(
              'rounded p-1.5 transition-colors',
              previewViewport === 'mobile'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-white',
            )}
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Right — save status + preview toggle */}
      <div className="flex items-center gap-3">
        <SaveStatusIndicator status={saveStatus} />
        <button
          type="button"
          onClick={handleTogglePreview}
          aria-label={isPreviewMode ? 'Exit preview' : 'Preview page'}
          className={cn(
            'flex items-center gap-1.5 rounded px-3 py-1.5 text-sm transition-colors',
            isPreviewMode
              ? 'bg-blue-600 text-white hover:bg-blue-500'
              : 'text-gray-400 hover:bg-white/5 hover:text-white',
          )}
        >
          <Eye className="h-4 w-4" />
          <span>{isPreviewMode ? 'Exit Preview' : 'Preview'}</span>
        </button>
      </div>
    </header>
  )
}
