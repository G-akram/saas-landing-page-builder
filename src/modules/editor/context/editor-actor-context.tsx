'use client'

import { createContext, useContext } from 'react'
import { useActorRef } from '@xstate/react'
import { type ActorRefFrom } from 'xstate'

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
  // useActorRef handles start/stop and Strict Mode rehydration correctly.
  const actor = useActorRef(editorMachine)

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
