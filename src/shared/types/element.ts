import { z } from 'zod'

// ── Primitives ─────────────────────────────────────────────────────────────

export const SpacingConfigSchema = z.object({
  top: z.number(),
  bottom: z.number(),
  left: z.number(),
  right: z.number(),
})

export const LinkConfigSchema = z.object({
  type: z.enum(['url', 'section', 'variant']),
  value: z.string(),
  newTab: z.boolean(),
})

export const TextModeSchema = z.enum(['inline', 'multiline'])

// ── Element content — discriminated union keyed on `type` ──────────────────

export const ElementContentSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('heading'), text: z.string(), level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]) }),
  z.object({ type: z.literal('text'), text: z.string(), mode: TextModeSchema.optional() }),
  z.object({ type: z.literal('button'), text: z.string() }),
  z.object({ type: z.literal('image'), src: z.string(), alt: z.string() }),
  z.object({ type: z.literal('icon'), name: z.string() }),
])

// ── Element styles ─────────────────────────────────────────────────────────

export const ElementStylesSchema = z.object({
  // Typography
  fontSize: z.number().optional(),
  fontWeight: z.number().optional(),
  fontFamily: z.string().optional(),
  color: z.string().optional(),
  textAlign: z.enum(['left', 'center', 'right']).optional(),
  lineHeight: z.number().optional(),

  // Box
  backgroundColor: z.string().optional(),
  borderRadius: z.number().optional(),
  padding: SpacingConfigSchema.optional(),

  // Dimensions
  width: z.string().optional(),
  maxWidth: z.string().optional(),

  // Spacing within section
  marginTop: z.number().optional(),
  marginBottom: z.number().optional(),
})

// ── Element ────────────────────────────────────────────────────────────────

export const ElementTypeSchema = z.enum(['heading', 'text', 'button', 'image', 'icon'])

export const ElementSchema = z.object({
  id: z.string(),
  type: ElementTypeSchema,
  slot: z.number().int().nonnegative(),
  content: ElementContentSchema,
  styles: ElementStylesSchema,
  link: LinkConfigSchema.optional(),
})

// ── Derived TypeScript types ───────────────────────────────────────────────

export type SpacingConfig = z.infer<typeof SpacingConfigSchema>
export type LinkConfig = z.infer<typeof LinkConfigSchema>
export type TextMode = z.infer<typeof TextModeSchema>
export type ElementContent = z.infer<typeof ElementContentSchema>
export type ElementStyles = z.infer<typeof ElementStylesSchema>
export type ElementType = z.infer<typeof ElementTypeSchema>
export type Element = z.infer<typeof ElementSchema>
