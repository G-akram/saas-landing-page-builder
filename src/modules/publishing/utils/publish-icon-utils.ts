/**
 * Curated inline SVG path data for icons used in block templates.
 * Using raw SVG paths avoids React component rendering in the server-side
 * publishing pipeline, which uses a CJS require() React instance that can
 * conflict with ESM React components from lucide-react.
 *
 * All paths are from the Lucide icon set (24×24 viewBox, strokeWidth=2,
 * strokeLinecap=round, strokeLinejoin=round, fill=none).
 */
const ICON_PATHS: Record<string, string> = {
  zap: '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>',
  'shield-check':
    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  'chart-bar':
    '<line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/>',
  'bar-chart-2':
    '<line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>',
  'bar-chart':
    '<line x1="18" x2="18" y1="20" y2="10"/><line x1="12" x2="12" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/>',
  rocket:
    '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>' +
    '<path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>' +
    '<path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>' +
    '<path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
  puzzle:
    '<path d="M19.439 7.85c-.049.322.059.648.289.878l1.568 1.568c.47.47.706 1.087.706 1.704s-.235 1.233-.706 1.704l-1.611 1.611a.98.98 0 0 1-.837.276c-.47-.07-.802-.48-.968-.925a2.501 2.501 0 1 0-3.214 3.214c.446.166.855.497.925.968a.979.979 0 0 1-.276.837l-1.61 1.61a2.404 2.404 0 0 1-3.408 0l-1.569-1.567a.881.881 0 0 0-.878-.29c-.493.074-.84.504-1.02.968a2.5 2.5 0 1 1-3.237-3.237c.464-.18.894-.527.967-1.02a.88.88 0 0 0-.289-.878l-1.568-1.568A2.402 2.402 0 0 1 1.998 12c0-.617.236-1.234.706-1.704L4.23 8.77c.24-.24.581-.353.917-.303.515.077.877.528 1.073 1.01a2.5 2.5 0 1 0 3.259-3.259c-.482-.196-.933-.558-1.01-1.073-.05-.336.062-.676.303-.917l1.525-1.525A2.402 2.402 0 0 1 12 2c.617 0 1.234.236 1.704.706l1.568 1.568c.23.23.556.338.878.29.493-.074.84-.504 1.02-.968a2.5 2.5 0 1 1 3.237 3.237c-.464.18-.894.527-.967 1.02z"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>' +
    '<path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  globe:
    '<circle cx="12" cy="12" r="10"/><line x1="2" x2="22" y1="12" y2="12"/>' +
    '<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>',
  cpu:
    '<rect x="4" y="4" width="16" height="16" rx="2"/><rect x="9" y="9" width="6" height="6"/>' +
    '<line x1="9" x2="9" y1="1" y2="4"/><line x1="15" x2="15" y1="1" y2="4"/>' +
    '<line x1="9" x2="9" y1="20" y2="23"/><line x1="15" x2="15" y1="20" y2="23"/>' +
    '<line x1="20" x2="23" y1="9" y2="9"/><line x1="20" x2="23" y1="14" y2="14"/>' +
    '<line x1="1" x2="4" y1="9" y2="9"/><line x1="1" x2="4" y1="14" y2="14"/>',
  layers:
    '<polygon points="12 2 2 7 12 12 22 7 12 2"/>' +
    '<polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/>',
  'bar-chart-horizontal':
    '<line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="14" y1="12" y2="12"/><line x1="4" x2="17" y1="18" y2="18"/>',
  sparkles:
    '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.287 1.288L3 12l5.8 1.9a2 2 0 0 1 1.288 1.287L12 21l1.9-5.8a2 2 0 0 1 1.287-1.288L21 12l-5.8-1.9a2 2 0 0 1-1.288-1.287Z"/>',
  check:
    '<path d="M20 6 9 17l-5-5"/>',
  star:
    '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
  'arrow-right':
    '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
}

/** Fallback SVG path when an icon name is not in the curated map. */
const FALLBACK_PATH = '<circle cx="12" cy="12" r="9"/>'

/**
 * Returns the inner SVG path markup for a given icon name.
 * Uses a curated static map — no React component rendering required.
 */
export function getIconSvgPaths(name: string): string {
  return ICON_PATHS[name] ?? FALLBACK_PATH
}
