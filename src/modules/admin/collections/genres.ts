import type { CollectionConfig } from 'payload'

export const GenresCollection: CollectionConfig = {
  slug: 'genres',
  labels: {
    singular: 'Жанр',
    plural: 'Жанры',
  },
  admin: {
    useAsTitle: 'name',
    group: 'Каталог',
    description: 'Справочник жанров',
  },
  fields: [
    { type: 'text', name: 'name', required: true },
    {
      type: 'select',
      options: [
        { label: 'Фильм', value: 'movie' },
        { label: 'Мультфильм', value: 'cartoon' },
        { label: 'Сериал', value: 'serial' },
        { label: 'Мультсериал', value: 'cartoon_serial' },
        { label: 'Аниме', value: 'anime' },
      ],
      hasMany: true,
      name: 'type',
      label: 'К какому типу тайтла относится',
    },
  ],
  access: {
    read: () => true,
  },
}
