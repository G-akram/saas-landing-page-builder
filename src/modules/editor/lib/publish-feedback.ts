import { type EditorPublishState } from '../hooks/use-publish'

export interface PublishFeedback {
  className: string
  label: string
}

export function resolvePublishFeedback(
  publishState: EditorPublishState,
  publishDisabledReason: string | null,
): PublishFeedback | null {
  if (publishState.status === 'publishing') {
    return {
      className: 'text-gray-400',
      label: 'Publishing...',
    }
  }

  if (publishDisabledReason) {
    return {
      className: 'text-amber-300',
      label: publishDisabledReason,
    }
  }

  if (publishState.status === 'error' && publishState.message) {
    return {
      className: 'text-red-400',
      label: publishState.message,
    }
  }

  if (publishState.status === 'published') {
    return {
      className: 'text-green-400',
      label: publishState.message ?? 'Published',
    }
  }

  return null
}
