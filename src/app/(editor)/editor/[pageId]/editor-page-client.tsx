'use client'

import { useCallback } from 'react'

import { EditorShell } from '@/modules/editor'
import { renamePage } from '@/modules/dashboard/actions/page-actions'
import { type PageDocument } from '@/shared/types'

const PUBLISH_ERROR_MESSAGES: Record<string, string> = {
  NOT_AUTHENTICATED: 'Sign in again before publishing.',
  PAGE_NOT_FOUND: 'This page no longer exists.',
  PAGE_ACCESS_DENIED: 'You do not have access to publish this page.',
  INVALID_DOCUMENT: 'Fix document issues before publishing.',
  RENDER_FAILED: 'Rendering failed. Try again.',
  STORAGE_WRITE_FAILED: 'Failed to store published output. Try again.',
  PUBLISH_CONFLICT: 'Publish conflict detected. Retry publish.',
  RATE_LIMITED: 'Too many publish attempts. Wait a moment.',
  UNKNOWN_ERROR: 'Publish failed. Try again.',
}

interface EditorPageClientProps {
  pageId: string
  pageName: string
  pageSlug: string
  pageStatus: 'draft' | 'published'
  pageUpdatedAt: string
  document: PageDocument
}

interface PublishApiSuccess {
  success: true
  liveUrl: string
}

interface PublishApiError {
  success: false
  errorCode: string
  message: string
}

type PublishApiResult = PublishApiSuccess | PublishApiError

function isPublishApiResult(value: unknown): value is PublishApiResult {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  if (!('success' in value)) {
    return false
  }

  const success = value.success
  if (success === true) {
    return 'liveUrl' in value && typeof value.liveUrl === 'string'
  }

  return (
    success === false &&
    'errorCode' in value &&
    typeof value.errorCode === 'string' &&
    'message' in value &&
    typeof value.message === 'string'
  )
}

export function EditorPageClient({
  pageId,
  pageName,
  pageSlug,
  pageStatus,
  pageUpdatedAt,
  document,
}: EditorPageClientProps): React.JSX.Element {
  const initialLiveUrl = pageStatus === 'published' ? `/p/${pageSlug}` : null

  const handleRename = useCallback(async (name: string) => {
    return renamePage(pageId, name)
  }, [pageId])

  const handlePublish = useCallback(async () => {
    const response = await fetch('/api/publish', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ pageId }),
    })

    const payload: unknown = await response.json().catch(() => null)
    if (!isPublishApiResult(payload)) {
      return {
        success: false as const,
        message: 'Publish failed. Try again.',
      }
    }

    if (payload.success) {
      return {
        success: true as const,
        liveUrl: payload.liveUrl,
      }
    }

    return {
      success: false as const,
      message: PUBLISH_ERROR_MESSAGES[payload.errorCode] ?? payload.message,
    }
  }, [pageId])

  return (
    <EditorShell
      pageId={pageId}
      pageName={pageName}
      pageUpdatedAt={pageUpdatedAt}
      document={document}
      initialLiveUrl={initialLiveUrl}
      onPublish={handlePublish}
      onRename={handleRename}
    />
  )
}
