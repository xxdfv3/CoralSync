import type { CollectionConfig, CollectionSlug } from 'payload'

import {
  deleteUserTitleIfOrphaned,
  getUserTitleIdFromItemDoc,
} from '@/server/collections/orphan-user-titles'

const WATCH_STATUS_OPTIONS = [
  { label: 'Запланировано', value: 'planned' },
  { label: 'Смотрю', value: 'watching' },
  { label: 'Просмотрено', value: 'completed' },
  { label: 'Отложено', value: 'on_hold' },
  { label: 'Брошено', value: 'dropped' },
] as const

/**
 * Строка списка: в какой коллекции + ссылка на пользовательский тайтл (или каталог).
 * Вся инфа о названии/годе/жанрах — в user-titles; здесь только прогресс и статус просмотра.
 * legacy: snapshot без userTitle — только для старых импортов.
 */
export const UserCollectionItemsCollection: CollectionConfig = {
  slug: 'user-collection-items',
  labels: {
    singular: 'Элемент списка',
    plural: 'Элементы списков',
  },
  admin: {
    defaultColumns: ['userList', 'userTitle', 'catalogTitle', 'status', 'userId', 'createdAt'],
    group: 'Пользователи сайта',
    description:
      'Связь коллекция + пользовательский тайтл (или каталог) + статус/прогресс. Детали тайтла — в «Пользовательские тайтлы».',
  },
  timestamps: true,
  fields: [
    {
      type: 'text',
      name: 'userId',
      label: 'ID пользователя (Better Auth)',
      required: true,
      index: true,
    },
    {
      type: 'relationship',
      name: 'userList',
      label: 'Коллекция (список)',
      relationTo: 'user-collections' as CollectionSlug,
      required: true,
      admin: {
        description:
          'Поле названо userList — pathname collection зарезервирован в Mongoose.',
      },
    },
    {
      type: 'relationship',
      name: 'userTitle',
      label: 'Пользовательский тайтл',
      relationTo: 'user-titles' as CollectionSlug,
      admin: {
        description: 'Основной вариант: одна запись тайтла — много списков могут ссылаться позже',
      },
    },
    {
      type: 'relationship',
      name: 'catalogTitle',
      label: 'Тайтл из каталога',
      relationTo: 'titles' as CollectionSlug,
      admin: { description: 'Если добавили из каталога — без userTitle' },
    },
    {
      type: 'select',
      name: 'status',
      label: 'Статус просмотра',
      required: true,
      defaultValue: 'planned',
      options: [...WATCH_STATUS_OPTIONS],
    },
    {
      type: 'number',
      name: 'progressCurrent',
      label: 'Прогресс текущий',
      min: 0,
    },
    {
      type: 'number',
      name: 'progressTotal',
      label: 'Прогресс всего / эпизодов',
      min: 0,
    },
    {
      type: 'text',
      name: 'displayTitle',
      label: 'Legacy: название без связи',
      admin: {
        description: 'Только для старых записей без userTitle (импорт localStorage)',
      },
    },
  ],
  access: {
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
  hooks: {
    afterDelete: [
      async ({ doc, req }) => {
        const userTitleId = getUserTitleIdFromItemDoc(doc as Record<string, unknown>)
        const userId = typeof doc.userId === 'string' ? doc.userId : null
        if (userTitleId && userId && req.payload) {
          await deleteUserTitleIfOrphaned(req.payload, userTitleId, userId)
        }
      },
    ],
  },
}
