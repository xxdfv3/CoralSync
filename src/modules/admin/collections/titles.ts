import type { CollectionConfig, CollectionSlug } from 'payload'

export const TitlesCollection: CollectionConfig = {
  slug: 'titles',
  labels: {
    singular: 'Тайтл',
    plural: 'Тайтлы',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'type', 'releasedAt'],
    group: 'Каталог',
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          type: 'text',
          name: 'name',
          label: 'Название',
          required: true,
          admin: { width: '75%'},
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          type: 'select',
          name: 'type',
          label: 'Тип тайтла',
          required: true,
          options: [
            { label: 'Фильм', value: 'movie' },
            { label: 'Мультфильм', value: 'cartoon' },
            { label: 'Сериал', value: 'serial' },
            { label: 'Мультсериал', value: 'cartoon_serial' },
            { label: 'Аниме', value: 'anime' },
          ],
          admin: { width: '33%' },
        },
        {
          type: 'date',
          name: 'releasedAt',
          label: 'Дата выхода',
          admin: { width: '33%', date: { pickerAppearance: 'dayOnly' } },
        },
        {
          type: 'number',
          name: 'episodesCount',
          label: 'Кол-во эпизодов',
          admin: { width: '33%' },
          min: 0,
        },
        {
          type: 'relationship',
          name: 'genres',
          relationTo: 'genres' as CollectionSlug,
          hasMany: true,
          label: 'Жанры',
          admin: { width: '50%' },
        },
        {
          type: 'relationship',
          name: 'dubbingStudios',
          relationTo: 'dubbing-studios' as CollectionSlug,
          hasMany: true,
          label: 'Студия озвучки',
          admin: { width: '50%', },
        },
      ],
    },
    {
      type: 'upload',
      name: 'poster',
      label: 'Постер',
      relationTo: 'media' as CollectionSlug,
      required: true,
    },
    {
      type: 'textarea',
      name: 'description',
      label: 'Описание',
    },
  ],
  access: {
    read: () => true,
  },
}
