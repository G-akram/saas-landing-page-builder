import { logger } from '@/shared/lib/logger'

export interface SendLeadToWebhookInput {
  webhookUrl: string
  slug: string
  pageId: string
  variantId: string
  elementId: string
  formVariant: 'email' | 'contact' | 'newsletter'
  email: string
  name: string | null
  message: string | null
}

export async function sendLeadToWebhook(
  input: SendLeadToWebhookInput,
): Promise<{ status: 'delivered' | 'delivery-failed'; httpStatus: number | null }> {
  try {
    const response = await fetch(input.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        slug: input.slug,
        pageId: input.pageId,
        variantId: input.variantId,
        elementId: input.elementId,
        formVariant: input.formVariant,
        submittedAt: new Date().toISOString(),
        lead: {
          email: input.email,
          name: input.name,
          message: input.message,
        },
      }),
    })

    if (response.ok) {
      return { status: 'delivered', httpStatus: response.status }
    }

    logger.warn('Lead webhook delivery failed', {
      pageId: input.pageId,
      variantId: input.variantId,
      elementId: input.elementId,
      statusCode: response.status,
    })

    return { status: 'delivery-failed', httpStatus: response.status }
  } catch (error) {
    logger.warn('Lead webhook request error', {
      pageId: input.pageId,
      variantId: input.variantId,
      elementId: input.elementId,
      error: error instanceof Error ? error.message : 'unknown error',
    })

    return { status: 'delivery-failed', httpStatus: null }
  }
}
