import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

import {
  getFileExtensionForImageType,
  type AllowedImageType,
} from '@/shared/lib/upload-validation'

// ── Interface ────────────────────────────────────────────────────────────────

export interface UploadResult {
  url: string
  key: string
}

export interface UploadService {
  upload(file: Buffer, mimeType: AllowedImageType): Promise<UploadResult>
  delete(key: string): Promise<void>
}

// ── Local adapter ────────────────────────────────────────────────────────────

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')
const UPLOAD_KEY_PATTERN = /^[a-f0-9-]{36}\.(jpg|png|webp|gif)$/

class LocalUploadAdapter implements UploadService {
  async upload(file: Buffer, mimeType: AllowedImageType): Promise<UploadResult> {
    await fs.mkdir(UPLOADS_DIR, { recursive: true })

    const ext = getFileExtensionForImageType(mimeType)
    const key = `${randomUUID()}${ext}`
    const dest = resolveUploadPath(key)
    if (!dest) {
      throw new Error('Failed to resolve upload path for generated key')
    }

    await fs.writeFile(dest, file)

    return { url: `/uploads/${key}`, key }
  }

  async delete(key: string): Promise<void> {
    const target = resolveUploadPath(key)
    if (!target) {
      throw new Error('Invalid upload key')
    }

    await fs.unlink(target)
  }
}

function resolveUploadPath(key: string): string | null {
  const normalizedKey = key.trim().toLowerCase()
  if (!UPLOAD_KEY_PATTERN.test(normalizedKey)) {
    return null
  }

  const resolvedPath = path.resolve(UPLOADS_DIR, normalizedKey)
  const relativePath = path.relative(UPLOADS_DIR, resolvedPath)
  if (relativePath.length === 0 || relativePath.startsWith('..') || path.isAbsolute(relativePath)) {
    return null
  }

  return resolvedPath
}

// ── Factory — swap point for cloud adapters in Phase 4 ───────────────────────

export function getUploadService(): UploadService {
  return new LocalUploadAdapter()
}
