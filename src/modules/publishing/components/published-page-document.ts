import { createElement } from 'react'

import { type Section } from '@/shared/types'

import { type PublishedSeoMetadata } from '../types'
import { PUBLISHED_PAGE_BASE_CSS } from '../utils/publish-renderer-utils'
import { PublishedPageSection } from './published-page-section'

interface PublishedPageDocumentProps {
  slug: string
  sections: Section[]
  metadata: PublishedSeoMetadata
  primaryGoalElementId: string | null
}

export function PublishedPageDocument({
  slug,
  sections,
  metadata,
  primaryGoalElementId,
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
            primaryGoalElementId,
          }),
        ),
      ),
      primaryGoalElementId
        ? createElement('script', {
            key: 'primary-goal-beacon',
            dangerouslySetInnerHTML: {
              __html: buildPrimaryGoalBeaconScript(slug),
            },
          })
        : null,
    ),
  )
}

function buildPrimaryGoalBeaconScript(slug: string): string {
  const endpoint = `/p/${slug}/conversion`

  return `(function(){var goal=document.querySelector('[data-pb-primary-goal-id]');if(!goal)return;var sent=false;var url=${JSON.stringify(endpoint)};function send(goalId){if(sent)return;sent=true;var body=JSON.stringify({goalElementId:goalId});if(navigator.sendBeacon){navigator.sendBeacon(url,new Blob([body],{type:'application/json'}));return;}fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:body,keepalive:true,credentials:'same-origin'}).catch(function(){});}goal.addEventListener('click',function(){var goalId=goal.getAttribute('data-pb-primary-goal-id');if(goalId){send(goalId);}});})();`
}
