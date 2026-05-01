/** Типы и чистые хелперы для фронта. Данные товаров — из Payload (см. `products.server`). */

export interface ProductCharacteristic {
  key: string;
  value: string;
}

/** Поля вкладки SEO (Payload `@payloadcms/plugin-seo`, группа `meta`). */
export type ProductSeoMeta = {
  title?: string;
  description?: string;
  /** URL превью для OG/twitter (sizes.card или url медиа). */
  image?: string;
};

export interface Product {
  /** ID из Payload (sqlite). */
  id: number;
  /** Абсолютный или корневой URL превью (из `sizes.card`). */
  image: string;
  image2?: string;
  image3?: string;
  category: string;
  name: string;
  description: string;
  /** Текст после блока характеристик (маркетинговый хвост) */
  descriptionEnd?: string;
  /** Характеристики изделия для таблицы на странице товара */
  characteristics?: ProductCharacteristic[];
  /** null — цена по запросу */
  price: number | null;
  bannerImage?: string;
  /** SEO для `generateMetadata` */
  meta?: ProductSeoMeta;
}

/** Slug категории для `?category=` и сравнения с фильтром коллекции. */
export function getCategorySlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '-');
}

// Форматирование числовой цены (рубли)
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price);
}

export type CatalogNavCategory = { id: string; name: string };
