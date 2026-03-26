export default function EditorLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="bg-background min-h-screen">
      {children}
    </div>
  )
}
