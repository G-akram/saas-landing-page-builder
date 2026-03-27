'use client'

import { icons, type LucideIcon } from 'lucide-react'
import { ImageIcon } from 'lucide-react'

import { type Element as PageElement } from '@/shared/types'

// ── Props ───────────────────────────────────────────────────────────────────

interface ElementRendererProps {
  element: PageElement
  /** Fallback text color class when element has no explicit color */
  textColorClass: string
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
}: ElementRendererProps): React.JSX.Element {
  if (element.content.type !== 'heading') throw new Error('Expected heading')

  const Tag = HEADING_TAG[element.content.level]

  return (
    <Tag
      className={`font-bold ${element.styles.color ? '' : textColorClass}`}
      style={buildBaseStyles(element.styles)}
    >
      {element.content.text}
    </Tag>
  )
}

// ── Text ────────────────────────────────────────────────────────────────────

function TextElement({
  element,
  textColorClass,
}: ElementRendererProps): React.JSX.Element {
  if (element.content.type !== 'text') throw new Error('Expected text')

  return (
    <p
      className={element.styles.color ? '' : textColorClass}
      style={buildBaseStyles(element.styles)}
    >
      {element.content.text}
    </p>
  )
}

// ── Button ──────────────────────────────────────────────────────────────────

function ButtonElement({
  element,
}: ElementRendererProps): React.JSX.Element {
  if (element.content.type !== 'button') throw new Error('Expected button')

  const styles = element.styles

  return (
    <span
      className="inline-block cursor-default"
      style={{
        ...buildBaseStyles(styles),
        backgroundColor: styles.backgroundColor ?? undefined,
        borderRadius: pxOrUndefined(styles.borderRadius),
        paddingTop: styles.padding ? `${String(styles.padding.top)}px` : undefined,
        paddingBottom: styles.padding ? `${String(styles.padding.bottom)}px` : undefined,
        paddingLeft: styles.padding ? `${String(styles.padding.left)}px` : undefined,
        paddingRight: styles.padding ? `${String(styles.padding.right)}px` : undefined,
      }}
    >
      {element.content.text}
    </span>
  )
}

// ── Image ───────────────────────────────────────────────────────────────────

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
