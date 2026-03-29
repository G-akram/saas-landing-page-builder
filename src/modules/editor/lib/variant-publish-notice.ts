export function resolveVariantPublishNotice(
  variantCount: number,
  liveUrl: string | null,
): string | null {
  if (variantCount <= 1) {
    return null
  }

  if (liveUrl) {
    return 'Multi-variant drafts are editor-only for now. The live URL still serves the last single-variant publish.'
  }

  return 'Multi-variant drafts are editor-only for now. Publishing stays blocked until Step 4 ships.'
}
