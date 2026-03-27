'use client'

import { useState, useEffect } from 'react'

import { type Element as PageElement, type ElementStyles } from '@/shared/types'

// ── Shared helpers ──────────────────────────────────────────────────────────

type StyleUpdater = (styles: Partial<ElementStyles>) => void
type ContentUpdater = (content: PageElement['content']) => void

interface FieldRowProps {
  label: string
  children: React.ReactNode
}

function FieldRow({ label, children }: FieldRowProps): React.JSX.Element {
  return (
    <div className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-xs text-gray-500">{label}</span>
      <div className="flex-1">{children}</div>
    </div>
  )
}

const INPUT_CLASS =
  'w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-blue-500'
const SELECT_CLASS =
  'w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-blue-500'

// ── Blur-commit text input ──────────────────────────────────────────────────

function BlurInput({
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

// ── Content controls ────────────────────────────────────────────────────────

interface ContentControlsProps {
  element: PageElement
  onUpdateContent: ContentUpdater
}

export function ContentControls({
  element,
  onUpdateContent,
}: ContentControlsProps): React.JSX.Element | null {
  const { content } = element

  switch (content.type) {
    case 'heading':
      return (
        <>
          <FieldRow label="Text">
            <BlurInput
              value={content.text}
              onCommit={(text) => {
                onUpdateContent({ ...content, text })
              }}
            />
          </FieldRow>
          <FieldRow label="Level">
            <select
              className={SELECT_CLASS}
              value={content.level}
              onChange={(e) => {
                onUpdateContent({
                  ...content,
                  level: Number(e.target.value) as 1 | 2 | 3 | 4,
                })
              }}
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
              <option value={4}>H4</option>
            </select>
          </FieldRow>
        </>
      )
    case 'text':
      return (
        <FieldRow label="Text">
          <BlurInput
            value={content.text}
            onCommit={(text) => {
              onUpdateContent({ ...content, text })
            }}
          />
        </FieldRow>
      )
    case 'button':
      return (
        <FieldRow label="Label">
          <BlurInput
            value={content.text}
            onCommit={(text) => {
              onUpdateContent({ ...content, text })
            }}
          />
        </FieldRow>
      )
    case 'image':
      return (
        <>
          <FieldRow label="Source">
            <BlurInput
              value={content.src}
              placeholder="https://..."
              onCommit={(src) => {
                onUpdateContent({ ...content, src })
              }}
            />
          </FieldRow>
          <FieldRow label="Alt text">
            <BlurInput
              value={content.alt}
              onCommit={(alt) => {
                onUpdateContent({ ...content, alt })
              }}
            />
          </FieldRow>
        </>
      )
    case 'icon':
      return (
        <FieldRow label="Icon">
          <BlurInput
            value={content.name}
            placeholder="e.g. arrow-right"
            onCommit={(name) => {
              onUpdateContent({ ...content, name })
            }}
          />
        </FieldRow>
      )
  }
}

// ── Typography controls ─────────────────────────────────────────────────────

interface StyleControlsProps {
  element: PageElement
  onUpdateStyles: StyleUpdater
}

export function TypographyControls({
  element,
  onUpdateStyles,
}: StyleControlsProps): React.JSX.Element {
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

// ── Appearance controls ─────────────────────────────────────────────────────

export function AppearanceControls({
  element,
  onUpdateStyles,
}: StyleControlsProps): React.JSX.Element | null {
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
