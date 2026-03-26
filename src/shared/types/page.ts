import { z } from 'zod'

import { SectionSchema } from './section'

// ── Variant ────────────────────────────────────────────────────────────────

export const VariantSchema = z.object({
  id: z.string(),
  name: z.string(),
  trafficWeight: z.number().min(0).max(100),
  sections: z.array(SectionSchema),
})

// ── Page document ──────────────────────────────────────────────────────────
// This is the shape stored in pages.document (JSONB).
// It does NOT include id/name/slug/status/timestamps — those live as DB columns.

export const PageDocumentSchema = z.object({
  activeVariantId: z.string(),
  variants: z.array(VariantSchema).min(1),
})

// ── Derived TypeScript types ───────────────────────────────────────────────

export type Variant = z.infer<typeof VariantSchema>
export type PageDocument = z.infer<typeof PageDocumentSchema>
