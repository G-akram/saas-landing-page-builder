import { NextResponse } from 'next/server'
import { z } from 'zod'

import { publishPage } from '@/modules/publishing/actions'

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

  const result = await publishPage({ pageId: parsed.data.pageId })
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
