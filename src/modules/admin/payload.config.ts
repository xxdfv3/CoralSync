import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { en } from '@payloadcms/translations/languages/en'
import { ru } from '@payloadcms/translations/languages/ru'

import { AdminUsersCollection } from './collections/user'
import { SiteUsersCollection } from './collections/site-users'
import { MediaCollection } from './collections/media'
import { GenresCollection } from './collections/genres'
import { DubbingStudiosCollection } from './collections/dubbing-studios'
import { TitlesCollection } from './collections/titles'
import { UserCollectionsCollection } from './collections/user-collections'
import { UserTitlesCollection } from './collections/user-titles'
import { UserCollectionItemsCollection } from './collections/user-collection-items'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: AdminUsersCollection.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    AdminUsersCollection,
    SiteUsersCollection,
    MediaCollection,
    GenresCollection,
    DubbingStudiosCollection,
    TitlesCollection,
    // Пользовательские данные (Better Auth userId); только админка Payload
    UserCollectionsCollection,
    UserTitlesCollection,
    UserCollectionItemsCollection,
  ],

  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: mongooseAdapter({
    url: process.env.MONGODB_URI || '',
  }),
  sharp,

  plugins: [],

  i18n: {
    supportedLanguages: { ru, en },
  },
})