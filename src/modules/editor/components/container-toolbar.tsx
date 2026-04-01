'use client'

import { ChevronDown, ChevronUp, X } from 'lucide-react'

interface ContainerToolbarProps {
  onMoveUp?: (() => void) | undefined
  onMoveDown?: (() => void) | undefined
  onDelete?: (() => void) | undefined
}

export function ContainerToolbar({
  onMoveUp,
  onMoveDown,
  onDelete,
}: ContainerToolbarProps): React.JSX.Element {
  return (
    <div className="absolute -top-7 right-0 z-20 flex items-center gap-0.5 rounded border border-white/10 bg-gray-800 px-1 py-0.5 shadow-lg">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onMoveUp?.()
        }}
        disabled={!onMoveUp}
        aria-label="Move card up"
        className={`rounded p-0.5 transition-colors ${
          onMoveUp
            ? 'text-gray-400 hover:bg-white/10 hover:text-white'
            : 'cursor-default text-gray-700'
        }`}
      >
        <ChevronUp className="h-3.5 w-3.5" />
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onMoveDown?.()
        }}
        disabled={!onMoveDown}
        aria-label="Move card down"
        className={`rounded p-0.5 transition-colors ${
          onMoveDown
            ? 'text-gray-400 hover:bg-white/10 hover:text-white'
            : 'cursor-default text-gray-700'
        }`}
      >
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {onDelete ? (
        <>
          <div className="mx-0.5 h-3 w-px bg-white/10" />
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            aria-label="Delete card"
            className="rounded p-0.5 text-gray-400 transition-colors hover:bg-red-500/20 hover:text-red-400"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </>
      ) : null}
    </div>
  )
}
