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
    // Принимаем slug только чтобы не ломать запросы: админка подмешивает его из списка (у старых документов в MongoDB он есть).
    // В beforeChange выкидываем — в БД не сохраняем.
    { type: 'text', name: 'slug', required: false, admin: { hidden: true, readOnly: true } },
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
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (data && typeof data === 'object' && 'slug' in data) {
          const next = { ...data }
          delete (next as Record<string, unknown>).slug
          return next
        }
        return data
      },
    ],
  },
  access: {
    read: () => true,
  },
}
