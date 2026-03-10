'use client'

import { useCallback, useEffect, useState } from 'react'

import {
  addCollectionItem,
  cleanupOrphanUserTitles,
  createCollection,
  importFromLocalStorage,
  listCollectionItems,
  listMyCollections,
  removeCollectionItem,
  syncSiteUserToPayload,
  updateCollectionItemStatus,
  type ServerCollectionItem,
} from '@/server/collections/actions'

import type { Collection, CollectionItem, WatchStatus } from './useLocalCollections'

const STORAGE_KEY = 'coralsync-collections'

function readLocalPayload(): {
  collections: { id: string; name: string }[]
  items: CollectionItem[]
} | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as {
      collections?: Collection[]
      items?: CollectionItem[]
    }
    if (!Array.isArray(parsed.collections) || !Array.isArray(parsed.items)) return null
    return { collections: parsed.collections, items: parsed.items }
  } catch {
    return null
  }
}

function clearLocalStorage() {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // ignore
  }
}

/**
 * Коллекции с сервера (Payload) для авторизованного пользователя.
 * При первом заходе можно импортировать данные из localStorage.
 * @param enabled — вызывать загрузку только при true (есть сессия).
 */
export function useServerCollections(enabled: boolean) {
  const [collections, setCollections] = useState<Collection[]>([])
  const [currentCollectionId, setCurrentCollectionId] = useState<string | null>(null)
  const [items, setItems] = useState<CollectionItem[]>([])
  const [loading, setLoading] = useState(true)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const refreshCollections = useCallback(async () => {
    setError(null)
    const list = await listMyCollections()
    const mapped = list.map((c) => ({ id: c.id, name: c.name }))
    setCollections(mapped)
    setCurrentCollectionId((prev) => {
      if (prev && mapped.some((c) => c.id === prev)) return prev
      return mapped[0]?.id ?? null
    })
  }, [])

  const refreshItems = useCallback(async (collectionId: string | null) => {
    if (!collectionId) {
      setItems([])
      return
    }
    setError(null)
    try {
      const list = await listCollectionItems(collectionId)
      setItems(
        list.map(
          (row: ServerCollectionItem): CollectionItem => ({
            id: row.id,
            collectionId: row.collectionId,
            status: row.status as WatchStatus,
            title: row.title,
            year: row.year,
            season: row.season,
            type: row.type,
            rating: row.rating,
            genres: row.genres,
            coverUrl: row.coverUrl,
            progressCurrent: row.progressCurrent,
            progressTotal: row.progressTotal,
            totalEpisodes: row.totalEpisodes,
          })
        )
      )
    } catch {
      setItems([])
    }
  }, [])

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      setCollections([])
      setCurrentCollectionId(null)
      setItems([])
      return
    }
    let cancelled = false
    ;(async () => {
      setLoading(true)
      try {
        await syncSiteUserToPayload().catch(() => {})
        await refreshCollections()
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Ошибка загрузки')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [enabled, refreshCollections])

  useEffect(() => {
    refreshItems(currentCollectionId)
  }, [currentCollectionId, refreshItems])

  const addCollection = useCallback(async (name: string) => {
    const id = await createCollection(name)
    await refreshCollections()
    setCurrentCollectionId(id)
    return id
  }, [refreshCollections])

  const addItem = useCallback(
    async (collectionId: string, item: Omit<CollectionItem, 'id' | 'collectionId'>) => {
      const ext = item as Omit<CollectionItem, 'id' | 'collectionId'> & {
        titleType?: string
        formatLabel?: string
        description?: string
      }
      await addCollectionItem({
        collectionId,
        title: item.title,
        year: item.year,
        season: item.season,
        titleType:
          ext.titleType === 'movie' ||
          ext.titleType === 'cartoon' ||
          ext.titleType === 'serial' ||
          ext.titleType === 'cartoon_serial' ||
          ext.titleType === 'anime' ||
          ext.titleType === 'custom'
            ? ext.titleType
            : 'anime',
        formatLabel: ext.formatLabel ?? item.type,
        rating: item.rating,
        genres: item.genres,
        coverUrl: item.coverUrl ?? null,
        description: ext.description,
        progressCurrent: item.progressCurrent,
        progressTotal: item.progressTotal,
        totalEpisodes: item.totalEpisodes,
        status: item.status,
      })
      if (collectionId !== currentCollectionId) {
        setCurrentCollectionId(collectionId)
      }
      await refreshItems(collectionId)
    },
    [currentCollectionId, refreshItems]
  )

  const updateItemStatus = useCallback(
    async (itemId: string, status: WatchStatus) => {
      const result = await updateCollectionItemStatus(itemId, status)
      if (result.ok && currentCollectionId) {
        await refreshItems(currentCollectionId)
      }
      return result
    },
    [currentCollectionId, refreshItems]
  )

  const removeItem = useCallback(
    async (itemId: string) => {
      const result = await removeCollectionItem(itemId)
      if (result.ok && currentCollectionId) {
        await refreshItems(currentCollectionId)
      }
      return result
    },
    [currentCollectionId, refreshItems]
  )

  const runCleanupOrphans = useCallback(async () => {
    setError(null)
    try {
      const { removed } = await cleanupOrphanUserTitles()
      if (removed > 0 && currentCollectionId) {
        await refreshItems(currentCollectionId)
      }
      return removed
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Очистка не удалась')
      return 0
    }
  }, [currentCollectionId, refreshItems])

  const runImport = useCallback(async () => {
    const local = readLocalPayload()
    if (!local || local.collections.length === 0) return
    setImporting(true)
    setError(null)
    try {
      await importFromLocalStorage({
        collections: local.collections,
        items: local.items,
      })
      clearLocalStorage()
      await refreshCollections()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Импорт не удался')
    } finally {
      setImporting(false)
    }
  }, [refreshCollections])

  const itemsForCurrentCollection = items.filter(
    (item) => item.collectionId === currentCollectionId
  )

  const hasLocalData = typeof window !== 'undefined' && !!readLocalPayload()?.collections.length
  const canImport = hasLocalData && collections.length === 0 && !loading

  return {
    collections,
    currentCollectionId,
    setCurrentCollectionId,
    addCollection,
    addItem,
    updateItemStatus,
    removeItem,
    items,
    itemsForCurrentCollection,
    loading,
    importing,
    error,
    canImport,
    runImport,
    runCleanupOrphans,
  }
}
