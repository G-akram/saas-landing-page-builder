'use client'

import { type Element as PageElement, type ElementStyles } from '@/shared/types'

import { FieldRow, BlurInput, INPUT_CLASS } from './field-row'

type StyleUpdater = (styles: Partial<ElementStyles>, options?: { pushHistory?: boolean }) => void

interface SpacingControlsProps {
  element: PageElement
  onUpdateStyles: StyleUpdater
}

function NumberInput({
  value,
  onChange,
  placeholder = '0',
}: {
  value: number | undefined
  onChange: (val: number | undefined) => void
  placeholder?: string
}): React.JSX.Element {
  return (
    <input
      type="number"
      className={INPUT_CLASS}
      value={value ?? ''}
      min={0}
      placeholder={placeholder}
      onChange={(e) => {
        const val = e.target.value === '' ? undefined : Number(e.target.value)
        onChange(val)
      }}
    />
  )
}

export function SpacingControls({
  element,
  onUpdateStyles,
}: SpacingControlsProps): React.JSX.Element {
  const { styles } = element
  const padding = styles.padding

  function updatePadding(side: 'top' | 'right' | 'bottom' | 'left', val: number | undefined): void {
    onUpdateStyles({
      padding: {
        top: padding?.top ?? 0,
        right: padding?.right ?? 0,
        bottom: padding?.bottom ?? 0,
        left: padding?.left ?? 0,
        [side]: val ?? 0,
      },
    })
  }

  return (
    <>
      <FieldRow label="Width">
        <BlurInput
          value={styles.width ?? ''}
          placeholder="auto"
          onCommit={(val) => {
            onUpdateStyles({ width: val === '' ? undefined : val })
          }}
        />
      </FieldRow>
      <FieldRow label="Height">
        <BlurInput
          value={styles.height ?? ''}
          placeholder="auto"
          onCommit={(val) => {
            onUpdateStyles({ height: val === '' ? undefined : val })
          }}
        />
      </FieldRow>
      <FieldRow label="Max W">
        <BlurInput
          value={styles.maxWidth ?? ''}
          placeholder="none"
          onCommit={(val) => {
            onUpdateStyles({ maxWidth: val === '' ? undefined : val })
          }}
        />
      </FieldRow>
      <FieldRow label="Margin T">
        <NumberInput
          value={styles.marginTop}
          onChange={(val) => onUpdateStyles({ marginTop: val })}
        />
      </FieldRow>
      <FieldRow label="Margin B">
        <NumberInput
          value={styles.marginBottom}
          onChange={(val) => onUpdateStyles({ marginBottom: val })}
        />
      </FieldRow>

      <div className="mt-1 flex flex-col gap-1">
        <span className="text-xs text-gray-500">Padding (px)</span>
        <div className="grid grid-cols-2 gap-1">
          <div className="flex items-center gap-1">
            <span className="w-4 shrink-0 text-center text-[10px] text-gray-600">T</span>
            <NumberInput value={padding?.top} onChange={(v) => updatePadding('top', v)} />
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 shrink-0 text-center text-[10px] text-gray-600">R</span>
            <NumberInput value={padding?.right} onChange={(v) => updatePadding('right', v)} />
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 shrink-0 text-center text-[10px] text-gray-600">B</span>
            <NumberInput value={padding?.bottom} onChange={(v) => updatePadding('bottom', v)} />
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 shrink-0 text-center text-[10px] text-gray-600">L</span>
            <NumberInput value={padding?.left} onChange={(v) => updatePadding('left', v)} />
          </div>
        </div>
      </div>
    </>
  )
}
