import { describe, expect, it } from 'vitest'

import { type EditorPublishState } from '../../hooks/use-publish'
import { resolvePublishFeedback } from '../publish-feedback'

function createState(overrides: Partial<EditorPublishState> = {}): EditorPublishState {
  return {
    status: 'idle',
    liveUrl: null,
    message: null,
    ...overrides,
  }
}

describe('resolvePublishFeedback', () => {
  it('prioritizes gating reason over stale published state', () => {
    const feedback = resolvePublishFeedback(
      createState({ status: 'published', message: 'Published' }),
      'Save changes before publishing',
    )

    expect(feedback).toEqual({
      className: 'text-amber-300',
      label: 'Save changes before publishing',
    })
  })

  it('shows published message when gate is open', () => {
    const feedback = resolvePublishFeedback(
      createState({ status: 'published', message: 'Published' }),
      null,
    )

    expect(feedback).toEqual({
      className: 'text-green-400',
      label: 'Published',
    })
  })

  it('shows error message when no gating reason exists', () => {
    const feedback = resolvePublishFeedback(
      createState({ status: 'error', message: 'Publish failed. Try again.' }),
      null,
    )

    expect(feedback).toEqual({
      className: 'text-red-400',
      label: 'Publish failed. Try again.',
    })
  })
})

