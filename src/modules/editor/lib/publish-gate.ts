import { type SaveStatus } from '../hooks/use-auto-save'

interface ResolvePublishGateInput {
  hasPublishAction: boolean
  isDirty: boolean
  isPublishing: boolean
  saveStatus: SaveStatus
}

export interface PublishGate {
  canPublish: boolean
  reason: string | null
}

export function resolvePublishGate({
  hasPublishAction,
  isDirty,
  isPublishing,
  saveStatus,
}: ResolvePublishGateInput): PublishGate {
  if (!hasPublishAction) {
    return {
      canPublish: false,
      reason: 'Publish is unavailable',
    }
  }

  if (isPublishing) {
    return {
      canPublish: false,
      reason: 'Publishing in progress',
    }
  }

  if (saveStatus === 'saving') {
    return {
      canPublish: false,
      reason: 'Wait for autosave to finish',
    }
  }

  if (saveStatus === 'error') {
    return {
      canPublish: false,
      reason: 'Fix save errors before publishing',
    }
  }

  if (isDirty) {
    return {
      canPublish: false,
      reason: 'Save changes before publishing',
    }
  }

  return {
    canPublish: true,
    reason: null,
  }
}
