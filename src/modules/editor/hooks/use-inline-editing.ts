'use client'

import { useEffect, useRef } from 'react'

/**
 * Attaches contentEditable behaviour to a text element ref.
 * Returns event handlers to spread onto the element.
 *
 * Why a hook rather than inline handlers: the focus/blur/keydown logic is
 * identical for heading, text, and button — extract once, reuse three times.
 */
export function useInlineEditing(
  ref: React.RefObject<HTMLElement | null>,
  originalText: string,
  isSingleLine: boolean,
  isEditing: boolean,
  onInlineSave: ((text: string) => void) | undefined,
  onEditEnd: (() => void) | undefined,
): {
  onBlur: React.FocusEventHandler<HTMLElement>
  onKeyDown: React.KeyboardEventHandler<HTMLElement>
  onPaste: React.ClipboardEventHandler<HTMLElement>
} {
  // Guards against the spurious blur fired when Escape restores text programmatically.
  const isCancellingRef = useRef(false)

  // Focus and place cursor at end when editing activates.
  useEffect(() => {
    if (!isEditing || !ref.current) return
    ref.current.focus()
    const range = document.createRange()
    range.selectNodeContents(ref.current)
    range.collapse(false)
    const sel = window.getSelection()
    sel?.removeAllRanges()
    sel?.addRange(range)
  }, [isEditing, ref])

  function onBlur(e: React.FocusEvent<HTMLElement>): void {
    if (isCancellingRef.current) return
    const text = e.currentTarget.innerText
    onInlineSave?.(text)
    onEditEnd?.()
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLElement>): void {
    if (e.key === 'Escape') {
      e.preventDefault()
      isCancellingRef.current = true
      if (ref.current) {
        ref.current.innerText = originalText
      }
      ref.current?.blur()
      isCancellingRef.current = false
      onEditEnd?.()
      return
    }
    // Single-line elements (heading, button): Enter submits without a newline.
    if (e.key === 'Enter' && isSingleLine) {
      e.preventDefault()
      ref.current?.blur()
      return
    }

    // Multi-line text: Enter commits edit, Shift+Enter inserts a newline.
    if (e.key === 'Enter' && !isSingleLine && !e.shiftKey) {
      e.preventDefault()
      ref.current?.blur()
    }
  }

  function onPaste(e: React.ClipboardEvent<HTMLElement>): void {
    e.preventDefault()
    const text = e.clipboardData.getData('text/plain')
    const sel = window.getSelection()
    if (sel?.rangeCount) {
      const range = sel.getRangeAt(0)
      range.deleteContents()
      range.insertNode(document.createTextNode(text))
      sel.collapseToEnd()
    }
  }

  return { onBlur, onKeyDown, onPaste }
}
