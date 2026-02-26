/**
 * Title entity types (anime / movie / TV show).
 */

export type TitleType = 'anime' | 'movie' | 'tv'

export interface Title {
  id: string
  type: TitleType
  name: string
  nameEn?: string | null
  posterUrl?: string | null
  /** Release / start date */
  releasedAt?: string | null
}
