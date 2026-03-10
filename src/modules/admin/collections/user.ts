import type { CollectionConfig } from 'payload'

export const AdminUsersCollection: CollectionConfig = {
  slug: 'admin-users',
  labels: {
    singular: 'Пользователь',
    plural: 'Пользователи',
  },
  auth: true,
  admin: {
    group: 'Система',
    description: 'Админ-аккаунты (Payload), не путать с Better Auth user',
  },
  fields: [
    {
      name: 'email',
      type: 'email',
      required: true,
    },
  ],
}