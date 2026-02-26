/**
 * User entity types (CoralSync / better-auth).
 */

export interface UserProfile {
  id: string
  email: string
  name?: string | null
  image?: string | null
  emailVerified?: boolean
}
