import { beforeEach, describe, expect, it } from 'vitest'
import { createActor, type Actor } from 'xstate'

import { editorMachine, type EditorMode } from '../editor-machine'

// ── Helper ───────────────────────────────────────────────────────────────────

function mode(actor: Actor<typeof editorMachine>): EditorMode {
  return actor.getSnapshot().value as EditorMode
}

function ctx(actor: Actor<typeof editorMachine>) {
  return actor.getSnapshot().context
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('editorMachine', () => {
  let actor: Actor<typeof editorMachine>

  beforeEach(() => {
    actor = createActor(editorMachine)
    actor.start()
  })

  describe('initial state', () => {
    it('starts idle with nothing selected', () => {
      expect(mode(actor)).toBe('idle')
      expect(ctx(actor).selectedSectionId).toBeNull()
      expect(ctx(actor).selectedElementId).toBeNull()
    })
  })

  describe('SELECT_SECTION', () => {
    it('idle → selected when sectionId is provided', () => {
      actor.send({ type: 'SELECT_SECTION', sectionId: 'sec-1' })
      expect(mode(actor)).toBe('selected')
      expect(ctx(actor).selectedSectionId).toBe('sec-1')
    })

    it('idle → idle when sectionId is null (guard blocks transition)', () => {
      actor.send({ type: 'SELECT_SECTION', sectionId: null })
      expect(mode(actor)).toBe('idle')
    })

    it('selected → selected when re-selecting a different section', () => {
      actor.send({ type: 'SELECT_SECTION', sectionId: 'sec-1' })
      actor.send({ type: 'SELECT_SECTION', sectionId: 'sec-2' })
      expect(mode(actor)).toBe('selected')
      expect(ctx(actor).selectedSectionId).toBe('sec-2')
    })

    it('clears selectedElementId when re-selecting a section', () => {
      actor.send({ type: 'SELECT_SECTION', sectionId: 'sec-1' })
      actor.send({ type: 'SELECT_ELEMENT', elementId: 'el-1', sectionId: 'sec-1' })
      actor.send({ type: 'SELECT_SECTION', sectionId: 'sec-2' })
      expect(ctx(actor).selectedElementId).toBeNull()
    })

    it('selected → idle when sectionId is null (deselect)', () => {
      actor.send({ type: 'SELECT_SECTION', sectionId: 'sec-1' })
      actor.send({ type: 'SELECT_SECTION', sectionId: null })
      expect(mode(actor)).toBe('idle')
      expect(ctx(actor).selectedSectionId).toBeNull()
    })
  })

  describe('SELECT_ELEMENT', () => {
    it('updates selectedElementId without changing state', () => {
      actor.send({ type: 'SELECT_SECTION', sectionId: 'sec-1' })
      actor.send({ type: 'SELECT_ELEMENT', elementId: 'el-1', sectionId: 'sec-1' })
      expect(mode(actor)).toBe('selected')
      expect(ctx(actor).selectedElementId).toBe('el-1')
      expect(ctx(actor).selectedSectionId).toBe('sec-1')
    })

    it('updates selectedSectionId when element is in a different section', () => {
      actor.send({ type: 'SELECT_SECTION', sectionId: 'sec-1' })
      actor.send({ type: 'SELECT_ELEMENT', elementId: 'el-2', sectionId: 'sec-2' })
      expect(mode(actor)).toBe('selected')
      expect(ctx(actor).selectedSectionId).toBe('sec-2')
      expect(ctx(actor).selectedElementId).toBe('el-2')
    })

    it('idle → selected when clicking element directly (no prior section click)', () => {
      actor.send({ type: 'SELECT_ELEMENT', elementId: 'el-1', sectionId: 'sec-1' })
      expect(mode(actor)).toBe('selected')
      expect(ctx(actor).selectedSectionId).toBe('sec-1')
      expect(ctx(actor).selectedElementId).toBe('el-1')
    })
  })

  describe('DESELECT', () => {
    it('selected → idle and clears all selection', () => {
      actor.send({ type: 'SELECT_SECTION', sectionId: 'sec-1' })
      actor.send({ type: 'SELECT_ELEMENT', elementId: 'el-1', sectionId: 'sec-1' })
      actor.send({ type: 'DESELECT' })
      expect(mode(actor)).toBe('idle')
      expect(ctx(actor).selectedSectionId).toBeNull()
      expect(ctx(actor).selectedElementId).toBeNull()
    })
  })

  describe('DRAG_START', () => {
    it('idle → dragging', () => {
      actor.send({ type: 'DRAG_START' })
      expect(mode(actor)).toBe('dragging')
    })

    it('selected → dragging (preserves selection context)', () => {
      actor.send({ type: 'SELECT_SECTION', sectionId: 'sec-1' })
      actor.send({ type: 'DRAG_START' })
      expect(mode(actor)).toBe('dragging')
      expect(ctx(actor).selectedSectionId).toBe('sec-1')
    })
  })

  describe('DRAG_END', () => {
    it('dragging → selected when section was selected before drag', () => {
      actor.send({ type: 'SELECT_SECTION', sectionId: 'sec-1' })
      actor.send({ type: 'DRAG_START' })
      actor.send({ type: 'DRAG_END' })
      expect(mode(actor)).toBe('selected')
    })

    it('dragging → idle when nothing was selected before drag', () => {
      actor.send({ type: 'DRAG_START' })
      actor.send({ type: 'DRAG_END' })
      expect(mode(actor)).toBe('idle')
    })
  })

  describe('DRAG_CANCEL', () => {
    it('dragging → selected when section was selected before drag', () => {
      actor.send({ type: 'SELECT_SECTION', sectionId: 'sec-1' })
      actor.send({ type: 'DRAG_START' })
      actor.send({ type: 'DRAG_CANCEL' })
      expect(mode(actor)).toBe('selected')
    })

    it('dragging → idle when nothing was selected before drag', () => {
      actor.send({ type: 'DRAG_START' })
      actor.send({ type: 'DRAG_CANCEL' })
      expect(mode(actor)).toBe('idle')
    })
  })

  describe('previewing state', () => {
    it('idle → previewing on TOGGLE_PREVIEW', () => {
      actor.send({ type: 'TOGGLE_PREVIEW' })
      expect(mode(actor)).toBe('previewing')
    })

    it('selected → previewing on TOGGLE_PREVIEW', () => {
      actor.send({ type: 'SELECT_SECTION', sectionId: 'sec-1' })
      actor.send({ type: 'TOGGLE_PREVIEW' })
      expect(mode(actor)).toBe('previewing')
    })

    it('previewing → idle on second TOGGLE_PREVIEW', () => {
      actor.send({ type: 'TOGGLE_PREVIEW' })
      actor.send({ type: 'TOGGLE_PREVIEW' })
      expect(mode(actor)).toBe('idle')
    })

    it('SELECT_SECTION is dropped while previewing', () => {
      actor.send({ type: 'TOGGLE_PREVIEW' })
      actor.send({ type: 'SELECT_SECTION', sectionId: 'sec-1' })
      expect(mode(actor)).toBe('previewing')
      expect(ctx(actor).selectedSectionId).toBeNull()
    })

    it('DRAG_START is dropped while previewing', () => {
      actor.send({ type: 'TOGGLE_PREVIEW' })
      actor.send({ type: 'DRAG_START' })
      expect(mode(actor)).toBe('previewing')
    })
  })
})
