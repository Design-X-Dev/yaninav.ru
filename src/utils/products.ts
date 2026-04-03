import productsData from '@/data/products.json';

export interface Product {
  id: number;
  image: string;
  image2?: string; // Второе изображение товара
  category: string;
  name: string;
  description: string;
  price: number;
  bannerImage: string;
}

// Функция для получения пути к изображению товара
export function getProductImagePath(imageName: string): string {
  if (!imageName) return '/images/placeholder.jpg';
  // Ищем фото в разных папках
  return `/images/products/${imageName}`;
}

// Функция для получения всех товаров
export function getAllProducts(): Product[] {
  return productsData as Product[];
}

// Функция для получения товара по ID
export function getProductById(id: number): Product | undefined {
  return productsData.find((product: Product) => product.id === id);
}

// Функция для получения товаров по категории
export function getProductsByCategory(category: string): Product[] {
  if (category === 'all') {
    // Гарантируем уникальность даже для 'all'
    return Array.from(
      new Map(productsData.map(product => [product.id, product])).values()
    ) as Product[];
  }
  
  const seenIds = new Set<number>();
  return productsData.filter((product: Product) => {
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
    else if (searchCategory.includes('обручальн') || searchCategory === 'wedding-rings') {
      matches = productCategory.includes('обручальн');
    }
    else if (searchCategory.includes('цветными') || searchCategory === 'colored-stones') {
      matches = productCategory.includes('цветными');
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
}

// Функция для получения всех категорий
export function getAllCategories(): { id: string; name: string }[] {
  const categoriesMap = new Map<string, string>();
  productsData.forEach((product: Product) => {
    if (product.category) {
      const normalizedId = product.category.toLowerCase().replace(/\s+/g, '-');
      // Используем Map для гарантии уникальности ID
      if (!categoriesMap.has(normalizedId)) {
        categoriesMap.set(normalizedId, product.category);
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

// Функция для форматирования цены
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('ru-RU').format(price);
}

