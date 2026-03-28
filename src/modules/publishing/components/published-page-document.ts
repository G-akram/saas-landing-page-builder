import { createElement } from 'react'

import { type Section } from '@/shared/types'

import { type PublishedSeoMetadata } from '../types'
import { PUBLISHED_PAGE_BASE_CSS } from '../utils/publish-renderer-utils'
import { PublishedPageSection } from './published-page-section'

interface PublishedPageDocumentProps {
  sections: Section[]
  metadata: PublishedSeoMetadata
}

export function PublishedPageDocument({
  sections,
  metadata,
}: PublishedPageDocumentProps): React.JSX.Element {
  const headChildren: React.ReactNode[] = [
    createElement('meta', { key: 'charset', charSet: 'utf-8' }),
    createElement('meta', {
      key: 'viewport',
      name: 'viewport',
      content: 'width=device-width, initial-scale=1',
    }),
    createElement('title', { key: 'title' }, metadata.title),
    createElement('meta', {
      key: 'description',
      name: 'description',
      content: metadata.description,
    }),
    createElement('meta', {
      key: 'og-type',
      property: 'og:type',
      content: 'website',
    }),
    createElement('meta', {
      key: 'og-title',
      property: 'og:title',
      content: metadata.title,
    }),
    createElement('meta', {
      key: 'og-description',
      property: 'og:description',
      content: metadata.description,
    }),
  ]

  if (metadata.ogImage) {
    headChildren.push(
      createElement('meta', {
        key: 'og-image',
        property: 'og:image',
        content: metadata.ogImage,
      }),
    )
  }

  if (metadata.canonicalUrl) {
    headChildren.push(
      createElement('meta', {
        key: 'og-url',
        property: 'og:url',
        content: metadata.canonicalUrl,
      }),
      createElement('link', {
        key: 'canonical',
        rel: 'canonical',
        href: metadata.canonicalUrl,
      }),
    )
  }

  headChildren.push(
    createElement('style', { key: 'base-style' }, PUBLISHED_PAGE_BASE_CSS),
  )

  return createElement(
    'html',
    { lang: 'en' },
    createElement('head', null, ...headChildren),
    createElement(
      'body',
      null,
      createElement(
        'main',
        null,
        ...sections.map((section) =>
          createElement(PublishedPageSection, {
            key: section.id,
            section,
          }),
        ),
      ),
    ),
  )
}
