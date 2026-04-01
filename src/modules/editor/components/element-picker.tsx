'use client'

import { useState } from 'react'
import {
  Heading,
  ImageIcon,
  Mail,
  MousePointerClick,
  Plus,
  Sparkles,
  Type,
} from 'lucide-react'

import { type Element as PageElement } from '@/shared/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

import { heading, text, button, image, icon, form } from '@/shared/lib/block-element-factories'

// ── Types ──────────────────────────────────────────────────────────────────

interface ElementPickerProps {
  slot: number
  onAdd: (element: PageElement) => void
}

interface ElementOption {
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  create: (slot: number) => PageElement
}

// ── Element options ────────────────────────────────────────────────────────

const ELEMENT_OPTIONS: ElementOption[] = [
  {
    label: 'Heading',
    description: 'Title or section heading (H1–H4)',
    icon: Heading,
    create: (slot) =>
      heading(slot, 'New Heading', 2, {
        fontSize: 32,
        fontWeight: 700,
        color: '#111827',
        colorToken: 'text-primary',
      }),
  },
  {
    label: 'Text',
    description: 'Paragraph or descriptive text',
    icon: Type,
    create: (slot) =>
      text(slot, 'Add your text here. Double-click to edit.', {
        fontSize: 16,
        lineHeight: 1.6,
      }),
  },
  {
    label: 'Button',
    description: 'Call-to-action button with link',
    icon: MousePointerClick,
    create: (slot) => button(slot, 'Click Me'),
  },
  {
    label: 'Image',
    description: 'Photo, screenshot, or illustration',
    icon: ImageIcon,
    create: (slot) => image(slot, 'Image description'),
  },
  {
    label: 'Icon',
    description: 'Lucide icon (1,600+ options)',
    icon: Sparkles,
    create: (slot) => icon(slot, 'star'),
  },
  {
    label: 'Form',
    description: 'Lead-capture form with submit handling',
    icon: Mail,
    create: (slot) => form(slot, 'email'),
  },
]

// ── Component ──────────────────────────────────────────────────────────────

export function ElementPicker({ slot, onAdd }: ElementPickerProps): React.JSX.Element {
  const [open, setOpen] = useState(false)

  function handleSelect(option: ElementOption): void {
    onAdd(option.create(slot))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className="flex cursor-pointer items-center gap-1.5 rounded-md border border-dashed border-white/20 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:border-blue-500/40 hover:bg-blue-500/10 hover:text-gray-200"
        aria-label="Add element"
      >
        <Plus className="h-3 w-3" />
        Add element
      </DialogTrigger>

      <DialogContent className="bg-gray-900 text-white ring-white/10 sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-white">Add element</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-1.5">
          {ELEMENT_OPTIONS.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => {
                handleSelect(option)
              }}
              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/5">
                <option.icon className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">{option.label}</div>
                <div className="text-xs text-gray-400">{option.description}</div>
              </div>
            </button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
