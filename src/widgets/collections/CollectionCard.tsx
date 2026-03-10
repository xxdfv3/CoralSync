'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MoreHorizontal, Plus } from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'

export type WatchStatus = 'planned' | 'watching' | 'completed' | 'on_hold' | 'dropped'

export interface CollectionItemMock {
  id: string
  title: string
  year: number
  season: string
  type: string
  rating: string
  genres: string[]
  coverUrl: string | null
  progressCurrent: number
  progressTotal: number
  totalEpisodes: number
  isOngoing?: boolean
}

const STATUS_LABELS: { value: WatchStatus; label: string }[] = [
  { value: 'planned', label: 'Запланировано' },
  { value: 'watching', label: 'Смотрю' },
  { value: 'completed', label: 'Просмотрено' },
  { value: 'on_hold', label: 'Отложено' },
  { value: 'dropped', label: 'Брошено' },
]

interface CollectionCardProps {
  item: CollectionItemMock & { status?: WatchStatus }
  className?: string
  /** Если передан — меню «Изменить статус» / «Удалить» активно */
  onUpdateStatus?: (itemId: string, status: WatchStatus) => void | Promise<unknown>
  onRemove?: (itemId: string) => void | Promise<unknown>
}

export function CollectionCard({
  item,
  className,
  onUpdateStatus,
  onRemove,
}: CollectionCardProps) {
  const progressLabel =
    item.progressTotal > 0
      ? `${item.progressCurrent} из ${item.progressTotal} | всего ${item.totalEpisodes}`
      : `всего ${item.totalEpisodes}`

  const canManage = Boolean(item.id && (onUpdateStatus || onRemove))

  async function handleStatus(status: WatchStatus) {
    if (!onUpdateStatus || !item.id) return
    const result = await onUpdateStatus(item.id, status)
    if (result && typeof result === 'object' && 'ok' in result && result.ok === false) {
      toast.error('error' in result && typeof result.error === 'string' ? result.error : 'Ошибка')
    } else {
      toast.success('Статус обновлён')
    }
  }

  async function handleRemove() {
    if (!onRemove || !item.id) return
    if (!window.confirm('Удалить тайтл из этой коллекции?')) return
    const result = await onRemove(item.id)
    if (result && typeof result === 'object' && 'ok' in result && result.ok === false) {
      toast.error('error' in result && typeof result.error === 'string' ? result.error : 'Ошибка')
    } else {
      toast.success('Удалено из коллекции')
    }
  }

  return (
    <article
      className={cn(
        'flex gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-muted/30',
        className
      )}
    >
      <Link href="#" className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
        {item.coverUrl ? (
          <Image
            src={item.coverUrl}
            alt=""
            fill
            className="object-cover"
            sizes="64px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground text-xs">
            ?
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link href="#" className="font-medium text-foreground hover:underline line-clamp-1">
          {item.title}
        </Link>
        <p className="mt-0.5 text-muted-foreground text-sm">
          {item.year} • {item.season} • {item.type} • {item.rating}
        </p>
        <p className="text-muted-foreground text-xs">
          {item.genres.slice(0, 3).join(' • ')}
        </p>
        <p className="mt-1 text-muted-foreground text-xs">{progressLabel}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {item.isOngoing ? (
            <Button size="xs" className="bg-emerald-600 hover:bg-emerald-700 text-white">
              Онгоинг
            </Button>
          ) : (
            <Button size="xs" variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400">
              <Plus className="size-3" />
              Добавить
            </Button>
          )}
        </div>
      </div>

      {canManage && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-xs" className="shrink-0" aria-label="Меню">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[200px]">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>Изменить статус</DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                {STATUS_LABELS.map((opt) => (
                  <DropdownMenuItem
                    key={opt.value}
                    onClick={() => handleStatus(opt.value)}
                    className={item.status === opt.value ? 'bg-accent' : ''}
                  >
                    {opt.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleRemove}
              className="focus:bg-destructive/15 focus:text-destructive"
            >
              Удалить из коллекции
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </article>
  )
}
