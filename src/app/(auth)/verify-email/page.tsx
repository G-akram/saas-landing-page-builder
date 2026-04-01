import { Suspense } from 'react'

import VerifyEmailContent from './verify-email-content'

export default function VerifyEmailPage(): React.JSX.Element {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0a0f1a]" />
      }
    >
      <VerifyEmailContent />
    </Suspense>
  )
}
