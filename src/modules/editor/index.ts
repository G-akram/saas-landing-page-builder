// Public API for the editor module.
// All cross-module imports must go through here — never deep-import internals.
export { useDocumentStore, useUIStore } from './store'
export type { DocumentStore, UIStore, EditorMode, SidePanel } from './store'
export { EditorShell, EditorCanvas, SectionRenderer } from './components'
