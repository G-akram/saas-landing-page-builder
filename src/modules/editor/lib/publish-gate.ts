import { type SaveStatus } from '../hooks/use-auto-save'

interface ResolvePublishGateInput {
  hasPublishAction: boolean
  isDirty: boolean
  isPublishing: boolean
  saveStatus: SaveStatus
  variantCount: number
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
  variantCount,
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

  if (variantCount > 1) {
    return {
      canPublish: false,
      reason: 'Multi-variant publish is not available yet',
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
