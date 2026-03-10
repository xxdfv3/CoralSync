'use server'

import { headers } from 'next/headers'
import { getPayload } from 'payload'
import { z } from 'zod'

import config from '@payload-config'

import { auth } from '../auth'
import {
  deleteUserTitleIfOrphaned,
  getUserTitleIdFromItemDoc,
} from './orphan-user-titles'

/** Slug коллекций UGC; тип Config в билде может браться из устаревшего payload-types в корне. */
const USER_COLLECTIONS = 'user-collections' as const
const USER_COLLECTION_ITEMS = 'user-collection-items' as const
const USER_TITLES = 'user-titles' as const
const SITE_USERS = 'site-users' as const
const GENRES = 'genres' as const
const DUBBING_STUDIOS = 'dubbing-studios' as const
/** Обход рассинхрона Config в корневом payload-types при сборке */
function pl(
  payload: Awaited<ReturnType<typeof getPayload>>
): {
  find: (a: Record<string, unknown>) => Promise<{ docs: Record<string, unknown>[] }>
  findByID: (a: Record<string, unknown>) => Promise<Record<string, unknown> | null>
  create: (a: Record<string, unknown>) => Promise<{ id: string }>
  update: (a: Record<string, unknown>) => Promise<unknown>
  delete: (a: Record<string, unknown>) => Promise<unknown>
} {
  return payload as never
}

/**
 * Синхронизация текущего пользователя Better Auth в коллекцию site-users (для админки).
 * Вызывать после входа или при заходе в защищённые разделы.
 */
export async function syncSiteUserToPayload(): Promise<void> {
  const h = await headers()
  const session = await auth.api.getSession({ headers: h })
  const user = session?.user
  if (!user?.id || typeof user.id !== 'string') return

  const email =
    typeof user.email === 'string' && user.email
      ? user.email
      : `user-${user.id}@placeholder.local`
  const name =
    typeof user.name === 'string' && user.name ? user.name : undefined

  const payload = pl(await getPayload({ config }))
  const { docs } = await payload.find({
    collection: SITE_USERS,
    where: { betterAuthUserId: { equals: user.id } },
    limit: 1,
    overrideAccess: true,
  })

  const syncedAt = new Date().toISOString()

  if (docs.length > 0) {
    const id = String(docs[0].id)
    await payload.update({
      collection: SITE_USERS,
      id,
      data: {
        email,
        name: name ?? undefined,
        syncedAt,
      },
      overrideAccess: true,
    })
    return
  }

  await payload.create({
    collection: SITE_USERS,
    data: {
      betterAuthUserId: user.id,
      email,
      name,
      role: 'user',
      syncedAt,
    },
    overrideAccess: true,
  })
}

async function requireUserId(): Promise<string> {
  const h = await headers()
  const session = await auth.api.getSession({ headers: h })
  const userId = session?.user?.id
  if (!userId || typeof userId !== 'string') {
    throw new Error('UNAUTHORIZED')
  }
  return userId
}

export type ServerCollection = { id: string; name: string }
export type ServerCollectionItem = {
  id: string
  collectionId: string
  status: string
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
}

/**
 * Список коллекций текущего пользователя (Payload id + name).
 */
export type GenreOption = { id: string; name: string }

/**
 * Жанры из админки, отфильтрованные по типу тайтла (поле type у жанра — hasMany).
 * Для custom возвращаем все жанры.
 */
export async function listGenresForTitleType(
  titleType: string
): Promise<GenreOption[]> {
  await requireUserId()
  const payload = pl(await getPayload({ config }))
  const { docs } = await payload.find({
    collection: GENRES,
    limit: 500,
    sort: 'name',
    overrideAccess: true,
  })
  const list: GenreOption[] = []
  for (const d of docs) {
    const name = typeof d.name === 'string' ? d.name : ''
    if (!name) continue
    const typeField = d.type
    const types = Array.isArray(typeField) ? typeField : []
    if (
      titleType === 'custom' ||
      types.length === 0 ||
      types.includes(titleType)
    ) {
      list.push({ id: String(d.id), name })
    }
  }
  return list
}

/**
 * Студии озвучки из админки, по типу тайтла (поле type — hasMany, как у жанров).
 */
export async function listDubbingStudiosForTitleType(
  titleType: string
): Promise<GenreOption[]> {
  await requireUserId()
  const payload = pl(await getPayload({ config }))
  const { docs } = await payload.find({
    collection: DUBBING_STUDIOS,
    limit: 500,
    sort: 'name',
    overrideAccess: true,
  })
  const list: GenreOption[] = []
  for (const d of docs) {
    const name = typeof d.name === 'string' ? d.name : ''
    if (!name) continue
    const typeField = d.type
    const types = Array.isArray(typeField) ? typeField : []
    if (
      titleType === 'custom' ||
      types.length === 0 ||
      types.includes(titleType)
    ) {
      list.push({ id: String(d.id), name })
    }
  }
  return list
}

export async function listMyCollections(): Promise<ServerCollection[]> {
  const userId = await requireUserId()
  const payload = pl(await getPayload({ config }))
  const { docs } = await payload.find({
    collection: USER_COLLECTIONS,
    where: { userId: { equals: userId } },
    limit: 200,
    sort: '-createdAt',
    overrideAccess: true,
  })
  if (docs.length === 0) {
    const doc = await payload.create({
      collection: USER_COLLECTIONS,
      data: { userId, name: 'Моя коллекция', isPublic: false },
      overrideAccess: true,
    })
    return [{ id: String(doc.id), name: 'Моя коллекция' }]
  }
  return docs.map((d) => ({
    id: String(d.id),
    name: typeof d.name === 'string' ? d.name : '',
  }))
}

/**
 * Создать коллекцию в БД; возвращает Payload id.
 */
export async function createCollection(name: string): Promise<string> {
  const userId = await requireUserId()
  const trimmed = name.trim()
  if (!trimmed) throw new Error('EMPTY_NAME')
  const payload = pl(await getPayload({ config }))
  const doc = await payload.create({
    collection: USER_COLLECTIONS,
    data: { userId, name: trimmed, isPublic: false },
    overrideAccess: true,
  })
  return String(doc.id)
}

const watchStatusSchema = z.enum([
  'planned',
  'watching',
  'completed',
  'on_hold',
  'dropped',
])

const userTitleTypeSchema = z.enum([
  'movie',
  'cartoon',
  'serial',
  'cartoon_serial',
  'anime',
  'custom',
])

const addItemSchema = z.object({
  collectionId: z.string().min(1),
  title: z.string().min(1),
  year: z.number().int(),
  season: z.string(),
  /** Тип как в админке user-titles (каталог/модерация) */
  titleType: userTitleTypeSchema.default('anime'),
  /** Название студии озвучки (из справочника); в user-titles пишется в formatLabel */
  formatLabel: z.string().optional(),
  /** Оценка 1–5 (звёзды) */
  rating: z.string().regex(/^[1-5]$/),
  genres: z.array(z.string()),
  coverUrl: z.string().nullable().optional(),
  description: z.string().optional(),
  progressCurrent: z.number().int().min(0),
  progressTotal: z.number().int().min(0),
  totalEpisodes: z.number().int().min(0),
  status: watchStatusSchema,
})

/**
 * Добавить тайтл: сначала user-titles (вся инфа), затем элемент списка — только коллекция + userTitle + прогресс/статус.
 */
export async function addCollectionItem(
  input: z.infer<typeof addItemSchema>
): Promise<string> {
  const userId = await requireUserId()
  const data = addItemSchema.parse(input)
  const payload = pl(await getPayload({ config }))
  const coll = await payload.findByID({
    collection: USER_COLLECTIONS,
    id: data.collectionId,
    overrideAccess: true,
  })
  if (!coll || coll.userId !== userId) throw new Error('FORBIDDEN')

  const genresLine = data.genres.filter((g) => g && g !== '—').join(', ')
  const formatLabel =
    data.formatLabel && data.formatLabel.trim()
      ? data.formatLabel.trim()
      : undefined

  const userTitleDoc = await payload.create({
    collection: USER_TITLES,
    data: {
      userId,
      name: data.title,
      type: data.titleType,
      year: data.year,
      season: data.season && data.season !== '—' ? data.season : undefined,
      formatLabel,
      rating: data.rating,
      genresText: genresLine || undefined,
      coverUrl: data.coverUrl ?? undefined,
      description: data.description?.trim() || undefined,
      moderationStatus: 'pending',
    },
    overrideAccess: true,
  })
  const userTitleId = String(userTitleDoc.id)

  const itemDoc = await payload.create({
    collection: USER_COLLECTION_ITEMS,
    data: {
      userId,
      userList: data.collectionId,
      userTitle: userTitleId,
      status: data.status,
      progressCurrent: data.progressCurrent,
      progressTotal: data.progressTotal,
    },
    overrideAccess: true,
  })
  return String(itemDoc.id)
}

/**
 * Обновить статус просмотра элемента списка (user-collection-items).
 */
export async function updateCollectionItemStatus(
  itemId: string,
  status: z.infer<typeof watchStatusSchema>
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userId = await requireUserId()
    const payload = pl(await getPayload({ config }))
    const doc = await payload.findByID({
      collection: USER_COLLECTION_ITEMS,
      id: itemId,
      overrideAccess: true,
    })
    if (!doc || doc.userId !== userId) {
      return { ok: false, error: 'Нет доступа' }
    }
    await payload.update({
      collection: USER_COLLECTION_ITEMS,
      id: itemId,
      data: { status },
      overrideAccess: true,
    })
    return { ok: true }
  } catch {
    return { ok: false, error: 'Не удалось обновить статус' }
  }
}

/**
 * Удалить элемент из коллекции (только user-collection-items).
 */
export async function removeCollectionItem(
  itemId: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const userId = await requireUserId()
    const payloadRaw = await getPayload({ config })
    const payload = pl(payloadRaw)
    const doc = await payload.findByID({
      collection: USER_COLLECTION_ITEMS,
      id: itemId,
      overrideAccess: true,
    })
    if (!doc || doc.userId !== userId) {
      return { ok: false, error: 'Нет доступа' }
    }
    const userTitleId = getUserTitleIdFromItemDoc(doc as Record<string, unknown>)

    await payload.delete({
      collection: USER_COLLECTION_ITEMS,
      id: itemId,
      overrideAccess: true,
    })

    if (userTitleId) {
      await deleteUserTitleIfOrphaned(payloadRaw, userTitleId, userId)
    }
    return { ok: true }
  } catch {
    return { ok: false, error: 'Не удалось удалить' }
  }
}

/**
 * Одноразовая очистка: удаляет user-titles текущего пользователя, на которые
 * больше нет ни одного элемента списка (после старых удалений без каскада).
 */
export async function cleanupOrphanUserTitles(): Promise<{ removed: number }> {
  const userId = await requireUserId()
  const payloadRaw = await getPayload({ config })
  const payload = pl(payloadRaw)
  const { docs: titles } = await payload.find({
    collection: USER_TITLES,
    where: { userId: { equals: userId } },
    limit: 1000,
    overrideAccess: true,
  })
  let removed = 0
  for (const t of titles) {
    const id = String(t.id)
    const { docs: items } = await payload.find({
      collection: USER_COLLECTION_ITEMS,
      where: { userTitle: { equals: id } },
      limit: 1,
      overrideAccess: true,
    })
    if (items.length === 0) {
      await payload.delete({
        collection: USER_TITLES,
        id,
        overrideAccess: true,
      })
      removed++
    }
  }
  return { removed }
}

/**
 * Элементы выбранной коллекции в формате UI (CollectionItemMock + status + collectionId).
 */
export async function listCollectionItems(
  collectionId: string
): Promise<ServerCollectionItem[]> {
  const userId = await requireUserId()
  const payload = pl(await getPayload({ config }))
  const coll = await payload.findByID({
    collection: USER_COLLECTIONS,
    id: collectionId,
    overrideAccess: true,
  })
  if (!coll || coll.userId !== userId) throw new Error('FORBIDDEN')

  const { docs } = await payload.find({
    collection: USER_COLLECTION_ITEMS,
    where: {
      and: [
        { userId: { equals: userId } },
        { userList: { equals: collectionId } },
      ],
    },
    limit: 500,
    sort: '-createdAt',
    depth: 1,
    overrideAccess: true,
  })

  return docs.map((d) => {
    const ut = d.userTitle as Record<string, unknown> | string | null | undefined
    const utObj =
      ut && typeof ut === 'object' && !Array.isArray(ut) ? ut : null
    const title =
      utObj && typeof utObj.name === 'string'
        ? utObj.name
        : typeof d.displayTitle === 'string'
          ? d.displayTitle
          : '—'
    const year =
      utObj && typeof utObj.year === 'number' ? utObj.year : new Date().getFullYear()
    const season =
      utObj && typeof utObj.season === 'string' ? utObj.season : '—'
    const type =
      utObj && typeof utObj.formatLabel === 'string'
        ? utObj.formatLabel
        : utObj && typeof utObj.type === 'string'
          ? utObj.type
          : '—'
    const rating =
      utObj && typeof utObj.rating === 'string' ? utObj.rating : '—'
    const genresStr =
      utObj && typeof utObj.genresText === 'string' ? utObj.genresText : ''
    const genres = genresStr
      ? genresStr.split(/[,;\n]/).map((g) => g.trim()).filter(Boolean)
      : []
    const coverUrl =
      utObj && typeof utObj.coverUrl === 'string' ? utObj.coverUrl : null

    return {
      id: String(d.id),
      collectionId,
      status: typeof d.status === 'string' ? d.status : 'planned',
      title,
      year,
      season,
      type,
      rating,
      genres: genres.length > 0 ? genres : ['—'],
      coverUrl,
      progressCurrent:
        typeof d.progressCurrent === 'number' ? d.progressCurrent : 0,
      progressTotal:
        typeof d.progressTotal === 'number' ? d.progressTotal : 0,
      totalEpisodes:
        typeof d.progressTotal === 'number' && d.progressTotal > 0
          ? d.progressTotal
          : 0,
    }
  })
}

const importCollectionSchema = z.object({
  id: z.string(),
  name: z.string(),
})

const importItemSchema = z.object({
  id: z.string(),
  collectionId: z.string(),
  status: watchStatusSchema,
  title: z.string(),
  year: z.number(),
  season: z.string(),
  type: z.string(),
  rating: z.string(),
  genres: z.array(z.string()),
  coverUrl: z.string().nullable(),
  progressCurrent: z.number(),
  progressTotal: z.number(),
  totalEpisodes: z.number(),
})

const importPayloadSchema = z.object({
  collections: z.array(importCollectionSchema),
  items: z.array(importItemSchema),
})

/**
 * Импорт состояния из localStorage: создаёт коллекции и элементы, маппит старые id → новые Payload id.
 * Идемпотентность не гарантируется — при повторном вызове будут дубликаты, если не чистить локально.
 */
export async function importFromLocalStorage(
  payloadJson: unknown
): Promise<{ collectionIds: string[] }> {
  const userId = await requireUserId()
  const parsed = importPayloadSchema.parse(payloadJson)
  const payload = pl(await getPayload({ config }))
  const idMap = new Map<string, string>()

  for (const c of parsed.collections) {
    const doc = await payload.create({
      collection: USER_COLLECTIONS,
      data: { userId, name: c.name.trim() || 'Без названия', isPublic: false },
      overrideAccess: true,
    })
    idMap.set(c.id, String(doc.id))
  }

  for (const item of parsed.items) {
    const newCollId = idMap.get(item.collectionId)
    if (!newCollId) continue
    const genresLine = item.genres.filter((g) => g && g !== '—').join(', ')
    const userTitleDoc = await payload.create({
      collection: USER_TITLES,
      data: {
        userId,
        name: item.title,
        type: 'custom',
        year: item.year,
        season: item.season && item.season !== '—' ? item.season : undefined,
        formatLabel: item.type && item.type !== '—' ? item.type : undefined,
        rating: item.rating,
        genresText: genresLine || undefined,
        coverUrl: item.coverUrl ?? undefined,
        moderationStatus: 'pending',
      },
      overrideAccess: true,
    })
    await payload.create({
      collection: USER_COLLECTION_ITEMS,
      data: {
        userId,
        userList: newCollId,
        userTitle: String(userTitleDoc.id),
        status: item.status,
        progressCurrent: item.progressCurrent,
        progressTotal: item.progressTotal || item.totalEpisodes,
      },
      overrideAccess: true,
    })
  }

  return { collectionIds: [...idMap.values()] }
}
