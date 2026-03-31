import {
  type BackgroundConfig,
  type Element as PageElement,
  type SectionLayout,
  type SectionType,
  type SlotStyle,
  type SpacingConfig,
} from '@/shared/types'

export interface BlockTemplate {
  variantStyleId: string
  label: string
  layout: SectionLayout
  background: BackgroundConfig
  padding: SpacingConfig
  /** @deprecated Use container elements instead. Kept for legacy templates. */
  slotStyle?: SlotStyle
  createElements: () => PageElement[]
}

export interface BlockVariantGroup {
  type: SectionType
  variants: BlockTemplate[]
}
