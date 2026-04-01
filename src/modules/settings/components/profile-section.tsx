'use client'

import { useActionState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import { updateProfileAction } from '../actions/update-profile-action'

interface ProfileSectionProps {
  name: string
  email: string
}

export function ProfileSection({ name, email }: ProfileSectionProps): React.JSX.Element {
  const [state, formAction, isPending] = useActionState(
    async (_prev: { success: boolean; error?: string }, formData: FormData) => {
      return updateProfileAction(formData)
    },
    { success: false } as { success: boolean; error?: string },
  )

  return (
    <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-6">
      <h2 className="text-base font-semibold text-white">Profile</h2>
      <p className="mt-1 text-sm text-white/40">Manage your account information.</p>

      <form action={formAction} className="mt-5 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white/70">
            Name
          </Label>
          <Input
            id="name"
            name="name"
            defaultValue={name}
            className="border-white/[0.08] bg-white/[0.04] text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-white/70">
            Email
          </Label>
          <Input
            id="email"
            value={email}
            disabled
            className="border-white/[0.06] bg-white/[0.02] text-white/40"
          />
          <p className="text-xs text-white/30">Email cannot be changed.</p>
        </div>

        {state.error && <p className="text-sm text-red-400">{state.error}</p>}
        {state.success && <p className="text-sm text-emerald-400">Profile updated.</p>}

        <Button
          type="submit"
          disabled={isPending}
          className="bg-indigo-600 text-white hover:bg-indigo-500"
        >
          {isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </div>
  )
}
