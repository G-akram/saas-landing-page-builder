'use client'

import { useEffect, useRef } from 'react'
import { icons, type LucideIcon } from 'lucide-react'
import { ImageIcon } from 'lucide-react'

import { type Element as PageElement } from '@/shared/types'

// ── Props ───────────────────────────────────────────────────────────────────

interface ElementRendererProps {
  element: PageElement
  /** Fallback text color class when element has no explicit color */
  textColorClass: string
  isEditing?: boolean
  onInlineSave?: ((text: string) => void) | undefined
  onEditEnd?: (() => void) | undefined
}

// ── Helpers ─────────────────────────────────────────────────────────────────

/** Convert kebab-case icon name to PascalCase for lucide-react lookup. */
function kebabToPascal(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function resolveLucideIcon(name: string): LucideIcon | null {
  const pascal = kebabToPascal(name)
  return (icons as Record<string, LucideIcon>)[pascal] ?? null
}

function pxOrUndefined(value: number | undefined): string | undefined {
  return value !== undefined ? `${String(value)}px` : undefined
}

// ── Shared style builder ────────────────────────────────────────────────────

function buildBaseStyles(styles: PageElement['styles']): React.CSSProperties {
  return {
    fontSize: pxOrUndefined(styles.fontSize),
    fontWeight: styles.fontWeight ?? undefined,
    fontFamily: styles.fontFamily ?? undefined,
    color: styles.color ?? undefined,
    textAlign: styles.textAlign ?? undefined,
    lineHeight: styles.lineHeight ?? undefined,
    maxWidth: styles.maxWidth ?? undefined,
    width: styles.width ?? undefined,
    marginTop: pxOrUndefined(styles.marginTop),
    marginBottom: pxOrUndefined(styles.marginBottom),
  }
}

// ── Inline editing hook ──────────────────────────────────────────────────────

/**
 * Attaches contentEditable behaviour to a text element ref.
 * Returns event handlers to spread onto the element.
 *
 * Why a hook rather than inline handlers: the focus/blur/keydown logic is
 * identical for heading, text, and button — extract once, reuse three times.
 */
function useInlineEditing(
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
    if (e.key === 'Enter' && !e.shiftKey && isSingleLine) {
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

// ── Heading ─────────────────────────────────────────────────────────────────

const HEADING_TAG = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
} as const

function HeadingElement({
  element,
  textColorClass,
  isEditing = false,
  onInlineSave,
  onEditEnd,
}: ElementRendererProps): React.JSX.Element {
  if (element.content.type !== 'heading') throw new Error('Expected heading')

  const ref = useRef<HTMLHeadingElement>(null)
  const { onBlur, onKeyDown, onPaste } = useInlineEditing(
    ref,
    element.content.text,
    true,
    isEditing,
    onInlineSave,
    onEditEnd,
  )

  const Tag = HEADING_TAG[element.content.level]

  return (
    <Tag
      ref={ref}
      contentEditable={isEditing}
      suppressContentEditableWarning
      className={`font-bold ${element.styles.color ? '' : textColorClass} ${isEditing ? 'outline-none' : ''}`}
      style={buildBaseStyles(element.styles)}
      {...(isEditing ? { onBlur, onKeyDown, onPaste } : {})}
    >
      {element.content.text}
    </Tag>
  )
}

// ── Text ────────────────────────────────────────────────────────────────────

function TextElement({
  element,
  textColorClass,
  isEditing = false,
  onInlineSave,
  onEditEnd,
}: ElementRendererProps): React.JSX.Element {
  if (element.content.type !== 'text') throw new Error('Expected text')

  const ref = useRef<HTMLParagraphElement>(null)
  const { onBlur, onKeyDown, onPaste } = useInlineEditing(
    ref,
    element.content.text,
    false, // paragraphs allow Enter for line breaks
    isEditing,
    onInlineSave,
    onEditEnd,
  )

  return (
    <p
      ref={ref}
      contentEditable={isEditing}
      suppressContentEditableWarning
      className={`${element.styles.color ? '' : textColorClass} ${isEditing ? 'outline-none' : ''}`}
      style={buildBaseStyles(element.styles)}
      {...(isEditing ? { onBlur, onKeyDown, onPaste } : {})}
    >
      {element.content.text}
    </p>
  )
}

// ── Button ──────────────────────────────────────────────────────────────────

function ButtonElement({
  element,
  isEditing = false,
  onInlineSave,
  onEditEnd,
}: ElementRendererProps): React.JSX.Element {
  if (element.content.type !== 'button') throw new Error('Expected button')

  const ref = useRef<HTMLSpanElement>(null)
  const { onBlur, onKeyDown, onPaste } = useInlineEditing(
    ref,
    element.content.text,
    true,
    isEditing,
    onInlineSave,
    onEditEnd,
  )

  const styles = element.styles

  return (
    <span
      ref={ref}
      contentEditable={isEditing}
      suppressContentEditableWarning
      className={`inline-block cursor-default ${isEditing ? 'outline-none' : ''}`}
      style={{
        ...buildBaseStyles(styles),
        backgroundColor: styles.backgroundColor ?? undefined,
        borderRadius: pxOrUndefined(styles.borderRadius),
        paddingTop: styles.padding ? `${String(styles.padding.top)}px` : undefined,
        paddingBottom: styles.padding ? `${String(styles.padding.bottom)}px` : undefined,
        paddingLeft: styles.padding ? `${String(styles.padding.left)}px` : undefined,
        paddingRight: styles.padding ? `${String(styles.padding.right)}px` : undefined,
      }}
      {...(isEditing ? { onBlur, onKeyDown, onPaste } : {})}
    >
      {element.content.text}
    </span>
  )
}

// ── Image ────────────────────────────────────────────────────────────────────

function ImageElement({
  element,
}: ElementRendererProps): React.JSX.Element {
  if (element.content.type !== 'image') throw new Error('Expected image')

  const { src, alt } = element.content
  const styles = element.styles

  // If src is set, render actual image
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user-uploaded dynamic src in editor canvas
      <img
        src={src}
        alt={alt}
        className="block"
        style={{
          maxWidth: styles.maxWidth ?? '100%',
          width: styles.width ?? undefined,
          borderRadius: pxOrUndefined(styles.borderRadius),
          marginTop: pxOrUndefined(styles.marginTop),
          marginBottom: pxOrUndefined(styles.marginBottom),
        }}
      />
    )
  }

  // Placeholder for empty images
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 bg-gray-200 text-gray-400"
      style={{
        maxWidth: styles.maxWidth ?? '100%',
        width: styles.width ?? '100%',
        height: '160px',
        borderRadius: pxOrUndefined(styles.borderRadius),
        marginTop: pxOrUndefined(styles.marginTop),
        marginBottom: pxOrUndefined(styles.marginBottom),
      }}
    >
      <ImageIcon className="h-8 w-8" />
      <span className="text-xs">{alt || 'Image'}</span>
    </div>
  )
}

// ── Icon ────────────────────────────────────────────────────────────────────

function IconElement({
  element,
}: ElementRendererProps): React.JSX.Element {
  if (element.content.type !== 'icon') throw new Error('Expected icon')

  const Icon = resolveLucideIcon(element.content.name)
  const size = element.styles.fontSize ?? 32

  if (!Icon) {
    return (
      <span
        style={{
          fontSize: `${String(size)}px`,
          color: element.styles.color ?? undefined,
          marginTop: pxOrUndefined(element.styles.marginTop),
          marginBottom: pxOrUndefined(element.styles.marginBottom),
        }}
      >
        {element.content.name}
      </span>
    )
  }

  return (
    <Icon
      style={{
        color: element.styles.color ?? undefined,
        marginTop: pxOrUndefined(element.styles.marginTop),
        marginBottom: pxOrUndefined(element.styles.marginBottom),
      }}
      size={size}
    />
  )
}

// ── Main renderer ───────────────────────────────────────────────────────────

export function ElementRenderer(props: ElementRendererProps): React.JSX.Element {
  switch (props.element.content.type) {
    case 'heading':
      return <HeadingElement {...props} />
    case 'text':
      return <TextElement {...props} />
    case 'button':
      return <ButtonElement {...props} />
    case 'image':
      return <ImageElement {...props} />
    case 'icon':
      return <IconElement {...props} />
  }
}
