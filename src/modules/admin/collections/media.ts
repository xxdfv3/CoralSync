import type { CollectionConfig } from 'payload'

export const MediaCollection: CollectionConfig = {
  slug: 'media',
  labels: {
    singular: 'Медиа',
    plural: 'Медиа',
  },
  admin: {
    group: 'Каталог',
    description:
      'Медиафайлы (постеры, аватары). Перед релизом можно вынести в S3/R2/Blob.',
  },
  fields: [
    {
      name: 'alt',
      label: 'Описание',
      type: 'text',
      required: true,
    },
    {
      name: 'usage',
      label: 'Назначение',
      type: 'select',
      defaultValue: 'catalog',
      options: [
        { label: 'Каталог (постер и т.д.)', value: 'catalog' },
        { label: 'Аватар пользователя', value: 'avatar' },
        { label: 'Баннер тайтла (зарезервировано)', value: 'title_banner' },
      ],
      admin: {
        description:
          'Для фильтрации в админке и будущей миграции в object storage.',
      },
    },
  ],
  upload: true,
  access: {
    read: () => true,
  },
}