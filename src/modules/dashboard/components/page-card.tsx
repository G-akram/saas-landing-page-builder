'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { deletePage } from '@/modules/dashboard/actions/page-actions'

import { type PageVariantAnalyticsSummary } from '../queries/page-query-types'

interface PageCardProps {
  id: string
  name: string
  slug: string
  status: string
  updatedAt: Date
  analytics: PageVariantAnalyticsSummary[]
}

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${String(diffMins)}m ago`
  if (diffHours < 24) return `${String(diffHours)}h ago`
  if (diffDays < 30) return `${String(diffDays)}d ago`
  return date.toLocaleDateString()
}

export function PageCard({
  id,
  name,
  slug,
  status,
  updatedAt,
  analytics,
}: PageCardProps): React.JSX.Element {
  interface DeletePageFormState {
    error?: string
    success?: string
  }

  const [state, formAction, isPending] = useActionState(
    async (_prev: DeletePageFormState, formData: FormData): Promise<DeletePageFormState> => {
      const result = await deletePage(formData)
      if (!result.success) {
        return { error: result.error }
      }

      return result.message ? { success: result.message } : {}
    },
    {},
  )

  return (
    <Card className={isPending ? 'pointer-events-none opacity-50' : undefined}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <Link href={`/editor/${id}`} className="hover:underline">
              <CardTitle className="text-lg">{name}</CardTitle>
            </Link>
            <CardDescription>/{slug}</CardDescription>
          </div>
          <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
            {status}
          </span>
        </div>
      </CardHeader>
      {analytics.length > 0 ? (
        <div className="border-t px-6 py-4">
          <div className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
            A/B performance
          </div>
          <div className="space-y-2">
            {analytics.map((variant) => (
              <div
                key={variant.variantId}
                className="bg-muted/40 flex items-center justify-between rounded-md px-3 py-2 text-sm"
              >
                <span className="font-medium">{variant.variantName}</span>
                <span className="text-muted-foreground">
                  {variant.views} views · {variant.conversions} conv · {variant.conversionRate}%
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <CardFooter className="flex items-center justify-between">
        <div className="space-y-1">
          <span className="text-muted-foreground block text-xs">
            Updated {formatRelativeDate(updatedAt)}
          </span>
          {state.error ? <p className="text-xs text-red-500">{state.error}</p> : null}
          {state.success ? <p className="text-xs text-green-600">{state.success}</p> : null}
        </div>
        <form action={formAction}>
          <input type="hidden" name="pageId" value={id} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={isPending}
            className="text-red-500 hover:bg-red-50 hover:text-red-600"
          >
            {isPending ? (
              <>
                <Spinner className="text-red-500" />
                Deleting…
              </>
            ) : (
              'Delete'
            )}
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
