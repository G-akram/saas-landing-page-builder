import { type BuildPublishedArtifactStorageKeyInput } from '../types/storage'

const PAGE_ID_PATTERN = /^[a-zA-Z0-9_-]+$/
const CONTENT_HASH_PATTERN = /^[a-f0-9]{64}$/
const STORAGE_KEY_PATTERN = /^pages\/([a-zA-Z0-9_-]+)\/([a-f0-9]{64}\.html)$/

export interface ParsedPublishedArtifactStorageKey {
  pageId: string
  fileName: string
}

export function buildPublishedArtifactStorageKey(
  input: BuildPublishedArtifactStorageKeyInput,
): string | null {
  if (!PAGE_ID_PATTERN.test(input.pageId)) {
    return null
  }

  if (!CONTENT_HASH_PATTERN.test(input.contentHash)) {
    return null
  }

  return `pages/${input.pageId}/${input.contentHash}.html`
}

export function parsePublishedArtifactStorageKey(
  storageKey: string,
): ParsedPublishedArtifactStorageKey | null {
  const normalized = storageKey.trim()

  if (normalized.length === 0) {
    return null
  }

  const match = STORAGE_KEY_PATTERN.exec(normalized)

  if (!match) {
    return null
  }

  const [, pageId, fileName] = match

  if (!pageId || !fileName) {
    return null
  }

  return {
    pageId,
    fileName,
  }
}
