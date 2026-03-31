'use client'

import { type BackgroundConfig } from '@/shared/types'

import { ImageUploadButton } from '../image-upload-button'
import { FieldRow, BlurInput, SELECT_CLASS } from './field-row'

// ── Types ────────────────────────────────────────────────────────────────────

interface SectionBackgroundControlsProps {
  background: BackgroundConfig
  onUpdate: (background: BackgroundConfig) => void
}

// ── Component ────────────────────────────────────────────────────────────────

export function SectionBackgroundControls({
  background,
  onUpdate,
}: SectionBackgroundControlsProps): React.JSX.Element {
  return (
    <>
      <FieldRow label="Type">
        <select
          className={SELECT_CLASS}
          value={background.type}
          onChange={(e) => {
            onUpdate({
              ...background,
              type: e.target.value as BackgroundConfig['type'],
              value: '',
            })
          }}
        >
          <option value="color">Color</option>
          <option value="gradient">Gradient</option>
          <option value="image">Image</option>
        </select>
      </FieldRow>

      {background.type === 'image' ? (
        <>
          <ImageUploadButton
            {...(background.value ? { currentSrc: background.value } : {})}
            onUpload={(value) => {
              onUpdate({ ...background, value })
            }}
          />
          <FieldRow label="Overlay">
            <BlurInput
              value={background.overlay ?? ''}
              placeholder="rgba(0,0,0,0.4)"
              onCommit={(overlay) => {
                onUpdate({ ...background, overlay: overlay || undefined })
              }}
            />
          </FieldRow>
        </>
      ) : (
        <FieldRow label="Value">
          <BlurInput
            value={background.value}
            placeholder={background.type === 'color' ? '#1a1a2e' : 'linear-gradient(...)'}
            onCommit={(value) => {
              onUpdate({ ...background, value })
            }}
          />
        </FieldRow>
      )}
    </>
  )
}
