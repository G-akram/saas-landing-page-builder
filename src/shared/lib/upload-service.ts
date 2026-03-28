import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

// ── Interface ────────────────────────────────────────────────────────────────

export interface UploadResult {
  url: string
  key: string
}

export interface UploadService {
  upload(file: Buffer, filename: string, mimeType: string): Promise<UploadResult>
  delete(key: string): Promise<void>
}

// ── Local adapter ────────────────────────────────────────────────────────────

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

class LocalUploadAdapter implements UploadService {
  async upload(file: Buffer, filename: string, _mimeType: string): Promise<UploadResult> {
    await fs.mkdir(UPLOADS_DIR, { recursive: true })

    const ext = path.extname(filename)
    const key = `${randomUUID()}${ext}`
    const dest = path.join(UPLOADS_DIR, key)

    await fs.writeFile(dest, file)

    return { url: `/uploads/${key}`, key }
  }

  async delete(key: string): Promise<void> {
    const target = path.join(UPLOADS_DIR, key)
    await fs.unlink(target)
  }
}

// ── Factory — swap point for cloud adapters in Phase 4 ───────────────────────

export function getUploadService(): UploadService {
  return new LocalUploadAdapter()
}
