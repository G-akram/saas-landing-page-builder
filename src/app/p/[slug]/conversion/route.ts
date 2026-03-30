import { z } from 'zod'

import { recordPublishedPageConversion } from '@/modules/publishing'
import { logger } from '@/shared/lib/logger'

const ConversionRequestSchema = z.object({
  goalElementId: z.string().min(1),
})

interface PublishedPageConversionRouteContext {
  params: Promise<{ slug: string }>
}

export async function POST(
  request: Request,
  context: PublishedPageConversionRouteContext,
): Promise<Response> {
  const { slug: rawSlug } = await context.params
  const slug = rawSlug.trim()

  if (slug.length === 0) {
    return new Response(null, {
      status: 404,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return new Response(null, {
      status: 400,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  const parsed = ConversionRequestSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(null, {
      status: 400,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  try {
    await recordPublishedPageConversion({
      slug,
      goalElementId: parsed.data.goalElementId,
      cookieHeader: request.headers.get('cookie'),
    })

    return new Response(null, {
      status: 204,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    logger.error('Published conversion route failed', {
      slug,
      error: getReadableErrorMessage(error),
    })

    return new Response(null, {
      status: 500,
      headers: { 'Cache-Control': 'no-store' },
    })
  }
}

function getReadableErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  return 'unknown error'
}
