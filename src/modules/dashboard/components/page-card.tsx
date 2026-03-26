'use client'

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

interface PageCardProps {
  id: string
  name: string
  slug: string
  status: string
  updatedAt: Date
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

export function PageCard({ id, name, slug, status, updatedAt }: PageCardProps): React.JSX.Element {
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
            <CardTitle className="text-lg">{name}</CardTitle>
            <CardDescription>/{slug}</CardDescription>
          </div>
          <span className="bg-secondary text-secondary-foreground rounded-full px-2.5 py-0.5 text-xs font-medium">
            {status}
          </span>
        </div>
      </CardHeader>
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
