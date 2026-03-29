'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

import { useDocumentStore } from '../store'
import { resolvePublishGate, type PublishGate } from '../lib/publish-gate'
import { type SaveStatus } from './use-auto-save'

export type EditorPublishStatus = 'idle' | 'publishing' | 'published' | 'error'

export interface EditorPublishResultSuccess {
  success: true
  liveUrl: string
}

export interface EditorPublishResultError {
  success: false
  message: string
}

export type EditorPublishResult = EditorPublishResultSuccess | EditorPublishResultError

export interface EditorPublishState {
  status: EditorPublishStatus
  liveUrl: string | null
  message: string | null
}

interface UsePublishInput {
  pageId: string
  initialLiveUrl?: string | null
  onPublish?: (() => Promise<EditorPublishResult>) | null
  saveStatus: SaveStatus
}

interface UsePublishResult {
  publishState: EditorPublishState
  publishGate: PublishGate
  triggerPublish: () => Promise<void>
}

function createInitialPublishState(initialLiveUrl?: string | null): EditorPublishState {
  if (!initialLiveUrl) {
    return {
      status: 'idle',
      liveUrl: null,
      message: null,
    }
  }

  return {
    status: 'published',
    liveUrl: initialLiveUrl,
    message: 'Page is published',
  }
}

export function usePublish({
  pageId,
  initialLiveUrl,
  onPublish,
  saveStatus,
}: UsePublishInput): UsePublishResult {
  const isDirty = useDocumentStore((s) => s.isDirty)
  const [publishState, setPublishState] = useState<EditorPublishState>(() =>
    createInitialPublishState(initialLiveUrl),
  )

  useEffect(() => {
    setPublishState(createInitialPublishState(initialLiveUrl))
  }, [pageId, initialLiveUrl])

  const isPublishing = publishState.status === 'publishing'

  const publishGate = useMemo(
    () =>
      resolvePublishGate({
        hasPublishAction: Boolean(onPublish),
        isDirty,
        isPublishing,
        saveStatus,
      }),
    [isDirty, isPublishing, onPublish, saveStatus],
  )

  const triggerPublish = useCallback(async (): Promise<void> => {
    if (!onPublish || !publishGate.canPublish) {
      return
    }

    setPublishState((previousState) => ({
      ...previousState,
      status: 'publishing',
      message: null,
    }))

    try {
      const result = await onPublish()

      if (result.success) {
        setPublishState({
          status: 'published',
          liveUrl: result.liveUrl,
          message: 'Published',
        })
        return
      }

      setPublishState((previousState) => ({
        ...previousState,
        status: 'error',
        message: result.message,
      }))
    } catch {
      setPublishState((previousState) => ({
        ...previousState,
        status: 'error',
        message: 'Publish failed. Try again.',
      }))
    }
  }, [onPublish, publishGate.canPublish])

  return {
    publishState,
    publishGate,
    triggerPublish,
  }
}
