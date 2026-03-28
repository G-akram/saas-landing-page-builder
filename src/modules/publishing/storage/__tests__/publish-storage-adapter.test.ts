import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { createPublishStorageAdapter } from '../publish-storage-adapter'
import { buildPublishedArtifactStorageKey } from '../publish-storage-key'

let tempRootDir = ''

describe('publish storage adapter', () => {
  beforeEach(async () => {
    tempRootDir = await fs.mkdtemp(path.join(os.tmpdir(), 'publish-storage-'))
    delete process.env.PUBLISH_STORAGE_PROVIDER
  })

  afterEach(async () => {
    if (tempRootDir.length > 0) {
      await fs.rm(tempRootDir, { recursive: true, force: true })
      tempRootDir = ''
    }

    delete process.env.PUBLISH_STORAGE_PROVIDER
  })

  it('builds deterministic storage keys from pageId and contentHash', () => {
    const key = buildPublishedArtifactStorageKey({
      pageId: 'page-123',
      contentHash: 'a'.repeat(64),
    })

    expect(key).toBe(`pages/page-123/${'a'.repeat(64)}.html`)
  })

  it('rejects invalid storage key inputs', () => {
    const invalidPageIdKey = buildPublishedArtifactStorageKey({
      pageId: 'page/with/slash',
      contentHash: 'a'.repeat(64),
    })

    const invalidHashKey = buildPublishedArtifactStorageKey({
      pageId: 'page-123',
      contentHash: 'not-a-sha256-hash',
    })

    expect(invalidPageIdKey).toBeNull()
    expect(invalidHashKey).toBeNull()
  })

  it('writes and reads a published artifact using local provider', async () => {
    const adapter = createPublishStorageAdapter({
      provider: 'local',
      localRootDir: tempRootDir,
    })

    const writeResult = await adapter.writeArtifact({
      pageId: 'page-abc',
      contentHash: 'b'.repeat(64),
      html: '<!DOCTYPE html><html><body><h1>Hello</h1></body></html>',
    })

    expect(writeResult.success).toBe(true)
    if (!writeResult.success) return

    expect(writeResult.storageProvider).toBe('local')
    expect(writeResult.storageKey).toBe(`pages/page-abc/${'b'.repeat(64)}.html`)

    const readResult = await adapter.readArtifact({
      storageKey: writeResult.storageKey,
    })

    expect(readResult.success).toBe(true)
    if (!readResult.success) return

    expect(readResult.html).toContain('<h1>Hello</h1>')
    expect(readResult.bytes).toBeGreaterThan(0)
  })

  it('returns not found for missing artifact keys', async () => {
    const adapter = createPublishStorageAdapter({
      provider: 'local',
      localRootDir: tempRootDir,
    })

    const result = await adapter.readArtifact({
      storageKey: `pages/page-xyz/${'c'.repeat(64)}.html`,
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.errorCode).toBe('NOT_FOUND')
  })

  it('rejects malformed storage keys on read', async () => {
    const adapter = createPublishStorageAdapter({
      provider: 'local',
      localRootDir: tempRootDir,
    })

    const result = await adapter.readArtifact({
      storageKey: '../outside.html',
    })

    expect(result.success).toBe(false)
    if (result.success) return

    expect(result.errorCode).toBe('INVALID_KEY')
  })

  it('throws for unsupported object-storage provider boundary', () => {
    expect(() => createPublishStorageAdapter({ provider: 'object-storage' })).toThrow(
      'Publish storage provider "object-storage" is not implemented yet',
    )
  })

  it('throws for invalid provider configured in environment', () => {
    process.env.PUBLISH_STORAGE_PROVIDER = 'invalid-provider'

    expect(() => createPublishStorageAdapter()).toThrow(
      'Unsupported publish storage provider "invalid-provider". Supported values: local, object-storage',
    )
  })
})
