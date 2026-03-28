import { createElement } from 'react'

import { icons, type LucideIcon } from 'lucide-react'

import { type Element as PageElement } from '@/shared/types'

import {
  buildBaseElementStyle,
  buildButtonStyle,
  buildImageStyle,
  resolvePublishedHref,
} from '../utils/publish-renderer-utils'

interface PublishedPageElementProps {
  element: PageElement
  defaultTextColor: string
}

const HEADING_TAG_BY_LEVEL = {
  1: 'h1',
  2: 'h2',
  3: 'h3',
  4: 'h4',
} as const

function kebabToPascal(value: string): string {
  return value
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function resolveIcon(name: string): LucideIcon | null {
  const pascalName = kebabToPascal(name)
  return (icons as Record<string, LucideIcon>)[pascalName] ?? null
}

function wrapWithLinkIfPresent(
  element: PageElement,
  child: React.JSX.Element,
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
      style: { textDecoration: 'none', color: 'inherit' },
    },
    child,
  )
}

function renderHeading(
  element: PageElement,
  defaultTextColor: string,
): React.JSX.Element {
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

function renderText(
  element: PageElement,
  defaultTextColor: string,
): React.JSX.Element {
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

  return wrapWithLinkIfPresent(element, buttonNode)
}

function renderImage(element: PageElement): React.JSX.Element {
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

  const imageNode =
    createElement('img', {
      src: source,
      alt: element.content.alt,
      style: buildImageStyle(element.styles),
    })

  return wrapWithLinkIfPresent(element, imageNode)
}

function renderIcon(
  element: PageElement,
  defaultTextColor: string,
): React.JSX.Element {
  if (element.content.type !== 'icon') {
    throw new Error('Expected icon element content')
  }

  const icon = resolveIcon(element.content.name)
  const iconSize = element.styles.fontSize ?? 28

  if (!icon) {
    return createElement(
      'span',
      {
        style: {
          ...buildBaseElementStyle(element.styles),
          color: element.styles.color ?? defaultTextColor,
        },
      },
      element.content.name,
    )
  }

  const iconNode = createElement(icon, {
    size: iconSize,
    style: {
      ...buildBaseElementStyle(element.styles),
      color: element.styles.color ?? defaultTextColor,
    },
    'aria-hidden': true,
  })

  return wrapWithLinkIfPresent(element, iconNode)
}

export function PublishedPageElement({
  element,
  defaultTextColor,
}: PublishedPageElementProps): React.JSX.Element {
  switch (element.content.type) {
    case 'heading':
      return renderHeading(element, defaultTextColor)
    case 'text':
      return renderText(element, defaultTextColor)
    case 'button':
      return renderButton(element, defaultTextColor)
    case 'image':
      return renderImage(element)
    case 'icon':
      return renderIcon(element, defaultTextColor)
  }
}
