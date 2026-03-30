export default function EditorLayout({
  children,
}: {
  children: React.ReactNode
}): React.JSX.Element {
  return <div className="min-h-screen bg-gray-950 text-white">{children}</div>
}
