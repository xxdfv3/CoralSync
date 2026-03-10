import type { CollectionConfig } from 'payload'

/**
 * Учётные записи для входа в Payload /admin только.
 * Не связаны с Better Auth и не отображают пользователей сайта.
 */
export const AdminUsersCollection: CollectionConfig = {
  slug: 'admin-users',
  labels: {
    singular: 'Администратор Payload',
    plural: 'Администраторы Payload',
  },
  auth: true,
  admin: {
    group: 'Пользователи и доступ',
    description:
      'Только вход в /admin. Пользователи сайта (регистрация на сайте) — в коллекции «Пользователи сайта».',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    },
  ],
}
