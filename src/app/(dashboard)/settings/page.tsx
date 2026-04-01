import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { auth } from '@/shared/lib/auth'
import { getSubscription, getCreditBalance, SubscriptionStatus } from '@/modules/billing'
import { ProfileSection, DangerZone } from '@/modules/settings'

export default async function SettingsPage(): Promise<React.JSX.Element> {
  const session = await auth()
  if (!session?.user?.id) redirect('/login')

  const { id: userId, name, email } = session.user

  const [subscription, creditBalance] = await Promise.all([
    getSubscription(userId),
    getCreditBalance(userId),
  ])

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0a0f1a]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-2xl items-center px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-sm text-white/50 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl space-y-6 px-6 py-10">
        <h1 className="text-2xl font-bold text-white">Settings</h1>

        <ProfileSection name={name ?? ''} email={email ?? ''} />

        <SubscriptionStatus
          tier={subscription.tier}
          periodEnd={
            subscription.currentPeriodEnd
              ? subscription.currentPeriodEnd.toLocaleDateString()
              : null
          }
          cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
          creditBalance={creditBalance}
        />

        <DangerZone />
      </main>
    </div>
  )
}
