interface EmptyStateProps {
  createButton?: React.ReactNode
}

export function EmptyState({ createButton }: EmptyStateProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.02] py-24 text-center">
      {/* Icon */}
      <div className="mb-5 flex size-16 items-center justify-center rounded-2xl border border-white/[0.08] bg-gradient-to-br from-indigo-500/20 to-violet-500/10">
        <svg
          className="size-7 text-indigo-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={1.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
          />
        </svg>
      </div>

      <h3 className="text-base font-semibold text-white">No pages yet</h3>
      <p className="mt-2 max-w-xs text-sm text-white/40">
        Pick a template and publish your first landing page in minutes.
      </p>

      {createButton ? <div className="mt-6">{createButton}</div> : null}
    </div>
  )
}
