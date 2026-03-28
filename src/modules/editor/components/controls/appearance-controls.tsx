'use client'

import { type Element as PageElement, type ElementStyles } from '@/shared/types'

import { FieldRow, BlurInput, INPUT_CLASS } from './field-row'

// ── Types ────────────────────────────────────────────────────────────────────

type StyleUpdater = (styles: Partial<ElementStyles>) => void

interface AppearanceControlsProps {
  element: PageElement
  onUpdateStyles: StyleUpdater
}

// ── Component ────────────────────────────────────────────────────────────────

export function AppearanceControls({
  element,
  onUpdateStyles,
}: AppearanceControlsProps): React.JSX.Element | null {
  const { styles } = element
  const showBg = element.type === 'button'
  const showRadius = element.type === 'button' || element.type === 'image'

  if (!showBg && !showRadius) return null

  return (
    <>
      {showBg && (
        <FieldRow label="Bg Color">
          <div className="flex items-center gap-2">
            <input
              type="color"
              className="h-6 w-6 shrink-0 cursor-pointer rounded border border-white/10"
              value={styles.backgroundColor ?? '#3b82f6'}
              onChange={(e) => {
                onUpdateStyles({ backgroundColor: e.target.value })
              }}
            />
            <BlurInput
              value={styles.backgroundColor ?? ''}
              placeholder="#3b82f6"
              onCommit={(bg) => {
                onUpdateStyles({ backgroundColor: bg || undefined })
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
