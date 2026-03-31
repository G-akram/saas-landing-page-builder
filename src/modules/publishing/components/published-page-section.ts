import { createElement } from 'react'

import { type Section } from '@/shared/types'

import {
  buildGridLayoutStyle,
  buildPublishedSlotStyle,
  buildSectionStyle,
  buildSlotStyle,
  buildStackLayoutStyle,
  groupElementsBySlot,
  resolveDefaultTextColor,
  sanitizeSectionId,
} from '../utils/publish-renderer-utils'
import { PublishedPageElement } from './published-page-element'

interface PublishedPageSectionProps {
  slug: string
  section: Section
  primaryGoalElementId: string | null
}

function renderGridSection(
  slug: string,
  section: Section,
  defaultTextColor: string,
  primaryGoalElementId: string | null,
): React.JSX.Element {
  const columns = section.layout.columns ?? 1
  const slots = groupElementsBySlot(section.elements)
  const slotIndices = Array.from({ length: columns }, (_, index) => index)

  return createElement(
    'div',
    {
      className: 'pb-grid',
      style: buildGridLayoutStyle(columns, section.layout.gap),
    },
    ...slotIndices.map((slotIndex) => {
      const elements = slots.get(slotIndex) ?? []

      return createElement(
        'div',
        {
          key: slotIndex,
          className: 'pb-slot',
          style: {
            ...buildSlotStyle(section.layout),
            ...(section.slotStyle ? buildPublishedSlotStyle(section.slotStyle) : {}),
          },
        },
        ...elements.map((element) =>
          createElement(PublishedPageElement, {
            key: element.id,
            slug,
            element,
            defaultTextColor,
            primaryGoalElementId,
          }),
        ),
      )
    }),
  )
}

function renderStackSection(
  slug: string,
  section: Section,
  defaultTextColor: string,
  primaryGoalElementId: string | null,
): React.JSX.Element {
  const allElements = [...groupElementsBySlot(section.elements).values()].flat()

  return createElement(
    'div',
    {
      className: 'pb-stack',
      style: buildStackLayoutStyle(section.layout),
    },
    ...allElements.map((element) =>
      createElement(PublishedPageElement, {
        key: element.id,
        slug,
        element,
        defaultTextColor,
        primaryGoalElementId,
      }),
    ),
  )
}

export function PublishedPageSection({
  slug,
  section,
  primaryGoalElementId,
}: PublishedPageSectionProps): React.JSX.Element {
  const defaultTextColor = resolveDefaultTextColor(section)

  return createElement(
    'section',
    {
      id: sanitizeSectionId(section.id),
      className: 'pb-section',
      style: buildSectionStyle(section),
      'data-section-type': section.type,
      'data-variant-style-id': section.variantStyleId,
    },
    section.background.overlay
      ? createElement('div', {
          'aria-hidden': true,
          className: 'pb-overlay',
          style: { backgroundColor: section.background.overlay },
        })
      : null,
    createElement(
      'div',
      { className: 'pb-content' },
      section.layout.type === 'grid' && section.layout.columns
        ? renderGridSection(slug, section, defaultTextColor, primaryGoalElementId)
        : renderStackSection(slug, section, defaultTextColor, primaryGoalElementId),
    ),
  )
}
