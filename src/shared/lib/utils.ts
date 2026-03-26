import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Merges Tailwind classes safely — later classes win, no conflicts.
// e.g. cn('px-2 py-1', isActive && 'bg-blue-500') → 'px-2 py-1 bg-blue-500'
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
