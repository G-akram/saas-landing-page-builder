import { describe, expect, it } from 'vitest'

import { resolveVariantPublishNotice } from '../variant-publish-notice'

describe('resolveVariantPublishNotice', () => {
  it('returns null for single-variant drafts', () => {
    expect(resolveVariantPublishNotice(1, null)).toBeNull()
  })

  it('explains that an existing live URL still serves the published fallback variant', () => {
    expect(resolveVariantPublishNotice(2, '/p/demo-page')).toContain(
      'still serves the published fallback variant',
    )
  })

  it('explains that publish now updates every variant when no live URL exists yet', () => {
    expect(resolveVariantPublishNotice(2, null)).toContain('Publishing now updates every variant.')
  })
})
