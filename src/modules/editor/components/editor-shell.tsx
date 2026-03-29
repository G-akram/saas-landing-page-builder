'use client'

import { useEffect, useRef, useState } from 'react'

import { type PageDocument } from '@/shared/types'

import { EditorActorProvider, useEditorActor } from '../context'
import { useAutoSave } from '../hooks/use-auto-save'
import { useLayoutConfig } from '../hooks/use-layout-config'
import { usePublish, type EditorPublishResult } from '../hooks/use-publish'
import { useDocumentStore, useUIStore } from '../store'
import { EditorCanvas } from './editor-canvas'
import { EditorTopBar } from './editor-top-bar'
import { PropertyPanel } from './property-panel'
import { SectionListPanel } from './section-list-panel'
import { VariantBar } from './variant-bar'

const SIDEBAR_WIDTH = 240
const RIGHT_PANEL_WIDTH = 280
const MOBILE_VIEWPORT_WIDTH = 375

interface EditorShellProps {
  pageId: string
  pageName: string
  pageUpdatedAt: string
  document: PageDocument
  initialLiveUrl?: string | null
  onPublish?: (() => Promise<EditorPublishResult>) | null
}

interface EditorLayoutProps {
  pageId: string
  pageName: string
  pageUpdatedAt: string
  document: PageDocument
  initialLiveUrl?: string | null
  onPublish?: (() => Promise<EditorPublishResult>) | null
}

function EditorLayout({
  pageId,
  pageName,
  pageUpdatedAt,
  document,
  initialLiveUrl,
  onPublish,
}: EditorLayoutProps): React.JSX.Element {
  const actor = useEditorActor()
  const [isHydrated, setIsHydrated] = useState(false)
  const initializeDocument = useDocumentStore((state) => state.initializeDocument)
  const resetUI = useUIStore((state) => state.resetUI)
  const initializedPageIdRef = useRef<string | null>(null)
  const isAutoSaveEnabled = initializedPageIdRef.current === pageId

  const previewViewport = useUIStore((state) => state.previewViewport)
  const {
    status: saveStatus,
    canManualSave,
    triggerManualSave,
  } = useAutoSave(pageId, pageUpdatedAt, { enabled: isAutoSaveEnabled })
  const { publishState, publishGate, triggerPublish } = usePublish({
    pageId,
    initialLiveUrl: initialLiveUrl ?? null,
    onPublish: onPublish ?? null,
    saveStatus,
  })
  const { showSidebar, showTopBar, showRightPanel, canvasMode } = useLayoutConfig()

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  useEffect(() => {
    initializedPageIdRef.current = pageId

    initializeDocument(document)
    resetUI()
    actor.send({ type: 'RESET' })
  }, [actor, pageId, document, initializeDocument, resetUI])

  const isPreviewMode = canvasMode === 'preview'
  const isMobileViewport = previewViewport === 'mobile'

  if (!isHydrated) {
    return (
      <div className="dark flex h-screen items-center justify-center bg-gray-950 text-white">
        <p className="text-sm text-gray-400">Loading editor...</p>
      </div>
    )
  }

  return (
    <div
      className="dark h-screen bg-gray-950 text-white"
      style={{
        display: 'grid',
        gridTemplateAreas: `
          "header header header"
          "sidebar canvas properties"
        `,
        gridTemplateRows: showTopBar ? 'auto 1fr' : '0px 1fr',
        gridTemplateColumns: `${showSidebar ? String(SIDEBAR_WIDTH) : '0'}px 1fr ${showRightPanel ? String(RIGHT_PANEL_WIDTH) : '0'}px`,
      }}
    >
      <div className="overflow-hidden" style={{ gridArea: 'header' }}>
        {showTopBar && (
          <div className="flex flex-col">
            <EditorTopBar
              pageName={pageName}
              saveStatus={saveStatus}
              onManualSave={triggerManualSave}
              canManualSave={canManualSave}
              isPreviewMode={isPreviewMode}
              publishState={publishState}
              onPublish={triggerPublish}
              isPublishDisabled={!publishGate.canPublish}
              publishDisabledReason={publishGate.reason}
            />
            <VariantBar liveUrl={publishState.liveUrl} />
          </div>
        )}
      </div>

      <div className="overflow-hidden" style={{ gridArea: 'sidebar' }}>
        {showSidebar && <SectionListPanel />}
      </div>

      <main className="scrollbar-editor overflow-y-auto p-8" style={{ gridArea: 'canvas' }}>
        <div
          className="@container mx-auto transition-[max-width] duration-300 ease-in-out"
          style={{
            maxWidth: isMobileViewport ? `${String(MOBILE_VIEWPORT_WIDTH)}px` : undefined,
          }}
        >
          <EditorCanvas />
        </div>
      </main>

      <div className="overflow-hidden" style={{ gridArea: 'properties' }}>
        {showRightPanel && <PropertyPanel />}
      </div>
    </div>
  )
}

export function EditorShell({
  pageId,
  pageName,
  pageUpdatedAt,
  document,
  initialLiveUrl,
  onPublish,
}: EditorShellProps): React.JSX.Element {
  return (
    <EditorActorProvider>
      <EditorLayout
        pageId={pageId}
        pageName={pageName}
        pageUpdatedAt={pageUpdatedAt}
        document={document}
        initialLiveUrl={initialLiveUrl ?? null}
        onPublish={onPublish ?? null}
      />
    </EditorActorProvider>
  )
}
