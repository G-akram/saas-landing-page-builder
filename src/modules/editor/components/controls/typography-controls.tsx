'use client'

import { type Element as PageElement, type ElementStyles } from '@/shared/types'

import { FieldRow, BlurInput, INPUT_CLASS, SELECT_CLASS } from './field-row'

// ── Types ────────────────────────────────────────────────────────────────────

type StyleUpdater = (styles: Partial<ElementStyles>) => void

interface TypographyControlsProps {
  element: PageElement
  onUpdateStyles: StyleUpdater
}

// ── Component ────────────────────────────────────────────────────────────────

export function TypographyControls({
  element,
  onUpdateStyles,
}: TypographyControlsProps): React.JSX.Element {
  const { styles } = element
  const showTextControls =
    element.type === 'heading' || element.type === 'text' || element.type === 'button'

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
            value={styles.color ?? '#ffffff'}
            onChange={(e) => {
              onUpdateStyles({ color: e.target.value })
            }}
          />
          <BlurInput
            value={styles.color ?? ''}
            placeholder="#ffffff"
            onCommit={(color) => {
              onUpdateStyles({ color: color || undefined })
            }}
          />
        </div>
      </FieldRow>
    </>
  )
}
