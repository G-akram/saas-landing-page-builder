'use client'

import { useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// ── Props ────────────────────────────────────────────────────────────────────

interface QueryProviderProps {
  children: React.ReactNode
}

// ── Component ────────────────────────────────────────────────────────────────

// QueryClient is created inside the component so each request in SSR
// gets its own instance (avoids shared state across users).
export function QueryProvider({ children }: QueryProviderProps): React.JSX.Element {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 60 * 1000 },
        },
      }),
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
