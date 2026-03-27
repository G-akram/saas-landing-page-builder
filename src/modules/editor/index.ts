// Public API for the editor module.
// All cross-module imports must go through here — never deep-import internals.
export { useDocumentStore, useUIStore } from './store'
export type { DocumentStore, UIStore, SidePanel } from './store'

export { EditorActorProvider, useEditorActor } from './context'
export type { EditorMode } from './machines'

export { EditorShell, EditorCanvas, SectionRenderer } from './components'
