'use client'

import { cn } from '@/shared/lib/utils'

import { type SaveStatus } from '../hooks/use-auto-save'

// ── Props ────────────────────────────────────────────────────────────────────

interface SaveStatusIndicatorProps {
  status: SaveStatus
}

// ── Constants ────────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  idle: { label: '', className: '' },
  saving: { label: 'Saving…', className: 'text-gray-400' },
  saved: { label: 'Saved', className: 'text-green-400' },
  error: { label: 'Save failed', className: 'text-red-400' },
} satisfies Record<SaveStatus, { label: string; className: string }>

// ── Component ────────────────────────────────────────────────────────────────

export function SaveStatusIndicator({ status }: SaveStatusIndicatorProps): React.JSX.Element {
  const { label, className } = STATUS_CONFIG[status]

  return (
    <span className={cn('text-xs transition-colors', className)} aria-live="polite">
      {label}
    </span>
  )
}
