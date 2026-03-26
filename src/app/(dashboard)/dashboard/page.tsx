import { auth, signOut } from '@/shared/lib/auth'
import { Button } from '@/components/ui/button'

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const session = await auth()

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <p className="text-muted-foreground text-sm">
        Signed in as {session?.user?.email}
      </p>
      <form
        action={async () => {
          'use server'
          await signOut({ redirectTo: '/login' })
        }}
      >
        <Button type="submit" variant="outline">
          Sign out
        </Button>
      </form>
    </div>
  )
}
