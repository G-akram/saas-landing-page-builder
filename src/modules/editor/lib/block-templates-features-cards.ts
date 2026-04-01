import { type ContainerStyle } from '@/shared/types'

/** Shared card styles used by feature template variants. */

export const CARD_STYLE_LIGHT: ContainerStyle = {
  backgroundColor: '#ffffff',
  borderRadius: 16,
  boxShadow: '0 2px 16px rgba(0,0,0,0.07)',
  border: '1px solid rgba(0,0,0,0.06)',
  padding: { top: 32, bottom: 32, left: 28, right: 28 },
}

export const CARD_STYLE_DARK: ContainerStyle = {
  backgroundColor: '#1e293b',
  borderRadius: 14,
  border: '1px solid rgba(255,255,255,0.08)',
  boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
  padding: { top: 28, bottom: 28, left: 24, right: 24 },
}

export const CARD_STYLE_GLASS: ContainerStyle = {
  backgroundColor: 'rgba(255,255,255,0.12)',
  borderRadius: 20,
  border: '1px solid rgba(255,255,255,0.25)',
  backdropFilter: 'blur(12px)',
  boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
  padding: { top: 36, bottom: 36, left: 28, right: 28 },
}
