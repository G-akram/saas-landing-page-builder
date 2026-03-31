import { MarketingAbHighlight } from './_components/marketing-ab-highlight'
import { MarketingCta } from './_components/marketing-cta'
import { MarketingFeatures } from './_components/marketing-features'
import { MarketingFooter } from './_components/marketing-footer'
import { MarketingHero } from './_components/marketing-hero'
import { MarketingHowItWorks } from './_components/marketing-how-it-works'
import { MarketingNav } from './_components/marketing-nav'

export default function HomePage(): React.JSX.Element {
  return (
    <div className="bg-[#030712]">
      <MarketingNav />
      <MarketingHero />
      <MarketingFeatures />
      <MarketingHowItWorks />
      <MarketingAbHighlight />
      <MarketingCta />
      <MarketingFooter />
    </div>
  )
}
