'use client'

import { useEffect, useRef, useState } from 'react'

import { type PageDocument, type Element as PageElement } from '@/shared/types'

import { EditorActorProvider, useEditorActor } from '../context'
import { useAutoSave } from '../hooks/use-auto-save'
import { useLayoutConfig } from '../hooks/use-layout-config'
import { usePublish, type EditorPublishResult } from '../hooks/use-publish'
import { useDocumentStore, useUIStore } from '../store'
import { cloneElementWithNewIds, findElementDeep, findParentContainer } from '../store/document-store-helpers'
import { EditorCanvas } from './editor-canvas'
import { EditorTopBar } from './editor-top-bar'
import { PropertyPanel } from './property-panel'
import { SectionListPanel } from './section-list-panel'
import { ShortcutsHelpOverlay } from './shortcuts-help-overlay'
import { VariantBar } from './variant-bar'

const INLINE_EDITABLE_TYPES = new Set(['heading', 'text', 'button'])

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
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false)
  // Session clipboard — not persisted, no re-render needed on copy
  const clipboardElementRef = useRef<PageElement | null>(null)
  const initializeDocument = useDocumentStore((state) => state.initializeDocument)
  const resetUI = useUIStore((state) => state.resetUI)
  const undo = useDocumentStore((state) => state.undo)
  const redo = useDocumentStore((state) => state.redo)
  const moveElement = useDocumentStore((state) => state.moveElement)
  const deleteElement = useDocumentStore((state) => state.deleteElement)
  const duplicateSection = useDocumentStore((state) => state.duplicateSection)
  const addElement = useDocumentStore((state) => state.addElement)
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

  // Global keyboard shortcuts — operates on the XState-selected element so it
  // works regardless of which DOM element currently has focus (e.g. property panel).
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        return
      }

      // Shortcuts help toggle — always available
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault()
        setIsShortcutsOpen((open) => !open)
        return
      }

      // Manual save — blocks browser's native save-page dialog
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        if (canManualSave) triggerManualSave()
        return
      }

      // Undo / redo
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key === 'z') {
        e.preventDefault()
        undo()
        return
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        e.preventDefault()
        redo()
        return
      }

      // Read selection state from XState for context-sensitive shortcuts
      const snapshot = actor.getSnapshot()
      const { selectedElementId, selectedSectionId } = snapshot.context

      // Escape → deselect (works for both element and section-only selection)
      if (e.key === 'Escape' && (selectedSectionId !== null || selectedElementId !== null)) {
        e.preventDefault()
        actor.send({ type: 'DESELECT' })
        return
      }

      if (!selectedElementId || !selectedSectionId) return

      // Don't fire element-level shortcuts while inline-editing text
      if (snapshot.matches('editing')) return

      const { document } = useDocumentStore.getState()
      if (!document) return
      const activeVariant = document.variants.find((v) => v.id === document.activeVariantId)
      if (!activeVariant) return
      const section = activeVariant.sections.find((s) => s.id === selectedSectionId)
      if (!section) return

      const parentContainer = findParentContainer(section.elements, selectedElementId)

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        deleteElement(activeVariant.id, selectedSectionId, selectedElementId)
        return
      }

      // Copy / paste elements
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'c') {
          e.preventDefault()
          const location = findElementDeep(section.elements, selectedElementId)
          if (location !== null) {
            clipboardElementRef.current = structuredClone(location.element)
          }
          return
        }

        if (e.key === 'v' && clipboardElementRef.current !== null) {
          e.preventDefault()
          const pasted = cloneElementWithNewIds(clipboardElementRef.current)
          // Find insertion index: after the currently selected top-level element
          const location = findElementDeep(section.elements, selectedElementId)
          const atIndex =
            location !== null && location.childIndex === undefined
              ? location.topLevelIndex + 1
              : undefined
          addElement(activeVariant.id, selectedSectionId, pasted, atIndex)
          return
        }
      }

      // Enter → start inline editing for text-based elements
      if (e.key === 'Enter') {
        e.preventDefault()
        const location = findElementDeep(section.elements, selectedElementId)
        if (location !== null && INLINE_EDITABLE_TYPES.has(location.element.content.type)) {
          actor.send({ type: 'EDIT_START', elementId: selectedElementId, sectionId: selectedSectionId })
        }
        return
      }

      if (e.ctrlKey || e.metaKey) {
        // Duplicate the section that contains the selected element
        if (e.key === 'd') {
          e.preventDefault()
          duplicateSection(activeVariant.id, selectedSectionId)
          return
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault()
          moveElement(activeVariant.id, selectedSectionId, selectedElementId, 'up', parentContainer?.id)
          return
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          moveElement(activeVariant.id, selectedSectionId, selectedElementId, 'down', parentContainer?.id)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [undo, redo, moveElement, deleteElement, duplicateSection, addElement, actor, canManualSave, triggerManualSave])

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
      <div className="overflow-visible" style={{ gridArea: 'header' }}>
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

      <ShortcutsHelpOverlay
        isOpen={isShortcutsOpen}
        onClose={() => { setIsShortcutsOpen(false) }}
      />
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
