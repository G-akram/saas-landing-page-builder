import { describe, expect, it } from 'vitest'

import {
  PublishedPageEventSchema,
  PublishedVariantAssignmentSchema,
} from '../ab-testing-contracts'

describe('ab testing publishing contracts', () => {
  it('accepts a valid sticky assignment payload', () => {
    const result = PublishedVariantAssignmentSchema.safeParse({
      assignmentId: 'assign-1',
      pageId: 'page-1',
      variantId: 'variant-a',
      contentHash: 'a'.repeat(64),
      assignedAt: '2026-03-29T21:45:00.000Z',
    })

    expect(result.success).toBe(true)
  })

  it('requires a goal element id for conversion events', () => {
    const result = PublishedPageEventSchema.safeParse({
      pageId: 'page-1',
      variantId: 'variant-a',
      assignmentId: 'assign-1',
      contentHash: 'a'.repeat(64),
      occurredAt: '2026-03-29T21:45:00.000Z',
      eventType: 'conversion',
    })

    expect(result.success).toBe(false)
  })

  it('accepts a view event without a goal element id', () => {
    const result = PublishedPageEventSchema.safeParse({
      pageId: 'page-1',
      variantId: 'variant-a',
      assignmentId: 'assign-1',
      contentHash: 'a'.repeat(64),
      occurredAt: '2026-03-29T21:45:00.000Z',
      eventType: 'view',
    })

    expect(result.success).toBe(true)
  })
})
