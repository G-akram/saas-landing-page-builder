import { NextResponse } from 'next/server'

import { auth } from '@/shared/lib/auth'
import { logger } from '@/shared/lib/logger'
import { getUploadService } from '@/shared/lib/upload-service'
import {
  isAllowedImageType,
  MAX_IMAGE_SIZE_BYTES,
} from '@/shared/lib/upload-validation'

export async function POST(request: Request): Promise<NextResponse> {
  const session = await auth()
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'Invalid multipart request' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Missing file field' }, { status: 400 })
  }

  if (!isAllowedImageType(file.type)) {
    return NextResponse.json(
      { error: `File type not allowed: ${file.type}` },
      { status: 400 },
    )
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    return NextResponse.json(
      { error: 'File exceeds 5 MB limit' },
      { status: 413 },
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const result = await getUploadService().upload(buffer, file.name, file.type)
    logger.info('Image uploaded', { url: result.url, userId: session.user.id })
    return NextResponse.json(result)
  } catch (err) {
    logger.error('Upload failed', { error: String(err) })
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
