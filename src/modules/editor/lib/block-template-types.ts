import {
  type BackgroundConfig,
  type Element as PageElement,
  type SectionLayout,
  type SectionType,
  type SpacingConfig,
} from '@/shared/types'

export interface BlockTemplate {
  variantStyleId: string
  label: string
  layout: SectionLayout
  background: BackgroundConfig
  padding: SpacingConfig
  createElements: () => PageElement[]
}

export interface BlockVariantGroup {
  type: SectionType
  variants: BlockTemplate[]
}
