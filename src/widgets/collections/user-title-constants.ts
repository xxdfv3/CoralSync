/**
 * Синхронно с Payload user-titles / titles: тип тайтла для каталога и модерации.
 */
export const USER_TITLE_TYPE_OPTIONS = [
  { value: 'anime', label: 'Аниме' },
  { value: 'movie', label: 'Фильм' },
  { value: 'cartoon', label: 'Мультфильм' },
  { value: 'serial', label: 'Сериал' },
  { value: 'cartoon_serial', label: 'Мультсериал' },
  { value: 'custom', label: 'Другое / не из каталога' },
] as const

export type UserTitleType = (typeof USER_TITLE_TYPE_OPTIONS)[number]['value']
