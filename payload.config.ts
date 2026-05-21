import path from 'path';

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
import { Image } from './src/payload/collections/Image';
import { Video } from './src/payload/collections/Video';
import { Pages } from './src/payload/collections/Pages';
import { Products } from './src/payload/collections/Products';
import { Users } from './src/payload/collections/Users';
import { About } from './src/payload/globals/About';
import { Contact } from './src/payload/globals/Contact';
import { Hero } from './src/payload/globals/Hero';
import { HomeCatalogGlobal } from './src/payload/globals/HomeCatalog';
import { Homepage, HOMEPAGE_GLOBAL_SLUG } from './src/payload/globals/Homepage';
import { Memories } from './src/payload/globals/Memories';
import { applyRussianFormLabels, applyRussianSubmissionLabels } from './src/payload/i18n/formBuilderLabels';
import { seedAboutIfMissing } from './src/payload/seeds/aboutBootstrap';
import { seedContactGlobalIfMissing, ensureContactChannelsFromDefaults } from './src/payload/seeds/contactBootstrap';
import { seedContactFormIfMissing } from './src/payload/seeds/contactFormBootstrap';
import { seedHeroIfMissing } from './src/payload/seeds/heroBootstrap';
import { seedHomeCatalogIfMissing } from './src/payload/seeds/homeCatalogBootstrap';
import { seedHomepageSeoIfMissing } from './src/payload/seeds/homepageBootstrap';
import { seedMemoriesIfMissing } from './src/payload/seeds/memoriesBootstrap';
import { seedPagesIfMissing } from './src/payload/seeds/pagesBootstrap';
import { seedAdminIfMissing } from './src/payload/seeds/usersBootstrap';
import {
  HOMEPAGE_DEFAULT_DESCRIPTION,
  HOMEPAGE_DEFAULT_TITLE,
} from './src/lib/homepageMeta.defaults';
import { pickLocalizedString, siteUrlNormalized, truncateDescription } from './src/lib/seoHelpers';
import { PAYLOAD_ADMIN_GROUPS } from './src/payload/adminSidebarGroups';
import { migrations as payloadProdMigrations } from './src/payload/migrations';

const siteUrl = siteUrlNormalized();

function resolvePayloadSecret(): string {
  const secret = process.env.PAYLOAD_SECRET?.trim();
  if (secret) return secret;
  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      '[payload] PAYLOAD_SECRET is required in production. ' +
        'Set it in .env or run scripts/prod-up.sh to bootstrap.',
    );
  }
  return 'dev-local-payload-secret-change-me';
}

const generateTitle: GenerateTitle<{ name?: unknown; slug?: unknown; title?: unknown }> = ({
  doc,
  collectionSlug,
  globalSlug,
}) => {
  if (globalSlug === HOMEPAGE_GLOBAL_SLUG) {
    return HOMEPAGE_DEFAULT_TITLE;
  }
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
  if (collectionSlug === 'pages') {
    const title = pickLocalizedString(doc?.title);
    const base = title || 'Страница';
    return `${base} | ЯНИНА В`;
  }
  return 'ЯНИНА В';
};

const generateDescription: GenerateDescription<{
  description?: unknown;
  name?: unknown;
  title?: unknown;
}> = ({ doc, collectionSlug, globalSlug }) => {
  if (globalSlug === HOMEPAGE_GLOBAL_SLUG) {
    return truncateDescription(HOMEPAGE_DEFAULT_DESCRIPTION);
  }
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
  if (collectionSlug === 'pages') {
    const title = pickLocalizedString(doc?.title);
    return truncateDescription(
      `${title ?? 'Информационная страница'} — ювелирная студия ЯНИНА В.`,
    );
  }
  return '';
};

const generateURL: GenerateURL<{ id?: unknown; slug?: unknown }> = ({
  doc,
  collectionSlug,
  globalSlug,
}) => {
  if (globalSlug === HOMEPAGE_GLOBAL_SLUG) {
    return siteUrl;
  }
  if (collectionSlug === 'products') {
    const id = typeof doc?.id === 'number' ? doc.id : Number(doc?.id);
    if (Number.isFinite(id)) return `${siteUrl}/products/${id}`;
  }
  if (collectionSlug === 'categories') {
    const slugRaw = typeof doc?.slug === 'string' ? doc.slug : '';
    const slug = slugRaw.trim().toLowerCase();
    if (slug) return `${siteUrl}/collection?category=${encodeURIComponent(slug)}`;
  }
  if (collectionSlug === 'pages') {
    const slugRaw = typeof doc?.slug === 'string' ? doc.slug : '';
    const slug = slugRaw.trim().toLowerCase();
    if (slug) return `${siteUrl}/${slug}`;
  }
  return siteUrl;
};

const generateImage: GenerateImage<{ image?: unknown }> = ({ doc, collectionSlug, globalSlug }) => {
  if (globalSlug === HOMEPAGE_GLOBAL_SLUG) {
    return '';
  }
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
  localization: {
    locales: [
      { label: 'Русский', code: 'ru' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'ru',
    fallback: true,
  },
  /** Порядок регистрации задаёт порядок внутри групп в Payload Admin. */
  collections: [Pages, Categories, Products, Image, Video, Users],
  globals: [Homepage, Memories, Hero, About, Contact, HomeCatalogGlobal],
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
        admin: { group: PAYLOAD_ADMIN_GROUPS.forms, useAsTitle: 'title' },
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
        admin: {
          group: PAYLOAD_ADMIN_GROUPS.forms,
          useAsTitle: 'name',
          defaultColumns: ['name', 'email', 'phone', 'createdAt'],
        },
        access: {
          create: ({ req: { user } }) => Boolean(user),
          read: ({ req: { user } }) => Boolean(user),
          update: () => false,
          delete: ({ req: { user } }) => Boolean(user),
        },
        fields: ({ defaultFields }) => [
          {
            name: 'name',
            type: 'text',
            label: 'Имя',
            admin: { readOnly: true, position: 'sidebar' },
          },
          {
            name: 'email',
            type: 'email',
            label: 'Email',
            admin: { readOnly: true, position: 'sidebar' },
          },
          {
            name: 'phone',
            type: 'text',
            label: 'Телефон',
            admin: { readOnly: true, position: 'sidebar' },
          },
          {
            name: 'message',
            type: 'textarea',
            label: 'Сообщение',
            admin: { readOnly: true },
          },
          ...applyRussianSubmissionLabels(defaultFields),
        ],
      },
    }),
    seoPlugin({
      collections: ['products', 'categories', 'pages'],
      globals: ['homepage'],
      uploadsCollection: 'image',
      tabbedUI: true,
      generateTitle,
      generateDescription,
      generateURL,
      generateImage,
    }),
  ],
  secret: resolvePayloadSecret(),
  typescript: {
    outputFile: path.resolve(process.cwd(), 'src/payload-types.ts'),
  },
  editor: lexicalEditor({}),
  db: sqliteAdapter({
    client: {
      url: process.env.DATABASE_URI || 'file:./data/payload.db',
    },
    push: false,
    migrationDir: path.resolve(process.cwd(), 'src/payload/migrations'),
    prodMigrations: payloadProdMigrations,
  }),
  onInit: async (payload) => {
    await seedAdminIfMissing(payload);
    await seedContactFormIfMissing(payload);
    await seedHomepageSeoIfMissing(payload);
    await seedMemoriesIfMissing(payload);
    await seedHeroIfMissing(payload);
    await seedAboutIfMissing(payload);
    await seedContactGlobalIfMissing(payload);
    await ensureContactChannelsFromDefaults(payload);
    await seedHomeCatalogIfMissing(payload);
    await seedPagesIfMissing(payload);
  },
  sharp,
});
