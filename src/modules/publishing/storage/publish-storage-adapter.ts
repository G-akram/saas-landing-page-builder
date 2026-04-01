import { PUBLISH_STORAGE_PROVIDERS, type PublishStorageProvider } from '../types/publishing'
import {
  type CreatePublishStorageAdapterOptions,
  type PublishStorageAdapter,
} from '../types/storage'
import { BlobPublishStorageAdapter } from './blob-publish-storage-adapter'
import { LocalPublishStorageAdapter } from './local-publish-storage-adapter'

const PUBLISH_STORAGE_PROVIDER_ENV_KEY = 'PUBLISH_STORAGE_PROVIDER'

export function createPublishStorageAdapter(
  options: CreatePublishStorageAdapterOptions = {},
): PublishStorageAdapter {
  const provider = options.provider ?? getPublishStorageProviderFromEnv()

  if (provider === 'local') {
    if (options.localRootDir) {
      return new LocalPublishStorageAdapter({ rootDir: options.localRootDir })
    }

    return new LocalPublishStorageAdapter()
  }

  return new BlobPublishStorageAdapter()
}

function getPublishStorageProviderFromEnv(): PublishStorageProvider {
  const rawProvider = process.env[PUBLISH_STORAGE_PROVIDER_ENV_KEY]

  if (!rawProvider) {
    return 'local'
  }

  if (isPublishStorageProvider(rawProvider)) {
    return rawProvider
  }

  throw new Error(
    `Unsupported publish storage provider "${rawProvider}". Supported values: ${PUBLISH_STORAGE_PROVIDERS.join(', ')}`,
  )
}

function isPublishStorageProvider(value: string): value is PublishStorageProvider {
  return PUBLISH_STORAGE_PROVIDERS.some((provider) => provider === value)
}
