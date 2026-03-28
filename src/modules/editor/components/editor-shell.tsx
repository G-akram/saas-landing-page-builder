'use client'

import { useEffect, useRef } from 'react'

import { type PageDocument } from '@/shared/types'
import { useDocumentStore, useUIStore } from '@/modules/editor'
import { EditorActorProvider } from '@/modules/editor'

import { useAutoSave } from '../hooks/use-auto-save'
import { useLayoutConfig } from '../hooks/use-layout-config'
import { EditorCanvas } from './editor-canvas'
import { EditorTopBar } from './editor-top-bar'
import { PropertyPanel } from './property-panel'
import { SectionListPanel } from './section-list-panel'

// ── Constants ────────────────────────────────────────────────────────────────

const SIDEBAR_WIDTH = 240
const RIGHT_PANEL_WIDTH = 280
const MOBILE_VIEWPORT_WIDTH = 375

// ── Props ───────────────────────────────────────────────────────────────────

interface EditorShellProps {
  pageId: string
  pageName: string
  pageUpdatedAt: string
  document: PageDocument
}

// ── Inner layout (needs XState actor context) ───────────────────────────────

interface EditorLayoutProps {
  pageId: string
  pageName: string
  pageUpdatedAt: string
  document: PageDocument
}

function EditorLayout({
  pageId,
  pageName,
  pageUpdatedAt,
  document,
}: EditorLayoutProps): React.JSX.Element {
  const initializeDocument = useDocumentStore((s) => s.initializeDocument)
  const resetUI = useUIStore((s) => s.resetUI)
  const initializedPageIdRef = useRef<string | null>(null)

  const previewViewport = useUIStore((s) => s.previewViewport)
  const saveStatus = useAutoSave(pageId, pageUpdatedAt)
  const { showSidebar, showTopBar, showRightPanel, canvasMode } = useLayoutConfig()

  // Initialize stores once on mount (or when page changes).
  useEffect(() => {
    if (initializedPageIdRef.current === pageId) return
    initializedPageIdRef.current = pageId

    initializeDocument(document)
    resetUI()
  }, [pageId, document, initializeDocument, resetUI])

  const isPreviewMode = canvasMode === 'preview'
  const isMobileViewport = previewViewport === 'mobile'

  return (
    <div
      className="dark h-screen bg-gray-950 text-white"
      style={{
        display: 'grid',
        gridTemplateAreas: `
          "header header header"
          "sidebar canvas properties"
        `,
        gridTemplateRows: showTopBar ? '48px 1fr' : '0px 1fr',
        gridTemplateColumns: `${showSidebar ? String(SIDEBAR_WIDTH) : '0'}px 1fr ${showRightPanel ? String(RIGHT_PANEL_WIDTH) : '0'}px`,
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
        className="scrollbar-editor overflow-y-auto p-8"
        style={{ gridArea: 'canvas' }}
      >
        <div
          className="@container mx-auto transition-[max-width] duration-300 ease-in-out"
          style={{
            maxWidth: isMobileViewport ? `${String(MOBILE_VIEWPORT_WIDTH)}px` : undefined,
          }}
        >
          <EditorCanvas />
        </div>
      </main>

      {/* Right panel — grid area: properties */}
      <div
        className="overflow-hidden"
        style={{ gridArea: 'properties' }}
      >
        {showRightPanel && <PropertyPanel />}
      </div>
    </div>
  )
}

// ── Shell (provides context) ────────────────────────────────────────────────

export function EditorShell({
  pageId,
  pageName,
  pageUpdatedAt,
  document,
}: EditorShellProps): React.JSX.Element {
  // EditorActorProvider creates the XState actor and makes it available to
  // all children via useEditorActor(). Actor stops on unmount (page navigation).
  return (
    <EditorActorProvider>
      <EditorLayout
        pageId={pageId}
        pageName={pageName}
        pageUpdatedAt={pageUpdatedAt}
        document={document}
      />
    </EditorActorProvider>
  )
}
