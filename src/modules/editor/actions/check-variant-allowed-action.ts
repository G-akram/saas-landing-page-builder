'use server'

import { auth } from '@/shared/lib/auth'
import { checkVariantAllowed } from '@/shared/lib/tier-gate'

interface VariantCheckResult {
  allowed: boolean
  reason?: string
}

export async function checkVariantAllowedAction(
  currentVariantCount: number,
): Promise<VariantCheckResult> {
  const session = await auth()
  if (!session?.user?.id) {
    return { allowed: false, reason: 'Not authenticated' }
  }

  return checkVariantAllowed(session.user.id, currentVariantCount)
}
