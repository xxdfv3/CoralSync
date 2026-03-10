import { mongooseAdapter } from '@payloadcms/db-mongodb'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'

import { en } from '@payloadcms/translations/languages/en'
import { ru } from '@payloadcms/translations/languages/ru'

import { AdminUsersCollection } from './collections/user'
import { MediaCollection } from './collections/media'
import { GenresCollection } from './collections/genres'
import { DubbingStudiosCollection } from './collections/dubbing-studios'
import { TitlesCollection } from './collections/titles'

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
    MediaCollection,
    GenresCollection,
    DubbingStudiosCollection,
    TitlesCollection,
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