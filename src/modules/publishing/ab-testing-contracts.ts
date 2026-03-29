import { z } from 'zod'

const CONTENT_HASH_PATTERN = /^[a-f0-9]{64}$/

export const PUBLISHED_PAGE_EVENT_TYPES = ['view', 'conversion'] as const
export type PublishedPageEventType = (typeof PUBLISHED_PAGE_EVENT_TYPES)[number]

export const PublishedPageEventTypeSchema = z.enum(PUBLISHED_PAGE_EVENT_TYPES)

export const PublishedVariantAssignmentSchema = z.object({
  assignmentId: z.string(),
  pageId: z.string(),
  variantId: z.string(),
  contentHash: z.string().regex(CONTENT_HASH_PATTERN),
  assignedAt: z.iso.datetime({ offset: true }),
})

const PublishedPageEventBaseSchema = z.object({
  pageId: z.string(),
  variantId: z.string(),
  assignmentId: z.string(),
  contentHash: z.string().regex(CONTENT_HASH_PATTERN),
  occurredAt: z.iso.datetime({ offset: true }),
})

export const PublishedPageEventSchema = z.discriminatedUnion('eventType', [
  PublishedPageEventBaseSchema.extend({
    eventType: z.literal('view'),
  }),
  PublishedPageEventBaseSchema.extend({
    eventType: z.literal('conversion'),
    goalElementId: z.string(),
  }),
])

export type PublishedVariantAssignment = z.infer<typeof PublishedVariantAssignmentSchema>
export type PublishedPageEvent = z.infer<typeof PublishedPageEventSchema>
