'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Palette } from 'lucide-react'

import { cn } from '@/shared/lib/utils'
import { THEME_LIST, type ThemeDefinition } from '@/shared/lib/design-tokens'

import { useDocumentStore } from '../store'

function ThemeSwatchRow({
  theme,
  isActive,
  onSelect,
}: {
  theme: ThemeDefinition
  isActive: boolean
  onSelect: () => void
}): React.JSX.Element {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'flex w-full cursor-pointer items-center gap-3 rounded px-3 py-2 text-left text-sm transition-colors',
        isActive ? 'bg-white/10 text-white' : 'text-gray-300 hover:bg-white/5 hover:text-white',
      )}
    >
      <div className="flex shrink-0 gap-0.5">
        {(['primary', 'accent', 'background', 'surface'] as const).map((token) => (
          <div
            key={token}
            className="h-4 w-4 rounded-sm border border-white/10"
            style={{ backgroundColor: theme.colors[token] }}
          />
        ))}
      </div>
      <div className="min-w-0">
        <div className="truncate font-medium">{theme.name}</div>
        <div className="truncate text-xs text-gray-500">{theme.description}</div>
      </div>
    </button>
  )
}

export function ThemePicker(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const currentThemeId = useDocumentStore((state) => state.document?.themeId ?? 'starter')
  const applyTheme = useDocumentStore((state) => state.applyTheme)

  const handleSelect = useCallback(
    (themeId: string) => {
      applyTheme(themeId)
      setIsOpen(false)
    },
    [applyTheme],
  )

  useEffect(() => {
    if (!isOpen) return

    function handleClickOutside(event: MouseEvent): void {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const activeTheme = THEME_LIST.find((t) => t.id === currentThemeId)

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => {
          setIsOpen((prev) => !prev)
        }}
        aria-label="Change theme"
        aria-expanded={isOpen}
        className={cn(
          'flex cursor-pointer items-center gap-1.5 rounded px-2 py-1.5 text-sm transition-colors',
          isOpen
            ? 'bg-white/10 text-white'
            : 'text-gray-400 hover:bg-white/5 hover:text-white',
        )}
      >
        <Palette className="h-4 w-4" />
        <span className="hidden sm:inline">{activeTheme?.name ?? 'Theme'}</span>
      </button>

      {isOpen && (
        <div className="absolute left-1/2 top-full z-50 mt-1 w-72 -translate-x-1/2 rounded-lg border border-white/10 bg-gray-900 p-1.5 shadow-xl">
          <div className="mb-1 px-3 py-1.5 text-xs font-medium uppercase tracking-wider text-gray-500">
            Page Theme
          </div>
          {THEME_LIST.map((theme) => (
            <ThemeSwatchRow
              key={theme.id}
              theme={theme}
              isActive={theme.id === currentThemeId}
              onSelect={() => {
                handleSelect(theme.id)
              }}
            />
          ))}
        </div>
      )}
    </div>
  )
}
