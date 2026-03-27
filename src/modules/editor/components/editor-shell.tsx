'use client'

import { useEffect, useRef } from 'react'
import Link from 'next/link'

import { type PageDocument } from '@/shared/types'
import { useDocumentStore, useUIStore } from '@/modules/editor'

import { useAutoSave } from '../hooks/use-auto-save'
import { EditorCanvas } from './editor-canvas'
import { SaveStatusIndicator } from './save-status-indicator'

// ── Props ───────────────────────────────────────────────────────────────────

interface EditorShellProps {
  pageId: string
  pageName: string
  document: PageDocument
}

// ── Component ───────────────────────────────────────────────────────────────

export function EditorShell({
  pageId,
  pageName,
  document,
}: EditorShellProps): React.JSX.Element {
  const initializeDocument = useDocumentStore((s) => s.initializeDocument)
  const resetUI = useUIStore((s) => s.resetUI)
  const isInitialized = useRef(false)

  const saveStatus = useAutoSave(pageId)

  // Initialize stores once on mount (or when page changes)
  useEffect(() => {
    // Guard against StrictMode double-invoke in dev
    if (isInitialized.current) return
    isInitialized.current = true

    initializeDocument(document)
    resetUI()
  }, [pageId, document, initializeDocument, resetUI])

  return (
    <div className="flex h-screen flex-col bg-gray-950">
      {/* Top bar — minimal for now, expanded in Step 7 */}
      <header className="flex h-12 shrink-0 items-center justify-between border-b border-white/10 px-4">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-sm text-gray-400 transition-colors hover:text-white"
          >
            ← Back
          </Link>
          <div className="h-4 w-px bg-white/10" />
          <h1 className="text-sm font-medium text-white">{pageName}</h1>
        </div>

        <SaveStatusIndicator status={saveStatus} />
      </header>

      {/* Canvas area — scrollable, centered */}
      <main className="flex-1 overflow-y-auto p-8">
        <EditorCanvas />
      </main>
    </div>
  )
}
