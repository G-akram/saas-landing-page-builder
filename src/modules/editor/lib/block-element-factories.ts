import {
  type AtomicElement,
  type ContainerElement,
  type ContainerStyle,
  type ContainerLayout,
} from '@/shared/types'

export function heading(
  slot: number,
  text: string,
  level: 1 | 2 | 3 | 4,
  styles: AtomicElement['styles'] = {},
): AtomicElement {
  return {
    id: crypto.randomUUID(),
    type: 'heading',
    slot,
    content: { type: 'heading', text, level },
    styles: { textAlign: 'center', ...styles },
  }
}

export function text(slot: number, value: string, styles: AtomicElement['styles'] = {}): AtomicElement {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    slot,
    content: { type: 'text', text: value },
    styles: {
      textAlign: 'center',
      color: '#6b7280',
      colorToken: 'text-muted',
      fontSize: 18,
      lineHeight: 1.6,
      ...styles,
    },
  }
}

export function button(
  slot: number,
  label: string,
  styles: AtomicElement['styles'] = {},
): AtomicElement {
  return {
    id: crypto.randomUUID(),
    type: 'button',
    slot,
    content: { type: 'button', text: label },
    styles: {
      backgroundColor: '#2563eb',
      backgroundColorToken: 'primary',
      color: '#ffffff',
      colorToken: 'primary-foreground',
      fontSize: 16,
      fontWeight: 600,
      borderRadius: 8,
      padding: { top: 12, bottom: 12, left: 32, right: 32 },
      ...styles,
    },
  }
}

export function image(slot: number, alt: string, styles: AtomicElement['styles'] = {}): AtomicElement {
  return {
    id: crypto.randomUUID(),
    type: 'image',
    slot,
    content: { type: 'image', src: '', alt },
    styles: { borderRadius: 8, maxWidth: '100%', ...styles },
  }
}

export function icon(slot: number, name: string, styles: AtomicElement['styles'] = {}): AtomicElement {
  return {
    id: crypto.randomUUID(),
    type: 'icon',
    slot,
    content: { type: 'icon', name },
    styles: { fontSize: 32, color: '#2563eb', colorToken: 'primary', ...styles },
  }
}

/**
 * Container element — groups atomic children as a visual card unit.
 * Children receive slot:0 since layout is controlled by containerLayout, not slot numbers.
 */
export function container(
  slot: number,
  children: AtomicElement[],
  containerStyle: ContainerStyle,
  containerLayout: ContainerLayout = { direction: 'column', gap: 16 },
  styles: ContainerElement['styles'] = {},
): ContainerElement {
  return {
    id: crypto.randomUUID(),
    type: 'container',
    slot,
    content: { type: 'container' },
    styles,
    containerStyle,
    containerLayout,
    children: children.map((child) => ({ ...child, slot: 0 })),
  }
}

/** Eyebrow label — small uppercase tracking text used above headings. */
export function badge(slot: number, value: string, styles: AtomicElement['styles'] = {}): AtomicElement {
  return {
    id: crypto.randomUUID(),
    type: 'text',
    slot,
    content: { type: 'text', text: value, mode: 'inline' },
    styles: {
      textAlign: 'center',
      fontSize: 13,
      fontWeight: 600,
      letterSpacing: '0.08em',
      textTransform: 'uppercase',
      color: '#2563eb',
      colorToken: 'primary',
      ...styles,
    },
  }
}
