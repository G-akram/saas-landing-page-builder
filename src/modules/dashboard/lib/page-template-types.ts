import { type PageDocument } from '@/shared/types'

export interface PageTemplate {
  id: string
  name: string
  description: string
  themeId: string
  /** Factory — called once per create action, generates fresh UUIDs each time */
  createSections: () => PageDocument['variants'][number]['sections']
}
