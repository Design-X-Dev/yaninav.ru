'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProductCard } from '@/components/Catalog';
import { getProductById, getProductImagePath, formatPrice, getAllProducts, type Product } from '@/utils/products';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Собираем все доступные изображения
  const images = useMemo(() => {
    if (!product) return [];
    const imgArray = [product.image];
    if (product.image2?.trim()) {
      imgArray.push(product.image2);
    }
    if (product.bannerImage?.trim()) {
      imgArray.push(product.bannerImage);
    }
    return imgArray.filter(Boolean);
  }, [product]);

  const hasMultipleImages = images.length > 1;

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleDotClick = useCallback((index: number) => {
    setCurrentImageIndex(index);
  }, []);

  useEffect(() => {
    if (params.id) {
      const productId = parseInt(params.id as string);
      const foundProduct = getProductById(productId);
      
      if (foundProduct) {
        setProduct(foundProduct);
        setCurrentImageIndex(0); // Сбрасываем индекс при смене товара
        // Получаем похожие товары из той же категории
        const allProducts = getAllProducts();
        const related = allProducts
          .filter(p => p.category === foundProduct.category && p.id !== foundProduct.id)
          .slice(0, 3);
        setRelatedProducts(related);
      }
    }
  }, [params.id]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Товар не найден</h1>
          <Link href="/#catalog" className="text-accent-primary hover:underline">
            Вернуться в каталог
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main>
      <Header />
      
      <div className="min-h-screen bg-[#f4f7f0] pt-20 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumbs */}
          <nav className="mb-8">
            <div className="flex items-center space-x-2 text-sm">
              <Link href="/" className="text-theme-secondary hover:text-accent-primary">
                Главная
              </Link>
              <span className="text-theme-secondary">/</span>
              <Link href="/#catalog" className="text-theme-secondary hover:text-accent-primary">
                Каталог
              </Link>
              <span className="text-theme-secondary">/</span>
              <span className="text-theme-secondary">{product.name}</span>
            </div>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Product Images Slider */}
            <div className="relative group">
              {/* Основной слайдер */}
              <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
                {images.map((image, index) => (
                  <Image
                    key={`product-${product.id}-image-${index}`}
                    src={getProductImagePath(image)}
                    alt={index === 0 ? product.name : `${product.name} - вид ${index + 1}`}
                    fill
                    className="object-cover transition-opacity duration-300"
                    style={{
                      opacity: currentImageIndex === index ? 1 : 0,
                      position: 'absolute',
                      zIndex: currentImageIndex === index ? 1 : 0
                    }}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={index === 0}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/images/placeholder.jpg';
                    }}
                  />
                ))}

                {/* Стрелки навигации */}
                {hasMultipleImages && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 z-30 opacity-0 group-hover:opacity-100 shadow-xl"
                      aria-label="Предыдущее изображение"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 z-30 opacity-0 group-hover:opacity-100 shadow-xl"
                      aria-label="Следующее изображение"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}

                {/* Индикаторы точек */}
                {hasMultipleImages && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5 z-[100]">
                    {images.map((_, index) => (
                      <button
                        key={`dot-${index}`}
                        onClick={() => handleDotClick(index)}
                        className="rounded-full transition-all duration-300 hover:scale-125"
                        aria-label={`Показать изображение ${index + 1}`}
                        style={{ 
                          width: currentImageIndex === index ? '36px' : '14px',
                          height: '14px',
                          backgroundColor: currentImageIndex === index ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
                          minWidth: currentImageIndex === index ? '36px' : '14px',
                          minHeight: '14px',
                          cursor: 'pointer',
                          flexShrink: 0,
                          boxShadow: currentImageIndex === index 
                            ? '0 3px 6px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.2)' 
                            : '0 1px 2px rgba(0, 0, 0, 0.2)',
                          border: 'none',
                          outline: 'none',
                          transition: 'all 0.3s ease'
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <span className="text-sm text-theme-secondary mb-2 block">{product.category}</span>
                <h1 className="font-display text-4xl font-bold mb-4 text-theme-secondary">
                  {product.name}
                </h1>
                <div className="mb-6">
                  <div className="text-3xl font-bold text-accent-primary mb-2">
                    Цена от {formatPrice(product.price)} ₽
                  </div>
                  <p className="text-sm text-theme-secondary">
                    * для расчёта стоимости свяжитесь с нашим менеджером
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="prose max-w-none">
                <div className="text-theme-secondary whitespace-pre-line leading-relaxed">
                  {product.description.split('\n').map((line, index, array) => (
                    <span key={`product-${product.id}-desc-line-${index}`}>
                      {line}
                      {index < array.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <a
                  href="tel:+79920147127"
                  className="flex-1 px-8 py-4 rounded-full font-medium text-center transition-all duration-300 transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: '#384a32', color: '#f4f7f0' }}
                >
                  Заказать по телефону
                </a>
                <a
                  href="mailto:yaninav-jewelrystudio@yandex.ru"
                  className="flex-1 px-8 py-4 rounded-full font-medium text-center transition-all duration-300 border-2"
                  style={{ borderColor: '#384a32', color: '#384a32' }}
                >
                  Написать нам
                </a>
              </div>

              {/* Additional Info */}
              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm text-theme-secondary">
                  * Все изделия изготавливаются индивидуально под заказ. 
                  Свяжитесь с нами для уточнения деталей и сроков изготовления.
                </p>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-3xl font-bold mb-8 text-theme-secondary">
                Похожие товары
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 items-stretch">
                {relatedProducts.map((relatedProduct, index) => (
                  <ProductCard
                    key={`related-product-${relatedProduct.id}-${index}`}
                    product={relatedProduct}
                    backgroundColor="#f4f7f0"
                    headingColor="#59151f"
                    textColor="#616161"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}

