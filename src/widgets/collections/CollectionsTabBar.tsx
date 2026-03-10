'use client'

import { ChevronDown, FolderPlus } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { cn } from '@/shared/lib/utils'
import type { Collection } from './useLocalCollections'
import type { WatchStatus } from './useLocalCollections'

/** Фильтр списка: по статусу или все сразу */
export type CollectionStatusFilter = WatchStatus | 'all'

const MAX_VISIBLE_COLLECTIONS = 4

const STATUS_FILTERS: { value: CollectionStatusFilter; label: string }[] = [
  { value: 'all', label: 'Все' },
  { value: 'planned', label: 'Запланировано' },
  { value: 'watching', label: 'Смотрю' },
  { value: 'on_hold', label: 'Отложено' },
  { value: 'completed', label: 'Просмотрено' },
  { value: 'dropped', label: 'Брошено' },
]

interface CollectionsTabBarProps {
  collections: Collection[]
  currentCollectionId: string | null
  onSelectCollection: (id: string) => void
  onOpenCreateCollection: () => void
  /** Фильтр по статусу просмотра внутри выбранной коллекции */
  activeStatus: CollectionStatusFilter
  onStatusChange: (status: CollectionStatusFilter) => void
}

export function CollectionsTabBar({
  collections,
  currentCollectionId,
  onSelectCollection,
  onOpenCreateCollection,
  activeStatus,
  onStatusChange,
}: CollectionsTabBarProps) {
  const visible = collections.slice(0, MAX_VISIBLE_COLLECTIONS)
  const overflow = collections.slice(MAX_VISIBLE_COLLECTIONS)
  const current = collections.find((c) => c.id === currentCollectionId)
  const currentInOverflow =
    current && overflow.some((c) => c.id === currentCollectionId)

  return (
    <div className="mb-4 space-y-3">
      {/* Ряд 1: только коллекции пользователя — до 4 вкладок + «Ещё…» */}
      <div
        className="flex flex-wrap items-end gap-1 border-b border-border"
        role="tablist"
        aria-label="Коллекции"
      >
        {visible.map((col) => {
          const isActive = col.id === currentCollectionId
          return (
            <button
              key={col.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={cn(
                'max-w-[140px] truncate rounded-none border-b-2 border-transparent px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'border-primary text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
              onClick={() => onSelectCollection(col.id)}
              title={col.name}
            >
              {col.name}
            </button>
          )
        })}

        {overflow.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  'mb-px gap-1 rounded-none border-b-2 border-transparent px-3 py-2 font-medium',
                  currentInOverflow
                    ? 'border-primary text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
                aria-label="Остальные коллекции"
              >
                {currentInOverflow ? (
                  <span className="max-w-[100px] truncate">{current.name}</span>
                ) : (
                  <span>Ещё ({overflow.length})</span>
                )}
                <ChevronDown className="size-4 shrink-0 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[220px]">
              <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                Другие коллекции
              </DropdownMenuLabel>
              {overflow.map((col) => (
                <DropdownMenuItem
                  key={col.id}
                  onClick={() => onSelectCollection(col.id)}
                  className={cn(col.id === currentCollectionId && 'bg-accent font-medium')}
                >
                  {col.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mb-px gap-1 rounded-none px-3 py-2 text-muted-foreground hover:text-foreground"
          onClick={onOpenCreateCollection}
          aria-label="Создать коллекцию"
        >
          <FolderPlus className="size-4" />
          <span className="hidden sm:inline">Новая</span>
        </Button>
      </div>

      {/* Ряд 2: статус просмотра — фильтр списка в текущей коллекции */}
      <div
        className="flex flex-wrap gap-1"
        role="tablist"
        aria-label="Статус просмотра"
      >
        {STATUS_FILTERS.map((tab) => {
          const isActive = activeStatus === tab.value
          return (
            <button
              key={tab.value}
              type="button"
              role="tab"
              aria-selected={isActive}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-primary/15 text-primary'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
              onClick={() => onStatusChange(tab.value)}
            >
              {tab.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
