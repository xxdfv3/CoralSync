import type { CollectionConfig } from 'payload'

/**
 * Пользователи сайта (Better Auth) — зеркало для админки.
 * Источник правды по паролям/сессиям — коллекция Better Auth `user` в MongoDB;
 * здесь — удобный просмотр, роль приложения (admin) и ручное заведение.
 */
export const SiteUsersCollection: CollectionConfig = {
  slug: 'site-users',
  labels: {
    singular: 'Пользователь сайта',
    plural: 'Пользователи сайта',
  },
  admin: {
    useAsTitle: 'email',
    defaultColumns: ['email', 'name', 'role', 'betterAuthUserId', 'syncedAt'], // name = username в Better Auth
    group: 'Пользователи и доступ',
    description:
      'Better Auth: id совпадает с документом в MongoDB (коллекция user). Роль admin — администратор приложения (не вход в /admin).',
  },
  timestamps: true,
  fields: [
    {
      type: 'text',
      name: 'betterAuthUserId',
      label: 'ID пользователя (Better Auth)',
      required: true,
      unique: true,
      index: true,
      admin: {
        description: 'Тот же id, что в session.user.id',
      },
    },
    {
      type: 'email',
      name: 'email',
      label: 'Email',
      required: true,
    },
    {
      type: 'text',
      name: 'name',
      label: 'Имя пользователя (username)',
      admin: {
        description: 'В Better Auth хранится в user.name',
      },
    },
    {
      type: 'select',
      name: 'role',
      label: 'Роль в приложении',
      required: true,
      defaultValue: 'user',
      options: [
        { label: 'Пользователь', value: 'user' },
        { label: 'Администратор приложения', value: 'admin' },
      ],
      admin: {
        description:
          'admin — расширенные права в приложении. Вход в Payload /admin — только через коллекцию «Администраторы Payload».',
      },
    },
    {
      type: 'date',
      name: 'syncedAt',
      label: 'Синхронизировано',
      admin: {
        description: 'Когда последний раз подтянуты данные с сайта',
        date: { pickerAppearance: 'dayAndTime' },
      },
    },
  ],
  access: {
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
}
