'use client'

import { type ContainerElement, type ContainerStyle, type ContainerLayout } from '@/shared/types'

import { FieldRow, BlurInput, INPUT_CLASS, SELECT_CLASS } from './field-row'

// ── Types ──────────────────────────────────────────────────────────────────

type ContainerStyleUpdater = (updates: Partial<ContainerStyle>) => void
type ContainerLayoutUpdater = (updates: Partial<ContainerLayout>) => void

interface ContainerControlsProps {
  container: ContainerElement
  onUpdateContainerStyle: ContainerStyleUpdater
  onUpdateContainerLayout: ContainerLayoutUpdater
}

// ── Component ───────────────────────────────────────────────────────────────

export function ContainerControls({
  container,
  onUpdateContainerStyle,
  onUpdateContainerLayout,
}: ContainerControlsProps): React.JSX.Element {
  const { containerStyle, containerLayout } = container

  return (
    <>
      {/* Layout */}
      <FieldRow label="Direction">
        <select
          className={SELECT_CLASS}
          value={containerLayout.direction}
          onChange={(e) => {
            onUpdateContainerLayout({ direction: e.target.value as ContainerLayout['direction'] })
          }}
        >
          <option value="column">Stack (vertical)</option>
          <option value="row">Row (horizontal)</option>
        </select>
      </FieldRow>

      <FieldRow label="Gap">
        <input
          type="number"
          className={INPUT_CLASS}
          value={containerLayout.gap}
          min={0}
          max={64}
          onChange={(e) => {
            onUpdateContainerLayout({ gap: Number(e.target.value) })
          }}
        />
      </FieldRow>

      <FieldRow label="Align">
        <select
          className={SELECT_CLASS}
          value={containerLayout.align ?? 'left'}
          onChange={(e) => {
            onUpdateContainerLayout({ align: e.target.value as ContainerLayout['align'] })
          }}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </select>
      </FieldRow>

      {/* Appearance */}
      <FieldRow label="Bg Color">
        <BlurInput
          value={containerStyle.backgroundColor ?? ''}
          placeholder="#ffffff"
          onCommit={(val) => {
            onUpdateContainerStyle({ backgroundColor: val || undefined })
          }}
        />
      </FieldRow>

      <FieldRow label="Radius">
        <input
          type="number"
          className={INPUT_CLASS}
          value={containerStyle.borderRadius ?? ''}
          min={0}
          max={64}
          placeholder="0"
          onChange={(e) => {
            const val = e.target.value === '' ? undefined : Number(e.target.value)
            onUpdateContainerStyle({ borderRadius: val })
          }}
        />
      </FieldRow>

      <FieldRow label="Shadow">
        <BlurInput
          value={containerStyle.boxShadow ?? ''}
          placeholder="0 2px 16px rgba(0,0,0,0.1)"
          onCommit={(val) => {
            onUpdateContainerStyle({ boxShadow: val || undefined })
          }}
        />
      </FieldRow>

      <FieldRow label="Border">
        <BlurInput
          value={containerStyle.border ?? ''}
          placeholder="1px solid rgba(0,0,0,0.1)"
          onCommit={(val) => {
            onUpdateContainerStyle({ border: val || undefined })
          }}
        />
      </FieldRow>

      <FieldRow label="Blur">
        <BlurInput
          value={containerStyle.backdropFilter ?? ''}
          placeholder="blur(12px)"
          onCommit={(val) => {
            onUpdateContainerStyle({ backdropFilter: val || undefined })
          }}
        />
      </FieldRow>

      <FieldRow label="Padding T">
        <input
          type="number"
          className={INPUT_CLASS}
          value={containerStyle.padding?.top ?? ''}
          min={0}
          placeholder="0"
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : Number(e.target.value)
            onUpdateContainerStyle({
              padding: { top: val, bottom: containerStyle.padding?.bottom ?? 0, left: containerStyle.padding?.left ?? 0, right: containerStyle.padding?.right ?? 0 },
            })
          }}
        />
      </FieldRow>

      <FieldRow label="Padding B">
        <input
          type="number"
          className={INPUT_CLASS}
          value={containerStyle.padding?.bottom ?? ''}
          min={0}
          placeholder="0"
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : Number(e.target.value)
            onUpdateContainerStyle({
              padding: { top: containerStyle.padding?.top ?? 0, bottom: val, left: containerStyle.padding?.left ?? 0, right: containerStyle.padding?.right ?? 0 },
            })
          }}
        />
      </FieldRow>

      <FieldRow label="Padding LR">
        <input
          type="number"
          className={INPUT_CLASS}
          value={containerStyle.padding?.left ?? ''}
          min={0}
          placeholder="0"
          onChange={(e) => {
            const val = e.target.value === '' ? 0 : Number(e.target.value)
            onUpdateContainerStyle({
              padding: { top: containerStyle.padding?.top ?? 0, bottom: containerStyle.padding?.bottom ?? 0, left: val, right: val },
            })
          }}
        />
      </FieldRow>
    </>
  )
}
