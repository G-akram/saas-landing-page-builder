import fs from 'node:fs/promises'
import path from 'node:path'

import {
  type PublishArtifactReadInput,
  type PublishArtifactReadResult,
  type PublishArtifactWriteInput,
  type PublishArtifactWriteResult,
  type PublishStorageAdapter,
} from '../types/storage'
import {
  buildPublishedArtifactStorageKey,
  parsePublishedArtifactStorageKey,
} from './publish-storage-key'

const DEFAULT_LOCAL_PUBLISH_STORAGE_ROOT_DIR = path.join(process.cwd(), '.published-pages')

export interface LocalPublishStorageAdapterOptions {
  rootDir?: string
}

export class LocalPublishStorageAdapter implements PublishStorageAdapter {
  readonly provider = 'local' as const

  private readonly rootDir: string

  constructor(options: LocalPublishStorageAdapterOptions = {}) {
    this.rootDir = path.resolve(options.rootDir ?? DEFAULT_LOCAL_PUBLISH_STORAGE_ROOT_DIR)
  }

  async writeArtifact(input: PublishArtifactWriteInput): Promise<PublishArtifactWriteResult> {
    const storageKey = buildPublishedArtifactStorageKey({
      pageId: input.pageId,
      contentHash: input.contentHash,
    })

    if (!storageKey) {
      return {
        success: false,
        errorCode: 'INVALID_KEY',
        message: `Unable to build a valid storage key for page ${input.pageId}`,
      }
    }

    const filePath = this.resolveStoragePath(storageKey)

    if (!filePath) {
      return {
        success: false,
        errorCode: 'INVALID_KEY',
        message: `Storage key ${storageKey} is invalid for local storage`,
      }
    }

    try {
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(filePath, input.html, 'utf8')

      return {
        success: true,
        storageProvider: this.provider,
        storageKey,
        bytes: Buffer.byteLength(input.html, 'utf8'),
      }
    } catch (error) {
      return {
        success: false,
        errorCode: 'WRITE_FAILED',
        message: `Failed to write published artifact to local storage: ${getReadableErrorMessage(error)}`,
      }
    }
  }

  async readArtifact(input: PublishArtifactReadInput): Promise<PublishArtifactReadResult> {
    const filePath = this.resolveStoragePath(input.storageKey)

    if (!filePath) {
      return {
        success: false,
        errorCode: 'INVALID_KEY',
        message: `Storage key ${input.storageKey} is invalid for local storage`,
      }
    }

    try {
      const html = await fs.readFile(filePath, 'utf8')

      return {
        success: true,
        html,
        bytes: Buffer.byteLength(html, 'utf8'),
      }
    } catch (error) {
      const code = getNodeErrorCode(error)

      if (code === 'ENOENT') {
        return {
          success: false,
          errorCode: 'NOT_FOUND',
          message: `Published artifact was not found for key ${input.storageKey}`,
        }
      }

      return {
        success: false,
        errorCode: 'READ_FAILED',
        message: `Failed to read published artifact from local storage: ${getReadableErrorMessage(error)}`,
      }
    }
  }

  private resolveStoragePath(storageKey: string): string | null {
    const parsed = parsePublishedArtifactStorageKey(storageKey)

    if (!parsed) {
      return null
    }

    const filePath = path.resolve(this.rootDir, 'pages', parsed.pageId, parsed.fileName)

    if (!isPathInsideRoot(filePath, this.rootDir)) {
      return null
    }

    return filePath
  }
}

function isPathInsideRoot(filePath: string, rootDir: string): boolean {
  const relative = path.relative(rootDir, filePath)

  if (relative.length === 0) {
    return false
  }

  if (relative === '..') {
    return false
  }

  if (relative.startsWith(`..${path.sep}`)) {
    return false
  }

  return !path.isAbsolute(relative)
}

function getNodeErrorCode(error: unknown): string | null {
  if (!(error instanceof Error)) {
    return null
  }

  if (!('code' in error)) {
    return null
  }

  const value = (error as { code?: unknown }).code

  return typeof value === 'string' ? value : null
}

function getReadableErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'unknown error'
}

