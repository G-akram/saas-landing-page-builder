'use client'

import Link from 'next/link'
import { ArrowLeft, Eye, Monitor, Redo2, Smartphone, Undo2 } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

import { type SaveStatus } from '../hooks/use-auto-save'
import { type EditorPublishState } from '../hooks/use-publish'
import { resolvePublishFeedback } from '../lib/publish-feedback'
import { useDocumentStore, useUIStore } from '../store'
import { useEditorActor } from '../context'
import { PageNameInput } from './page-name-input'
import { SaveStatusIndicator } from './save-status-indicator'
import { ThemePicker } from './theme-picker'

interface EditorTopBarProps {
  pageName: string
  onRename: (name: string) => Promise<void>
  saveStatus: SaveStatus
  canManualSave: boolean
  onManualSave: () => Promise<void>
  isPreviewMode: boolean
  publishState: EditorPublishState
  onPublish: () => Promise<void>
  isPublishDisabled: boolean
  publishDisabledReason: string | null
}

export function EditorTopBar({
  pageName,
  onRename,
  saveStatus,
  canManualSave,
  onManualSave,
  isPreviewMode,
  publishState,
  onPublish,
  isPublishDisabled,
  publishDisabledReason,
}: EditorTopBarProps): React.JSX.Element {
  const undo = useDocumentStore((state) => state.undo)
  const redo = useDocumentStore((state) => state.redo)
  const hasUndo = useDocumentStore((state) => state.undoStack.length > 0)
  const hasRedo = useDocumentStore((state) => state.redoStack.length > 0)
  const previewViewport = useUIStore((state) => state.previewViewport)
  const setPreviewViewport = useUIStore((state) => state.setPreviewViewport)
  const actor = useEditorActor()

  const publishFeedback = resolvePublishFeedback(publishState, publishDisabledReason)

  function handleTogglePreview(): void {
    actor.send({ type: 'TOGGLE_PREVIEW' })
  }

  const isManualSaveDisabled = !canManualSave || saveStatus === 'saving'

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="flex items-center gap-1.5 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back</span>
        </Link>
        <div className="h-4 w-px bg-white/10" />
        <PageNameInput pageName={pageName} onRename={onRename} />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={undo}
            disabled={!hasUndo}
            aria-label="Undo"
            className="cursor-pointer rounded p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={redo}
            disabled={!hasRedo}
            aria-label="Redo"
            className="cursor-pointer rounded p-1.5 text-gray-400 transition-colors hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>

        <div className="h-4 w-px bg-white/10" />

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setPreviewViewport('desktop')
            }}
            aria-label="Desktop view"
            className={cn(
              'cursor-pointer rounded p-1.5 transition-colors',
              previewViewport === 'desktop'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-white',
            )}
          >
            <Monitor className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setPreviewViewport('mobile')
            }}
            aria-label="Mobile view"
            className={cn(
              'cursor-pointer rounded p-1.5 transition-colors',
              previewViewport === 'mobile'
                ? 'bg-white/10 text-white'
                : 'text-gray-400 hover:bg-white/5 hover:text-white',
            )}
          >
            <Smartphone className="h-4 w-4" />
          </button>
        </div>

        <div className="h-4 w-px bg-white/10" />

        <ThemePicker />
      </div>

      <div className="flex items-center gap-3">
        <SaveStatusIndicator status={saveStatus} />

        <button
          type="button"
          onClick={() => {
            void onManualSave()
          }}
          disabled={isManualSaveDisabled}
          aria-label="Save page now"
          className={cn(
            'flex items-center gap-1.5 rounded px-3 py-1.5 text-sm transition-colors',
            isManualSaveDisabled
              ? 'cursor-not-allowed bg-white/5 text-gray-500'
              : 'cursor-pointer bg-white/10 text-white hover:bg-white/20',
          )}
        >
          <span>{saveStatus === 'saving' ? 'Saving...' : 'Save'}</span>
        </button>

        {publishFeedback && (
          <span className={cn('max-w-52 truncate text-xs', publishFeedback.className)}>
            {publishFeedback.label}
          </span>
        )}

        {publishState.liveUrl && (
          <Link
            href={publishState.liveUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-blue-300 transition-colors hover:text-blue-200"
          >
            Live URL
          </Link>
        )}

        <button
          type="button"
          onClick={() => {
            void onPublish()
          }}
          disabled={isPublishDisabled}
          aria-label="Publish page"
          className={cn(
            'flex items-center gap-1.5 rounded px-3 py-1.5 text-sm transition-colors',
            isPublishDisabled
              ? 'cursor-not-allowed bg-white/5 text-gray-500'
              : 'cursor-pointer bg-green-600 text-white hover:bg-green-500',
          )}
        >
          <span>{publishState.status === 'publishing' ? 'Publishing...' : 'Publish'}</span>
        </button>

        <button
          type="button"
          onClick={handleTogglePreview}
          aria-label={isPreviewMode ? 'Exit preview' : 'Preview page'}
          className={cn(
            'cursor-pointer flex items-center gap-1.5 rounded px-3 py-1.5 text-sm transition-colors',
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
