/**
 * При удалении последнего user-collection-items, ссылающегося на user-title,
 * удаляем и сам user-titles — иначе в админке остаются «висячие» тайтлы.
 */
import type { Payload } from 'payload'

const USER_COLLECTION_ITEMS = 'user-collection-items' as const
const USER_TITLES = 'user-titles' as const

function pl(payload: Payload) {
  return payload as unknown as {
    find: (a: Record<string, unknown>) => Promise<{ docs: unknown[]; totalDocs?: number }>
    findByID: (a: Record<string, unknown>) => Promise<Record<string, unknown> | null>
    delete: (a: Record<string, unknown>) => Promise<unknown>
  }
}

/**
 * Из документа элемента списка достаёт id связанного user-titles (если есть).
 */
export function getUserTitleIdFromItemDoc(doc: Record<string, unknown> | null): string | null {
  if (!doc) return null
  const ut = doc.userTitle
  if (typeof ut === 'string' && ut) return ut
  if (ut && typeof ut === 'object' && !Array.isArray(ut) && 'id' in ut) {
    const id = (ut as { id: unknown }).id
    if (typeof id === 'string' && id) return id
  }
  return null
}

/**
 * Если на этот user-title больше нет ни одного элемента списка — удаляем user-titles.
 * Проверяем userId владельца тайтла, чтобы не трогать чужие данные.
 */
export async function deleteUserTitleIfOrphaned(
  payload: Payload,
  userTitleId: string,
  deletedItemUserId: string
): Promise<void> {
  const p = pl(payload)
  const titleDoc = await p.findByID({
    collection: USER_TITLES,
    id: userTitleId,
    overrideAccess: true,
  })
  if (!titleDoc || titleDoc.userId !== deletedItemUserId) return

  const { docs } = await p.find({
    collection: USER_COLLECTION_ITEMS,
    where: { userTitle: { equals: userTitleId } },
    limit: 1,
    overrideAccess: true,
  })
  if (docs.length > 0) return

  await p.delete({
    collection: USER_TITLES,
    id: userTitleId,
    overrideAccess: true,
  })
}
