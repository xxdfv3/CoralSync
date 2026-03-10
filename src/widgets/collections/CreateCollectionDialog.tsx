'use client'

import { useState } from 'react'

import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'

interface CreateCollectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Локально может вернуть id; с сервера — Promise<string>. Результат не обязателен. */
  onCreate: (name: string) => void | Promise<void> | string | undefined | Promise<string>
}

export function CreateCollectionDialog({
  open,
  onOpenChange,
  onCreate,
}: CreateCollectionDialogProps) {
  const [name, setName] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    try {
      await Promise.resolve(onCreate(trimmed))
    } catch {
      // ошибка уже на сервере; при необходимости — toast
    }
    setName('')
    onOpenChange(false)
  }

  function handleOpenChange(next: boolean) {
    if (!next) setName('')
    onOpenChange(next)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Создать коллекцию</DialogTitle>
            <DialogDescription>
              Введите название новой коллекции. Позже вы сможете добавлять в неё тайтлы.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="collection-name">Название</Label>
              <Input
                id="collection-name"
                placeholder="Например: Хочу посмотреть"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                aria-required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
              Отмена
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              Создать
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
