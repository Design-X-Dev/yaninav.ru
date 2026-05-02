import path from 'path';
import { fileURLToPath } from 'url';

import { sqliteAdapter } from '@payloadcms/db-sqlite';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import { formBuilderPlugin } from '@payloadcms/plugin-form-builder';
import { seoPlugin } from '@payloadcms/plugin-seo';
import type { GenerateDescription, GenerateImage, GenerateTitle, GenerateURL } from '@payloadcms/plugin-seo/types';
import { buildConfig } from 'payload';
import { en } from 'payload/i18n/en';
import { ru } from 'payload/i18n/ru';
import sharp from 'sharp';

import { Categories } from './src/payload/collections/Categories';
import { Media } from './src/payload/collections/Media';
import { MediaVideo } from './src/payload/collections/MediaVideo';
import { Products } from './src/payload/collections/Products';
import { Users } from './src/payload/collections/Users';
import { Hero } from './src/payload/globals/Hero';
import { Memories } from './src/payload/globals/Memories';
import { applyRussianFormLabels, applyRussianSubmissionLabels } from './src/payload/i18n/formBuilderLabels';
import { seedContactFormIfMissing } from './src/payload/seeds/contactFormBootstrap';
import { seedHeroIfMissing } from './src/payload/seeds/heroBootstrap';
import { seedMemoriesIfMissing } from './src/payload/seeds/memoriesBootstrap';
import { pickLocalizedString, siteUrlNormalized, truncateDescription } from './src/lib/seoHelpers';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const siteUrl = siteUrlNormalized();

const generateTitle: GenerateTitle<{ name?: unknown; slug?: unknown }> = ({ doc, collectionSlug }) => {
  if (collectionSlug === 'products') {
    const name = pickLocalizedString(doc?.name);
    const base = name || 'Ювелирное изделие';
    return `${base} — ЯНИНА В`;
  }
  if (collectionSlug === 'categories') {
    const name = pickLocalizedString(doc?.name);
    const base = name || 'Каталог';
    return `${base} | Каталог ЯНИНА В`;
  }
  return 'ЯНИНА В';
};

const generateDescription: GenerateDescription<{ description?: unknown; name?: unknown }> = ({
  doc,
  collectionSlug,
}) => {
  if (collectionSlug === 'products') {
    const raw = pickLocalizedString(doc?.description);
    return truncateDescription(raw || '');
  }
  if (collectionSlug === 'categories') {
    const name = pickLocalizedString(doc?.name);
    return truncateDescription(
      `${name ?? 'Раздел каталога'} — эксклюзивные ювелирные украшения ручной работы.`,
    );
  }
  return '';
};

const generateURL: GenerateURL<{ id?: unknown; slug?: unknown }> = ({ doc, collectionSlug }) => {
  if (collectionSlug === 'products') {
    const id = typeof doc?.id === 'number' ? doc.id : Number(doc?.id);
    if (Number.isFinite(id)) return `${siteUrl}/products/${id}`;
  }
  if (collectionSlug === 'categories') {
    const slugRaw = typeof doc?.slug === 'string' ? doc.slug : '';
    const slug = slugRaw.trim().toLowerCase();
    if (slug) return `${siteUrl}/collection?category=${encodeURIComponent(slug)}`;
  }
  return siteUrl;
};

const generateImage: GenerateImage<{ image?: unknown }> = ({ doc, collectionSlug }) => {
  if (collectionSlug !== 'products') return '';
  const img = doc?.image;
  if (typeof img === 'number') return img;
  if (img && typeof img === 'object' && 'id' in img) {
    const id = (img as { id: unknown }).id;
    return typeof id === 'number' ? id : '';
  }
  return '';
};

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Yanina V',
    },
  },
  i18n: {
    supportedLanguages: { ru, en },
    fallbackLanguage: 'ru',
  },
  collections: [Users, Media, MediaVideo, Categories, Products],
  globals: [Memories, Hero],
  plugins: [
    formBuilderPlugin({
      fields: {
        text: true,
        email: true,
        textarea: true,
        message: true,
        checkbox: true,
        select: true,
        number: true,
        date: false,
        country: false,
        state: false,
        payment: false,
        upload: false,
      },
      formOverrides: {
        labels: { singular: 'Форма', plural: 'Формы' },
        admin: { group: 'Формы и заявки', useAsTitle: 'title' },
        fields: ({ defaultFields }) => [
          {
            name: 'slug',
            type: 'text',
            label: 'Slug (для сайта)',
            required: true,
            unique: true,
            admin: {
              description:
                'Стабильный ключ загрузки на фронте, например «contact». Должен совпадать с вызовом getSerializedContactForm в коде.',
              position: 'sidebar',
            },
          },
          ...applyRussianFormLabels(defaultFields),
        ],
      },
      formSubmissionOverrides: {
        labels: { singular: 'Заявка', plural: 'Заявки' },
        admin: { group: 'Формы и заявки' },
        access: {
          create: () => true,
          read: ({ req: { user } }) => Boolean(user),
          update: () => false,
          delete: ({ req: { user } }) => Boolean(user),
        },
        fields: ({ defaultFields }) => applyRussianSubmissionLabels(defaultFields),
      },
    }),
    seoPlugin({
      collections: ['products', 'categories'],
      uploadsCollection: 'media',
      tabbedUI: true,
      generateTitle,
      generateDescription,
      generateURL,
      generateImage,
    }),
  ],
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
  onInit: async (payload) => {
    await seedContactFormIfMissing(payload);
    await seedMemoriesIfMissing(payload);
    await seedHeroIfMissing(payload);
  },
  sharp,
});
