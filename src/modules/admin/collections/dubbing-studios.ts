import type { CollectionConfig, CollectionSlug } from 'payload'

export const DubbingStudiosCollection: CollectionConfig = {
  slug: 'dubbing-studios',
  labels: {
    singular: 'Студия озвучки',
    plural: 'Студии озвучки',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Каталог',
    description: 'Студия, которая делала озвучку (дубляж). Жанр помогает при назначении студии тайтлу.',
  },
  fields: [
    { type: 'text', name: 'name', required: true, label: 'Название' },
    {
      type: 'select',
      name: 'type',
      options: [
        { label: 'Фильм', value: 'movie' },
        { label: 'Мультфильм', value: 'cartoon' },
        { label: 'Сериал', value: 'serial' },
        { label: 'Мультсериал', value: 'cartoon_serial' },
        { label: 'Аниме', value: 'anime' },
      ],
      hasMany: true,
      label: 'Тип озвучки',
      admin: {
        description: 'К какому жанру относится студия — для удобной фильтрации при выборе студии у тайтла',
      },
    },
  ],
  access: {
    read: () => true,
  },
}
