import { put } from '@vercel/blob'

import {
  type PublishArtifactReadInput,
  type PublishArtifactReadResult,
  type PublishArtifactWriteInput,
  type PublishArtifactWriteResult,
  type PublishStorageAdapter,
} from '../types/storage'
import { buildPublishedArtifactStorageKey } from './publish-storage-key'

const BLOB_URL_PATTERN = /^https:\/\//

export class BlobPublishStorageAdapter implements PublishStorageAdapter {
  readonly provider = 'object-storage' as const

  async writeArtifact(input: PublishArtifactWriteInput): Promise<PublishArtifactWriteResult> {
    const pathKey = buildPublishedArtifactStorageKey({
      pageId: input.pageId,
      contentHash: input.contentHash,
    })

    if (!pathKey) {
      return {
        success: false,
        errorCode: 'INVALID_KEY',
        message: `Unable to build a valid storage key for page ${input.pageId}`,
      }
    }

    try {
      const blob = await put(pathKey, input.html, {
        access: 'public',
        contentType: 'text/html; charset=utf-8',
        addRandomSuffix: false,
      })

      return {
        success: true,
        storageProvider: this.provider,
        storageKey: blob.url,
        bytes: Buffer.byteLength(input.html, 'utf8'),
      }
    } catch (error) {
      return {
        success: false,
        errorCode: 'WRITE_FAILED',
        message: `Failed to write published artifact to Vercel Blob: ${getReadableErrorMessage(error)}`,
      }
    }
  }

  async readArtifact(input: PublishArtifactReadInput): Promise<PublishArtifactReadResult> {
    if (!BLOB_URL_PATTERN.test(input.storageKey)) {
      return {
        success: false,
        errorCode: 'INVALID_KEY',
        message: `Storage key "${input.storageKey}" is not a valid Vercel Blob URL`,
      }
    }

    try {
      const response = await fetch(input.storageKey)

      if (response.status === 404) {
        return {
          success: false,
          errorCode: 'NOT_FOUND',
          message: `Published artifact not found at ${input.storageKey}`,
        }
      }

      if (!response.ok) {
        return {
          success: false,
          errorCode: 'READ_FAILED',
          message: `Failed to read published artifact from Vercel Blob: HTTP ${response.status.toString()}`,
        }
      }

      const html = await response.text()

      return {
        success: true,
        html,
        bytes: Buffer.byteLength(html, 'utf8'),
      }
    } catch (error) {
      return {
        success: false,
        errorCode: 'READ_FAILED',
        message: `Failed to read published artifact from Vercel Blob: ${getReadableErrorMessage(error)}`,
      }
    }
  }
}

function getReadableErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'unknown error'
}
