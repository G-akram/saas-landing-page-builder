'use client'

import { useEffect, useMemo, useState } from 'react'
import { Copy, Flag, Plus, Trash2 } from 'lucide-react'
import { useSelector } from '@xstate/react'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn } from '@/shared/lib/utils'

import { checkVariantAllowedAction } from '../actions/check-variant-allowed-action'
import { useEditorActor } from '../context'
import { resolveVariantPublishNotice } from '../lib/variant-publish-notice'
import { useDocumentStore } from '../store'

interface VariantBarProps {
  liveUrl: string | null
}

function getTrafficInputValue(trafficWeight: number): string {
  return String(trafficWeight)
}

export function VariantBar({ liveUrl }: VariantBarProps): React.JSX.Element | null {
  const actor = useEditorActor()
  const document = useDocumentStore((state) => state.document)
  const createVariant = useDocumentStore((state) => state.createVariant)
  const duplicateVariant = useDocumentStore((state) => state.duplicateVariant)
  const deleteVariant = useDocumentStore((state) => state.deleteVariant)
  const switchVariant = useDocumentStore((state) => state.switchVariant)
  const setVariantTrafficWeight = useDocumentStore((state) => state.setVariantTrafficWeight)

  const isDragging = useSelector(actor, (state) => state.matches('dragging'))
  const variantCount = document?.variants.length ?? 0
  const activeVariant =
    document?.variants.find((variant) => variant.id === document.activeVariantId) ?? null

  const [trafficInput, setTrafficInput] = useState(() =>
    activeVariant ? getTrafficInputValue(activeVariant.trafficWeight) : '100',
  )
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [tierError, setTierError] = useState<string | null>(null)

  useEffect(() => {
    setTrafficInput(activeVariant ? getTrafficInputValue(activeVariant.trafficWeight) : '100')
  }, [activeVariant])

  const publishNotice = useMemo(
    () => resolveVariantPublishNotice(variantCount, liveUrl),
    [liveUrl, variantCount],
  )

  if (!document || !activeVariant) {
    return null
  }

  const currentDocument = document
  const currentActiveVariant = activeVariant

  function clearSelection(): void {
    actor.send({ type: 'CLEAR_SELECTION' })
  }

  function handleSwitchVariant(variantId: string): void {
    if (variantId === currentDocument.activeVariantId || isDragging) {
      return
    }

    switchVariant(variantId)
    clearSelection()
  }

  async function handleCreateVariant(): Promise<void> {
    if (isDragging) {
      return
    }

    const check = await checkVariantAllowedAction(variantCount)
    if (!check.allowed) {
      setTierError(check.reason ?? 'Variant limit reached')
      return
    }

    setTierError(null)
    createVariant()
    clearSelection()
  }

  async function handleDuplicateVariant(): Promise<void> {
    if (isDragging) {
      return
    }

    const check = await checkVariantAllowedAction(variantCount)
    if (!check.allowed) {
      setTierError(check.reason ?? 'Variant limit reached')
      return
    }

    setTierError(null)
    duplicateVariant(currentActiveVariant.id)
    clearSelection()
  }

  function handleDeleteVariant(): void {
    if (isDragging || variantCount <= 1) {
      return
    }

    deleteVariant(currentActiveVariant.id)
    clearSelection()
    setIsDeleteDialogOpen(false)
  }

  function commitTrafficWeight(rawValue: string): void {
    const trimmedValue = rawValue.trim()
    const parsed = Number(trimmedValue)
    setVariantTrafficWeight(
      currentActiveVariant.id,
      trimmedValue.length > 0 && Number.isFinite(parsed)
        ? parsed
        : currentActiveVariant.trafficWeight,
    )
    const nextDocument = useDocumentStore.getState().document
    const nextActiveVariant = nextDocument?.variants.find(
      (variant) => variant.id === nextDocument.activeVariantId,
    )

    setTrafficInput(
      getTrafficInputValue(nextActiveVariant?.trafficWeight ?? currentActiveVariant.trafficWeight),
    )
  }

  return (
    <>
      <div className="flex min-h-14 items-center gap-3 border-b border-white/10 px-4">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto py-2">
          {currentDocument.variants.map((variant) => {
            const isActive = variant.id === currentDocument.activeVariantId
            const hasPrimaryGoal = variant.primaryGoal !== null

            return (
              <button
                key={variant.id}
                type="button"
                onClick={() => {
                  handleSwitchVariant(variant.id)
                }}
                disabled={isDragging}
                className={cn(
                  'flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-left transition-colors',
                  isActive
                    ? 'border-blue-500 bg-blue-500/15 text-white'
                    : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10 hover:text-white',
                  isDragging ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
                )}
              >
                <span className="text-sm font-medium">{variant.name}</span>
                <span className="rounded bg-black/20 px-1.5 py-0.5 text-[10px] tracking-wide text-gray-300 uppercase">
                  {variant.trafficWeight}%
                </span>
                {hasPrimaryGoal && (
                  <span
                    title="Primary conversion goal set"
                    className="rounded bg-emerald-500/15 p-1 text-emerald-300"
                  >
                    <Flag className="h-3 w-3" />
                  </span>
                )}
              </button>
            )
          })}
        </div>

        <div className="flex shrink-0 items-center gap-3 py-2">
          <div className="flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1.5">
            <span className="text-[11px] tracking-wide text-gray-500 uppercase">Traffic</span>
            <input
              type="number"
              min={0}
              max={100}
              inputMode="numeric"
              value={trafficInput}
              onChange={(event) => {
                setTrafficInput(event.target.value)
              }}
              onBlur={() => {
                commitTrafficWeight(trafficInput)
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.currentTarget.blur()
                }
              }}
              disabled={variantCount <= 1 || isDragging}
              aria-label={`Traffic split for ${currentActiveVariant.name}`}
              className="w-14 rounded border border-white/10 bg-gray-950 px-2 py-1 text-right text-xs text-white outline-none focus:border-blue-500 disabled:cursor-not-allowed disabled:text-gray-500"
            />
            <span className="text-xs text-gray-400">%</span>
          </div>

          <button
            type="button"
            onClick={handleCreateVariant}
            disabled={isDragging}
            className="flex cursor-pointer items-center gap-1.5 rounded px-2.5 py-1.5 text-xs text-gray-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Variant</span>
          </button>

          <button
            type="button"
            onClick={handleDuplicateVariant}
            disabled={isDragging}
            className="flex cursor-pointer items-center gap-1.5 rounded px-2.5 py-1.5 text-xs text-gray-300 transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Copy className="h-3.5 w-3.5" />
            <span>Duplicate</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setIsDeleteDialogOpen(true)
            }}
            disabled={variantCount <= 1 || isDragging}
            className="flex cursor-pointer items-center gap-1.5 rounded px-2.5 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-500/10 hover:text-red-200 disabled:cursor-not-allowed disabled:text-gray-500"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      <div className="flex min-h-9 items-center gap-3 border-b border-white/10 px-4 text-xs text-gray-400">
        <span>Weights always rebalance to 100%.</span>
        {publishNotice && (
          <>
            <span className="h-3 w-px bg-white/10" />
            <span className="text-amber-300">{publishNotice}</span>
          </>
        )}
        {tierError && (
          <>
            <span className="h-3 w-px bg-white/10" />
            <span className="text-red-400">{tierError}</span>
          </>
        )}
      </div>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent
          className="border border-white/10 bg-gray-900 text-white"
          showCloseButton={false}
        >
          <DialogHeader>
            <DialogTitle>Delete variant?</DialogTitle>
            <DialogDescription className="text-gray-400">
              {variantCount <= 2
                ? 'The remaining variant will take 100% of the traffic.'
                : 'The remaining variants will be rebalanced automatically.'}
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-200">
            {currentActiveVariant.name}
          </div>

          <DialogFooter className="border-white/10 bg-gray-900/80">
            <Button
              variant="outline"
              onClick={() => {
                setIsDeleteDialogOpen(false)
              }}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteVariant}>
              Delete Variant
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
