import { createElement } from 'react'

import {
  type Element as PageElement,
  type ContainerElement,
  type FormConfig,
  isContainerElement,
} from '@/shared/types'

import {
  buildBaseElementStyle,
  buildButtonStyle,
  buildContainerPublishedStyle,
  buildImageStyle,
  resolvePublishedHref,
} from '../utils/publish-renderer-utils'
import { getLucideIconSvg } from '../utils/publish-lucide-icon-renderer'

interface PublishedPageElementProps {
  slug: string
  element: PageElement
  defaultTextColor: string
  primaryGoalElementId: string | null
}

const HEADING_TAG_BY_LEVEL = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
} as const


function wrapWithLinkIfPresent(
  element: PageElement,
  child: React.JSX.Element,
  primaryGoalElementId: string | null,
): React.JSX.Element {
  const href = resolvePublishedHref(element.link)
  if (!href) return child

  const shouldOpenNewTab = element.link?.newTab === true

  return createElement(
    'a',
    {
      href,
      target: shouldOpenNewTab ? '_blank' : undefined,
      rel: shouldOpenNewTab ? 'noopener noreferrer' : undefined,
      'data-pb-primary-goal-id':
        element.id === primaryGoalElementId ? primaryGoalElementId : undefined,
      style: { textDecoration: 'none', color: 'inherit' },
    },
    child,
  )
}

function renderHeading(element: PageElement, defaultTextColor: string): React.JSX.Element {
  if (element.content.type !== 'heading') {
    throw new Error('Expected heading element content')
  }

  const headingTag = HEADING_TAG_BY_LEVEL[element.content.level]

  return createElement(
    headingTag,
    {
      style: {
        ...buildBaseElementStyle(element.styles),
        color: element.styles.color ?? defaultTextColor,
      },
    },
    element.content.text,
  )
}

function renderText(element: PageElement, defaultTextColor: string): React.JSX.Element {
  if (element.content.type !== 'text') {
    throw new Error('Expected text element content')
  }

  return createElement(
    'p',
    {
      style: {
        ...buildBaseElementStyle(element.styles),
        color: element.styles.color ?? defaultTextColor,
        whiteSpace: element.content.mode === 'inline' ? 'normal' : 'pre-wrap',
      },
    },
    element.content.text,
  )
}

function renderButton(
  element: PageElement,
  defaultTextColor: string,
  primaryGoalElementId: string | null,
): React.JSX.Element {
  if (element.content.type !== 'button') {
    throw new Error('Expected button element content')
  }

  const buttonNode = createElement(
    'span',
    {
      style: {
        ...buildButtonStyle(element.styles),
        color: element.styles.color ?? defaultTextColor,
      },
    },
    element.content.text,
  )

  return wrapWithLinkIfPresent(element, buttonNode, primaryGoalElementId)
}

function renderImage(element: PageElement, primaryGoalElementId: string | null): React.JSX.Element {
  if (element.content.type !== 'image') {
    throw new Error('Expected image element content')
  }

  const source = element.content.src.trim()

  if (!source) {
    return createElement(
      'div',
      {
        className: 'pb-image-placeholder',
        style: buildImageStyle(element.styles),
      },
      element.content.alt || 'Image',
    )
  }

  const imageNode = createElement('img', {
    src: source,
    alt: element.content.alt,
    style: buildImageStyle(element.styles),
  })

  return wrapWithLinkIfPresent(element, imageNode, primaryGoalElementId)
}

function renderIcon(
  element: PageElement,
  defaultTextColor: string,
  primaryGoalElementId: string | null,
): React.JSX.Element {
  if (element.content.type !== 'icon') {
    throw new Error('Expected icon element content')
  }

  const iconSize = element.styles.fontSize ?? 28
  const iconColor = element.styles.color ?? defaultTextColor

  // Extract SVG paths from lucide-react's icon data (not React component rendering).
  // This avoids the CJS/ESM dual-React-instance issue in the publishing pipeline.
  // Falls back to a simple circle if the icon name is not found in lucide-react
  const svgPaths = getLucideIconSvg(element.content.name) ?? '<circle cx="12" cy="12" r="9"/>'

  const iconNode = createElement('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    width: iconSize,
    height: iconSize,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: iconColor,
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    'aria-hidden': true,
    style: {
      display: 'inline-block',
      verticalAlign: 'middle',
      flexShrink: 0,
      marginTop:
        element.styles.marginTop !== undefined
          ? `${String(element.styles.marginTop)}px`
          : undefined,
      marginBottom:
        element.styles.marginBottom !== undefined
          ? `${String(element.styles.marginBottom)}px`
          : undefined,
    },
    dangerouslySetInnerHTML: { __html: svgPaths },
  })

  return wrapWithLinkIfPresent(element, iconNode, primaryGoalElementId)
}

function renderContainer(
  container: ContainerElement,
  slug: string,
  defaultTextColor: string,
  primaryGoalElementId: string | null,
): React.JSX.Element {
  return createElement(
    'div',
    { className: 'pb-container', style: buildContainerPublishedStyle(container) },
    ...container.children.map((child) =>
      createElement(PublishedPageElement, {
        key: child.id,
        slug,
        element: child,
        defaultTextColor,
        primaryGoalElementId,
      }),
    ),
  )
}

function resolveFormConfig(element: PageElement): FormConfig | null {
  if (isContainerElement(element)) {
    return element.formConfig ?? null
  }

  return element.content.type === 'form' ? element.content : null
}

function buildFormWrapperStyle(element: PageElement): React.CSSProperties {
  const flex: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  }

  if (isContainerElement(element)) {
    const cs = element.containerStyle
    const s = element.styles
    return {
      ...flex,
      background: cs.backgroundGradient ?? cs.backgroundColor ?? undefined,
      borderRadius: cs.borderRadius !== undefined ? `${String(cs.borderRadius)}px` : undefined,
      boxShadow: cs.boxShadow ?? undefined,
      border: cs.border ?? undefined,
      backdropFilter: cs.backdropFilter ?? undefined,
      paddingTop: cs.padding ? `${String(cs.padding.top)}px` : undefined,
      paddingBottom: cs.padding ? `${String(cs.padding.bottom)}px` : undefined,
      paddingLeft: cs.padding ? `${String(cs.padding.left)}px` : undefined,
      paddingRight: cs.padding ? `${String(cs.padding.right)}px` : undefined,
      maxWidth: s.maxWidth ?? undefined,
      width: s.width ?? undefined,
      marginTop: s.marginTop !== undefined ? `${String(s.marginTop)}px` : undefined,
      marginBottom: s.marginBottom !== undefined ? `${String(s.marginBottom)}px` : undefined,
    }
  }

  // Atomic form element — element.styles carries all visual properties
  const s = element.styles
  return {
    ...buildBaseElementStyle(s),
    ...flex,
    background: s.backgroundGradient ?? s.backgroundColor ?? undefined,
    borderRadius: s.borderRadius !== undefined ? `${String(s.borderRadius)}px` : undefined,
    paddingTop: s.padding ? `${String(s.padding.top)}px` : undefined,
    paddingBottom: s.padding ? `${String(s.padding.bottom)}px` : undefined,
    paddingLeft: s.padding ? `${String(s.padding.left)}px` : undefined,
    paddingRight: s.padding ? `${String(s.padding.right)}px` : undefined,
  }
}

function renderFieldGroup(
  labelText: string,
  field: React.JSX.Element,
): React.JSX.Element {
  return createElement(
    'div',
    { className: 'pb-form-field-group' },
    createElement('label', { className: 'pb-form-label' }, labelText),
    field,
  )
}

function renderForm(
  element: PageElement,
  formConfig: FormConfig,
  slug: string,
  defaultTextColor: string,
): React.JSX.Element {
  const endpoint = `/p/${slug}/lead`
  const isContactForm = formConfig.variant === 'contact'
  const buttonStyle = buildButtonStyle(element.styles)

  return createElement(
    'form',
    {
      className: 'pb-lead-form',
      action: endpoint,
      method: 'post',
      style: buildFormWrapperStyle(element),
      'data-pb-form-element-id': element.id,
      'data-pb-form-success-message': formConfig.successMessage,
    },
    createElement('input', {
      type: 'hidden',
      name: 'elementId',
      value: element.id,
    }),
    isContactForm
      ? renderFieldGroup(
          'Your name',
          createElement('input', {
            className: 'pb-form-field',
            name: 'name',
            type: 'text',
            required: true,
            placeholder: formConfig.namePlaceholder ?? 'Your name',
          }),
        )
      : null,
    renderFieldGroup(
      'Email address',
      createElement('input', {
        className: 'pb-form-field',
        name: 'email',
        type: 'email',
        required: true,
        placeholder: formConfig.emailPlaceholder ?? 'you@company.com',
      }),
    ),
    isContactForm
      ? renderFieldGroup(
          'Message',
          createElement('textarea', {
            className: 'pb-form-field',
            name: 'message',
            required: true,
            rows: 4,
            placeholder: formConfig.messagePlaceholder ?? 'How can we help?',
          }),
        )
      : null,
    createElement(
      'button',
      {
        type: 'submit',
        className: 'pb-form-submit',
        style: {
          ...buttonStyle,
          color: element.styles.color ?? defaultTextColor,
          display: 'block',
          width: '100%',
          textAlign: 'center',
        },
      },
      formConfig.submitLabel,
    ),
    !isContactForm
      ? createElement(
          'p',
          { className: 'pb-form-privacy' },
          'We respect your privacy. No spam, ever.',
        )
      : null,
    createElement(
      'p',
      {
        className: 'pb-form-status',
        'data-pb-form-status': true,
        'aria-live': 'polite',
      },
      '',
    ),
  )
}

export function PublishedPageElement({
  slug,
  element,
  defaultTextColor,
  primaryGoalElementId,
}: PublishedPageElementProps): React.JSX.Element {
  const formConfig = resolveFormConfig(element)
  if (formConfig) {
    return renderForm(element, formConfig, slug, defaultTextColor)
  }

  if (isContainerElement(element)) {
    return renderContainer(element, slug, defaultTextColor, primaryGoalElementId)
  }

  switch (element.content.type) {
    case 'heading':
      return renderHeading(element, defaultTextColor)
    case 'text':
      return renderText(element, defaultTextColor)
    case 'button':
      return renderButton(element, defaultTextColor, primaryGoalElementId)
    case 'image':
      return renderImage(element, primaryGoalElementId)
    case 'icon':
      return renderIcon(element, defaultTextColor, primaryGoalElementId)
    default:
      throw new Error(`Unsupported element content type: ${element.content.type}`)
  }
}
