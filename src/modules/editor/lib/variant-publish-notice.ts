export function resolveVariantPublishNotice(
  variantCount: number,
  liveUrl: string | null,
): string | null {
  if (variantCount <= 1) {
    return null
  }

  if (liveUrl) {
    return 'Publishing now updates every variant. The live URL still serves the published fallback variant until sticky serving ships.'
  }

  return 'Publishing now updates every variant. Live traffic will keep using one published fallback variant until sticky serving ships.'
}
