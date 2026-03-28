import { type PublishStorageProvider } from './publishing'

export const PUBLISH_STORAGE_OPERATION_ERROR_CODES = [
  'INVALID_KEY',
  'NOT_FOUND',
  'READ_FAILED',
  'WRITE_FAILED',
] as const

export type PublishStorageOperationErrorCode =
  (typeof PUBLISH_STORAGE_OPERATION_ERROR_CODES)[number]

export interface BuildPublishedArtifactStorageKeyInput {
  pageId: string
  contentHash: string
}

export interface PublishStorageOperationError {
  success: false
  errorCode: PublishStorageOperationErrorCode
  message: string
}

export interface PublishArtifactWriteInput {
  pageId: string
  contentHash: string
  html: string
}

export interface PublishArtifactWriteSuccess {
  success: true
  storageProvider: PublishStorageProvider
  storageKey: string
  bytes: number
}

export type PublishArtifactWriteResult =
  | PublishArtifactWriteSuccess
  | PublishStorageOperationError

export interface PublishArtifactReadInput {
  storageKey: string
}

export interface PublishArtifactReadSuccess {
  success: true
  html: string
  bytes: number
}

export type PublishArtifactReadResult =
  | PublishArtifactReadSuccess
  | PublishStorageOperationError

export interface PublishStorageAdapter {
  readonly provider: PublishStorageProvider
  writeArtifact(input: PublishArtifactWriteInput): Promise<PublishArtifactWriteResult>
  readArtifact(input: PublishArtifactReadInput): Promise<PublishArtifactReadResult>
}

export interface CreatePublishStorageAdapterOptions {
  provider?: PublishStorageProvider
  localRootDir?: string
}
