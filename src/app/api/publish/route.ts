import { NextResponse } from 'next/server'
import { z } from 'zod'

import { publishPage } from '@/modules/publishing'
import { logger } from '@/shared/lib/logger'

const PublishRequestSchema = z.object({
  pageId: z.string().min(1),
})

export async function POST(request: Request): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON request' }, { status: 400 })
  }

  const parsed = PublishRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid publish payload' }, { status: 400 })
  }

  let result: Awaited<ReturnType<typeof publishPage>>
  try {
    result = await publishPage({ pageId: parsed.data.pageId })
  } catch (error) {
    logger.error('Publish API route failed', { error: getReadableErrorMessage(error) })
    return NextResponse.json(
      {
        success: false,
        errorCode: 'UNKNOWN_ERROR',
        message: 'Publish failed. Try again.',
      },
      { status: 500 },
    )
  }

  if (result.success) {
    return NextResponse.json(result)
  }

  return NextResponse.json(result, { status: mapPublishErrorToStatus(result.errorCode) })
}

function mapPublishErrorToStatus(errorCode: string): number {
  if (errorCode === 'NOT_AUTHENTICATED') return 401
  if (errorCode === 'PAGE_ACCESS_DENIED') return 403
  if (errorCode === 'PAGE_NOT_FOUND') return 404
  if (errorCode === 'RATE_LIMITED') return 429
  if (errorCode === 'PUBLISH_CONFLICT') return 409
  if (errorCode === 'INVALID_DOCUMENT') return 422
  return 500
}

function getReadableErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'unknown error'
}
