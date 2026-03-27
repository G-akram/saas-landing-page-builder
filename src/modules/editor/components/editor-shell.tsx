'use client'

import { useEffect, useRef } from 'react'

import { type PageDocument } from '@/shared/types'
import { useDocumentStore, useUIStore } from '@/modules/editor'
import { EditorActorProvider } from '@/modules/editor'

import { useAutoSave } from '../hooks/use-auto-save'
import { useLayoutConfig } from '../hooks/use-layout-config'
import { EditorCanvas } from './editor-canvas'
import { EditorTopBar } from './editor-top-bar'
import { SectionListPanel } from './section-list-panel'

// ── Constants ────────────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = 240

// ── Props ───────────────────────────────────────────────────────────────────

interface EditorShellProps {
  pageId: string
  pageName: string
  document: PageDocument
}

// ── Inner layout (needs XState actor context) ───────────────────────────────

interface EditorLayoutProps {
  pageId: string
  pageName: string
  document: PageDocument
}

function EditorLayout({
  pageId,
  pageName,
  document,
}: EditorLayoutProps): React.JSX.Element {
  const initializeDocument = useDocumentStore((s) => s.initializeDocument)
  const resetUI = useUIStore((s) => s.resetUI)
  const isInitialized = useRef(false)

  const saveStatus = useAutoSave(pageId)
  const { showSidebar, showTopBar, canvasMode } = useLayoutConfig()

  // Initialize stores once on mount (or when page changes).
  useEffect(() => {
    if (isInitialized.current) return
    isInitialized.current = true

    initializeDocument(document)
    resetUI()
  }, [pageId, document, initializeDocument, resetUI])

  const isPreviewMode = canvasMode === 'preview'

  return (
    <div
      className="dark h-screen bg-gray-950 text-white"
      style={{
        display: 'grid',
        gridTemplateAreas: `
          "header header"
          "sidebar canvas"
        `,
        gridTemplateRows: showTopBar ? '48px 1fr' : '0px 1fr',
        gridTemplateColumns: showSidebar ? `${String(SIDEBAR_WIDTH)}px 1fr` : '0px 1fr',
      }}
    >
      {/* Top bar — grid area: header */}
      <div
        className="overflow-hidden"
        style={{ gridArea: 'header' }}
      >
        {showTopBar && (
          <EditorTopBar
            pageName={pageName}
            saveStatus={saveStatus}
            isPreviewMode={isPreviewMode}
          />
        )}
      </div>

      {/* Left sidebar — grid area: sidebar */}
      <div
        className="overflow-hidden"
        style={{ gridArea: 'sidebar' }}
      >
        {showSidebar && <SectionListPanel />}
      </div>

      {/* Canvas — grid area: canvas */}
      <main
        className="overflow-y-auto p-8"
        style={{ gridArea: 'canvas' }}
      >
        <EditorCanvas />
      </main>
    </div>
  )
}

// ── Shell (provides context) ────────────────────────────────────────────────

export function EditorShell({
  pageId,
  pageName,
  document,
}: EditorShellProps): React.JSX.Element {
  // EditorActorProvider creates the XState actor and makes it available to
  // all children via useEditorActor(). Actor stops on unmount (page navigation).
  return (
    <EditorActorProvider>
      <EditorLayout pageId={pageId} pageName={pageName} document={document} />
    </EditorActorProvider>
  )
}
