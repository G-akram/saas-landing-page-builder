import { createElement } from 'react'

import {
  type Element as PageElement,
  type FormConfig,
  isContainerElement,
} from '@/shared/types'

import { buildBaseElementStyle, buildButtonStyle } from '../utils/publish-renderer-utils'

export function resolveFormConfig(element: PageElement): FormConfig | null {
  if (isContainerElement(element)) {
    return element.formConfig ?? null
  }

  return element.content.type === 'form' ? element.content : null
}

function buildFormWrapperStyle(element: PageElement): React.CSSProperties {
  const flex: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  }

  if (isContainerElement(element)) {
    const cs = element.containerStyle
    const s = element.styles
    return {
      ...flex,
      background: cs.backgroundGradient ?? cs.backgroundColor ?? undefined,
      borderRadius: cs.borderRadius !== undefined ? `${String(cs.borderRadius)}px` : undefined,
      boxShadow: cs.boxShadow ?? undefined,
      border: cs.border ?? undefined,
      backdropFilter: cs.backdropFilter ?? undefined,
      paddingTop: cs.padding ? `${String(cs.padding.top)}px` : undefined,
      paddingBottom: cs.padding ? `${String(cs.padding.bottom)}px` : undefined,
      paddingLeft: cs.padding ? `${String(cs.padding.left)}px` : undefined,
      paddingRight: cs.padding ? `${String(cs.padding.right)}px` : undefined,
      maxWidth: s.maxWidth ?? undefined,
      width: s.width ?? undefined,
      marginTop: s.marginTop !== undefined ? `${String(s.marginTop)}px` : undefined,
      marginBottom: s.marginBottom !== undefined ? `${String(s.marginBottom)}px` : undefined,
    }
  }

  const s = element.styles
  return {
    ...buildBaseElementStyle(s),
    ...flex,
    background: s.backgroundGradient ?? s.backgroundColor ?? undefined,
    borderRadius: s.borderRadius !== undefined ? `${String(s.borderRadius)}px` : undefined,
    paddingTop: s.padding ? `${String(s.padding.top)}px` : undefined,
    paddingBottom: s.padding ? `${String(s.padding.bottom)}px` : undefined,
    paddingLeft: s.padding ? `${String(s.padding.left)}px` : undefined,
    paddingRight: s.padding ? `${String(s.padding.right)}px` : undefined,
  }
}

function renderFieldGroup(
  labelText: string,
  field: React.JSX.Element,
): React.JSX.Element {
  return createElement(
    'div',
    { className: 'pb-form-field-group' },
    createElement('label', { className: 'pb-form-label' }, labelText),
    field,
  )
}

export function renderForm(
  element: PageElement,
  formConfig: FormConfig,
  slug: string,
  defaultTextColor: string,
): React.JSX.Element {
  const endpoint = `/p/${slug}/lead`
  const isContactForm = formConfig.variant === 'contact'
  const buttonStyle = buildButtonStyle(element.styles)

  return createElement(
    'form',
    {
      className: 'pb-lead-form',
      action: endpoint,
      method: 'post',
      style: buildFormWrapperStyle(element),
      'data-pb-form-element-id': element.id,
      'data-pb-form-success-message': formConfig.successMessage,
    },
    createElement('input', {
      type: 'hidden',
      name: 'elementId',
      value: element.id,
    }),
    isContactForm
      ? renderFieldGroup(
          'Your name',
          createElement('input', {
            className: 'pb-form-field',
            name: 'name',
            type: 'text',
            required: true,
            placeholder: formConfig.namePlaceholder ?? 'Your name',
          }),
        )
      : null,
    renderFieldGroup(
      'Email address',
      createElement('input', {
        className: 'pb-form-field',
        name: 'email',
        type: 'email',
        required: true,
        placeholder: formConfig.emailPlaceholder ?? 'you@company.com',
      }),
    ),
    isContactForm
      ? renderFieldGroup(
          'Message',
          createElement('textarea', {
            className: 'pb-form-field',
            name: 'message',
            required: true,
            rows: 4,
            placeholder: formConfig.messagePlaceholder ?? 'How can we help?',
          }),
        )
      : null,
    createElement(
      'button',
      {
        type: 'submit',
        className: 'pb-form-submit',
        style: {
          ...buttonStyle,
          color: element.styles.color ?? defaultTextColor,
          display: 'block',
          width: '100%',
          textAlign: 'center',
        },
      },
      formConfig.submitLabel,
    ),
    !isContactForm
      ? createElement(
          'p',
          { className: 'pb-form-privacy' },
          'We respect your privacy. No spam, ever.',
        )
      : null,
    createElement(
      'p',
      {
        className: 'pb-form-status',
        'data-pb-form-status': true,
        'aria-live': 'polite',
      },
      '',
    ),
  )
}
