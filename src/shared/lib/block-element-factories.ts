import {
  type AtomicElement,
  type ContainerElement,
  type ContainerStyle,
  type ContainerLayout,
  type FormConfig,
  type FormVariant,
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

// Bottom-border only via inset box-shadow — ElementStylesSchema has no borderBottom field
const FORM_INPUT_STYLES: AtomicElement['styles'] = {
  fontSize: 15,
  color: '#cbd5e1',
  backgroundColor: 'transparent',
  boxShadow: 'inset 0 -1.5px 0 #e2e8f0',
  padding: { top: 10, bottom: 10, left: 2, right: 2 },
  maxWidth: '100%',
  textAlign: 'left',
  lineHeight: 1.5,
}

export function form(
  slot: number,
  variant: FormVariant,
  styles: ContainerElement['styles'] = {},
): ContainerElement {
  const emailPlaceholder = variant === 'newsletter' ? 'Email address' : 'you@company.com'
  const submitLabel =
    variant === 'newsletter' ? 'Subscribe' : variant === 'contact' ? 'Send message' : 'Get access'
  const successMessage =
    variant === 'newsletter'
      ? 'Thanks for subscribing. Check your inbox for updates.'
      : 'Thanks. We received your message and will respond soon.'

  const emailField = text(0, emailPlaceholder, FORM_INPUT_STYLES)
  const submitButton = button(1, submitLabel, {
    width: '100%',
    fontSize: 15,
    fontWeight: 600,
    color: '#ffffff',
    backgroundColor: '#2563eb',
    backgroundColorToken: 'primary',
    borderRadius: 10,
    padding: { top: 14, bottom: 14, left: 20, right: 20 },
    letterSpacing: '0.01em',
  })

  const layout: ContainerLayout = { direction: 'column', gap: 12 }
  const containerStyle: ContainerStyle = {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    boxShadow: '0 0 0 1px rgba(15,23,42,0.06), 0 4px 6px -1px rgba(15,23,42,0.04), 0 10px 30px -5px rgba(15,23,42,0.06)',
    padding: { top: 36, bottom: 36, left: 36, right: 36 },
  }

  if (variant === 'contact') {
    const nameField = text(0, 'Your name', FORM_INPUT_STYLES)
    const messageField = text(0, 'How can we help?', {
      ...FORM_INPUT_STYLES,
      padding: { top: 10, bottom: 44, left: 2, right: 2 },
    })

    return container(
      slot,
      [nameField, emailField, messageField, submitButton],
      containerStyle,
      layout,
      styles,
      {
        variant,
        submitLabel,
        successMessage,
        submitTarget: 'database',
        emailPlaceholder,
        namePlaceholder: 'Your name',
        messagePlaceholder: 'How can we help?',
      },
    )
  }

  return container(
    slot,
    [emailField, submitButton],
    containerStyle,
    layout,
    styles,
    {
      variant,
      submitLabel,
      successMessage,
      submitTarget: 'database',
      emailPlaceholder,
    },
  )
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
  formConfig?: FormConfig,
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
    ...(formConfig ? { formConfig } : {}),
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
