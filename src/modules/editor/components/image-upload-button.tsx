'use client'

import { useRef, useState } from 'react'

import {
  ALLOWED_IMAGE_TYPES,
  MAX_IMAGE_SIZE_BYTES,
  isAllowedImageType,
} from '@/shared/lib/upload-validation'

const ACCEPT = ALLOWED_IMAGE_TYPES.join(',')
const MAX_MB = MAX_IMAGE_SIZE_BYTES / (1024 * 1024)

interface ImageUploadButtonProps {
  currentSrc?: string
  onUpload: (url: string) => void
}

export function ImageUploadButton({
  currentSrc,
  onUpload,
}: ImageUploadButtonProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null)
  // Counter-based drag tracking prevents flickering when cursor crosses child elements.
  // Each dragenter increments, each dragleave decrements — isDragging only flips at the true boundary.
  const dragCounterRef = useRef(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleFile(file: File): Promise<void> {
    setError(null)

    if (!isAllowedImageType(file.type)) {
      setError(`Unsupported type: ${file.type}`)
      return
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setError(`File exceeds ${String(MAX_MB)} MB`)
      return
    }

    setIsUploading(true)
    try {
      const body = new FormData()
      body.append('file', file)
      const res = await fetch('/api/uploads', { method: 'POST', body })
      if (!res.ok) {
        const data = (await res.json()) as { error?: string }
        setError(data.error ?? 'Upload failed')
        return
      }
      const { url } = (await res.json()) as { url: string }
      onUpload(url)
    } catch {
      setError('Upload failed — check your connection')
    } finally {
      setIsUploading(false)
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
    // Reset so the same file can be re-selected after an error
    e.target.value = ''
  }

  function handleDragEnter(e: React.DragEvent): void {
    e.preventDefault()
    dragCounterRef.current++
    if (dragCounterRef.current === 1) setIsDragging(true)
  }

  function handleDragOver(e: React.DragEvent): void {
    // Must preventDefault to allow drop, but don't touch isDragging here
    e.preventDefault()
  }

  function handleDragLeave(): void {
    dragCounterRef.current--
    if (dragCounterRef.current === 0) setIsDragging(false)
  }

  function handleDrop(e: React.DragEvent): void {
    e.preventDefault()
    dragCounterRef.current = 0
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) void handleFile(file)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload image"
        className={[
          'relative flex cursor-pointer flex-col items-center justify-center rounded border border-dashed px-3 py-3 text-center transition-colors',
          isDragging
            ? 'border-blue-400 bg-blue-500/10'
            : 'border-white/20 hover:border-white/40',
          isUploading ? 'pointer-events-none opacity-60' : '',
        ].join(' ')}
        onClick={() => { inputRef.current?.click() }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') inputRef.current?.click()
        }}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {currentSrc ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- dynamic user image, no Next Image needed */}
            <img
              src={currentSrc}
              alt="Current"
              className="max-h-20 max-w-full rounded object-contain"
            />
            <span className="mt-1 text-[10px] text-gray-400">
              {isUploading ? 'Uploading…' : 'Click or drop to replace'}
            </span>
          </>
        ) : (
          <>
            <svg
              className="mb-1 h-5 w-5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5V19a1.5 1.5 0 001.5 1.5h15A1.5 1.5 0 0021 19v-2.5M16 8l-4-4-4 4M12 4v12"
              />
            </svg>
            <span className="text-[10px] text-gray-400">
              {isUploading ? 'Uploading…' : 'Click or drop image'}
            </span>
            <span className="text-[9px] text-gray-600">
              JPEG, PNG, WebP, SVG, GIF · max {String(MAX_MB)} MB
            </span>
          </>
        )}

        {isDragging && (
          <div className="absolute inset-0 flex items-center justify-center rounded bg-blue-500/20">
            <span className="text-xs font-medium text-blue-300">Drop image here</span>
          </div>
        )}
      </div>

      {error !== null && (
        <p className="text-[10px] text-red-400">{error}</p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  )
}
