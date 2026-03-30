'use client'

import Link from 'next/link'
import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { deletePage } from '@/modules/dashboard/actions/page-actions'

import { type PageVariantAnalyticsSummary } from '../queries/page-queries'

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
  const [, formAction, isPending] = useActionState(
    async (_prev: Record<string, never>, formData: FormData): Promise<Record<string, never>> => {
      await deletePage(formData)
      return {}
    },
    {},
  )

  return (
    <Card className={isPending ? 'opacity-50 pointer-events-none' : undefined}>
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
          <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            A/B performance
          </div>
          <div className="space-y-2">
            {analytics.map((variant) => (
              <div
                key={variant.variantId}
                className="flex items-center justify-between rounded-md bg-muted/40 px-3 py-2 text-sm"
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
        <span className="text-muted-foreground text-xs">
          Updated {formatRelativeDate(updatedAt)}
        </span>
        <form action={formAction}>
          <input type="hidden" name="pageId" value={id} />
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            disabled={isPending}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
