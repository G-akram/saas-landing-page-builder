'use client'

import { FieldRow, BlurInput, BlurTextarea, SELECT_CLASS } from './field-row'

import type { FormConfig, FormSubmissionTarget, FormVariant } from '@/shared/types'

interface FormControlsProps {
  formConfig: FormConfig
  onUpdateConfig: (updates: Partial<FormConfig>) => void
}

const VARIANT_LABELS: Record<FormVariant, string> = {
  email: 'Email capture',
  contact: 'Contact form',
  newsletter: 'Newsletter signup',
}

const TARGET_LABELS: Record<FormSubmissionTarget, string> = {
  database: 'Store to DB',
  webhook: 'Send to webhook',
}

export function FormControls({
  formConfig,
  onUpdateConfig,
}: FormControlsProps): React.JSX.Element {
  return (
    <>
      <FieldRow label="Variant">
        <select
          className={SELECT_CLASS}
          value={formConfig.variant}
          onChange={(event) => {
            onUpdateConfig({ variant: event.target.value as FormVariant })
          }}
        >
          {(Object.keys(VARIANT_LABELS) as FormVariant[]).map((variant) => (
            <option key={variant} value={variant}>
              {VARIANT_LABELS[variant]}
            </option>
          ))}
        </select>
      </FieldRow>

      <FieldRow label="Submit">
        <BlurInput
          value={formConfig.submitLabel}
          onCommit={(submitLabel) => {
            onUpdateConfig({ submitLabel })
          }}
        />
      </FieldRow>

      <FieldRow label="Success">
        <BlurTextarea
          value={formConfig.successMessage}
          rows={2}
          onCommit={(successMessage) => {
            onUpdateConfig({ successMessage })
          }}
        />
      </FieldRow>

      <FieldRow label="Target">
        <select
          className={SELECT_CLASS}
          value={formConfig.submitTarget}
          onChange={(event) => {
            onUpdateConfig({ submitTarget: event.target.value as FormSubmissionTarget })
          }}
        >
          {(Object.keys(TARGET_LABELS) as FormSubmissionTarget[]).map((target) => (
            <option key={target} value={target}>
              {TARGET_LABELS[target]}
            </option>
          ))}
        </select>
      </FieldRow>

      {formConfig.submitTarget === 'webhook' ? (
        <FieldRow label="Webhook">
          <BlurInput
            value={formConfig.webhookUrl ?? ''}
            placeholder="https://example.com/lead-webhook"
            onCommit={(webhookUrl) => {
              onUpdateConfig({ webhookUrl: webhookUrl || undefined })
            }}
          />
        </FieldRow>
      ) : null}

      <FieldRow label="Email placeholder">
        <BlurInput
          value={formConfig.emailPlaceholder ?? ''}
          placeholder="you@company.com"
          onCommit={(emailPlaceholder) => {
            onUpdateConfig({ emailPlaceholder })
          }}
        />
      </FieldRow>
      {formConfig.variant === 'contact' ? (
        <>
          <FieldRow label="Name placeholder">
            <BlurInput
              value={formConfig.namePlaceholder ?? ''}
              placeholder="Your name"
              onCommit={(namePlaceholder) => {
                onUpdateConfig({ namePlaceholder })
              }}
            />
          </FieldRow>
          <FieldRow label="Msg placeholder">
            <BlurInput
              value={formConfig.messagePlaceholder ?? ''}
              placeholder="How can we help?"
              onCommit={(messagePlaceholder) => {
                onUpdateConfig({ messagePlaceholder })
              }}
            />
          </FieldRow>
        </>
      ) : null}
    </>
  )
}
