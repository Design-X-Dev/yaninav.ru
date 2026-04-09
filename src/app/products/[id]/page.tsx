'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProductCard } from '@/components/Catalog';
import { SECTIONS } from '@/utils/theme';
import { PHONE_HREF, EMAIL_HREF } from '@/utils/social';
import { getProductById, getProductImagePath, formatPrice, getAllProducts, type Product } from '@/utils/products';
import { capitalizeFirstLetter } from '@/utils/typography';

const { bg, heading, text } = SECTIONS.catalog;
const orderBg = '#384a32';

export default function ProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = useMemo(() => {
    if (!product) return [];
    return [product.image, product.image2, product.image3, product.bannerImage]
      .filter((img): img is string => Boolean(img?.trim()));
  }, [product]);

  const hasMultiple = images.length > 1;

  const handleNext = useCallback(() => setCurrentImageIndex((i) => (i + 1) % images.length), [images.length]);
  const handlePrev = useCallback(() => setCurrentImageIndex((i) => (i - 1 + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (!params.id) return;
    const found = getProductById(parseInt(params.id as string));
    if (found) {
      setProduct(found);
      setCurrentImageIndex(0);
      setRelatedProducts(
        getAllProducts().filter((p) => p.category === found.category && p.id !== found.id).slice(0, 3)
      );
    }
  }, [params.id]);

  if (!product) {
    return (
      <>
        <Header sectionColor={bg} />
        <div className="min-h-screen flex items-center justify-center px-4 pb-20" style={{ backgroundColor: bg }}>
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4" style={{ color: heading }}>Товар не найден</h1>
            <Link href="/collection" className="text-accent-primary hover:underline">
              Вернуться в каталог
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <main>
      <Header sectionColor={bg} />

      <div className="min-h-screen pt-4 pb-20 sm:pt-6" style={{ backgroundColor: bg }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Слайдер изображений */}
            <div className="relative group">
              <div className="relative aspect-square bg-white rounded-2xl overflow-hidden shadow-lg">
                {images.map((image, index) => (
                  <Image
                    key={`img-${index}`}
                    src={getProductImagePath(image)}
                    alt={index === 0 ? product.name : `${product.name} — вид ${index + 1}`}
                    fill
                    className="object-cover transition-opacity duration-300"
                    style={{ opacity: currentImageIndex === index ? 1 : 0, position: 'absolute', zIndex: currentImageIndex === index ? 1 : 0 }}
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority={index === 0}
                    onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/placeholder.jpg'; }}
                  />
                ))}

                {hasMultiple && (
                  <>
                    <button
                      onClick={handlePrev}
                      className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 z-30 opacity-0 group-hover:opacity-100 shadow-xl focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white"
                      aria-label="Предыдущее изображение"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNext}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 z-30 opacity-0 group-hover:opacity-100 shadow-xl focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white"
                      aria-label="Следующее изображение"
                    >
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
                      {images.map((_, index) => (
                        <button
                          key={`dot-${index}`}
                          onClick={() => setCurrentImageIndex(index)}
                          className="rounded-full transition-all duration-300 hover:scale-125 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1"
                          aria-label={`Показать изображение ${index + 1}`}
                          aria-pressed={currentImageIndex === index}
                          style={{
                            width: currentImageIndex === index ? '36px' : '14px',
                            height: '14px',
                            minWidth: currentImageIndex === index ? '36px' : '14px',
                            backgroundColor: currentImageIndex === index ? '#ffffff' : 'rgba(255,255,255,0.9)',
                            flexShrink: 0,
                            boxShadow: currentImageIndex === index
                              ? '0 3px 6px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.2)'
                              : '0 1px 2px rgba(0,0,0,0.2)',
                            transition: 'all 0.3s ease',
                          }}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>

              <Link
                href="/gift-certificate"
                className="mt-4 block w-full text-center px-6 py-3 rounded-full font-medium transition-all duration-300 border-2 hover:opacity-90 shadow-sm"
                style={{ borderColor: heading, color: heading }}
              >
                Подарочный сертификат
              </Link>
            </div>

            {/* Информация о товаре */}
            <div className="space-y-6">
              <div>
                <h1 className="font-display text-4xl font-bold mb-4" style={{ color: heading }}>
                  {product.name}
                </h1>
                <div className="mb-6">
                  <div className="text-3xl font-bold text-accent-primary mb-2">
                    {product.price !== null ? `Цена от ${formatPrice(product.price)} ₽` : 'Цена по запросу'}
                  </div>
                  <p className="text-sm" style={{ color: text }}>
                    * для расчёта стоимости свяжитесь с нашим менеджером
                  </p>
                </div>
              </div>

              <div className="prose max-w-none">
                <div className="whitespace-pre-line leading-relaxed" style={{ color: text }}>
                  {product.description.split('\n').map((line, index, arr) => (
                    <span key={index}>
                      {line}
                      {index < arr.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>

              {product.characteristics && product.characteristics.length > 0 && (
                <div className="mt-6 w-full text-left">
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[260px] border-collapse text-left text-sm">
                      <tbody>
                        {product.characteristics.map((row, idx) => (
                          <tr
                            key={`${product.id}-spec-${idx}-${row.key}`}
                            className="border-b border-theme-muted/25 last:border-b-0"
                          >
                            <th
                              scope="row"
                              className="max-w-[11rem] px-3 py-3 pr-4 align-top font-semibold sm:max-w-[13rem] sm:pr-5"
                              style={{ color: heading, textAlign: 'left' }}
                            >
                              {capitalizeFirstLetter(row.key)}
                            </th>
                            <td
                              className="px-3 py-3 align-top leading-relaxed"
                              style={{ color: text, textAlign: 'left' }}
                            >
                              {capitalizeFirstLetter(row.value)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {product.descriptionEnd && (
                <div className="prose max-w-none mt-6">
                  <div className="whitespace-pre-line leading-relaxed" style={{ color: text }}>
                    {product.descriptionEnd.split('\n').map((line, index, arr) => (
                      <span key={`end-${index}`}>
                        {line}
                        {index < arr.length - 1 && <br />}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <a
                  href={PHONE_HREF}
                  className="flex-1 px-8 py-4 rounded-full font-medium text-center transition-all duration-300 transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: orderBg, color: bg }}
                >
                  Заказать по телефону
                </a>
                <a
                  href={EMAIL_HREF}
                  className="flex-1 px-8 py-4 rounded-full font-medium text-center transition-all duration-300 border-2"
                  style={{ borderColor: orderBg, color: orderBg }}
                >
                  Написать нам
                </a>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <p className="text-sm" style={{ color: text }}>
                  * Все изделия изготавливаются индивидуально под заказ.
                  Свяжитесь с нами для уточнения деталей и сроков изготовления.
                </p>
              </div>
            </div>
          </div>

          {/* Похожие товары */}
          {relatedProducts.length > 0 && (
            <div className="mt-16">
              <h2 className="font-display text-3xl font-bold mb-8" style={{ color: heading }}>
                Похожие товары
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-8 items-stretch">
                {relatedProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    backgroundColor={bg}
                    headingColor={heading}
                    textColor={text}
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
