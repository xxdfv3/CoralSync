'use client'

import { useCallback, useEffect, useState } from 'react'

import type { CollectionItemMock } from './CollectionCard'

export type WatchStatus = 'planned' | 'watching' | 'completed' | 'on_hold' | 'dropped'

export interface Collection {
  id: string
  name: string
}

export interface CollectionItem extends CollectionItemMock {
  status: WatchStatus
  collectionId: string
}

const STORAGE_KEY = 'coralsync-collections'

interface StoredState {
  collections: Collection[]
  currentCollectionId: string | null
  items: CollectionItem[]
}

function loadState(): StoredState {
  if (typeof window === 'undefined') {
    return { collections: [], currentCollectionId: null, items: [] }
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { collections: [], currentCollectionId: null, items: [] }
    const parsed = JSON.parse(raw) as StoredState
    return {
      collections: Array.isArray(parsed.collections) ? parsed.collections : [],
      currentCollectionId: parsed.currentCollectionId ?? null,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    }
  } catch {
    return { collections: [], currentCollectionId: null, items: [] }
  }
}

function saveState(state: StoredState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // ignore
  }
}

function generateId() {
  return crypto.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function useLocalCollections() {
  const [state, setState] = useState<StoredState>(() => loadState())

  useEffect(() => {
    saveState(state)
  }, [state])

  const addCollection = useCallback((name: string) => {
    const trimmed = name.trim()
    if (!trimmed) return
    const id = generateId()
    setState((prev) => ({
      ...prev,
      collections: [...prev.collections, { id, name: trimmed }],
      currentCollectionId: id,
    }))
    return id
  }, [])

  const setCurrentCollectionId = useCallback((id: string | null) => {
    setState((prev) => ({ ...prev, currentCollectionId: id }))
  }, [])

  const addItem = useCallback(
    (collectionId: string, item: Omit<CollectionItem, 'id' | 'collectionId'>) => {
      const newItem: CollectionItem = {
        ...item,
        id: generateId(),
        collectionId,
      }
      setState((prev) => ({
        ...prev,
        items: [...prev.items, newItem],
      }))
      return newItem.id
    },
    []
  )

  const updateItemStatus = useCallback((itemId: string, status: WatchStatus) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.map((it) =>
        it.id === itemId ? { ...it, status } : it
      ),
    }))
  }, [])

  const removeItem = useCallback((itemId: string) => {
    setState((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.id !== itemId),
    }))
  }, [])

  const itemsForCurrentCollection = state.items.filter(
    (item) => item.collectionId === state.currentCollectionId
  )

  return {
    collections: state.collections,
    currentCollectionId: state.currentCollectionId,
    setCurrentCollectionId,
    addCollection,
    addItem,
    updateItemStatus,
    removeItem,
    items: state.items,
    itemsForCurrentCollection,
  }
}
