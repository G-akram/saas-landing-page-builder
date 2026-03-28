const RESERVED_SUBDOMAINS = new Set([
  'www',
  'app',
  'api',
  'dashboard',
  'editor',
  'p',
])

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

interface ResolvePublishedSubdomainSlugInput {
  hostHeader: string | null
  rootDomain: string | undefined
}

export function resolvePublishedSubdomainSlug(
  input: ResolvePublishedSubdomainSlugInput,
): string | null {
  const rootDomain = normalizeRootDomain(input.rootDomain)
  if (!rootDomain) {
    return null
  }

  const hostname = normalizeHostname(input.hostHeader)
  if (!hostname) {
    return null
  }

  const domainSuffix = `.${rootDomain}`
  if (!hostname.endsWith(domainSuffix)) {
    return null
  }

  const subdomain = hostname.slice(0, -domainSuffix.length)

  if (subdomain.length === 0 || subdomain.includes('.')) {
    return null
  }

  if (RESERVED_SUBDOMAINS.has(subdomain)) {
    return null
  }

  if (!SLUG_PATTERN.test(subdomain)) {
    return null
  }

  return subdomain
}

function normalizeRootDomain(rawRootDomain: string | undefined): string | null {
  if (!rawRootDomain) {
    return null
  }

  const normalizedInput = stripWildcardPrefix(rawRootDomain.trim().toLowerCase())
  if (normalizedInput.length === 0) {
    return null
  }

  try {
    const url = normalizedInput.includes('://')
      ? new URL(normalizedInput)
      : new URL(`http://${normalizedInput}`)

    return normalizeHostname(url.hostname)
  } catch {
    return null
  }
}

function stripWildcardPrefix(input: string): string {
  const schemeSeparatorIndex = input.indexOf('://')

  if (schemeSeparatorIndex === -1) {
    return input.replace(/^\*\./, '')
  }

  const scheme = input.slice(0, schemeSeparatorIndex)
  const rest = input.slice(schemeSeparatorIndex + 3)

  return `${scheme}://${rest.replace(/^\*\./, '')}`
}

function normalizeHostname(rawHostname: string | null): string | null {
  if (!rawHostname) {
    return null
  }

  const normalizedInput = rawHostname.trim().toLowerCase()
  if (normalizedInput.length === 0) {
    return null
  }

  try {
    const url = new URL(`http://${normalizedInput}`)
    return url.hostname.replace(/\.$/, '')
  } catch {
    return null
  }
}
