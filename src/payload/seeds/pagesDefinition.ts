import type { LexicalRootDoc } from './pagesLexicalBuilders';
import { CUSTOM_ORDERS_LEXICAL } from './pagesSeedCustomOrders';
import { DELIVERY_LEXICAL } from './pagesSeedDelivery';
import { GIFT_CERTIFICATE_LEXICAL } from './pagesSeedGiftCertificate';
import { OFFER_LEXICAL } from './pagesSeedOffer';
import { PRIVACY_LEXICAL } from './pagesSeedPrivacy';
import { WARRANTY_LEXICAL } from './pagesSeedWarranty';

export type PageSeedDefinition = {
  slug: string;
  /** Значение для локали `ru` поля `title`. */
  titleRu: string;
  showLegalDivider?: boolean;
  body: LexicalRootDoc;
};

/** Страницы, перенесённые из app/(site)/<slug>/page.tsx (этап 1). */
export const PAGES_SEED: PageSeedDefinition[] = [
  {
    slug: 'delivery',
    titleRu: 'Доставка и оплата',
    body: DELIVERY_LEXICAL,
  },
  {
    slug: 'warranty',
    titleRu: 'Гарантии',
    showLegalDivider: true,
    body: WARRANTY_LEXICAL,
  },
  {
    slug: 'custom-orders',
    titleRu: 'Индивидуальный заказ',
    body: CUSTOM_ORDERS_LEXICAL,
  },
  {
    slug: 'gift-certificate',
    titleRu: 'Подарочный сертификат',
    body: GIFT_CERTIFICATE_LEXICAL,
  },
  {
    slug: 'offer',
    titleRu: 'Публичная оферта',
    showLegalDivider: true,
    body: OFFER_LEXICAL,
  },
  {
    slug: 'privacy',
    titleRu: 'Политика конфиденциальности',
    showLegalDivider: true,
    body: PRIVACY_LEXICAL,
  },
];
