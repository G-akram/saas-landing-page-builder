import { type PageDocument, type Variant, type VariantPrimaryGoal } from '@/shared/types'

const TOTAL_TRAFFIC_WEIGHT = 100
const VARIANT_NAME_PREFIX = 'Variant'
const VARIANT_COPY_SUFFIX = 'Copy'

export function cleanupVariantPrimaryGoal(variant: Variant): Variant {
  if (!variant.primaryGoal || canAssignPrimaryGoal(variant, variant.primaryGoal.elementId)) {
    return variant
  }

  return {
    ...variant,
    primaryGoal: null,
  }
}

export function cleanupVariantPrimaryGoalInDocument(
  document: PageDocument,
  variantId: string,
): PageDocument {
  const variantIndex = document.variants.findIndex((variant) => variant.id === variantId)
  if (variantIndex === -1) {
    return document
  }

  const variant = document.variants[variantIndex]
  if (!variant) {
    return document
  }

  const cleanedVariant = cleanupVariantPrimaryGoal(variant)
  if (cleanedVariant === variant) {
    return document
  }

  const nextVariants = [...document.variants]
  nextVariants[variantIndex] = cleanedVariant

  return {
    ...document,
    variants: nextVariants,
  }
}

export function createVariantClone(
  sourceVariant: Variant,
  variantId: string,
  variantName: string,
): Variant {
  const clonedSections = structuredClone(sourceVariant.sections)
  const clonedPrimaryGoal = sourceVariant.primaryGoal
    ? ({ ...sourceVariant.primaryGoal } satisfies VariantPrimaryGoal)
    : null

  return {
    ...sourceVariant,
    id: variantId,
    name: variantName,
    sections: clonedSections,
    primaryGoal: clonedPrimaryGoal,
  }
}

export function createSequentialVariantName(variants: Variant[]): string {
  let nextNumber = variants.length + 1
  let candidate = `${VARIANT_NAME_PREFIX} ${String(nextNumber)}`

  while (hasVariantName(variants, candidate)) {
    nextNumber += 1
    candidate = `${VARIANT_NAME_PREFIX} ${String(nextNumber)}`
  }

  return candidate
}

export function createDuplicateVariantName(variants: Variant[], sourceName: string): string {
  const baseName = `${sourceName} ${VARIANT_COPY_SUFFIX}`

  if (!hasVariantName(variants, baseName)) {
    return baseName
  }

  let suffix = 2
  let candidate = `${baseName} ${String(suffix)}`

  while (hasVariantName(variants, candidate)) {
    suffix += 1
    candidate = `${baseName} ${String(suffix)}`
  }

  return candidate
}

export function distributeVariantTrafficWeightsEvenly(variants: Variant[]): Variant[] {
  if (variants.length === 0) {
    return variants
  }

  if (variants.length === 1) {
    return applyTrafficWeights(variants, [TOTAL_TRAFFIC_WEIGHT])
  }

  const nextWeights = distributeIntegerWeights(
    Array.from({ length: variants.length }, () => 1),
    TOTAL_TRAFFIC_WEIGHT,
  )

  return applyTrafficWeights(variants, nextWeights)
}

export function rebalanceTrafficWeightsAfterDelete(variants: Variant[]): Variant[] {
  if (variants.length === 0) {
    return variants
  }

  if (variants.length === 1) {
    return applyTrafficWeights(variants, [TOTAL_TRAFFIC_WEIGHT])
  }

  return applyTrafficWeights(
    variants,
    distributeIntegerWeights(
      variants.map((variant) => variant.trafficWeight),
      TOTAL_TRAFFIC_WEIGHT,
    ),
  )
}

export function rebalanceTrafficWeightsForVariant(
  variants: Variant[],
  variantId: string,
  trafficWeight: number,
): Variant[] | null {
  const targetIndex = variants.findIndex((variant) => variant.id === variantId)
  if (targetIndex === -1) {
    return null
  }

  if (variants.length === 1) {
    return applyTrafficWeights(variants, [TOTAL_TRAFFIC_WEIGHT])
  }

  const nextTargetWeight = clampTrafficWeight(trafficWeight)
  const remainingWeight = TOTAL_TRAFFIC_WEIGHT - nextTargetWeight
  const remainingShares = variants
    .filter((variant) => variant.id !== variantId)
    .map((variant) => variant.trafficWeight)
  const remainingWeights = distributeIntegerWeights(remainingShares, remainingWeight)

  const nextWeights = variants.map((variant) =>
    variant.id === variantId ? nextTargetWeight : (remainingWeights.shift() ?? 0),
  )

  return applyTrafficWeights(variants, nextWeights)
}

export function canAssignPrimaryGoal(variant: Variant, elementId: string): boolean {
  return variant.sections
    .flatMap((section) => section.elements)
    .some((element) => element.id === elementId && element.link !== undefined)
}

export function resolveValidActiveVariantId(
  variants: Variant[],
  preferredVariantId: string | null | undefined,
): string | null {
  if (preferredVariantId && variants.some((variant) => variant.id === preferredVariantId)) {
    return preferredVariantId
  }

  return variants[0]?.id ?? null
}

export function resolveNextActiveVariantIdAfterDelete(
  document: PageDocument,
  deletedVariantId: string,
): string | null {
  if (document.activeVariantId !== deletedVariantId) {
    return resolveValidActiveVariantId(document.variants, document.activeVariantId)
  }

  const deletedVariantIndex = document.variants.findIndex(
    (variant) => variant.id === deletedVariantId,
  )
  if (deletedVariantIndex === -1) {
    return resolveValidActiveVariantId(document.variants, document.activeVariantId)
  }

  const remainingVariants = document.variants.filter((variant) => variant.id !== deletedVariantId)
  const fallbackIndex = Math.max(0, deletedVariantIndex - 1)

  return remainingVariants[Math.min(fallbackIndex, remainingVariants.length - 1)]?.id ?? null
}

function applyTrafficWeights(variants: Variant[], trafficWeights: number[]): Variant[] {
  const nextVariants = variants.map((variant, index) => {
    const nextWeight = trafficWeights[index]
    if (nextWeight === undefined || variant.trafficWeight === nextWeight) {
      return variant
    }

    return { ...variant, trafficWeight: nextWeight }
  })

  const hasTrafficChange = nextVariants.some((variant, index) => variant !== variants[index])

  return hasTrafficChange ? nextVariants : variants
}

function clampTrafficWeight(value: number): number {
  return Math.max(0, Math.min(TOTAL_TRAFFIC_WEIGHT, Math.round(value)))
}

function distributeIntegerWeights(shares: number[], total: number): number[] {
  if (shares.length === 0) {
    return []
  }

  const normalizedShares = shares.map((share) => Math.max(0, share))
  const shareTotal = normalizedShares.reduce((sum, share) => sum + share, 0)
  const targetTotal = Math.max(0, Math.round(total))
  const rawWeights =
    shareTotal === 0
      ? normalizedShares.map(() => targetTotal / shares.length)
      : normalizedShares.map((share) => (share / shareTotal) * targetTotal)
  const flooredWeights = rawWeights.map((weight) => Math.floor(weight))
  let remainingWeight = targetTotal - flooredWeights.reduce((sum, weight) => sum + weight, 0)

  const rankedFractions = rawWeights
    .map((weight, index) => ({
      index,
      fraction: weight - (flooredWeights[index] ?? 0),
    }))
    .sort((left, right) => right.fraction - left.fraction || left.index - right.index)

  while (remainingWeight > 0) {
    const ranked = rankedFractions.shift()
    if (!ranked) {
      break
    }

    flooredWeights[ranked.index] = (flooredWeights[ranked.index] ?? 0) + 1
    remainingWeight -= 1
  }

  return flooredWeights
}

function hasVariantName(variants: Variant[], candidate: string): boolean {
  return variants.some((variant) => variant.name === candidate)
}
