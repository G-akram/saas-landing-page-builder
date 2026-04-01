'use client'

import { AlignLeft, AlignCenter, AlignRight } from 'lucide-react'

import { type SectionLayout } from '@/shared/types'

import { FieldRow } from './field-row'

// ── Props ────────────────────────────────────────────────────────────────────

interface SectionLayoutControlsProps {
  layout: SectionLayout
  onUpdate: (layout: SectionLayout) => void
}

// ── Sub-components ────────────────────────────────────────────────────────────

const SEGMENT_BASE =
  'flex-1 cursor-pointer rounded px-1.5 py-1 text-[11px] font-medium transition-colors'
const SEGMENT_ACTIVE = 'bg-blue-600 text-white'
const SEGMENT_INACTIVE = 'text-gray-400 hover:bg-white/10 hover:text-white'

interface SegmentButtonProps {
  label: string
  isActive: boolean
  onClick: () => void
  children?: React.ReactNode
}

function SegmentButton({ label, isActive, onClick, children }: SegmentButtonProps): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`${SEGMENT_BASE} ${isActive ? SEGMENT_ACTIVE : SEGMENT_INACTIVE}`}
    >
      {children ?? label}
    </button>
  )
}

// ── Component ─────────────────────────────────────────────────────────────────

export function SectionLayoutControls({
  layout,
  onUpdate,
}: SectionLayoutControlsProps): React.JSX.Element {
  function patch(updates: Partial<SectionLayout>): void {
    onUpdate({ ...layout, ...updates })
  }

  return (
    <>
      {/* Layout type */}
      <FieldRow label="Type">
        <div className="flex gap-1">
          <SegmentButton label="Stack" isActive={layout.type === 'stack'} onClick={() => patch({ type: 'stack' })} />
          <SegmentButton label="Grid" isActive={layout.type === 'grid'} onClick={() => patch({ type: 'grid' })} />
        </div>
      </FieldRow>

      {/* Columns — grid only */}
      {layout.type === 'grid' && (
        <FieldRow label="Cols">
          <div className="flex gap-1">
            {([2, 3, 4] as const).map((n) => (
              <SegmentButton
                key={n}
                label={String(n)}
                isActive={(layout.columns ?? 3) === n}
                onClick={() => patch({ columns: n })}
              />
            ))}
          </div>
        </FieldRow>
      )}

      {/* Gap */}
      <FieldRow label="Gap">
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={0}
            max={64}
            step={4}
            value={layout.gap}
            onChange={(e) => patch({ gap: Number(e.target.value) })}
            className="h-1 flex-1 cursor-pointer accent-blue-500"
          />
          <span className="w-8 shrink-0 text-right text-[11px] tabular-nums text-gray-400">
            {layout.gap}px
          </span>
        </div>
      </FieldRow>

      {/* Horizontal align */}
      <FieldRow label="Align">
        <div className="flex gap-1">
          <SegmentButton label="Align left" isActive={layout.align === 'left'} onClick={() => patch({ align: 'left' })}>
            <AlignLeft className="mx-auto h-3.5 w-3.5" />
          </SegmentButton>
          <SegmentButton label="Align center" isActive={layout.align === 'center'} onClick={() => patch({ align: 'center' })}>
            <AlignCenter className="mx-auto h-3.5 w-3.5" />
          </SegmentButton>
          <SegmentButton label="Align right" isActive={layout.align === 'right'} onClick={() => patch({ align: 'right' })}>
            <AlignRight className="mx-auto h-3.5 w-3.5" />
          </SegmentButton>
        </div>
      </FieldRow>

      {/* Vertical align */}
      <FieldRow label="V-Align">
        <div className="flex gap-1">
          <SegmentButton label="Align top" isActive={layout.verticalAlign === 'top'} onClick={() => patch({ verticalAlign: 'top' })}>
            Top
          </SegmentButton>
          <SegmentButton label="Align middle" isActive={layout.verticalAlign === 'center'} onClick={() => patch({ verticalAlign: 'center' })}>
            Mid
          </SegmentButton>
          <SegmentButton label="Align bottom" isActive={layout.verticalAlign === 'bottom'} onClick={() => patch({ verticalAlign: 'bottom' })}>
            Bot
          </SegmentButton>
        </div>
      </FieldRow>
    </>
  )
}
