'use client'

import { useActionState, useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { createPage } from '@/modules/dashboard/actions/page-actions'
import { PAGE_TEMPLATES } from '@/shared/lib/page-templates'

import { TemplateCard } from './template-card'

interface FormState {
  error?: string
}

const BLANK_ID = '__blank__'

export function CreatePageDialog(): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState(BLANK_ID)
  const formRef = useRef<HTMLFormElement>(null)

  const [state, formAction, isPending] = useActionState(
    async (_prev: FormState, formData: FormData): Promise<FormState> => {
      const result = await createPage(formData)
      if (!result.success) return { error: result.error }
      setIsOpen(false)
      setSelectedTemplateId(BLANK_ID)
      formRef.current?.reset()
      return {}
    },
    {},
  )

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger render={<Button />}>Create page</DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create a new page</DialogTitle>
          <DialogDescription>
            Choose a template to get started, or start from scratch.
          </DialogDescription>
        </DialogHeader>
        <form ref={formRef} action={formAction}>
          {/* Hidden field for template selection */}
          {selectedTemplateId !== BLANK_ID ? (
            <input type="hidden" name="templateId" value={selectedTemplateId} />
          ) : null}

          <div className="space-y-5 py-2">
            {/* Template gallery grid */}
            <div className="grid grid-cols-3 gap-3">
              <TemplateCard
                name="Blank"
                description="Start from scratch"
                isSelected={selectedTemplateId === BLANK_ID}
                onSelect={() => { setSelectedTemplateId(BLANK_ID) }}
              />
              {PAGE_TEMPLATES.map((template) => (
                <TemplateCard
                  key={template.id}
                  templateId={template.id}
                  name={template.name}
                  description={template.description}
                  themeId={template.themeId}
                  isSelected={selectedTemplateId === template.id}
                  onSelect={() => { setSelectedTemplateId(template.id) }}
                />
              ))}
            </div>

            {/* Name input */}
            <div className="space-y-2">
              <Label htmlFor="name">Page name</Label>
              <Input
                id="name"
                name="name"
                placeholder="My Landing Page"
                required
                maxLength={100}
                autoFocus
                disabled={isPending}
              />
            </div>
            {state.error ? <p className="text-sm text-red-500">{state.error}</p> : null}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setIsOpen(false) }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Spinner />
                  Creating…
                </>
              ) : (
                'Create'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
