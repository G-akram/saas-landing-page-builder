'use client'

import { useEffect, useState } from 'react'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

// ── Types ────────────────────────────────────────────────────────────────────

interface Shortcut {
  keys: string[]
  description: string
}

interface ShortcutGroup {
  title: string
  shortcuts: Shortcut[]
}

// ── Constants ────────────────────────────────────────────────────────────────

function buildGroups(mod: string): ShortcutGroup[] {
  return [
    {
      title: 'History',
      shortcuts: [
        { keys: [mod, 'Z'], description: 'Undo' },
        { keys: [mod, 'Y'], description: 'Redo' },
      ],
    },
    {
      title: 'File',
      shortcuts: [{ keys: [mod, 'S'], description: 'Save' }],
    },
    {
      title: 'Selection',
      shortcuts: [
        { keys: ['Esc'], description: 'Deselect' },
        { keys: ['Enter'], description: 'Edit text' },
        { keys: ['Del'], description: 'Delete element' },
      ],
    },
    {
      title: 'Element',
      shortcuts: [
        { keys: [mod, 'C'], description: 'Copy element' },
        { keys: [mod, 'V'], description: 'Paste element' },
        { keys: [mod, 'D'], description: 'Duplicate section' },
        { keys: [mod, '↑'], description: 'Move element up' },
        { keys: [mod, '↓'], description: 'Move element down' },
      ],
    },
    {
      title: 'View',
      shortcuts: [{ keys: [mod, '/'], description: 'Show shortcuts' }],
    },
  ]
}

// ── Sub-components ───────────────────────────────────────────────────────────

function KeyBadge({ label }: { label: string }): React.JSX.Element {
  return (
    <kbd className="inline-flex h-5 min-w-5 items-center justify-center rounded border border-white/20 bg-white/10 px-1.5 font-mono text-[11px] text-gray-300">
      {label}
    </kbd>
  )
}

function ShortcutRow({ shortcut }: { shortcut: Shortcut }): React.JSX.Element {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm text-gray-300">{shortcut.description}</span>
      <div className="flex shrink-0 items-center gap-1">
        {shortcut.keys.map((key, i) => (
          <KeyBadge key={i} label={key} />
        ))}
      </div>
    </div>
  )
}

// ── Component ────────────────────────────────────────────────────────────────

interface ShortcutsHelpOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function ShortcutsHelpOverlay({
  isOpen,
  onClose,
}: ShortcutsHelpOverlayProps): React.JSX.Element {
  const [mod, setMod] = useState('Ctrl')

  // Detect modifier key client-side to avoid SSR mismatch
  useEffect(() => {
    if (/Mac|iPhone|iPad/.test(navigator.platform)) {
      setMod('⌘')
    }
  }, [])

  const groups = buildGroups(mod)

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent className="border border-white/10 bg-gray-900 text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base font-semibold">Keyboard Shortcuts</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-x-8 gap-y-0 pt-1">
          {groups.map((group) => (
            <div key={group.title}>
              <p className="mb-1 mt-3 text-[10px] font-semibold uppercase tracking-widest text-gray-500">
                {group.title}
              </p>
              <div className="divide-y divide-white/5">
                {group.shortcuts.map((s) => (
                  <ShortcutRow key={s.description} shortcut={s} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
