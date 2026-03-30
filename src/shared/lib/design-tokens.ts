// ── Token key types ───────────────────────────────────────────────────────

/** Semantic color roles that map to concrete hex values per theme */
export type ColorToken =
  | 'primary'
  | 'primary-foreground'
  | 'secondary'
  | 'secondary-foreground'
  | 'accent'
  | 'accent-foreground'
  | 'background'
  | 'surface'
  | 'text-primary'
  | 'text-secondary'
  | 'text-muted'
  | 'text-on-primary'
  | 'text-on-dark'
  | 'border'

/** Font pairing roles */
export type FontToken = 'heading' | 'body'

/** Section padding presets */
export type SpacingPreset = 'compact' | 'default' | 'spacious'

/** Border radius presets */
export type RadiusPreset = 'none' | 'sm' | 'md' | 'lg' | 'full'

// ── Theme definition shape ────────────────────────────────────────────────

export interface ThemeDefinition {
  id: string
  name: string
  description: string
  colors: Record<ColorToken, string>
  fonts: Record<FontToken, string>
  spacing: Record<SpacingPreset, { top: number; bottom: number; left: number; right: number }>
  radius: Record<RadiusPreset, number>
}

// ── Preset themes ─────────────────────────────────────────────────────────

const SHARED_SPACING: ThemeDefinition['spacing'] = {
  compact: { top: 48, bottom: 48, left: 24, right: 24 },
  default: { top: 80, bottom: 80, left: 24, right: 24 },
  spacious: { top: 112, bottom: 112, left: 48, right: 48 },
}

const SHARED_RADIUS: ThemeDefinition['radius'] = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
  full: 9999,
}

/**
 * Starter — clean blue/white, the normalized version of existing hardcoded colors.
 * Feels professional and safe. Good default for any landing page.
 */
const STARTER_THEME: ThemeDefinition = {
  id: 'starter',
  name: 'Starter',
  description: 'Clean and professional — blue accents on white',
  colors: {
    primary: '#2563eb',
    'primary-foreground': '#ffffff',
    secondary: '#e5e7eb',
    'secondary-foreground': '#111827',
    accent: '#2563eb',
    'accent-foreground': '#ffffff',
    background: '#ffffff',
    surface: '#f9fafb',
    'text-primary': '#111827',
    'text-secondary': '#374151',
    'text-muted': '#6b7280',
    'text-on-primary': '#ffffff',
    'text-on-dark': '#f9fafb',
    border: '#e5e7eb',
  },
  fonts: {
    heading: 'Inter, system-ui, sans-serif',
    body: 'Inter, system-ui, sans-serif',
  },
  spacing: SHARED_SPACING,
  radius: SHARED_RADIUS,
}

/**
 * Startup — vibrant indigo/purple with energetic feel.
 * Gradients, warm tones, suited for tech startups and product launches.
 */
const STARTUP_THEME: ThemeDefinition = {
  id: 'startup',
  name: 'Startup',
  description: 'Vibrant indigo and purple — energetic and modern',
  colors: {
    primary: '#6366f1',
    'primary-foreground': '#ffffff',
    secondary: '#ede9fe',
    'secondary-foreground': '#3730a3',
    accent: '#a855f7',
    'accent-foreground': '#ffffff',
    background: '#ffffff',
    surface: '#f5f3ff',
    'text-primary': '#1e1b4b',
    'text-secondary': '#4338ca',
    'text-muted': '#6b7280',
    'text-on-primary': '#ffffff',
    'text-on-dark': '#e0e7ff',
    border: '#e0e7ff',
  },
  fonts: {
    heading: "'DM Sans', system-ui, sans-serif",
    body: 'Inter, system-ui, sans-serif',
  },
  spacing: SHARED_SPACING,
  radius: SHARED_RADIUS,
}

/**
 * Agency — bold dark sections, high contrast, editorial typography.
 * Suited for creative agencies, portfolios, and premium services.
 */
const AGENCY_THEME: ThemeDefinition = {
  id: 'agency',
  name: 'Agency',
  description: 'Bold and dark — high contrast with editorial feel',
  colors: {
    primary: '#f97316',
    'primary-foreground': '#ffffff',
    secondary: '#1e293b',
    'secondary-foreground': '#f8fafc',
    accent: '#f97316',
    'accent-foreground': '#ffffff',
    background: '#0f172a',
    surface: '#1e293b',
    'text-primary': '#f8fafc',
    'text-secondary': '#cbd5e1',
    'text-muted': '#94a3b8',
    'text-on-primary': '#ffffff',
    'text-on-dark': '#f8fafc',
    border: '#334155',
  },
  fonts: {
    heading: "'Space Grotesk', system-ui, sans-serif",
    body: 'Inter, system-ui, sans-serif',
  },
  spacing: SHARED_SPACING,
  radius: SHARED_RADIUS,
}

/**
 * SaaS Dark — dark backgrounds with teal/emerald accents.
 * Developer-friendly, dashboard aesthetic, modern SaaS feel.
 */
const SAAS_DARK_THEME: ThemeDefinition = {
  id: 'saas-dark',
  name: 'SaaS Dark',
  description: 'Dark mode with teal accents — modern SaaS aesthetic',
  colors: {
    primary: '#14b8a6',
    'primary-foreground': '#042f2e',
    secondary: '#1e293b',
    'secondary-foreground': '#e2e8f0',
    accent: '#2dd4bf',
    'accent-foreground': '#042f2e',
    background: '#0f172a',
    surface: '#1e293b',
    'text-primary': '#f0fdfa',
    'text-secondary': '#ccfbf1',
    'text-muted': '#94a3b8',
    'text-on-primary': '#042f2e',
    'text-on-dark': '#f0fdfa',
    border: '#334155',
  },
  fonts: {
    heading: "Inter, system-ui, sans-serif",
    body: 'Inter, system-ui, sans-serif',
  },
  spacing: SHARED_SPACING,
  radius: SHARED_RADIUS,
}

// ── Registry ──────────────────────────────────────────────────────────────

export const THEME_REGISTRY: Record<string, ThemeDefinition> = {
  starter: STARTER_THEME,
  startup: STARTUP_THEME,
  agency: AGENCY_THEME,
  'saas-dark': SAAS_DARK_THEME,
}

export const THEME_LIST: ThemeDefinition[] = Object.values(THEME_REGISTRY)

export const DEFAULT_THEME_ID = 'starter'

export function getTheme(themeId: string): ThemeDefinition {
  return THEME_REGISTRY[themeId] ?? STARTER_THEME
}

/** All valid color token keys, useful for validation and UI */
export const COLOR_TOKEN_KEYS: ColorToken[] = [
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'accent',
  'accent-foreground',
  'background',
  'surface',
  'text-primary',
  'text-secondary',
  'text-muted',
  'text-on-primary',
  'text-on-dark',
  'border',
]
