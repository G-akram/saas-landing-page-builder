import { eq } from 'drizzle-orm'
import { z } from 'zod'

import { db, leadSubmissions, pages } from '@/shared/db'
import {
  PageDocumentSchema,
  type AtomicElement,
  type FormConfig,
  type Section,
} from '@/shared/types'

import { readPublishedAssignmentFromCookieHeader } from './published-assignment-cookie'
import { getPublishedPageMetadataListBySlug } from './queries'
import { sendLeadToWebhook } from './webhook-delivery'

const EMAIL_SCHEMA = z.string().trim().toLowerCase().pipe(z.email())

type LeadCaptureErrorCode =
  | 'ASSIGNMENT_NOT_FOUND'
  | 'PUBLISHED_VARIANT_NOT_FOUND'
  | 'PAGE_NOT_FOUND'
  | 'FORM_NOT_FOUND'
  | 'INVALID_PAYLOAD'

interface CaptureLeadErrorResult {
  success: false
  errorCode: LeadCaptureErrorCode
}

interface CaptureLeadSuccessResult {
  success: true
  deliveryStatus: 'stored' | 'delivered' | 'delivery-failed' | 'skipped'
}

export type CaptureLeadResult = CaptureLeadErrorResult | CaptureLeadSuccessResult

interface CaptureLeadInput {
  slug: string
  elementId: string
  email: string
  name?: string | undefined
  message?: string | undefined
  cookieHeader: string | null
}

export async function capturePublishedLead({
  slug,
  elementId,
  email,
  name,
  message,
  cookieHeader,
}: CaptureLeadInput): Promise<CaptureLeadResult> {
  const assignment = readPublishedAssignmentFromCookieHeader({ slug, cookieHeader })
  if (!assignment) {
    return { success: false, errorCode: 'ASSIGNMENT_NOT_FOUND' }
  }

  const publishedVariants = await getPublishedPageMetadataListBySlug(slug)
  const publishedVariant = publishedVariants.find(
    (variant) =>
      variant.pageId === assignment.pageId &&
      variant.variantId === assignment.variantId &&
      variant.contentHash === assignment.contentHash,
  )
  if (!publishedVariant) {
    return { success: false, errorCode: 'PUBLISHED_VARIANT_NOT_FOUND' }
  }

  const pageRows = await db
    .select({
      id: pages.id,
      document: pages.document,
    })
    .from(pages)
    .where(eq(pages.id, assignment.pageId))
    .limit(1)

  const page = pageRows[0]
  if (!page) {
    return { success: false, errorCode: 'PAGE_NOT_FOUND' }
  }

  const parsedDocument = PageDocumentSchema.safeParse(page.document)
  if (!parsedDocument.success) {
    return { success: false, errorCode: 'FORM_NOT_FOUND' }
  }

  const variant = parsedDocument.data.variants.find((candidate) => candidate.id === assignment.variantId)
  if (!variant) {
    return { success: false, errorCode: 'FORM_NOT_FOUND' }
  }

  const formConfig = findFormConfig(variant.sections, elementId)
  if (!formConfig) {
    return { success: false, errorCode: 'FORM_NOT_FOUND' }
  }

  const normalizedEmail = EMAIL_SCHEMA.safeParse(email)
  if (!normalizedEmail.success) {
    return { success: false, errorCode: 'INVALID_PAYLOAD' }
  }

  if (formConfig.variant === 'contact' && (!name || !message)) {
    return { success: false, errorCode: 'INVALID_PAYLOAD' }
  }

  const deliveryTarget = formConfig.submitTarget
  const webhookUrl = formConfig.webhookUrl ?? null

  let deliveryStatus: 'stored' | 'delivered' | 'delivery-failed' | 'skipped' = 'stored'
  let deliveryHttpStatus: number | null = null

  if (deliveryTarget === 'webhook') {
    if (!webhookUrl) {
      deliveryStatus = 'skipped'
    } else {
      const webhookResult = await sendLeadToWebhook({
        webhookUrl,
        slug,
        pageId: assignment.pageId,
        variantId: assignment.variantId,
        elementId,
        formVariant: formConfig.variant,
        email: normalizedEmail.data,
        name: name ?? null,
        message: message ?? null,
      })
      deliveryStatus = webhookResult.status
      deliveryHttpStatus = webhookResult.httpStatus
    }
  }

  await db.insert(leadSubmissions).values({
    pageId: assignment.pageId,
    slug,
    variantId: assignment.variantId,
    elementId,
    formVariant: formConfig.variant,
    email: normalizedEmail.data,
    name: name ?? null,
    message: message ?? null,
    deliveryTarget,
    deliveryStatus,
    deliveryHttpStatus,
    webhookUrl,
  })

  return { success: true, deliveryStatus }
}

function findFormConfig(sections: Section[], elementId: string): FormConfig | null {
  for (const section of sections) {
    for (const element of section.elements) {
      if (element.id === elementId) {
        if (element.type !== 'container' && isLeadFormElement(element)) {
          return element.content
        }

        if (element.type === 'container' && element.formConfig) {
          return element.formConfig
        }
      }

      if (element.type !== 'container') {
        continue
      }

      for (const child of element.children) {
        if (child.id === elementId && isLeadFormElement(child)) {
          return child.content
        }
      }
    }
  }

  return null
}

function isLeadFormElement(element: AtomicElement): element is AtomicElement & { content: { type: 'form' } } {
  return element.type === 'form' && element.content.type === 'form'
}
