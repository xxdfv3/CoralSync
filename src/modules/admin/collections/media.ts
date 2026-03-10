import type { CollectionConfig } from 'payload'

export const MediaCollection: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Медиа',
    plural: 'Медиа',
  },
  admin: {
    group: 'Каталог',
    description: 'Медиафайлы (постеры)',
  },
  fields: [
    {
      name: 'alt',
      label: 'Описание',
      type: 'text',
      required: true,
    },
  ],
  upload: true,
  access: {
    read: () => true,
  },
}