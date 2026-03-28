'use client'

import { useEffect, useRef } from 'react'
import { useMutation } from '@tanstack/react-query'

import { type PageDocument } from '@/shared/types'
import { useDocumentStore } from '@/modules/editor'

import { savePage } from '../actions/save-page-action'

// ── Constants ────────────────────────────────────────────────────────────────

const DEBOUNCE_MS = 2000
const SAVED_DISPLAY_MS = 3000

// ── Types ────────────────────────────────────────────────────────────────────

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface SaveMutationInput {
  doc: PageDocument
  expectedUpdatedAt: string
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useAutoSave(pageId: string, initialUpdatedAt: string): SaveStatus {
  const document = useDocumentStore((s) => s.document)

  // Tracks the document reference at last save (or initial load).
  // null = hook hasn't run yet; used to skip the hydration fire.
  const baselineDocRef = useRef<PageDocument | null>(null)
  const lastKnownUpdatedAtRef = useRef(initialUpdatedAt)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const savedDisplayTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const { mutate, isPending, isSuccess, isError, reset } = useMutation({
    mutationFn: async ({ doc, expectedUpdatedAt }: SaveMutationInput): Promise<string> => {
      const result = await savePage(pageId, doc, expectedUpdatedAt)
      if (!result.success) throw new Error(result.error ?? 'Save failed')
      return result.updatedAt ?? expectedUpdatedAt
    },
    onSuccess: (updatedAt, { doc }) => {
      baselineDocRef.current = doc
      lastKnownUpdatedAtRef.current = updatedAt
      useDocumentStore.setState({ isDirty: false, baselineJson: JSON.stringify(doc) })
      // Show 'saved' briefly then revert to 'idle'
      if (savedDisplayTimerRef.current) clearTimeout(savedDisplayTimerRef.current)
      savedDisplayTimerRef.current = setTimeout(reset, SAVED_DISPLAY_MS)
    },
  })

  useEffect(() => {
    baselineDocRef.current = null
    lastKnownUpdatedAtRef.current = initialUpdatedAt
  }, [pageId, initialUpdatedAt])

  // Clear display timer on unmount
  useEffect(() => {
    return () => {
      if (savedDisplayTimerRef.current) clearTimeout(savedDisplayTimerRef.current)
    }
  }, [])

  useEffect(() => {
    if (!document) return

    // First run after initializeDocument: establish baseline, skip save
    if (baselineDocRef.current === null) {
      baselineDocRef.current = document
      return
    }

    // Same reference: no user edit since last save
    if (baselineDocRef.current === document) return

    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    debounceTimerRef.current = setTimeout(() => {
      mutate({
        doc: document,
        expectedUpdatedAt: lastKnownUpdatedAtRef.current,
      })
    }, DEBOUNCE_MS)

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current)
    }
  }, [document, mutate])

  if (isPending) return 'saving'
  if (isError) return 'error'
  if (isSuccess) return 'saved'
  return 'idle'
}
