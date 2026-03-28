/**
 * @vitest-environment jsdom
 */

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'

import { useInlineEditing } from '../use-inline-editing'

// ── Helpers ─────────────────────────────────────────────────────────────────

function createMockRef(text = 'Hello World'): React.RefObject<HTMLElement> {
  const el = document.createElement('div')
  el.innerText = text
  el.setAttribute('contenteditable', 'true')
  document.body.appendChild(el)
  return { current: el }
}

function createFocusEvent(target: HTMLElement): React.FocusEvent<HTMLElement> {
  return { currentTarget: target } as React.FocusEvent<HTMLElement>
}

interface MockKeyboardEvent {
  event: React.KeyboardEvent<HTMLElement>
  preventDefaultFn: ReturnType<typeof vi.fn>
}

function createKeyboardEvent(key: string, shiftKey = false): MockKeyboardEvent {
  const preventDefaultFn = vi.fn()
  const event = {
    key,
    shiftKey,
    preventDefault: preventDefaultFn,
  } as unknown as React.KeyboardEvent<HTMLElement>
  return { event, preventDefaultFn }
}

interface MockPasteEvent {
  event: React.ClipboardEvent<HTMLElement>
  preventDefaultFn: ReturnType<typeof vi.fn>
}

function createPasteEvent(text: string): MockPasteEvent {
  const preventDefaultFn = vi.fn()
  const event = {
    preventDefault: preventDefaultFn,
    clipboardData: {
      getData: (type: string) => (type === 'text/plain' ? text : ''),
    },
  } as unknown as React.ClipboardEvent<HTMLElement>
  return { event, preventDefaultFn }
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('useInlineEditing', () => {
  let ref: React.RefObject<HTMLElement>

  beforeEach(() => {
    ref = createMockRef('Hello World')
  })

  afterEach(() => {
    document.body.innerHTML = ''
    vi.restoreAllMocks()
  })

  it('returns blur, keydown, and paste handlers', () => {
    const { result } = renderHook(() =>
      useInlineEditing(ref, 'Hello World', true, false, undefined, undefined),
    )

    expect(result.current.onBlur).toBeDefined()
    expect(result.current.onKeyDown).toBeDefined()
    expect(result.current.onPaste).toBeDefined()
  })

  it('calls onInlineSave and onEditEnd on blur', () => {
    const onSave = vi.fn()
    const onEnd = vi.fn()
    const { result } = renderHook(() =>
      useInlineEditing(ref, 'Hello World', true, false, onSave, onEnd),
    )

    act(() => {
      result.current.onBlur(createFocusEvent(ref.current))
    })

    expect(onSave).toHaveBeenCalledWith('Hello World')
    expect(onEnd).toHaveBeenCalled()
  })

  it('restores original text and calls onEditEnd on Escape', () => {
    const onSave = vi.fn()
    const onEnd = vi.fn()
    ref.current.innerText = 'Modified text'

    const { result } = renderHook(() =>
      useInlineEditing(ref, 'Original', true, false, onSave, onEnd),
    )

    act(() => {
      result.current.onKeyDown(createKeyboardEvent('Escape').event)
    })

    expect(ref.current.innerText).toBe('Original')
    expect(onEnd).toHaveBeenCalled()
    expect(onSave).not.toHaveBeenCalled()
  })

  it('blurs on Enter for single-line elements', () => {
    let blurCalled = false
    ref.current.blur = () => { blurCalled = true }

    const { result } = renderHook(() =>
      useInlineEditing(ref, 'Hello', true, false, vi.fn(), vi.fn()),
    )

    const { event, preventDefaultFn } = createKeyboardEvent('Enter')
    act(() => {
      result.current.onKeyDown(event)
    })

    expect(preventDefaultFn).toHaveBeenCalled()
    expect(blurCalled).toBe(true)
  })

  it('does NOT blur on Enter for multi-line elements', () => {
    let blurCalled = false
    ref.current.blur = () => { blurCalled = true }

    const { result } = renderHook(() =>
      useInlineEditing(ref, 'Hello', false, false, vi.fn(), vi.fn()),
    )

    const { event, preventDefaultFn } = createKeyboardEvent('Enter')
    act(() => {
      result.current.onKeyDown(event)
    })

    expect(preventDefaultFn).not.toHaveBeenCalled()
    expect(blurCalled).toBe(false)
  })

  it('strips formatting on paste and inserts plain text', () => {
    const { event, preventDefaultFn } = createPasteEvent('Pasted text')
    const { result } = renderHook(() =>
      useInlineEditing(ref, 'Hello', true, false, vi.fn(), vi.fn()),
    )

    act(() => {
      result.current.onPaste(event)
    })

    expect(preventDefaultFn).toHaveBeenCalled()
  })

  it('allows Shift+Enter on single-line elements without blurring', () => {
    let blurCalled = false
    ref.current.blur = () => { blurCalled = true }

    const { result } = renderHook(() =>
      useInlineEditing(ref, 'Hello', true, false, vi.fn(), vi.fn()),
    )

    act(() => {
      result.current.onKeyDown(createKeyboardEvent('Enter', true).event)
    })

    expect(blurCalled).toBe(false)
  })

  it('does not call onInlineSave on blur when Escape was pressed (cancel guard)', () => {
    const onSave = vi.fn()
    const onEnd = vi.fn()

    const { result } = renderHook(() =>
      useInlineEditing(ref, 'Original', true, false, onSave, onEnd),
    )

    act(() => {
      result.current.onKeyDown(createKeyboardEvent('Escape').event)
    })

    expect(onSave).not.toHaveBeenCalled()
    expect(onEnd).toHaveBeenCalledTimes(1)
  })

  it('ignores unrelated key presses', () => {
    let blurCalled = false
    ref.current.blur = () => { blurCalled = true }

    const { result } = renderHook(() =>
      useInlineEditing(ref, 'Hello', true, false, vi.fn(), vi.fn()),
    )

    const { event, preventDefaultFn } = createKeyboardEvent('a')
    act(() => {
      result.current.onKeyDown(event)
    })

    expect(preventDefaultFn).not.toHaveBeenCalled()
    expect(blurCalled).toBe(false)
  })
})
