'use client'

import Link from 'next/link'
import { ChevronRight, Search, X } from 'lucide-react'
import { useState } from 'react'

import { useSession } from '@/shared/api/auth-client'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { AddTitleDialog } from './AddTitleDialog'
import { CollectionCard } from './CollectionCard'
import { CollectionFilters } from './CollectionFilters'
import { CollectionsTabBar } from './CollectionsTabBar'
import { CreateCollectionDialog } from './CreateCollectionDialog'
import { useLocalCollections, type WatchStatus } from './useLocalCollections'
import type { CollectionStatusFilter } from './CollectionsTabBar'
import { useServerCollections } from './useServerCollections'

/**
 * Контент страницы «Коллекции».
 * Гости — призыв войти. Авторизованные — данные в MongoDB (Payload); при первом входе — импорт из localStorage.
 */
export function CollectionsContent() {
  const { data: session, isPending } = useSession()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeStatus, setActiveStatus] =
    useState<CollectionStatusFilter>('all')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [addTitleDialogOpen, setAddTitleDialogOpen] = useState(false)

  const local = useLocalCollections()
  const server = useServerCollections(!!session)
  const useServer = !!session
  const collections = useServer ? server.collections : local.collections
  const currentCollectionId = useServer
    ? server.currentCollectionId
    : local.currentCollectionId
  const setCurrentCollectionId = useServer
    ? server.setCurrentCollectionId
    : local.setCurrentCollectionId
  const addCollection = useServer ? server.addCollection : local.addCollection
  const addItem = useServer ? server.addItem : local.addItem
  const updateItemStatus = useServer
    ? server.updateItemStatus
    : (id: string, status: import('./useLocalCollections').WatchStatus) =>
        Promise.resolve(local.updateItemStatus(id, status))
  const removeItem = useServer
    ? server.removeItem
    : (id: string) => Promise.resolve(local.removeItem(id))
  const itemsForCurrentCollection = useServer
    ? server.itemsForCurrentCollection
    : local.itemsForCurrentCollection

  if (isPending) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <span className="inline-block size-6 animate-pulse text-muted-foreground">…</span>
      </div>
    )
  }

  if (!session) {
    // гость — только локальный стейт не используется в UI
    return (
      <div className="mx-auto flex max-w-md flex-1 flex-col items-center justify-center gap-6 py-12 text-center">
        <h1 className="text-2xl font-semibold text-foreground">Коллекции</h1>
        <p className="text-muted-foreground">
          Войдите в аккаунт, чтобы создавать списки аниме, фильмов и сериалов и делиться ими.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" asChild>
            <Link href="/sign-in">Войти</Link>
          </Button>
          <Button asChild>
            <Link href="/sign-up">Регистрация</Link>
          </Button>
        </div>
      </div>
    )
  }

  if (useServer && server.loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-12">
        <span className="inline-block size-6 animate-pulse text-muted-foreground">…</span>
      </div>
    )
  }

  const collectionItems =
    activeStatus === 'all'
      ? itemsForCurrentCollection
      : itemsForCurrentCollection.filter((item) => item.status === activeStatus)
  const filteredItems = searchQuery.trim()
    ? collectionItems.filter((item) =>
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : collectionItems

  return (
    <div className="mx-auto w-full max-w-6xl">
      {/* Breadcrumbs */}
      <nav className="mb-4 flex items-center gap-1 text-muted-foreground text-sm" aria-label="Хлебные крошки">
        <Link href="/" className="hover:text-foreground transition-colors">
          Главная страница
        </Link>
        <ChevronRight className="size-4 shrink-0 opacity-60" aria-hidden />
        <Link href="/profile" className="hover:text-foreground transition-colors">
          Профиль
        </Link>
        <ChevronRight className="size-4 shrink-0 opacity-60" aria-hidden />
        <span className="text-foreground font-medium">Коллекции</span>
      </nav>

      {/* Page title */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Коллекции</h1>
        <p className="mt-1 text-muted-foreground">
          Здесь собрана вся ваша персональная библиотека аниме
        </p>
        {useServer && server.canImport && (
          <div className="mt-4 flex flex-wrap items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              Обнаружены списки в этом браузере. Перенести в аккаунт?
            </span>
            <Button
              type="button"
              size="sm"
              disabled={server.importing}
              onClick={() => server.runImport()}
            >
              {server.importing ? 'Импорт…' : 'Импортировать'}
            </Button>
          </div>
        )}
        {useServer && server.error && (
          <p className="mt-2 text-destructive text-sm" role="alert">
            {server.error}
          </p>
        )}
        {useServer && (
          <div className="mt-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground text-xs"
              onClick={async () => {
                const n = await server.runCleanupOrphans()
                if (n > 0) {
                  const { toast } = await import('sonner')
                  toast.success(`Удалено висячих тайтлов: ${n}`)
                } else {
                  const { toast } = await import('sonner')
                  toast.message('Висячих тайтлов не найдено')
                }
              }}
            >
              Почистить тайтлы без списков
            </Button>
          </div>
        )}
      </div>

      {/* Two columns: list + filters */}
      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        {/* Left: search, tabs, list */}
        <div className="min-w-0 flex-1">
          <div className="relative mb-4">
            <Search className="text-muted-foreground pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2" />
            <Input
              type="search"
              placeholder="Поиск по коллекции"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-9"
              aria-label="Поиск по коллекции"
            />
            {searchQuery && (
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="absolute right-1 top-1/2 -translate-y-1/2"
                aria-label="Очистить поиск"
                onClick={() => setSearchQuery('')}
              >
                <X className="size-4" />
              </Button>
            )}
          </div>

          <CollectionsTabBar
            collections={collections}
            currentCollectionId={currentCollectionId}
            onSelectCollection={setCurrentCollectionId}
            onOpenCreateCollection={() => setCreateDialogOpen(true)}
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
          />

          <ul className="flex flex-col gap-3" role="list">
            {filteredItems.length === 0 ? (
              <li className="rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center text-muted-foreground">
                {activeStatus === 'all'
                  ? 'В этой коллекции пока нет тайтлов.'
                  : 'Нет тайтлов с выбранным статусом.'}
              </li>
            ) : (
              filteredItems.map((item) => (
                <li key={item.id}>
                  <CollectionCard
                    item={item}
                    onUpdateStatus={updateItemStatus}
                    onRemove={removeItem}
                  />
                </li>
              ))
            )}
          </ul>
        </div>

        {/* Right: действия — добавить тайтл, создать коллекцию */}
        <CollectionFilters
          onOpenCreateCollection={() => setCreateDialogOpen(true)}
          onOpenAddTitle={() => setAddTitleDialogOpen(true)}
          hasCurrentCollection={!!currentCollectionId}
          collections={collections}
          currentCollectionId={currentCollectionId}
          onSelectCollection={setCurrentCollectionId}
        />
      </div>

      <CreateCollectionDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreate={addCollection}
      />
      <AddTitleDialog
        open={addTitleDialogOpen}
        onOpenChange={setAddTitleDialogOpen}
        collections={collections}
        defaultCollectionId={currentCollectionId}
        onAdd={async (item, collectionId) => {
          await addItem(collectionId, item)
        }}
      />
    </div>
  )
}
