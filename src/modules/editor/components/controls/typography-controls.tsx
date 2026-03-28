'use client'

import { useEffect, useRef, useState } from 'react'

import { type Element as PageElement, type ElementStyles } from '@/shared/types'

import { FieldRow, BlurInput, INPUT_CLASS, SELECT_CLASS } from './field-row'

type StyleUpdater = (
  styles: Partial<ElementStyles>,
  options?: { pushHistory?: boolean },
) => void

interface TypographyControlsProps {
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

export function TypographyControls({
  element,
  onUpdateStyles,
}: TypographyControlsProps): React.JSX.Element {
  const { styles } = element
  const showTextControls =
    element.type === 'heading' || element.type === 'text' || element.type === 'button'
  const hasLivePreviewSessionRef = useRef(false)
  const [colorDraft, setColorDraft] = useState(pickerColor(styles.color, '#ffffff'))

  useEffect(() => {
    setColorDraft(pickerColor(styles.color, '#ffffff'))
  }, [styles.color])

  return (
    <>
      <FieldRow label="Size">
        <input
          type="number"
          className={INPUT_CLASS}
          value={styles.fontSize ?? ''}
          min={8}
          max={120}
          placeholder="auto"
          onChange={(e) => {
            const val = e.target.value === '' ? undefined : Number(e.target.value)
            onUpdateStyles({ fontSize: val })
          }}
        />
      </FieldRow>
      {showTextControls && (
        <>
          <FieldRow label="Weight">
            <select
              className={SELECT_CLASS}
              value={styles.fontWeight ?? 400}
              onChange={(e) => {
                onUpdateStyles({ fontWeight: Number(e.target.value) })
              }}
            >
              <option value={300}>Light</option>
              <option value={400}>Regular</option>
              <option value={500}>Medium</option>
              <option value={600}>Semibold</option>
              <option value={700}>Bold</option>
              <option value={800}>Extra Bold</option>
            </select>
          </FieldRow>
          <FieldRow label="Align">
            <select
              className={SELECT_CLASS}
              value={styles.textAlign ?? 'left'}
              onChange={(e) => {
                onUpdateStyles({
                  textAlign: e.target.value as 'left' | 'center' | 'right',
                })
              }}
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </FieldRow>
        </>
      )}
      <FieldRow label="Color">
        <div className="flex items-center gap-2">
          <input
            type="color"
            className="h-6 w-6 shrink-0 cursor-pointer rounded border border-white/10"
            value={colorDraft}
            onChange={(e) => {
              const normalized = normalizeHexColor(e.target.value)
              setColorDraft(e.target.value)
              if (!normalized) return
              onUpdateStyles(
                { color: normalized },
                { pushHistory: !hasLivePreviewSessionRef.current },
              )
              hasLivePreviewSessionRef.current = true
            }}
            onBlur={() => {
              const normalized = normalizeHexColor(colorDraft)
              if (normalized && normalized !== styles.color) {
                onUpdateStyles(
                  { color: normalized },
                  { pushHistory: !hasLivePreviewSessionRef.current },
                )
              }
              hasLivePreviewSessionRef.current = false
            }}
          />
          <BlurInput
            value={styles.color ?? ''}
            placeholder="#ffffff"
            onCommit={(color) => {
              const normalized = normalizeHexColor(color)
              onUpdateStyles({ color: normalized ?? undefined })
            }}
          />
        </div>
      </FieldRow>
    </>
  )
}
