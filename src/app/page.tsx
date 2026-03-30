export default function HomePage(): React.JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Landing Page Builder</h1>
      <p className="text-muted-foreground mt-4 max-w-2xl">
        Build, publish, and A/B test landing pages with a drag-and-drop editor, editable block
        variants, sticky traffic splits, and per-variant analytics.
      </p>
      <p className="text-muted-foreground mt-2 text-sm">
        Phase 6 is focused on MVP hardening: quality gates, docs alignment, and the final polish
        needed to close the MVP cleanly.
      </p>
    </main>
  )
}
