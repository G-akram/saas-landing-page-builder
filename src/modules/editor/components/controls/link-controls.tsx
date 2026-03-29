'use client'

import { type Element as PageElement, type Section } from '@/shared/types'

import { SECTION_TEMPLATES } from '../../lib/section-templates'
import { BlurInput, FieldRow, SELECT_CLASS } from './field-row'

interface LinkControlsProps {
  element: PageElement
  sections: Section[]
  onUpdateLink: (link: PageElement['link']) => void
}

type LinkTypeOption = 'none' | 'url' | 'section'

function getLinkTypeValue(element: PageElement): LinkTypeOption {
  if (!element.link) {
    return 'none'
  }

  if (element.link.type === 'section') {
    return 'section'
  }

  return 'url'
}

export function LinkControls({
  element,
  sections,
  onUpdateLink,
}: LinkControlsProps): React.JSX.Element {
  const linkType = getLinkTypeValue(element)
  const currentLink = element.link
  const urlLink = currentLink?.type === 'url' ? currentLink : null
  const sectionLink = currentLink?.type === 'section' ? currentLink : null

  function handleChangeLinkType(nextType: LinkTypeOption): void {
    if (nextType === 'none') {
      onUpdateLink(undefined)
      return
    }

    if (nextType === 'url') {
      onUpdateLink({
        type: 'url',
        value: currentLink?.type === 'url' ? currentLink.value : '',
        newTab: currentLink?.type === 'url' ? currentLink.newTab : false,
      })
      return
    }

    const fallbackSectionId = sections[0]?.id ?? ''
    onUpdateLink({
      type: 'section',
      value: currentLink?.type === 'section' ? currentLink.value : fallbackSectionId,
      newTab: false,
    })
  }

  return (
    <>
      <FieldRow label="Type">
        <select
          className={SELECT_CLASS}
          value={linkType}
          onChange={(event) => {
            handleChangeLinkType(event.target.value as LinkTypeOption)
          }}
        >
          <option value="none">None</option>
          <option value="url">URL</option>
          <option value="section">Section</option>
        </select>
      </FieldRow>

      {urlLink && (
        <>
          <FieldRow label="URL">
            <BlurInput
              value={urlLink.value}
              placeholder="https://example.com"
              onCommit={(value) => {
                onUpdateLink({ ...urlLink, value })
              }}
            />
          </FieldRow>

          <label className="flex items-center gap-2 text-xs text-gray-400">
            <input
              type="checkbox"
              checked={urlLink.newTab}
              onChange={(event) => {
                onUpdateLink({ ...urlLink, newTab: event.target.checked })
              }}
              className="rounded border-white/20 bg-white/5"
            />
            <span>Open in new tab</span>
          </label>
        </>
      )}

      {sectionLink && (
        <FieldRow label="Section">
          <select
            className={SELECT_CLASS}
            value={sectionLink.value}
            onChange={(event) => {
              onUpdateLink({ ...sectionLink, value: event.target.value, newTab: false })
            }}
          >
            {sections.map((section, index) => {
              const label = SECTION_TEMPLATES[section.type].label

              return (
                <option key={section.id} value={section.id}>
                  {label} {index + 1}
                </option>
              )
            })}
          </select>
        </FieldRow>
      )}
    </>
  )
}
