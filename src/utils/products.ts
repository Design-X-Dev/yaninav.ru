import { nbspAfterSi } from '@/utils/typography';

export interface ProductCharacteristic {
  key: string;
  value: string;
}

export interface Product {
  id: number;
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
}

const SMALL_SUFFIX = '_small';

/** Имя файла превью: `photo.jpg` → `photo_small.jpg` (идемпотентно). */
function toSmallProductImageFileName(imageName: string): string {
  const t = imageName.trim();
  if (!t) return t;
  const lastDot = t.lastIndexOf('.');
  if (lastDot <= 0) return `${t}${SMALL_SUFFIX}`;
  const base = t.slice(0, lastDot);
  const ext = t.slice(lastDot);
  if (base.toLowerCase().endsWith(SMALL_SUFFIX)) return t;
  return `${base}${SMALL_SUFFIX}${ext}`;
}

/** Нормализация строковых полей (типографика). Используется на сервере при чтении из json. */
export function normalizeProductText(p: Product): Product {
  const characteristics = p.characteristics?.map((c) => ({
    key: nbspAfterSi(c.key),
    value: nbspAfterSi(c.value),
  }));
  return {
    ...p,
    name: nbspAfterSi(p.name),
    description: nbspAfterSi(p.description),
    descriptionEnd: p.descriptionEnd ? nbspAfterSi(p.descriptionEnd) : undefined,
    category: nbspAfterSi(p.category),
    characteristics,
  };
}

// Путь к сжатому превью в /public/images/products/
export function getProductImagePath(imageName: string): string {
  if (!imageName) return '/images/placeholder.jpg';
  return `/images/products/${toSmallProductImageFileName(imageName)}`;
}

/** Slug категории для `?category=` и сравнения с фильтром коллекции. */
export function getCategorySlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '-');
}

/** Порядок категорий в сабхедере главной и на странице коллекции */
export const CATALOG_NAV_ORDER: readonly string[] = [
  'all',
  'помолвочные-кольца',
  'кольца-с-цветными-камнями',
  'кольца-с-бриллиантами',
  'женские-обручальные-кольца',
  'мужские-обручальные-кольца',
  'обручальные-кольца',
  'серьги-и-пусеты',
];

// Форматирование числовой цены (рубли)
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price);
}

export type CatalogNavCategory = { id: string; name: string };
