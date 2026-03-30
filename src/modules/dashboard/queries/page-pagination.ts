const PAGE_CURSOR_SEPARATOR = ':'

interface PagePaginationCursor {
  updatedAt: string
  id: string
}

export function encodePageCursor(updatedAt: Date, id: string): string {
  const payload = `${updatedAt.toISOString()}${PAGE_CURSOR_SEPARATOR}${id}`
  return Buffer.from(payload, 'utf8').toString('base64url')
}

export function decodePageCursor(cursor: string | null | undefined): PagePaginationCursor | null {
  if (!cursor) {
    return null
  }

  try {
    const decoded = Buffer.from(cursor, 'base64url').toString('utf8')
    const separatorIndex = decoded.indexOf(PAGE_CURSOR_SEPARATOR)

    if (separatorIndex === -1) {
      return null
    }

    const updatedAt = decoded.slice(0, separatorIndex)
    const id = decoded.slice(separatorIndex + PAGE_CURSOR_SEPARATOR.length)
    if (updatedAt.length === 0 || id.length === 0) {
      return null
    }

    const parsedDate = new Date(updatedAt)
    if (Number.isNaN(parsedDate.getTime())) {
      return null
    }

    return {
      updatedAt,
      id,
    }
  } catch {
    return null
  }
}
