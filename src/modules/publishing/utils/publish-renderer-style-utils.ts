import { type CSSProperties } from 'react'

import {
  type Element as PageElement,
  type Section,
  type SlotStyle,
  type ContainerElement,
} from '@/shared/types'

const ALIGNMENT_STYLE: Record<
  Section['layout']['align'],
  Pick<CSSProperties, 'alignItems' | 'textAlign'>
> = {
  left: { alignItems: 'flex-start', textAlign: 'left' },
  center: { alignItems: 'center', textAlign: 'center' },
  right: { alignItems: 'flex-end', textAlign: 'right' },
}

const VERTICAL_ALIGNMENT_STYLE: Record<
  Section['layout']['verticalAlign'],
  Pick<CSSProperties, 'justifyContent'>
> = {
  top: { justifyContent: 'flex-start' },
  center: { justifyContent: 'center' },
  bottom: { justifyContent: 'flex-end' },
}

function toPx(value: number | undefined): string | undefined {
  return value !== undefined ? `${String(value)}px` : undefined
}

function buildBackgroundStyle(background: Section['background']): CSSProperties {
  switch (background.type) {
    case 'color':
      return { backgroundColor: background.value }
    case 'gradient':
      return { background: background.value }
    case 'image':
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }
  }
}

function expandHexColor(hex: string): string | null {
  const normalized = hex.replace('#', '').trim()
  if (normalized.length === 3) {
    return normalized
      .split('')
      .map((char) => `${char}${char}`)
      .join('')
  }

  if (normalized.length === 6) return normalized
  return null
}

export function isDarkBackground(section: Section): boolean {
  if (section.background.type !== 'color') return false

  const expanded = expandHexColor(section.background.value)
  if (!expanded) return false

  const red = Number.parseInt(expanded.slice(0, 2), 16)
  const green = Number.parseInt(expanded.slice(2, 4), 16)
  const blue = Number.parseInt(expanded.slice(4, 6), 16)

  const luminance = (0.299 * red + 0.587 * green + 0.114 * blue) / 255
  return luminance < 0.5
}

export function resolveDefaultTextColor(section: Section): string {
  return isDarkBackground(section) ? '#ffffff' : '#111827'
}

export function buildSectionStyle(section: Section): CSSProperties {
  return {
    ...buildBackgroundStyle(section.background),
    paddingTop: `${String(section.padding.top)}px`,
    paddingBottom: `${String(section.padding.bottom)}px`,
    paddingLeft: `${String(section.padding.left)}px`,
    paddingRight: `${String(section.padding.right)}px`,
    minHeight: section.minHeight !== undefined ? `${String(section.minHeight)}px` : undefined,
  }
}

export function buildSlotStyle(layout: Section['layout']): CSSProperties {
  return {
    ...ALIGNMENT_STYLE[layout.align],
    ...VERTICAL_ALIGNMENT_STYLE[layout.verticalAlign],
    gap: `${String(Math.max(8, Math.round(layout.gap * 0.5)))}px`,
  }
}

export function buildStackLayoutStyle(layout: Section['layout']): CSSProperties {
  return {
    ...ALIGNMENT_STYLE[layout.align],
    ...VERTICAL_ALIGNMENT_STYLE[layout.verticalAlign],
    gap: `${String(layout.gap)}px`,
  }
}

export function buildGridLayoutStyle(columns: number, gap: number): CSSProperties {
  const style: CSSProperties = {
    gap: `${String(gap)}px`,
  }

  ;(style as CSSProperties & Record<'--pb-columns', string>)['--pb-columns'] = String(columns)

  return style
}

export function buildBaseElementStyle(styles: PageElement['styles']): CSSProperties {
  return {
    fontSize: toPx(styles.fontSize),
    fontWeight: styles.fontWeight ?? undefined,
    fontFamily: styles.fontFamily ?? undefined,
    color: styles.color ?? undefined,
    textAlign: styles.textAlign ?? undefined,
    lineHeight: styles.lineHeight ?? undefined,
    width: styles.width ?? undefined,
    height: styles.height ?? undefined,
    maxWidth: styles.maxWidth ?? undefined,
    marginTop: toPx(styles.marginTop),
    marginBottom: toPx(styles.marginBottom),
    opacity: styles.opacity ?? undefined,
    letterSpacing: styles.letterSpacing ?? undefined,
    textTransform: styles.textTransform ?? undefined,
  }
}

export function buildButtonStyle(styles: PageElement['styles']): CSSProperties {
  return {
    ...buildBaseElementStyle(styles),
    display: 'inline-block',
    textDecoration: 'none',
    cursor: 'pointer',
    // backgroundGradient overrides backgroundColor for gradient buttons
    background: styles.backgroundGradient ?? styles.backgroundColor ?? undefined,
    borderRadius: toPx(styles.borderRadius),
    paddingTop: styles.padding ? `${String(styles.padding.top)}px` : undefined,
    paddingBottom: styles.padding ? `${String(styles.padding.bottom)}px` : undefined,
    paddingLeft: styles.padding ? `${String(styles.padding.left)}px` : undefined,
    paddingRight: styles.padding ? `${String(styles.padding.right)}px` : undefined,
    boxShadow: styles.boxShadow ?? undefined,
    border: styles.border ?? undefined,
    backdropFilter: styles.backdropFilter ?? undefined,
  }
}

export function buildImageStyle(styles: PageElement['styles']): CSSProperties {
  return {
    maxWidth: styles.maxWidth ?? '100%',
    width: styles.width ?? undefined,
    borderRadius: toPx(styles.borderRadius),
    marginTop: toPx(styles.marginTop),
    marginBottom: toPx(styles.marginBottom),
  }
}

export function buildPublishedSlotStyle(slotStyle: SlotStyle): CSSProperties {
  return {
    backgroundColor: slotStyle.backgroundColor ?? undefined,
    borderRadius: toPx(slotStyle.borderRadius),
    boxShadow: slotStyle.boxShadow ?? undefined,
    border: slotStyle.border ?? undefined,
    backdropFilter: slotStyle.backdropFilter ?? undefined,
    paddingTop: slotStyle.padding ? `${String(slotStyle.padding.top)}px` : undefined,
    paddingBottom: slotStyle.padding ? `${String(slotStyle.padding.bottom)}px` : undefined,
    paddingLeft: slotStyle.padding ? `${String(slotStyle.padding.left)}px` : undefined,
    paddingRight: slotStyle.padding ? `${String(slotStyle.padding.right)}px` : undefined,
  }
}

export function buildContainerPublishedStyle(container: ContainerElement): CSSProperties {
  const { containerStyle, containerLayout } = container

  const alignItems =
    containerLayout.align === 'center'
      ? 'center'
      : containerLayout.align === 'right'
        ? 'flex-end'
        : 'flex-start'

  return {
    display: 'flex',
    flexDirection: containerLayout.direction === 'row' ? 'row' : 'column',
    gap: `${String(containerLayout.gap)}px`,
    alignItems: containerLayout.direction === 'column' ? alignItems : undefined,
    background: containerStyle.backgroundGradient ?? containerStyle.backgroundColor ?? undefined,
    borderRadius: toPx(containerStyle.borderRadius),
    boxShadow: containerStyle.boxShadow ?? undefined,
    border: containerStyle.border ?? undefined,
    backdropFilter: containerStyle.backdropFilter ?? undefined,
    paddingTop: containerStyle.padding ? `${String(containerStyle.padding.top)}px` : undefined,
    paddingBottom: containerStyle.padding ? `${String(containerStyle.padding.bottom)}px` : undefined,
    paddingLeft: containerStyle.padding ? `${String(containerStyle.padding.left)}px` : undefined,
    paddingRight: containerStyle.padding ? `${String(containerStyle.padding.right)}px` : undefined,
    marginTop: toPx(container.styles.marginTop),
    marginBottom: toPx(container.styles.marginBottom),
    width: container.styles.width ?? undefined,
    height: container.styles.height ?? undefined,
    maxWidth: container.styles.maxWidth ?? undefined,
  }
}

export function groupElementsBySlot(elements: PageElement[]): Map<number, PageElement[]> {
  const sorted = [...elements].sort((left, right) => left.slot - right.slot)
  const grouped = new Map<number, PageElement[]>()

  for (const element of sorted) {
    const group = grouped.get(element.slot)
    if (group) {
      group.push(element)
      continue
    }

    grouped.set(element.slot, [element])
  }

  return grouped
}
