import { describe, expect, it } from 'vitest'

import { resolveVariantPublishNotice } from '../variant-publish-notice'

describe('resolveVariantPublishNotice', () => {
  it('returns null for single-variant drafts', () => {
    expect(resolveVariantPublishNotice(1, null)).toBeNull()
  })

  it('explains that an existing live URL still serves the last single-variant publish', () => {
    expect(resolveVariantPublishNotice(2, '/p/demo-page')).toContain(
      'still serves the last single-variant publish',
    )
  })

  it('explains that publish stays blocked when no live URL exists yet', () => {
    expect(resolveVariantPublishNotice(2, null)).toContain(
      'Publishing stays blocked until Step 4 ships.',
    )
  })
})
