'use client'

import { type AtomicElement } from '@/shared/types'

import { ImageUploadButton } from '../image-upload-button'
import { FieldRow, BlurInput, BlurTextarea, SELECT_CLASS } from './field-row'

// ── Types ────────────────────────────────────────────────────────────────────

type ContentUpdater = (content: AtomicElement['content']) => void

interface ContentControlsProps {
  element: AtomicElement
  onUpdateContent: ContentUpdater
}

// ── Component ────────────────────────────────────────────────────────────────

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
              className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-blue-500"
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
    case 'text': {
      const textMode = content.mode ?? 'multiline'
      return (
        <>
          <FieldRow label="Text">
            {textMode === 'multiline' ? (
              <BlurTextarea
                value={content.text}
                onCommit={(text) => {
                  onUpdateContent({ ...content, text })
                }}
              />
            ) : (
              <BlurInput
                value={content.text}
                onCommit={(text) => {
                  onUpdateContent({ ...content, text })
                }}
              />
            )}
          </FieldRow>
          <FieldRow label="Mode">
            <select
              className={SELECT_CLASS}
              value={textMode}
              onChange={(e) => {
                onUpdateContent({
                  ...content,
                  mode: e.target.value as 'inline' | 'multiline',
                })
              }}
            >
              <option value="multiline">Multiline</option>
              <option value="inline">Inline</option>
            </select>
          </FieldRow>
        </>
      )
    }
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
          <ImageUploadButton
            {...(content.src ? { currentSrc: content.src } : {})}
            onUpload={(src) => {
              onUpdateContent({ ...content, src })
            }}
          />
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
    case 'form':
      return (
        <>
          <FieldRow label="Variant">
            <select
              className={SELECT_CLASS}
              value={content.variant}
              onChange={(e) => {
                onUpdateContent({
                  ...content,
                  variant: e.target.value as 'email' | 'contact' | 'newsletter',
                })
              }}
            >
              <option value="email">Email capture</option>
              <option value="contact">Contact form</option>
              <option value="newsletter">Newsletter signup</option>
            </select>
          </FieldRow>
          <FieldRow label="Target">
            <select
              className={SELECT_CLASS}
              value={content.submitTarget}
              onChange={(e) => {
                onUpdateContent({
                  ...content,
                  submitTarget: e.target.value as 'database' | 'webhook',
                })
              }}
            >
              <option value="database">Store to DB</option>
              <option value="webhook">Send to webhook</option>
            </select>
          </FieldRow>
          {content.submitTarget === 'webhook' ? (
            <FieldRow label="Webhook">
              <BlurInput
                value={content.webhookUrl ?? ''}
                placeholder="https://example.com/lead-webhook"
                onCommit={(webhookUrl) => {
                  const trimmed = webhookUrl.trim()
                  onUpdateContent({ ...content, webhookUrl: trimmed.length > 0 ? trimmed : undefined })
                }}
              />
            </FieldRow>
          ) : null}
          <FieldRow label="Email PH">
            <BlurInput
              value={content.emailPlaceholder ?? ''}
              placeholder="you@company.com"
              onCommit={(emailPlaceholder) => {
                onUpdateContent({ ...content, emailPlaceholder })
              }}
            />
          </FieldRow>
          {content.variant === 'contact' ? (
            <>
              <FieldRow label="Name PH">
                <BlurInput
                  value={content.namePlaceholder ?? ''}
                  placeholder="Your name"
                  onCommit={(namePlaceholder) => {
                    onUpdateContent({ ...content, namePlaceholder })
                  }}
                />
              </FieldRow>
              <FieldRow label="Message PH">
                <BlurInput
                  value={content.messagePlaceholder ?? ''}
                  placeholder="How can we help?"
                  onCommit={(messagePlaceholder) => {
                    onUpdateContent({ ...content, messagePlaceholder })
                  }}
                />
              </FieldRow>
            </>
          ) : null}
          <FieldRow label="Button">
            <BlurInput
              value={content.submitLabel}
              onCommit={(submitLabel) => {
                onUpdateContent({ ...content, submitLabel })
              }}
            />
          </FieldRow>
          <FieldRow label="Success">
            <BlurTextarea
              rows={2}
              value={content.successMessage}
              onCommit={(successMessage) => {
                onUpdateContent({ ...content, successMessage })
              }}
            />
          </FieldRow>
        </>
      )
  }
}
