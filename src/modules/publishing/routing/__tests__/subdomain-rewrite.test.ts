import { describe, expect, it } from 'vitest'

import { resolvePublishedSubdomainSlug } from '../subdomain-rewrite'

describe('resolvePublishedSubdomainSlug', () => {
  it('returns slug for matching single-label subdomain', () => {
    const result = resolvePublishedSubdomainSlug({
      hostHeader: 'acme.app.com',
      rootDomain: 'app.com',
    })

    expect(result).toBe('acme')
  })

  it('handles host header with port', () => {
    const result = resolvePublishedSubdomainSlug({
      hostHeader: 'acme.app.com:3000',
      rootDomain: 'app.com',
    })

    expect(result).toBe('acme')
  })

  it('supports root domain env values with scheme and wildcard prefix', () => {
    const result = resolvePublishedSubdomainSlug({
      hostHeader: 'acme.app.com',
      rootDomain: 'https://*.app.com/',
    })

    expect(result).toBe('acme')
  })

  it('returns null for root domain host without subdomain', () => {
    const result = resolvePublishedSubdomainSlug({
      hostHeader: 'app.com',
      rootDomain: 'app.com',
    })

    expect(result).toBeNull()
  })

  it('returns null for nested subdomains', () => {
    const result = resolvePublishedSubdomainSlug({
      hostHeader: 'blog.acme.app.com',
      rootDomain: 'app.com',
    })

    expect(result).toBeNull()
  })

  it('returns null for reserved subdomains', () => {
    const result = resolvePublishedSubdomainSlug({
      hostHeader: 'www.app.com',
      rootDomain: 'app.com',
    })

    expect(result).toBeNull()
  })

  it('returns null for invalid slug characters', () => {
    const result = resolvePublishedSubdomainSlug({
      hostHeader: 'acme_team.app.com',
      rootDomain: 'app.com',
    })

    expect(result).toBeNull()
  })

  it('returns null when root domain env is missing', () => {
    const result = resolvePublishedSubdomainSlug({
      hostHeader: 'acme.app.com',
      rootDomain: undefined,
    })

    expect(result).toBeNull()
  })
})
