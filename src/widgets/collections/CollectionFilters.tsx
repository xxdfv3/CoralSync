'use client'

import { Filter, Folder, FolderPlus, Plus } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Label } from '@/shared/ui/label'
import { cn } from '@/shared/lib/utils'
import type { Collection } from './useLocalCollections'

interface CollectionFiltersProps {
  onOpenCreateCollection: () => void
  onOpenAddTitle: () => void
  hasCurrentCollection: boolean
  collections: Collection[]
  currentCollectionId: string | null
  onSelectCollection: (id: string) => void
}

export function CollectionFilters({
  onOpenCreateCollection,
  onOpenAddTitle,
  hasCurrentCollection,
  collections,
  currentCollectionId,
  onSelectCollection,
}: CollectionFiltersProps) {
  return (
    <aside className="flex w-full flex-col gap-6 lg:w-72 lg:shrink-0">
      <div className="space-y-2">
        <Label className="text-sm font-medium">Действия</Label>
        <p className="text-muted-foreground text-xs">
          {hasCurrentCollection
            ? 'Добавьте тайтл в коллекцию или создайте новую коллекцию'
            : 'Создайте коллекцию, чтобы добавлять в неё тайтлы'}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          variant="default"
          className="w-full justify-start gap-3 rounded-lg py-6"
          onClick={onOpenAddTitle}
          disabled={!hasCurrentCollection}
          title={!hasCurrentCollection ? 'Сначала создайте коллекцию' : undefined}
        >
          <Plus className="size-5 shrink-0" />
          <span>Добавить тайтл</span>
        </Button>
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-3 rounded-lg border-border bg-muted/30 py-6 hover:bg-muted/50"
          onClick={onOpenCreateCollection}
        >
          <FolderPlus className="size-5 shrink-0" />
          <span>Создать коллекцию</span>
        </Button>
        {/* Позже: выпадающее меню фильтров */}
        <Button
          type="button"
          variant="outline"
          className="w-full justify-start gap-3 rounded-lg border-border bg-muted/30 py-6 hover:bg-muted/50"
          onClick={() => {
            // TODO: открыть выпадающее меню фильтров
          }}
          aria-label="Фильтр"
        >
          <Filter className="size-5 shrink-0" />
          <span>Фильтр</span>
        </Button>
      </div>

      <div className="space-y-2">
        <Label className="text-sm font-medium">Мои коллекции</Label>
        {collections.length === 0 ? (
          <p className="text-muted-foreground rounded-lg border border-dashed border-border bg-muted/20 px-3 py-4 text-center text-xs">
            Пока нет коллекций. Создайте первую выше.
          </p>
        ) : (
          <div className="max-h-48 overflow-y-auto rounded-lg border border-border">
            <ul className="flex flex-col gap-0.5 p-1" role="list">
              {collections.map((col) => {
                const isActive = col.id === currentCollectionId
                return (
                  <li key={col.id}>
                    <button
                      type="button"
                      onClick={() => onSelectCollection(col.id)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
                        isActive
                          ? 'bg-primary/15 text-foreground font-medium'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      )}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <Folder
                        className={cn(
                          'size-4 shrink-0',
                          isActive ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                      <span className="min-w-0 truncate">{col.name}</span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>
    </aside>
  )
}
