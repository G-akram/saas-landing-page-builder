'use client'

import { useEffect, useRef, useState } from 'react'

import { type Element as PageElement, type ElementStyles } from '@/shared/types'

import { FieldRow, BlurInput, INPUT_CLASS } from './field-row'

type StyleUpdater = (
  styles: Partial<ElementStyles>,
  options?: { pushHistory?: boolean },
) => void

interface AppearanceControlsProps {
  element: PageElement
  onUpdateStyles: StyleUpdater
}

function normalizeHexColor(value: string): string | null {
  const trimmed = value.trim()
  const match = /^#([0-9a-fA-F]{6})$/.exec(trimmed)
  if (!match) return null
  const hex = match[1]
  if (!hex) return null
  return `#${hex.toLowerCase()}`
}

function pickerColor(value: string | undefined, fallback: string): string {
  if (!value) return fallback
  return normalizeHexColor(value) ?? fallback
}

export function AppearanceControls({
  element,
  onUpdateStyles,
}: AppearanceControlsProps): React.JSX.Element | null {
  const { styles } = element
  const showBg = element.type === 'button'
  const showRadius = element.type === 'button' || element.type === 'image'
  const hasLivePreviewSessionRef = useRef(false)
  const [bgDraft, setBgDraft] = useState(
    pickerColor(styles.backgroundColor, '#3b82f6'),
  )

  useEffect(() => {
    setBgDraft(pickerColor(styles.backgroundColor, '#3b82f6'))
  }, [styles.backgroundColor])

  if (!showBg && !showRadius) return null

  return (
    <>
      {showBg && (
        <FieldRow label="Bg Color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="h-6 w-6 shrink-0 cursor-pointer rounded border border-white/10"
              value={bgDraft}
              onChange={(e) => {
                const normalized = normalizeHexColor(e.target.value)
                setBgDraft(e.target.value)
                if (!normalized) return
                onUpdateStyles(
                  { backgroundColor: normalized },
                  { pushHistory: !hasLivePreviewSessionRef.current },
                )
                hasLivePreviewSessionRef.current = true
              }}
              onBlur={() => {
                const normalized = normalizeHexColor(bgDraft)
                if (normalized && normalized !== styles.backgroundColor) {
                  onUpdateStyles(
                    { backgroundColor: normalized },
                    { pushHistory: !hasLivePreviewSessionRef.current },
                  )
                }
                hasLivePreviewSessionRef.current = false
              }}
            />
            <BlurInput
              value={styles.backgroundColor ?? ''}
              placeholder="#3b82f6"
              onCommit={(bg) => {
                const normalized = normalizeHexColor(bg)
                onUpdateStyles({ backgroundColor: normalized ?? undefined })
              }}
            />
          </div>
        </FieldRow>
      )}
      {showRadius && (
        <FieldRow label="Radius">
          <input
            type="number"
            className={INPUT_CLASS}
            value={styles.borderRadius ?? ''}
            min={0}
            max={100}
            placeholder="0"
            onChange={(e) => {
              const val = e.target.value === '' ? undefined : Number(e.target.value)
              onUpdateStyles({ borderRadius: val })
            }}
          />
        </FieldRow>
      )}
    </>
  )
}
