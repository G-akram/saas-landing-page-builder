'use client'

import { useEffect, useRef, useState } from 'react'

interface PageNameInputProps {
  pageName: string
  onRename: (name: string) => Promise<void>
}

export function PageNameInput({ pageName, onRename }: PageNameInputProps): React.JSX.Element {
  const [isEditing, setIsEditing] = useState(false)
  const [draftName, setDraftName] = useState(pageName)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setDraftName(pageName)
  }, [pageName])

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.select()
    }
  }, [isEditing])

  async function handleCommit(): Promise<void> {
    const trimmed = draftName.trim()
    setIsEditing(false)
    if (trimmed.length === 0 || trimmed === pageName) {
      setDraftName(pageName)
      return
    }
    await onRename(trimmed)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>): void {
    if (e.key === 'Enter') {
      void handleCommit()
    } else if (e.key === 'Escape') {
      setDraftName(pageName)
      setIsEditing(false)
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        value={draftName}
        onChange={(e) => {
          setDraftName(e.target.value)
        }}
        onBlur={() => {
          void handleCommit()
        }}
        onKeyDown={handleKeyDown}
        maxLength={100}
        className="w-48 border-b border-white/30 bg-transparent text-sm font-medium text-white outline-none focus:border-white/70"
      />
    )
  }

  return (
    <button
      type="button"
      onClick={() => {
        setIsEditing(true)
      }}
      title="Click to rename"
      className="cursor-text text-sm font-medium text-white transition-colors hover:text-gray-300"
    >
      {pageName}
    </button>
  )
}
