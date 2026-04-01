'use client'

import { useActionState, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { deleteAccountAction } from '../actions/delete-account-action'

export function DangerZone(): React.JSX.Element {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [confirmation, setConfirmation] = useState('')

  const [state, formAction, isPending] = useActionState(
    async (_prev: { success: boolean; error?: string }, formData: FormData) => {
      const result = await deleteAccountAction(formData)
      if (result.success) {
        router.push('/login')
      }
      return result
    },
    { success: false } as { success: boolean; error?: string },
  )

  return (
    <div className="rounded-xl border border-red-500/20 bg-red-500/[0.03] p-6">
      <h2 className="text-base font-semibold text-white">Danger zone</h2>
      <p className="mt-1 text-sm text-white/40">
        Permanently delete your account and all associated data. This action cannot be undone.
      </p>

      <div className="mt-5">
        <Button variant="destructive" size="sm" onClick={() => { setIsOpen(true) }}>
          Delete account
        </Button>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent
            className="border border-white/10 bg-gray-900 text-white"
            showCloseButton={false}
          >
            <DialogHeader>
              <DialogTitle>Delete your account?</DialogTitle>
              <DialogDescription className="text-gray-400">
                This will permanently delete your account, all pages, published content, and billing
                data. Type <span className="font-mono font-bold text-red-400">DELETE</span> to
                confirm.
              </DialogDescription>
            </DialogHeader>

            <form action={formAction}>
              <Input
                name="confirmation"
                value={confirmation}
                onChange={(e) => { setConfirmation(e.target.value) }}
                placeholder="Type DELETE to confirm"
                className="border-white/[0.08] bg-white/[0.04] font-mono text-white"
              />
              {state.error && <p className="mt-2 text-sm text-red-400">{state.error}</p>}

              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsOpen(false)
                    setConfirmation('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={isPending || confirmation !== 'DELETE'}
                >
                  {isPending ? 'Deleting...' : 'Delete permanently'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
