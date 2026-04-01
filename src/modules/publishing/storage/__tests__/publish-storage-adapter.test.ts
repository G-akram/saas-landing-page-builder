import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'

import { put } from '@vercel/blob'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { createPublishStorageAdapter } from '../publish-storage-adapter'
import { buildPublishedArtifactStorageKey } from '../publish-storage-key'

vi.mock('@vercel/blob', () => ({
  put: vi.fn(),
}))

const mockPut = vi.mocked(put)

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

  it('throws for invalid provider configured in environment', () => {
    process.env.PUBLISH_STORAGE_PROVIDER = 'invalid-provider'

    expect(() => createPublishStorageAdapter()).toThrow(
      'Unsupported publish storage provider "invalid-provider". Supported values: local, object-storage',
    )
  })
})

describe('blob publish storage adapter', () => {
  const BLOB_URL = 'https://blob.vercel-storage.com/pages/page-abc/bbb.html'
  const SAMPLE_HTML = '<!DOCTYPE html><html><body><h1>Hello</h1></body></html>'

  beforeEach(() => {
    vi.resetAllMocks()
    delete process.env.PUBLISH_STORAGE_PROVIDER
  })

  it('returns object-storage as provider', () => {
    const adapter = createPublishStorageAdapter({ provider: 'object-storage' })

    expect(adapter.provider).toBe('object-storage')
  })

  it('writes artifact and returns blob URL as storage key', async () => {
    mockPut.mockResolvedValue({ url: BLOB_URL } as Awaited<ReturnType<typeof put>>)

    const adapter = createPublishStorageAdapter({ provider: 'object-storage' })
    const result = await adapter.writeArtifact({
      pageId: 'page-abc',
      contentHash: 'b'.repeat(64),
      html: SAMPLE_HTML,
    })

    expect(result.success).toBe(true)
    if (!result.success) return

    expect(result.storageProvider).toBe('object-storage')
    expect(result.storageKey).toBe(BLOB_URL)
    expect(result.bytes).toBeGreaterThan(0)
    expect(mockPut).toHaveBeenCalledWith(
      `pages/page-abc/${'b'.repeat(64)}.html`,
      SAMPLE_HTML,
      expect.objectContaining({ access: 'public', addRandomSuffix: false }),
    )
  })

  it('returns INVALID_KEY when pageId is malformed', async () => {
    const adapter = createPublishStorageAdapter({ provider: 'object-storage' })
    const result = await adapter.writeArtifact({
      pageId: 'page/bad',
      contentHash: 'b'.repeat(64),
      html: SAMPLE_HTML,
    })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.errorCode).toBe('INVALID_KEY')
    expect(mockPut).not.toHaveBeenCalled()
  })

  it('returns WRITE_FAILED when put throws', async () => {
    mockPut.mockRejectedValue(new Error('network error'))

    const adapter = createPublishStorageAdapter({ provider: 'object-storage' })
    const result = await adapter.writeArtifact({
      pageId: 'page-abc',
      contentHash: 'b'.repeat(64),
      html: SAMPLE_HTML,
    })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.errorCode).toBe('WRITE_FAILED')
    expect(result.message).toContain('network error')
  })

  it('reads artifact by fetching the blob URL', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, status: 200, text: async () => SAMPLE_HTML }),
    )

    const adapter = createPublishStorageAdapter({ provider: 'object-storage' })
    const result = await adapter.readArtifact({ storageKey: BLOB_URL })

    expect(result.success).toBe(true)
    if (!result.success) return
    expect(result.html).toBe(SAMPLE_HTML)
    expect(result.bytes).toBeGreaterThan(0)

    vi.unstubAllGlobals()
  })

  it('returns NOT_FOUND when blob returns 404', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: false, status: 404, text: async () => '' }),
    )

    const adapter = createPublishStorageAdapter({ provider: 'object-storage' })
    const result = await adapter.readArtifact({ storageKey: BLOB_URL })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.errorCode).toBe('NOT_FOUND')

    vi.unstubAllGlobals()
  })

  it('returns INVALID_KEY for non-https storage key', async () => {
    const adapter = createPublishStorageAdapter({ provider: 'object-storage' })
    const result = await adapter.readArtifact({ storageKey: 'pages/page-abc/hash.html' })

    expect(result.success).toBe(false)
    if (result.success) return
    expect(result.errorCode).toBe('INVALID_KEY')
  })
})
