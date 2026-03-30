import { z } from 'zod'

import { ElementSchema } from './element'

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
  elements: z.array(ElementSchema),
})

// ── Derived TypeScript types ───────────────────────────────────────────────

export type SectionLayout = z.infer<typeof SectionLayoutSchema>
export type BackgroundConfig = z.infer<typeof BackgroundConfigSchema>
export type SectionType = z.infer<typeof SectionTypeSchema>
export type Section = z.infer<typeof SectionSchema>
