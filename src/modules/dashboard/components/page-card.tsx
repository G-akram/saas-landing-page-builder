'use client'

import Link from 'next/link'
import { useActionState } from 'react'

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

// Deterministic gradient derived from slug — gives each card a unique identity
const CARD_GRADIENTS = [
  ['#6366f1', '#8b5cf6'],
  ['#14b8a6', '#06b6d4'],
  ['#f97316', '#ec4899'],
  ['#10b981', '#14b8a6'],
  ['#8b5cf6', '#6366f1'],
] as const

const FALLBACK_GRADIENT = CARD_GRADIENTS[0]

function getGradient(slug: string): readonly [string, string] {
  return CARD_GRADIENTS[slug.charCodeAt(0) % CARD_GRADIENTS.length] ?? FALLBACK_GRADIENT
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
  interface DeleteState {
    error?: string
  }

  const [state, formAction, isPending] = useActionState(
    async (_prev: DeleteState, formData: FormData): Promise<DeleteState> => {
      const result = await deletePage(formData)
      if (!result.success) return { error: result.error }
      return {}
    },
    {},
  )

  const [fromColor, toColor] = getGradient(slug)
  const isPublished = status === 'published'

  return (
    <div
      className={`group flex flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0d1117] transition-all hover:border-white/[0.15] hover:shadow-lg hover:shadow-black/40 ${isPending ? 'pointer-events-none opacity-50' : ''}`}
    >
      {/* Preview thumbnail */}
      <div
        className="relative h-36 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${fromColor}, ${toColor})` }}
      >
        <PageThumbnail />
        <div className="absolute top-3 right-3">
          <StatusBadge isPublished={isPublished} />
        </div>
      </div>

      {/* Card content */}
      <div className="flex flex-1 flex-col p-4">
        <Link
          href={`/editor/${id}`}
          className="line-clamp-1 text-base font-semibold text-white transition-colors hover:text-indigo-300"
        >
          {name}
        </Link>
        <p className="mt-0.5 font-mono text-xs text-white/30">/{slug}</p>

        {/* Analytics row */}
        {analytics.length > 0 ? (
          <div className="mt-3 space-y-1 border-t border-white/[0.06] pt-3">
            <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-white/20">
              A/B Performance
            </p>
            {analytics.map((v) => (
              <div
                key={v.variantId}
                className="flex items-center justify-between rounded-lg bg-white/[0.03] px-2.5 py-1.5"
              >
                <span className="truncate text-xs text-white/50">{v.variantName}</span>
                <span className="ml-2 shrink-0 font-mono text-xs text-white/25">
                  {v.views}v · {v.conversionRate}%
                </span>
              </div>
            ))}
          </div>
        ) : null}

        <div className="flex-1" />

        {/* Footer: timestamp + actions */}
        <div className="mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3">
          <span className="text-[11px] text-white/25">{formatRelativeDate(updatedAt)}</span>
          <div className="flex items-center gap-1.5">
            {state.error ? (
              <p className="mr-1 text-[11px] text-red-400">{state.error}</p>
            ) : null}
            <Link
              href={`/editor/${id}`}
              className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-white/70 transition-all hover:border-white/15 hover:text-white"
            >
              Edit
            </Link>
            <form action={formAction}>
              <input type="hidden" name="pageId" value={id} />
              <button
                type="submit"
                disabled={isPending}
                className="flex items-center justify-center rounded-lg px-2.5 py-1.5 text-xs text-white/25 transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-40"
              >
                {isPending ? <Spinner className="size-3 text-red-400" /> : 'Delete'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

function PageThumbnail(): React.JSX.Element {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 px-6">
      <div className="h-2 w-3/4 rounded-full bg-white/40" />
      <div className="h-1.5 w-1/2 rounded-full bg-white/25" />
      <div className="mt-1.5 flex gap-1.5">
        <div className="h-5 w-16 rounded-md bg-white/25" />
        <div className="h-5 w-12 rounded-md bg-white/15" />
      </div>
      {/* Feature row */}
      <div className="mt-1 flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-6 w-10 rounded bg-white/10" />
        ))}
      </div>
    </div>
  )
}

function StatusBadge({ isPublished }: { isPublished: boolean }): React.JSX.Element {
  if (isPublished) {
    return (
      <div className="flex items-center gap-1.5 rounded-full border border-green-500/40 bg-green-500/20 px-2.5 py-1 backdrop-blur-sm">
        <div className="size-1.5 rounded-full bg-green-400" />
        <span className="text-[10px] font-semibold text-green-300">Published</span>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/30 px-2.5 py-1 backdrop-blur-sm">
      <div className="size-1.5 rounded-full bg-white/50" />
      <span className="text-[10px] font-semibold text-white/60">Draft</span>
    </div>
  )
}
