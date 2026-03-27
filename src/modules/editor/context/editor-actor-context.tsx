'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createActor, type ActorRefFrom } from 'xstate'

import { editorMachine } from '../machines/editor-machine'

// ── Types ────────────────────────────────────────────────────────────────────

type EditorActorRef = ActorRefFrom<typeof editorMachine>

// ── Context ──────────────────────────────────────────────────────────────────

const EditorActorContext = createContext<EditorActorRef | null>(null)

// ── Provider ─────────────────────────────────────────────────────────────────

interface EditorActorProviderProps {
  children: React.ReactNode
}

export function EditorActorProvider({
  children,
}: EditorActorProviderProps): React.JSX.Element {
  // useState initializer runs once — actor reference is stable for the lifetime
  // of EditorShell. Context value never changes, so no re-render cascade.
  const [actor] = useState(() => {
    const a = createActor(editorMachine)
    a.start()
    return a
  })

  // Stop the actor when EditorShell unmounts (page navigation)
  useEffect(() => {
    return () => {
      actor.stop()
    }
  }, [actor])

  return (
    <EditorActorContext.Provider value={actor}>
      {children}
    </EditorActorContext.Provider>
  )
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useEditorActor(): EditorActorRef {
  const actor = useContext(EditorActorContext)
  if (!actor) {
    throw new Error('useEditorActor must be used within <EditorActorProvider>')
  }
  return actor
}
