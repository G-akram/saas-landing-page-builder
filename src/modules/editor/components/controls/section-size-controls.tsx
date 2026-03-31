'use client'

import { type Section } from '@/shared/types'

import { FieldRow, INPUT_CLASS } from './field-row'

interface SectionSizeControlsProps {
  section: Section
  onUpdateMinHeight: (value: number | undefined) => void
  onUpdatePadding: (padding: Section['padding']) => void
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

export function SectionSizeControls({
  section,
  onUpdateMinHeight,
  onUpdatePadding,
}: SectionSizeControlsProps): React.JSX.Element {
  const { padding } = section

  function updatePadding(side: 'top' | 'right' | 'bottom' | 'left', val: number | undefined): void {
    onUpdatePadding({
      top: padding.top,
      right: padding.right,
      bottom: padding.bottom,
      left: padding.left,
      [side]: val ?? 0,
    })
  }

  return (
    <>
      <FieldRow label="Min H">
        <NumberInput
          value={section.minHeight}
          onChange={onUpdateMinHeight}
          placeholder="auto"
        />
      </FieldRow>

      <div className="mt-1 flex flex-col gap-1">
        <span className="text-xs text-gray-500">Padding (px)</span>
        <div className="grid grid-cols-2 gap-1">
          <div className="flex items-center gap-1">
            <span className="w-4 shrink-0 text-center text-[10px] text-gray-600">T</span>
            <NumberInput value={padding.top} onChange={(v) => updatePadding('top', v)} />
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 shrink-0 text-center text-[10px] text-gray-600">R</span>
            <NumberInput value={padding.right} onChange={(v) => updatePadding('right', v)} />
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 shrink-0 text-center text-[10px] text-gray-600">B</span>
            <NumberInput value={padding.bottom} onChange={(v) => updatePadding('bottom', v)} />
          </div>
          <div className="flex items-center gap-1">
            <span className="w-4 shrink-0 text-center text-[10px] text-gray-600">L</span>
            <NumberInput value={padding.left} onChange={(v) => updatePadding('left', v)} />
          </div>
        </div>
      </div>
    </>
  )
}
