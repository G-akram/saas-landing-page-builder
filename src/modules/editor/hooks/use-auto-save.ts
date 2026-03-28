'use client'

import { useCallback, useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'

import { type PageDocument } from '@/shared/types'

import { savePage } from '../actions/save-page-action'
import { useDocumentStore } from '../store'

const DEBOUNCE_MS = 2000
const SAVED_DISPLAY_MS = 3000

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface SaveMutationInput {
  doc: PageDocument
  expectedUpdatedAt: string
}

export interface AutoSaveController {
  status: SaveStatus
  canManualSave: boolean
  triggerManualSave: () => Promise<void>
}

interface UseAutoSaveOptions {
  enabled?: boolean
}

export function useAutoSave(
  pageId: string,
  initialUpdatedAt: string,
  options: UseAutoSaveOptions = {},
): AutoSaveController {
  const isEnabled = options.enabled ?? true
  const document = useDocumentStore((state) => state.document)
  const isDirty = useDocumentStore((state) => state.isDirty)

  const baselineDocRef = useRef<PageDocument | null>(null)
  const lastKnownUpdatedAtRef = useRef(initialUpdatedAt)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedDisplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { mutateAsync, isPending, isSuccess, isError, reset } = useMutation({
    mutationFn: async ({ doc, expectedUpdatedAt }: SaveMutationInput): Promise<string> => {
      const result = await savePage(pageId, doc, expectedUpdatedAt)
      if (!result.success) throw new Error(result.error ?? 'Save failed')
      return result.updatedAt ?? expectedUpdatedAt
    },
    onSuccess: (updatedAt, { doc }) => {
      baselineDocRef.current = doc
      lastKnownUpdatedAtRef.current = updatedAt
      useDocumentStore.setState({ isDirty: false, baselineJson: JSON.stringify(doc) })

      if (savedDisplayTimerRef.current) clearTimeout(savedDisplayTimerRef.current)
      savedDisplayTimerRef.current = setTimeout(reset, SAVED_DISPLAY_MS)
    },
  })

  useEffect(() => {
    baselineDocRef.current = null
    lastKnownUpdatedAtRef.current = initialUpdatedAt
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    if (savedDisplayTimerRef.current) clearTimeout(savedDisplayTimerRef.current)
    reset()
  }, [pageId, initialUpdatedAt, isEnabled, reset])

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
      if (savedDisplayTimerRef.current) clearTimeout(savedDisplayTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!isEnabled) {
      return
    }

    if (!document) return

    if (baselineDocRef.current === null) {
      baselineDocRef.current = document
      return
    }

    if (baselineDocRef.current === document) return

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      void mutateAsync({
        doc: document,
        expectedUpdatedAt: lastKnownUpdatedAtRef.current,
      }).catch(() => {
        // Mutation status already exposes save error state.
      })
    }, DEBOUNCE_MS)

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [document, isEnabled, mutateAsync])

  const triggerManualSave = useCallback(async (): Promise<void> => {
    if (!isEnabled || !document || isPending || !isDirty) {
      return
    }

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)

    try {
      await mutateAsync({
        doc: document,
        expectedUpdatedAt: lastKnownUpdatedAtRef.current,
      })
    } catch {
      // Mutation status already exposes save error state.
    }
  }, [document, isDirty, isEnabled, isPending, mutateAsync])

  const status: SaveStatus = isPending
    ? 'saving'
    : isError
      ? 'error'
      : isSuccess
        ? 'saved'
        : 'idle'

  return {
    status: isEnabled ? status : 'idle',
    canManualSave: isEnabled && Boolean(document) && isDirty && !isPending,
    triggerManualSave,
  }
}
