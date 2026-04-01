import { icons, type LucideIcon } from 'lucide-react'

import { logger } from '@/shared/lib/logger'

// ── SVG attribute name mapping ───────────────────────────────────────────────

/** Convert React camelCase prop names to SVG attribute names. */
const SVG_ATTR_MAP: Record<string, string> = {
  strokeWidth: 'stroke-width',
  strokeLinecap: 'stroke-linecap',
  strokeLinejoin: 'stroke-linejoin',
  fillRule: 'fill-rule',
  clipRule: 'clip-rule',
  xlinkHref: 'xlink:href',
}

function toSvgAttrName(reactProp: string): string {
  return SVG_ATTR_MAP[reactProp] ?? reactProp
}

// ── Icon node serialization ──────────────────────────────────────────────────

type IconNode = [string, Record<string, string>][]

/**
 * Serializes an array of Lucide icon node tuples into SVG inner markup.
 * Each tuple is `[tagName, attributes]` — e.g. `["path", { d: "M..." }]`.
 */
function serializeIconNodes(nodes: IconNode): string {
  return nodes
    .map(([tag, attrs]) => {
      const attrString = Object.entries(attrs)
        .filter(([key]) => key !== 'key')
        .map(([key, value]) => {
          const escaped = String(value).replace(/"/g, '&quot;')
          return `${toSvgAttrName(key)}="${escaped}"`
        })
        .join(' ')
      return `<${tag} ${attrString}/>`
    })
    .join('')
}

// ── Cache and lookup ─────────────────────────────────────────────────────────

const svgPathCache = new Map<string, string>()

/** Convert kebab-case icon name to PascalCase for lucide-react lookup. */
function kebabToPascal(name: string): string {
  return name
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

/**
 * Extracts the inner SVG markup for any valid Lucide icon name.
 *
 * Accesses the raw `iconNode` data from lucide-react icon components
 * (an array of `[tag, attrs]` tuples) and serializes it to SVG markup.
 * This avoids rendering React components entirely — no `renderToStaticMarkup`,
 * no CJS/ESM dual-instance conflicts.
 *
 * Returns `null` if the icon name is not found in the lucide-react registry.
 */
export function getLucideIconSvg(name: string): string | null {
  const cached = svgPathCache.get(name)
  if (cached !== undefined) return cached

  const pascal = kebabToPascal(name)
  const Icon = (icons as Record<string, LucideIcon | undefined>)[pascal]
  if (!Icon) return null

  // Lucide icons are forwardRef components. Calling `.render(props, ref)`
  // returns a React element whose `props.iconNode` contains the raw SVG data
  // as an array of [tagName, attributes] tuples.
  // Wrapped in try/catch because this depends on Lucide's internal forwardRef
  // implementation — a library update could change the shape silently.
  try {
    const element = (Icon as unknown as { render: (props: object, ref: null) => { props: { iconNode: IconNode } } })
      .render({}, null)

    const iconNode = element.props.iconNode
    if (!iconNode || !Array.isArray(iconNode)) return null

    const svg = serializeIconNodes(iconNode)
    svgPathCache.set(name, svg)
    return svg
  } catch {
    logger.warn('Failed to extract Lucide icon SVG — library internals may have changed', {
      iconName: name,
    })
    return null
  }
}
