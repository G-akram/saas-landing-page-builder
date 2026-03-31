import { createHash } from 'node:crypto'
import { createRequire } from 'node:module'

import { createElement, type ReactElement } from 'react'

import { PageDocumentSchema, isContainerElement, type Section } from '@/shared/types'

import {
  type BuildSeoMetadataInput,
  type PublishedSeoMetadata,
  type RenderPublishedPageInput,
  type RenderPublishedPageResult,
} from '../types'
import { PublishedPageDocument } from '../components/published-page-document'
import { buildPublishedSeoMetadata } from './publish-renderer-utils'

const HTML_DOCTYPE = '<!DOCTYPE html>'

interface RenderStaticDocumentInput {
  slug: string
  sections: RenderPublishedPageInput['document']['variants'][number]['sections']
  metadata: PublishedSeoMetadata
  primaryGoalElementId: string | null
  variantId: string
  hasLeadCapture: boolean
}

interface ReactDomServerNode {
  renderToStaticMarkup: (element: ReactElement) => string
}

const require = createRequire(import.meta.url)

export function renderPublishedPage(
  input: RenderPublishedPageInput,
): Promise<RenderPublishedPageResult> {
  const parsed = PageDocumentSchema.safeParse(input.document)

  if (!parsed.success) {
    return Promise.resolve({
      success: false,
      errorCode: 'INVALID_DOCUMENT',
      message: `Page document for ${input.pageId} is invalid`,
    })
  }

  const variant = parsed.data.variants.find((candidate) => candidate.id === input.variantId)

  if (!variant) {
    return Promise.resolve({
      success: false,
      errorCode: 'VARIANT_NOT_FOUND',
      message: `Variant ${input.variantId} was not found for page ${input.pageId}`,
    })
  }

  const seoInput: BuildSeoMetadataInput = {
    pageName: input.pageName,
    slug: input.slug,
    sections: variant.sections,
  }

  if (input.liveUrl) {
    seoInput.liveUrl = input.liveUrl
  }

  if (input.seo) {
    seoInput.seo = input.seo
  }

  const metadata = buildPublishedSeoMetadata(seoInput)

  return Promise.resolve(
    renderStaticDocument({
      slug: input.slug,
      sections: variant.sections,
      metadata,
      primaryGoalElementId: variant.primaryGoal?.elementId ?? null,
      variantId: variant.id,
      hasLeadCapture: hasLeadCaptureForm(variant.sections),
    }),
  )
}

function renderStaticDocument({
  slug,
  sections,
  metadata,
  primaryGoalElementId,
  variantId,
  hasLeadCapture,
}: RenderStaticDocumentInput): RenderPublishedPageResult {
  const markup = getRenderToStaticMarkup()(
    createElement(PublishedPageDocument, {
      slug,
      sections,
      metadata,
      primaryGoalElementId,
      hasLeadCapture,
    }),
  )

  const html = markup.startsWith(HTML_DOCTYPE) ? markup : `${HTML_DOCTYPE}${markup}`
  const contentHash = createHash('sha256').update(html).digest('hex')

  return {
    success: true,
    html,
    contentHash,
    variantId,
    metadata,
  }
}

function getRenderToStaticMarkup(): (element: ReactElement) => string {
  const { renderToStaticMarkup } = require('react-dom/server.node') as ReactDomServerNode
  return renderToStaticMarkup
}

function hasLeadCaptureForm(
  sections: RenderPublishedPageInput['document']['variants'][number]['sections'],
): boolean {
  return sections.some((section) =>
    section.elements.some((element) => elementHasForm(element)),
  )
}

function elementHasForm(element: Section['elements'][number]): boolean {
  if (element.content.type === 'form') return true
  if (isContainerElement(element) && element.formConfig) return true
  if (element.type === 'container') {
    return element.children.some((child) => child.content.type === 'form')
  }
  return false
}
