import { z } from 'zod'

import { SectionSchema } from './section'

export const VariantPrimaryGoalSchema = z.object({
  type: z.literal('link-click'),
  elementId: z.string(),
})

export const VariantSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    trafficWeight: z.number().min(0).max(100),
    primaryGoal: VariantPrimaryGoalSchema.nullable().optional(),
    sections: z.array(SectionSchema),
  })
  .superRefine((variant, ctx) => {
    if (!variant.primaryGoal) {
      return
    }

    const goalElement = variant.sections
      .flatMap((section) => section.elements)
      .find((element) => element.id === variant.primaryGoal?.elementId)

    if (!goalElement) {
      ctx.addIssue({
        code: 'custom',
        path: ['primaryGoal', 'elementId'],
        message: 'primaryGoal must reference an element in the same variant',
      })
      return
    }

    if (!goalElement.link) {
      ctx.addIssue({
        code: 'custom',
        path: ['primaryGoal', 'elementId'],
        message: 'primaryGoal must reference a linked element',
      })
    }
  })

export const PageDocumentSchema = z
  .object({
    activeVariantId: z.string(),
    variants: z.array(VariantSchema).min(1),
  })
  .superRefine((document, ctx) => {
    const variantIds = new Set<string>()

    document.variants.forEach((variant, index) => {
      if (variantIds.has(variant.id)) {
        ctx.addIssue({
          code: 'custom',
          path: ['variants', index, 'id'],
          message: 'variant ids must be unique within a page document',
        })
        return
      }

      variantIds.add(variant.id)
    })

    const hasActiveVariant = document.variants.some(
      (variant) => variant.id === document.activeVariantId,
    )

    if (!hasActiveVariant) {
      ctx.addIssue({
        code: 'custom',
        path: ['activeVariantId'],
        message: 'activeVariantId must reference an existing variant',
      })
    }
  })

export type VariantPrimaryGoal = z.infer<typeof VariantPrimaryGoalSchema>
export type Variant = z.infer<typeof VariantSchema>
export type PageDocument = z.infer<typeof PageDocumentSchema>
