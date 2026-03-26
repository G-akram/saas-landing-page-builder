export function EmptyState(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16">
      <p className="text-muted-foreground text-lg font-medium">No pages yet</p>
      <p className="text-muted-foreground mt-1 text-sm">
        Create your first landing page to get started.
      </p>
    </div>
  )
}
