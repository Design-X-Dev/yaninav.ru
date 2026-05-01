import path from 'path';
import { fileURLToPath } from 'url';

import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { buildConfig } from 'payload';
import sharp from 'sharp';

import { Categories } from './src/payload/collections/Categories';
import { Media } from './src/payload/collections/Media';
import { Products } from './src/payload/collections/Products';
import { Users } from './src/payload/collections/Users';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Yanina V',
    },
  },
  collections: [Users, Media, Categories, Products],
  secret: process.env.PAYLOAD_SECRET || 'dev-local-payload-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'src/payload-types.ts'),
  },
  editor: lexicalEditor({}),
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./data/payload.db',
    },
  }),
  sharp,
});
