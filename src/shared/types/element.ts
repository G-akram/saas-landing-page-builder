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
export const FormVariantSchema = z.enum(['email', 'contact', 'newsletter'])
export const FormSubmissionTargetSchema = z.enum(['database', 'webhook'])
export const FormConfigSchema = z.object({
    variant: FormVariantSchema,
    submitLabel: z.string(),
    successMessage: z.string(),
    submitTarget: FormSubmissionTargetSchema,
    webhookUrl: z.url().optional(),
    emailPlaceholder: z.string().optional(),
    namePlaceholder: z.string().optional(),
    messagePlaceholder: z.string().optional(),
  })

// ── Element content — discriminated union keyed on `type` ──────────────────

export const AtomicElementContentSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('heading'),
    text: z.string(),
    level: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  }),
  z.object({ type: z.literal('text'), text: z.string(), mode: TextModeSchema.optional() }),
  z.object({ type: z.literal('button'), text: z.string() }),
  z.object({ type: z.literal('image'), src: z.string(), alt: z.string() }),
  z.object({ type: z.literal('icon'), name: z.string() }),
  z.object({
    type: z.literal('form'),
    variant: FormVariantSchema,
    submitLabel: z.string(),
    successMessage: z.string(),
    submitTarget: FormSubmissionTargetSchema,
    webhookUrl: z.url().optional(),
    emailPlaceholder: z.string().optional(),
    namePlaceholder: z.string().optional(),
    messagePlaceholder: z.string().optional(),
  }),
])

/** @deprecated Use AtomicElementContentSchema. Kept as alias for existing imports. */
export const ElementContentSchema = AtomicElementContentSchema

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
  height: z.string().optional(),
  maxWidth: z.string().optional(),

  // Spacing within section
  marginTop: z.number().optional(),
  marginBottom: z.number().optional(),

  // Visual effects
  boxShadow: z.string().optional(),
  border: z.string().optional(),
  opacity: z.number().min(0).max(1).optional(),
  letterSpacing: z.string().optional(),
  textTransform: z.enum(['none', 'uppercase', 'lowercase', 'capitalize']).optional(),
  backgroundGradient: z.string().optional(), // CSS gradient string, overrides backgroundColor
  backdropFilter: z.string().optional(), // e.g. 'blur(16px)' for glassmorphism

  // Design token keys (hybrid approach — store token key + resolved value)
  colorToken: z.string().optional(),
  backgroundColorToken: z.string().optional(),
  gradientToken: z.string().optional(), // maps to theme gradients (primary, accent, dark)
})

// ── Container-specific schemas ─────────────────────────────────────────────

export const ContainerLayoutSchema = z.object({
  direction: z.enum(['column', 'row']),
  gap: z.number().nonnegative(),
  align: z.enum(['left', 'center', 'right']).optional(),
  verticalAlign: z.enum(['top', 'center', 'bottom']).optional(),
})

export const ContainerStyleSchema = z.object({
  backgroundColor: z.string().optional(),
  backgroundGradient: z.string().optional(),
  gradientToken: z.string().optional(),
  backgroundColorToken: z.string().optional(),
  borderRadius: z.number().optional(),
  boxShadow: z.string().optional(),
  border: z.string().optional(),
  backdropFilter: z.string().optional(),
  padding: SpacingConfigSchema.optional(),
})

// ── Atomic element — leaf node, no children ────────────────────────────────

export const AtomicElementSchema = z.object({
  id: z.string(),
  type: z.enum(['heading', 'text', 'button', 'image', 'icon', 'form']),
  slot: z.number().int().nonnegative(),
  content: AtomicElementContentSchema,
  styles: ElementStylesSchema,
  link: LinkConfigSchema.optional(),
})

// ── Container element — holds atomic children, 1-level nesting only ────────

export const ContainerElementSchema = z.object({
  id: z.string(),
  type: z.literal('container'),
  slot: z.number().int().nonnegative(),
  content: z.object({ type: z.literal('container') }),
  styles: ElementStylesSchema, // outer spacing: marginTop, marginBottom, width, maxWidth
  containerStyle: ContainerStyleSchema,
  containerLayout: ContainerLayoutSchema,
  children: z.array(AtomicElementSchema),
  link: LinkConfigSchema.optional(),
  formConfig: FormConfigSchema.optional(),
})

// ── Element — union of atomic and container ────────────────────────────────

export const ElementTypeSchema = z.enum([
  'heading',
  'text',
  'button',
  'image',
  'icon',
  'form',
  'container',
])

export const ElementSchema = z.union([AtomicElementSchema, ContainerElementSchema])

// ── Type guard ─────────────────────────────────────────────────────────────

export function isContainerElement(element: Element): element is ContainerElement {
  return element.type === 'container'
}

// ── Derived TypeScript types ───────────────────────────────────────────────

export type SpacingConfig = z.infer<typeof SpacingConfigSchema>
export type LinkConfig = z.infer<typeof LinkConfigSchema>
export type TextMode = z.infer<typeof TextModeSchema>
export type FormVariant = z.infer<typeof FormVariantSchema>
export type FormSubmissionTarget = z.infer<typeof FormSubmissionTargetSchema>
export type ElementContent = z.infer<typeof AtomicElementContentSchema>
export type FormConfig = z.infer<typeof FormConfigSchema>
export type ElementStyles = z.infer<typeof ElementStylesSchema>
export type ElementType = z.infer<typeof ElementTypeSchema>
export type ContainerLayout = z.infer<typeof ContainerLayoutSchema>
export type ContainerStyle = z.infer<typeof ContainerStyleSchema>
export type AtomicElement = z.infer<typeof AtomicElementSchema>
export type ContainerElement = z.infer<typeof ContainerElementSchema>
export type Element = z.infer<typeof ElementSchema>
