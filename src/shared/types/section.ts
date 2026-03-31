import { z } from 'zod'

import { ElementSchema } from './element'

// ── Slot style ─────────────────────────────────────────────────────────────
// Optional visual card/container style applied to each grid slot.

export const SlotStyleSchema = z.object({
  backgroundColor: z.string().optional(),
  borderRadius: z.number().optional(),
  boxShadow: z.string().optional(),
  border: z.string().optional(),
  backdropFilter: z.string().optional(),
  padding: z
    .object({ top: z.number(), bottom: z.number(), left: z.number(), right: z.number() })
    .optional(),
})

// ── Layout ─────────────────────────────────────────────────────────────────

export const SectionLayoutSchema = z.object({
  type: z.enum(['stack', 'grid']),
  columns: z.number().int().positive().optional(), // grid only: 2, 3, 4
  gap: z.number(),
  align: z.enum(['left', 'center', 'right']),
  verticalAlign: z.enum(['top', 'center', 'bottom']),
})

// ── Background ─────────────────────────────────────────────────────────────

export const BackgroundConfigSchema = z.object({
  type: z.enum(['color', 'gradient', 'image']),
  value: z.string(), // hex, gradient string, or image URL
  overlay: z.string().optional(),
  valueToken: z.string().optional(), // design token key for the background value
})

// ── Section ────────────────────────────────────────────────────────────────

export const SectionTypeSchema = z.enum([
  'hero',
  'features',
  'cta',
  'pricing',
  'testimonials',
  'footer',
  'form',
  'custom',
])

export const SectionSchema = z.object({
  id: z.string(),
  type: SectionTypeSchema,
  variantStyleId: z.string(), // e.g. "hero-1", "features-2"
  layout: SectionLayoutSchema,
  background: BackgroundConfigSchema,
  padding: z.object({
    top: z.number(),
    bottom: z.number(),
    left: z.number(),
    right: z.number(),
  }),
  slotStyle: SlotStyleSchema.optional(), // visual card style applied to each grid slot
  minHeight: z.number().optional(), // minimum height in pixels
  elements: z.array(ElementSchema),
})

// ── Derived TypeScript types ───────────────────────────────────────────────

export type SlotStyle = z.infer<typeof SlotStyleSchema>
export type SectionLayout = z.infer<typeof SectionLayoutSchema>
export type BackgroundConfig = z.infer<typeof BackgroundConfigSchema>
export type SectionType = z.infer<typeof SectionTypeSchema>
export type Section = z.infer<typeof SectionSchema>
