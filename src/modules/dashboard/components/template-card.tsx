'use client'

import { getTheme } from '@/shared/lib/design-tokens'

// ── Theme-derived preview colors ──────────────────────────────────────────

interface PreviewColors {
  background: string
  surface: string
  primary: string
  accent: string
  textPrimary: string
  textMuted: string
  gradient: string
}

function getPreviewColors(themeId: string | undefined): PreviewColors | null {
  if (!themeId) return null
  const theme = getTheme(themeId)
  return {
    background: theme.colors.background,
    surface: theme.colors.surface,
    primary: theme.colors.primary,
    accent: theme.colors.accent,
    textPrimary: theme.colors['text-primary'],
    textMuted: theme.colors['text-muted'],
    gradient: theme.gradients.primary,
  }
}

// ── Props ────────────────────────────────────────────────────────────────

interface TemplateCardProps {
  templateId?: string
  name: string
  description: string
  themeId?: string
  isSelected: boolean
  onSelect: () => void
}

// ── Component ────────────────────────────────────────────────────────────

export function TemplateCard({
  name,
  description,
  themeId,
  isSelected,
  onSelect,
}: TemplateCardProps): React.JSX.Element {
  const colors = getPreviewColors(themeId)

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-lg border text-left transition-all ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-500/30'
          : 'border-white/10 hover:border-white/25'
      }`}
    >
      {/* Preview area */}
      <div
        className="relative h-28 w-full overflow-hidden"
        style={{ backgroundColor: colors?.background ?? '#111827' }}
      >
        {colors ? (
          <ThemePreview colors={colors} />
        ) : (
          <BlankPreview />
        )}
      </div>

      {/* Label */}
      <div className="bg-popover flex flex-col gap-0.5 px-3 py-2.5">
        <span className="text-foreground text-sm font-semibold leading-tight">{name}</span>
        <span className="text-muted-foreground line-clamp-1 text-[11px] leading-tight">
          {description}
        </span>
      </div>

      {/* Selected indicator */}
      {isSelected ? (
        <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500">
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      ) : null}
    </button>
  )
}

// ── Mini preview: themed layout ──────────────────────────────────────────

function ThemePreview({ colors }: { colors: PreviewColors }): React.JSX.Element {
  return (
    <div className="flex h-full flex-col">
      {/* Hero band */}
      <div
        className="flex flex-1 flex-col items-center justify-center gap-1.5 px-4"
        style={{ background: colors.gradient }}
      >
        <div
          className="h-1.5 w-16 rounded-full opacity-90"
          style={{ backgroundColor: colors.surface }}
        />
        <div
          className="h-1 w-10 rounded-full opacity-50"
          style={{ backgroundColor: colors.surface }}
        />
        <div
          className="mt-1 h-3 w-12 rounded-sm"
          style={{ backgroundColor: colors.surface, opacity: 0.85 }}
        />
      </div>

      {/* Feature cards band */}
      <div
        className="flex gap-1.5 px-3 py-2"
        style={{ backgroundColor: colors.surface }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="flex-1 rounded-sm border p-1.5"
            style={{
              borderColor: `${colors.textMuted}20`,
              backgroundColor: colors.background,
            }}
          >
            <div
              className="mb-1 h-1.5 w-3 rounded-full"
              style={{ backgroundColor: colors.primary }}
            />
            <div
              className="h-1 w-full rounded-full opacity-30"
              style={{ backgroundColor: colors.textPrimary }}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Mini preview: blank page ─────────────────────────────────────────────

function BlankPreview(): React.JSX.Element {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-dashed border-white/20">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-white/30" />
        </svg>
      </div>
      <span className="text-[10px] text-white/30">Empty canvas</span>
    </div>
  )
}
