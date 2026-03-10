import type { CollectionConfig, CollectionSlug } from 'payload'

const TITLE_TYPE_OPTIONS = [
  { label: 'Фильм', value: 'movie' },
  { label: 'Мультфильм', value: 'cartoon' },
  { label: 'Сериал', value: 'serial' },
  { label: 'Мультсериал', value: 'cartoon_serial' },
  { label: 'Аниме', value: 'anime' },
  { label: 'Не из каталога (произвольный формат)', value: 'custom' },
] as const

/**
 * Единственный источник правды о «тайтле, созданном пользователем».
 * Элемент списка (user-collection-items) только ссылается сюда + коллекция + статус/прогресс.
 */
export const UserTitlesCollection: CollectionConfig = {
  slug: 'user-titles',
  labels: {
    singular: 'Пользовательский тайтл',
    plural: 'Пользовательские тайтлы',
  },
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'year', 'formatLabel', 'userId', 'moderationStatus', 'createdAt'],
    listSearchableFields: ['name', 'userId'],
    group: 'Пользователи сайта',
    description:
      'Полные данные о тайтле с сайта. Элемент списка хранит только ссылку сюда и прогресс.',
  },
  timestamps: true,
  fields: [
    {
      type: 'text',
      name: 'userId',
      label: 'ID пользователя (Better Auth)',
      required: true,
      index: true,
    },
    {
      type: 'text',
      name: 'name',
      label: 'Название',
      required: true,
    },
    {
      type: 'select',
      name: 'type',
      label: 'Тип (для каталога/модерации)',
      required: true,
      defaultValue: 'anime',
      options: [...TITLE_TYPE_OPTIONS],
    },
    {
      type: 'number',
      name: 'year',
      label: 'Год',
      min: 1800,
      max: 2100,
    },
    {
      type: 'text',
      name: 'season',
      label: 'Сезон',
      admin: { description: 'Зима, Весна, Лето, Осень и т.д.' },
    },
    {
      type: 'text',
      name: 'formatLabel',
      label: 'Формат (как ввёл пользователь)',
      admin: { description: 'ТВ, OVA, Фильм… — необязательное отображение' },
    },
    {
      type: 'text',
      name: 'rating',
      label: 'Возрастной рейтинг',
      admin: { description: 'G, PG, 12+, 16+, 18+' },
    },
    {
      type: 'textarea',
      name: 'genresText',
      label: 'Жанры (как ввёл пользователь)',
      admin: { description: 'Через запятую или с новой строки' },
    },
    {
      type: 'textarea',
      name: 'description',
      label: 'Описание',
    },
    {
      type: 'text',
      name: 'coverUrl',
      label: 'URL обложки',
    },
    {
      type: 'select',
      name: 'moderationStatus',
      label: 'Модерация',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'На модерации', value: 'pending' },
        { label: 'Одобрено', value: 'approved' },
        { label: 'Отклонено', value: 'rejected' },
      ],
    },
    {
      type: 'relationship',
      name: 'promotedToCatalog',
      label: 'Перенесено в каталог',
      relationTo: 'titles' as CollectionSlug,
    },
  ],
  access: {
    create: ({ req }) => Boolean(req.user),
    read: ({ req }) => Boolean(req.user),
    update: ({ req }) => Boolean(req.user),
    delete: ({ req }) => Boolean(req.user),
  },
}
