'use client'

import { useState, useEffect } from 'react'

// ── Shared constants ────────────────────────────────────────────────────────

export const INPUT_CLASS =
  'w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-blue-500'
export const SELECT_CLASS =
  'w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-blue-500'
export const TEXTAREA_CLASS =
  'w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-blue-500'

// ── Field row ───────────────────────────────────────────────────────────────

interface FieldRowProps {
  label: string
  children: React.ReactNode
}

export function FieldRow({ label, children }: FieldRowProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-xs text-gray-500">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

// ── Blur-commit text input ──────────────────────────────────────────────────

export function BlurInput({
  value,
  onCommit,
  placeholder,
}: {
  value: string
  onCommit: (value: string) => void
  placeholder?: string
}): React.JSX.Element {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    setLocal(value)
  }, [value])

  return (
    <input
      className={INPUT_CLASS}
      value={local}
      placeholder={placeholder}
      onChange={(e) => {
        setLocal(e.target.value)
      }}
      onBlur={() => {
        if (local !== value) onCommit(local)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter') e.currentTarget.blur()
      }}
    />
  )
}

export function BlurTextarea({
  value,
  onCommit,
  placeholder,
  rows = 4,
}: {
  value: string
  onCommit: (value: string) => void
  placeholder?: string
  rows?: number
}): React.JSX.Element {
  const [local, setLocal] = useState(value)

  useEffect(() => {
    setLocal(value)
  }, [value])

  return (
    <textarea
      className={`${TEXTAREA_CLASS} min-h-20 resize-y leading-relaxed`}
      value={local}
      placeholder={placeholder}
      rows={rows}
      onChange={(e) => {
        setLocal(e.target.value)
      }}
      onBlur={() => {
        if (local !== value) onCommit(local)
      }}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          e.currentTarget.blur()
        }
      }}
    />
  )
}
