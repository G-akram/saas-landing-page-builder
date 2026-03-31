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
  hasLeadCapture: boolean
}

export function PublishedPageDocument({
  slug,
  sections,
  metadata,
  primaryGoalElementId,
  hasLeadCapture,
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

  headChildren.push(createElement('style', { key: 'base-style' }, PUBLISHED_PAGE_BASE_CSS))

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
            slug,
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
      hasLeadCapture
        ? createElement('script', {
            key: 'lead-capture-handler',
            dangerouslySetInnerHTML: {
              __html: buildLeadCaptureScript(slug),
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

function buildLeadCaptureScript(slug: string): string {
  const endpoint = `/p/${slug}/lead`

  return `(function(){var forms=document.querySelectorAll('.pb-lead-form');if(!forms.length)return;var url=${JSON.stringify(endpoint)};forms.forEach(function(form){if(!(form instanceof HTMLFormElement))return;form.addEventListener('submit',function(event){event.preventDefault();var statusEl=form.querySelector('[data-pb-form-status]');if(statusEl instanceof HTMLElement){statusEl.textContent='Submitting...';statusEl.style.color='inherit';}var data=new FormData(form);var payload={elementId:String(data.get('elementId')||''),email:String(data.get('email')||''),name:String(data.get('name')||''),message:String(data.get('message')||'')};fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),credentials:'same-origin'}).then(function(response){if(!response.ok){throw new Error('submit-failed');}var successMessage=form.getAttribute('data-pb-form-success-message')||'Thanks. We received your submission.';if(statusEl instanceof HTMLElement){statusEl.textContent=successMessage;statusEl.style.color='#15803d';}form.reset();}).catch(function(){if(statusEl instanceof HTMLElement){statusEl.textContent='Submission failed. Please try again.';statusEl.style.color='#b91c1c';}});});});})();`
}
