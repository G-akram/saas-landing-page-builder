'use client'

import { useRef } from 'react'
import { icons, type LucideIcon } from 'lucide-react'
import { ImageIcon } from 'lucide-react'

import { type AtomicElement, type TextMode } from '@/shared/types'

import { useInlineEditing } from '../hooks/use-inline-editing'

// ── Props ───────────────────────────────────────────────────────────────────

interface ElementRendererProps {
  element: AtomicElement
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

function buildBaseStyles(styles: AtomicElement['styles']): React.CSSProperties {
  return {
    fontSize: pxOrUndefined(styles.fontSize),
    fontWeight: styles.fontWeight ?? undefined,
    fontFamily: styles.fontFamily ?? undefined,
    color: styles.color ?? undefined,
    textAlign: styles.textAlign ?? undefined,
    lineHeight: styles.lineHeight ?? undefined,
    maxWidth: styles.maxWidth ?? undefined,
    width: styles.width ?? undefined,
    height: styles.height ?? undefined,
    marginTop: pxOrUndefined(styles.marginTop),
    marginBottom: pxOrUndefined(styles.marginBottom),
    opacity: styles.opacity ?? undefined,
    letterSpacing: styles.letterSpacing ?? undefined,
    textTransform: styles.textTransform ?? undefined,
  }
}

function resolveTextMode(content: Extract<AtomicElement['content'], { type: 'text' }>): TextMode {
  return content.mode ?? 'multiline'
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
  const textMode = resolveTextMode(element.content)
  const isSingleLine = textMode === 'inline'

  const ref = useRef<HTMLParagraphElement>(null)
  const { onBlur, onKeyDown, onPaste } = useInlineEditing(
    ref,
    element.content.text,
    isSingleLine,
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
      style={{
        ...buildBaseStyles(element.styles),
        whiteSpace: textMode === 'multiline' ? 'pre-wrap' : 'normal',
      }}
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
      className={`inline-block cursor-default @max-sm:block @max-sm:w-full @max-sm:text-center ${isEditing ? 'outline-none' : ''}`}
      style={{
        ...buildBaseStyles(styles),
        background: styles.backgroundGradient ?? styles.backgroundColor ?? undefined,
        borderRadius: pxOrUndefined(styles.borderRadius),
        paddingTop: styles.padding ? `${String(styles.padding.top)}px` : undefined,
        paddingBottom: styles.padding ? `${String(styles.padding.bottom)}px` : undefined,
        paddingLeft: styles.padding ? `${String(styles.padding.left)}px` : undefined,
        paddingRight: styles.padding ? `${String(styles.padding.right)}px` : undefined,
        boxShadow: styles.boxShadow ?? undefined,
        border: styles.border ?? undefined,
        backdropFilter: styles.backdropFilter ?? undefined,
      }}
      {...(isEditing ? { onBlur, onKeyDown, onPaste } : {})}
    >
      {element.content.text}
    </span>
  )
}

// ── Image ────────────────────────────────────────────────────────────────────

function ImageElement({ element }: ElementRendererProps): React.JSX.Element {
  if (element.content.type !== 'image') throw new Error('Expected image')

  const { src, alt } = element.content
  const styles = element.styles

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user-uploaded dynamic src in editor canvas
      <img
        src={src}
        alt={alt}
        className="block @max-sm:w-full"
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

  // Use square aspect ratio when maxWidth is small (avatar/icon context) so
  // borderRadius: 9999 produces circles rather than squashed ovals.
  const maxW = styles.maxWidth
  const isSmall = maxW !== undefined && /^\d+px$/.test(maxW) && parseInt(maxW) <= 80
  const aspectRatio = isSmall ? '1/1' : '16/9'

  return (
    <div
      className="flex flex-col items-center justify-center gap-1 bg-gray-200 text-gray-400"
      style={{
        maxWidth: styles.maxWidth ?? '100%',
        width: styles.width ?? (isSmall ? styles.maxWidth : '100%'),
        aspectRatio,
        borderRadius: pxOrUndefined(styles.borderRadius),
        marginTop: pxOrUndefined(styles.marginTop),
        marginBottom: pxOrUndefined(styles.marginBottom),
        overflow: 'hidden',
      }}
    >
      <ImageIcon className={isSmall ? 'h-4 w-4' : 'h-8 w-8'} />
      {!isSmall && <span className="text-xs">{alt || 'Image'}</span>}
    </div>
  )
}

// ── Icon ────────────────────────────────────────────────────────────────────

function IconElement({ element }: ElementRendererProps): React.JSX.Element {
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

function FormField({
  label,
  placeholder,
  multiline,
}: {
  label: string
  placeholder: string
  multiline?: boolean
}): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</span>
      {multiline ? (
        <textarea
          disabled
          rows={3}
          placeholder={placeholder}
          className="w-full resize-none border-0 border-b border-slate-200 bg-transparent py-2 text-[15px] text-slate-600 placeholder:text-slate-300 focus:outline-none"
        />
      ) : (
        <input
          disabled
          placeholder={placeholder}
          className="w-full border-0 border-b border-slate-200 bg-transparent py-2 text-[15px] text-slate-600 placeholder:text-slate-300 focus:outline-none"
        />
      )}
    </div>
  )
}

function FormElement({ element }: ElementRendererProps): React.JSX.Element {
  if (element.content.type !== 'form') throw new Error('Expected form')

  const isContactForm = element.content.variant === 'contact'
  const buttonBackground = element.styles.backgroundColor ?? '#2563eb'
  const buttonColor = element.styles.color ?? '#ffffff'
  const borderRadius = pxOrUndefined(element.styles.borderRadius) ?? '10px'
  const buttonPadding = element.styles.padding ?? { top: 14, bottom: 14, left: 20, right: 20 }

  return (
    <div
      className="w-full"
      style={{
        ...buildBaseStyles(element.styles),
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {isContactForm ? (
        <FormField label="Your name" placeholder={element.content.namePlaceholder ?? 'Your name'} />
      ) : null}
      <FormField
        label="Email address"
        placeholder={element.content.emailPlaceholder ?? 'you@company.com'}
      />
      {isContactForm ? (
        <FormField
          label="Message"
          placeholder={element.content.messagePlaceholder ?? 'How can we help?'}
          multiline
        />
      ) : null}
      <button
        type="button"
        className="mt-2 cursor-default text-[15px] font-semibold tracking-wide"
        style={{
          background: buttonBackground,
          color: buttonColor,
          borderRadius,
          paddingTop: `${String(buttonPadding.top)}px`,
          paddingBottom: `${String(buttonPadding.bottom)}px`,
          paddingLeft: `${String(buttonPadding.left)}px`,
          paddingRight: `${String(buttonPadding.right)}px`,
          alignSelf: 'stretch',
          border: 'none',
        }}
      >
        {element.content.submitLabel}
      </button>
      <p className="text-center text-[11px] uppercase tracking-wider text-slate-400">
        Preview only — submissions work on published pages.
      </p>
    </div>
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
    case 'form':
      return <FormElement {...props} />
  }
}
