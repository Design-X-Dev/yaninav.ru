import productsData from '@/data/products.json';
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

function normalizeProductText(p: Product): Product {
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

// Путь к сжатому превью в /public/images/products/ (оригиналы без суффикса в репозитории остаются)
export function getProductImagePath(imageName: string): string {
  if (!imageName) return '/images/placeholder.jpg';
  return `/images/products/${toSmallProductImageFileName(imageName)}`;
}

// Функция для получения всех товаров
export function getAllProducts(): Product[] {
  return (productsData as Product[]).map(normalizeProductText);
}

// Функция для получения товара по ID
export function getProductById(id: number): Product | undefined {
  const p = productsData.find((product: Product) => product.id === id);
  return p ? normalizeProductText(p) : undefined;
}

// Функция для получения товаров по категории
export function getProductsByCategory(category: string): Product[] {
  if (category === 'all') {
    // Гарантируем уникальность даже для 'all'
    return Array.from(
      new Map(productsData.map(product => [product.id, product])).values()
    ).map(normalizeProductText) as Product[];
  }

  const seenIds = new Set<number>();
  const filtered = productsData.filter((product: Product) => {
    // Гарантируем уникальность по ID
    if (seenIds.has(product.id)) return false;
    
    if (!product.category) return false;
    
    const productCategory = product.category.toLowerCase();
    const searchCategory = category.toLowerCase();
    
    // Нормализуем ID категории для сравнения
    const normalizedProductCategory = productCategory.replace(/\s+/g, '-');
    
    let matches = false;
    
    // Прямое совпадение
    if (normalizedProductCategory === searchCategory || productCategory === searchCategory) {
      matches = true;
    }
    // Маппинг категорий по ключевым словам
    else if (searchCategory.includes('помолвочн') || searchCategory === 'engagement-rings') {
      matches = productCategory.includes('помолвочн');
    }
    // Не использовать searchCategory.includes('обручальн'): slug «женские-обручальные-кольца» тоже
    // содержит эту подстроку и тогда в выборку попадали бы все обручальные, включая мужские.
    else if (searchCategory === 'wedding-rings') {
      matches = productCategory.includes('обручальн');
    }
    else if (searchCategory.includes('цветными') || searchCategory === 'colored-stones') {
      matches = productCategory.includes('цветными');
    }
    else if (
      searchCategory.includes('бриллиант') &&
      !searchCategory.includes('цветн') &&
      (searchCategory.includes('кольца') || searchCategory === 'diamond-rings')
    ) {
      matches =
        productCategory.includes('кольца с бриллиантами') ||
        productCategory === 'кольца с бриллиантами';
    }
    else if (searchCategory.includes('серьг') || searchCategory.includes('пусет') || searchCategory === 'earrings') {
      matches = productCategory.includes('серьги') || productCategory.includes('пусет');
    }
    // Частичное совпадение
    else {
      matches = productCategory.includes(searchCategory) || normalizedProductCategory.includes(searchCategory);
    }
    
    if (matches) {
      seenIds.add(product.id);
      return true;
    }
    
    return false;
  });
  return filtered.map(normalizeProductText);
}

/** Slug категории для `?category=` и сравнения с фильтром коллекции (как в getAllCategories). */
export function getCategorySlug(category: string): string {
  return category.toLowerCase().replace(/\s+/g, '-');
}

// Функция для получения всех категорий
export function getAllCategories(): { id: string; name: string }[] {
  const categoriesMap = new Map<string, string>();
  productsData.forEach((product: Product) => {
    if (product.category) {
      const normalizedId = getCategorySlug(product.category);
      // Используем Map для гарантии уникальности ID
      if (!categoriesMap.has(normalizedId)) {
        categoriesMap.set(normalizedId, nbspAfterSi(product.category));
      }
    }
  });
  
  const categories = Array.from(categoriesMap.entries()).map(([id, name]) => ({
    id,
    name
  }));
  
  return [
    { id: 'all', name: 'Все изделия' },
    ...categories
  ];
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

/** Категории для навигации (только существующие в данных, в заданном порядке) */
export function getCategoriesForNav(): { id: string; name: string }[] {
  const all = getAllCategories();
  const byId = new Map(all.map((c) => [c.id, c]));
  return CATALOG_NAV_ORDER.map((id) => byId.get(id)).filter(
    (c): c is { id: string; name: string } => c != null
  );
}

// Форматирование числовой цены (рубли)
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price);
}
