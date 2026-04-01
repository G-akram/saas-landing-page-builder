import { z } from 'zod'

import { capturePublishedLead } from '@/modules/publishing'
import { logger } from '@/shared/lib/logger'

const LeadSubmissionRequestSchema = z.object({
  elementId: z.string().min(1),
  email: z.string().min(1),
  name: z.string().trim().min(1).optional(),
  message: z.string().trim().min(1).optional(),
})

interface PublishedPageLeadRouteContext {
  params: Promise<{ slug: string }>
}

export async function POST(
  request: Request,
  context: PublishedPageLeadRouteContext,
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

  const parsed = LeadSubmissionRequestSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(null, {
      status: 400,
      headers: { 'Cache-Control': 'no-store' },
    })
  }

  try {
    const result = await capturePublishedLead({
      slug,
      elementId: parsed.data.elementId,
      email: parsed.data.email,
      name: parsed.data.name,
      message: parsed.data.message,
      cookieHeader: request.headers.get('cookie'),
    })

    if (!result.success) {
      return new Response(null, {
        status: result.errorCode === 'INVALID_PAYLOAD' ? 400 : 404,
        headers: { 'Cache-Control': 'no-store' },
      })
    }

    return new Response(null, {
      status: 204,
      headers: { 'Cache-Control': 'no-store' },
    })
  } catch (error) {
    logger.error('Published lead submission route failed', {
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
