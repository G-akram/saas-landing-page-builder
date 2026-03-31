import { createElement } from 'react'

import { type Element as PageElement } from '@/shared/types'

import {
  buildBaseElementStyle,
  buildButtonStyle,
  buildImageStyle,
  resolvePublishedHref,
} from '../utils/publish-renderer-utils'
import { getIconSvgPaths } from '../utils/publish-icon-utils'

interface PublishedPageElementProps {
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

  // Use curated inline SVG paths rather than React components from lucide-react.
  // The publishing pipeline uses require('react-dom/server.node') which creates a
  // separate CJS React instance — invoking ESM React components from external packages
  // inside that context causes "invalid hook call" / mismatched React errors.
  const svgPaths = getIconSvgPaths(element.content.name)

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

export function PublishedPageElement({
  element,
  defaultTextColor,
  primaryGoalElementId,
}: PublishedPageElementProps): React.JSX.Element {
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
  }
}
