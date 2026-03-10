import type { CollectionConfig } from 'payload'

/**
 * Пользовательские списки (коллекции) — владелец задаётся через Better Auth userId (строка).
 * Создание/изменение с сайта — позже через Server Actions с overrideAccess;
 * в админке — просмотр и ручная правка.
 */
export const UserCollectionsCollection: CollectionConfig = {
  slug: 'user-collections',
  labels: {
    singular: 'Коллекция пользователя',
    plural: 'Коллекции пользователей',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'userId', 'createdAt'],
    group: 'Пользователи сайта',
    description:
      'Списки пользователей Better Auth. userId — id из MongoDB Better Auth, не admin-users.',
  },
  timestamps: true,
  fields: [
    {
      type: 'text',
      name: 'userId',
      label: 'ID пользователя (Better Auth)',
      required: true,
      index: true,
      admin: { description: 'Строковый id пользователя сайта из Better Auth' },
    },
    {
      type: 'text',
      name: 'name',
      label: 'Название списка',
      required: true,
    },
    {
      type: 'checkbox',
      name: 'isPublic',
      label: 'Публичная',
      defaultValue: false,
    },
  ],
  access: {
    // Только авторизованные в Payload (админка); API с сайта — через overrideAccess
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
}
