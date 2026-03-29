import { describe, expect, it } from 'vitest'

import { resolvePublishGate } from '../publish-gate'

describe('resolvePublishGate', () => {
  it('blocks publish when publish action is unavailable', () => {
    const result = resolvePublishGate({
      hasPublishAction: false,
      isDirty: false,
      isPublishing: false,
      saveStatus: 'idle',
      variantCount: 1,
    })

    expect(result).toEqual({
      canPublish: false,
      reason: 'Publish is unavailable',
    })
  })

  it('blocks publish while autosave is running', () => {
    const result = resolvePublishGate({
      hasPublishAction: true,
      isDirty: false,
      isPublishing: false,
      saveStatus: 'saving',
      variantCount: 1,
    })

    expect(result).toEqual({
      canPublish: false,
      reason: 'Wait for autosave to finish',
    })
  })

  it('blocks publish when document is dirty', () => {
    const result = resolvePublishGate({
      hasPublishAction: true,
      isDirty: true,
      isPublishing: false,
      saveStatus: 'idle',
      variantCount: 1,
    })

    expect(result).toEqual({
      canPublish: false,
      reason: 'Save changes before publishing',
    })
  })

  it('allows publish when save state is clean', () => {
    const result = resolvePublishGate({
      hasPublishAction: true,
      isDirty: false,
      isPublishing: false,
      saveStatus: 'saved',
      variantCount: 1,
    })

    expect(result).toEqual({
      canPublish: true,
      reason: null,
    })
  })

  it('blocks publish when the draft has multiple variants', () => {
    const result = resolvePublishGate({
      hasPublishAction: true,
      isDirty: false,
      isPublishing: false,
      saveStatus: 'saved',
      variantCount: 2,
    })

    expect(result).toEqual({
      canPublish: false,
      reason: 'Multi-variant publish is not available yet',
    })
  })
})
