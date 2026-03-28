import { createHash } from 'node:crypto'

import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

import { PageDocumentSchema } from '@/shared/types'

import {
  type BuildSeoMetadataInput,
  type RenderPublishedPageInput,
  type RenderPublishedPageResult,
} from '../types'
import { PublishedPageDocument } from '../components/published-page-document'
import { buildPublishedSeoMetadata } from './publish-renderer-utils'

const HTML_DOCTYPE = '<!DOCTYPE html>'

export function renderPublishedPage(
  input: RenderPublishedPageInput,
): RenderPublishedPageResult {
  const parsed = PageDocumentSchema.safeParse(input.document)

  if (!parsed.success) {
    return {
      success: false,
      errorCode: 'INVALID_DOCUMENT',
      message: `Page document for ${input.pageId} is invalid`,
    }
  }

  const activeVariant = parsed.data.variants.find(
    (variant) => variant.id === parsed.data.activeVariantId,
  )

  if (!activeVariant) {
    return {
      success: false,
      errorCode: 'ACTIVE_VARIANT_NOT_FOUND',
      message: `Active variant ${parsed.data.activeVariantId} was not found for page ${input.pageId}`,
    }
  }

  const seoInput: BuildSeoMetadataInput = {
    pageName: input.pageName,
    slug: input.slug,
    sections: activeVariant.sections,
  }

  if (input.liveUrl) {
    seoInput.liveUrl = input.liveUrl
  }

  if (input.seo) {
    seoInput.seo = input.seo
  }

  const metadata = buildPublishedSeoMetadata(seoInput)

  const markup = renderToStaticMarkup(
    createElement(PublishedPageDocument, {
      sections: activeVariant.sections,
      metadata,
    }),
  )

  const html = `${HTML_DOCTYPE}${markup}`
  const contentHash = createHash('sha256').update(html).digest('hex')

  return {
    success: true,
    html,
    contentHash,
    variantId: activeVariant.id,
    metadata,
  }
}
