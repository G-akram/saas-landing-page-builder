import { type PageDocument, type VariantPrimaryGoal } from '@/shared/types'

import {
  canAssignPrimaryGoal,
  createDuplicateVariantName,
  createSequentialVariantName,
  createVariantClone,
  distributeVariantTrafficWeightsEvenly,
  rebalanceTrafficWeightsAfterDelete,
  rebalanceTrafficWeightsForVariant,
  resolveNextActiveVariantIdAfterDelete,
  resolveValidActiveVariantId,
} from './document-store-variant-helpers'

interface CreateVariantInput {
  name?: string
  sourceVariantId?: string
}

export function createVariantInDocument(
  document: PageDocument,
  input: CreateVariantInput = {},
): PageDocument | null {
  const sourceVariantId = input.sourceVariantId ?? document.activeVariantId
  const sourceVariant = document.variants.find((variant) => variant.id === sourceVariantId)
  if (!sourceVariant) {
    return null
  }

  const variantId = crypto.randomUUID()
  const variantName = input.name ?? createSequentialVariantName(document.variants)
  const createdVariant = createVariantClone(sourceVariant, variantId, variantName)
  const nextVariants = distributeVariantTrafficWeightsEvenly([...document.variants, createdVariant])

  return {
    ...document,
    activeVariantId: variantId,
    variants: nextVariants,
  }
}

export function duplicateVariantInDocument(
  document: PageDocument,
  sourceVariantId: string,
): PageDocument | null {
  const sourceVariant = document.variants.find((variant) => variant.id === sourceVariantId)
  if (!sourceVariant) {
    return null
  }

  return createVariantInDocument(document, {
    sourceVariantId,
    name: createDuplicateVariantName(document.variants, sourceVariant.name),
  })
}

export function deleteVariantInDocument(
  document: PageDocument,
  variantId: string,
): PageDocument | null {
  if (document.variants.length <= 1) {
    return null
  }

  const nextVariants = document.variants.filter((variant) => variant.id !== variantId)
  if (nextVariants.length === document.variants.length) {
    return null
  }

  const nextActiveVariantId = resolveNextActiveVariantIdAfterDelete(document, variantId)
  const validActiveVariantId = resolveValidActiveVariantId(nextVariants, nextActiveVariantId)
  if (!validActiveVariantId) {
    return null
  }

  return {
    ...document,
    activeVariantId: validActiveVariantId,
    variants: rebalanceTrafficWeightsAfterDelete(nextVariants),
  }
}

export function switchVariantInDocument(
  document: PageDocument,
  variantId: string,
): PageDocument | null {
  if (document.activeVariantId === variantId) {
    return null
  }

  const hasTargetVariant = document.variants.some((variant) => variant.id === variantId)
  if (!hasTargetVariant) {
    return null
  }

  return {
    ...document,
    activeVariantId: variantId,
  }
}

export function setVariantTrafficWeightInDocument(
  document: PageDocument,
  variantId: string,
  trafficWeight: number,
): PageDocument | null {
  const nextVariants = rebalanceTrafficWeightsForVariant(
    document.variants,
    variantId,
    trafficWeight,
  )
  if (!nextVariants || nextVariants === document.variants) {
    return null
  }

  return {
    ...document,
    variants: nextVariants,
  }
}

export function setVariantPrimaryGoalInDocument(
  document: PageDocument,
  variantId: string,
  elementId: string | null,
): PageDocument | null {
  const variantIndex = document.variants.findIndex((variant) => variant.id === variantId)
  if (variantIndex === -1) {
    return null
  }

  const variant = document.variants[variantIndex]
  if (!variant) {
    return null
  }

  const nextPrimaryGoal = getNextPrimaryGoal(variant, elementId)
  if (nextPrimaryGoal === undefined) {
    return null
  }

  if (
    variant.primaryGoal?.type === nextPrimaryGoal?.type &&
    variant.primaryGoal?.elementId === nextPrimaryGoal?.elementId
  ) {
    return null
  }

  const nextVariants = [...document.variants]
  nextVariants[variantIndex] = {
    ...variant,
    primaryGoal: nextPrimaryGoal,
  }

  return {
    ...document,
    variants: nextVariants,
  }
}

function getNextPrimaryGoal(
  variant: PageDocument['variants'][number],
  elementId: string | null,
): VariantPrimaryGoal | null | undefined {
  if (elementId === null) {
    return null
  }

  if (!canAssignPrimaryGoal(variant, elementId)) {
    return undefined
  }

  return {
    type: 'link-click',
    elementId,
  }
}
