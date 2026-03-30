export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'] as const

export type AllowedImageType = (typeof ALLOWED_IMAGE_TYPES)[number]

export const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

const JPEG_SIGNATURE = [0xff, 0xd8, 0xff] as const
const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a] as const
const GIF87A_SIGNATURE = [0x47, 0x49, 0x46, 0x38, 0x37, 0x61] as const
const GIF89A_SIGNATURE = [0x47, 0x49, 0x46, 0x38, 0x39, 0x61] as const
const RIFF_SIGNATURE = [0x52, 0x49, 0x46, 0x46] as const
const WEBP_SIGNATURE = [0x57, 0x45, 0x42, 0x50] as const

const EXTENSION_BY_IMAGE_TYPE = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
} satisfies Record<AllowedImageType, string>

export function isAllowedImageType(mimeType: string): mimeType is AllowedImageType {
  return (ALLOWED_IMAGE_TYPES as readonly string[]).includes(mimeType)
}

function startsWithBytes(fileBytes: Uint8Array, signature: readonly number[]): boolean {
  if (fileBytes.length < signature.length) return false
  return signature.every((byte, index) => fileBytes[index] === byte)
}

export function detectImageType(fileBytes: Uint8Array): AllowedImageType | null {
  if (startsWithBytes(fileBytes, JPEG_SIGNATURE)) return 'image/jpeg'
  if (startsWithBytes(fileBytes, PNG_SIGNATURE)) return 'image/png'
  if (
    startsWithBytes(fileBytes, GIF87A_SIGNATURE) ||
    startsWithBytes(fileBytes, GIF89A_SIGNATURE)
  ) {
    return 'image/gif'
  }

  // WebP header: "RIFF"...."WEBP" (bytes 0-3 and 8-11)
  if (
    startsWithBytes(fileBytes, RIFF_SIGNATURE) &&
    fileBytes.length >= 12 &&
    WEBP_SIGNATURE.every((byte, offset) => fileBytes[offset + 8] === byte)
  ) {
    return 'image/webp'
  }

  return null
}

export function getFileExtensionForImageType(mimeType: AllowedImageType): string {
  return EXTENSION_BY_IMAGE_TYPE[mimeType]
}
