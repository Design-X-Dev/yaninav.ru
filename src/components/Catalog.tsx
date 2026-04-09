'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { SECTIONS } from '@/utils/theme';
import { getProductsByCategory, getCategoriesForNav, getProductImagePath, formatPrice, type Product } from '@/utils/products';
import { nbspAfterSi } from '@/utils/typography';

// ─── Компоненты изображений ─────────────────────────────────────────────────

const ProductImage = ({ src, alt, isActive }: { src: string; alt: string; isActive: boolean }) => (
  <Image
    src={getProductImagePath(src)}
    alt={alt}
    fill
    className="object-cover transition-opacity duration-300"
    style={{ opacity: isActive ? 1 : 0, position: 'absolute', zIndex: isActive ? 1 : 0 }}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    onError={(e: React.SyntheticEvent<HTMLImageElement>) => { e.currentTarget.src = '/images/placeholder.jpg'; }}
  />
);

const DotIndicator = ({
  index,
  isActive,
  onClick,
}: {
  index: number;
  isActive: boolean;
  onClick: (e: React.MouseEvent, index: number) => void;
}) => (
  <button
    onClick={(e) => onClick(e, index)}
    className="rounded-full transition-all duration-300 hover:scale-125 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1"
    aria-label={`Показать изображение ${index + 1}`}
    aria-pressed={isActive}
    style={{
      width: isActive ? '36px' : '14px',
      height: '14px',
      minWidth: isActive ? '36px' : '14px',
      minHeight: '14px',
      backgroundColor: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
      flexShrink: 0,
      boxShadow: isActive
        ? '0 3px 6px rgba(0,0,0,0.4), 0 0 0 2px rgba(255,255,255,0.2)'
        : '0 1px 2px rgba(0,0,0,0.2)',
      transition: 'all 0.3s ease',
    }}
  />
);

const NavigationArrow = ({ direction, onClick }: { direction: 'prev' | 'next'; onClick: (e: React.MouseEvent) => void }) => {
  const isPrev = direction === 'prev';
  return (
    <button
      onClick={onClick}
      className={`absolute ${isPrev ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 z-30 opacity-0 group-hover:opacity-100 shadow-xl focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white`}
      aria-label={isPrev ? 'Предыдущее изображение' : 'Следующее изображение'}
    >
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={isPrev ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'} />
      </svg>
    </button>
  );
};

// ─── ProductCard ─────────────────────────────────────────────────────────────

export interface ProductCardProps {
  product: Product;
  backgroundColor: string;
  headingColor: string;
  textColor: string;
}

export const ProductCard = ({ product, backgroundColor, headingColor, textColor }: ProductCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const images = useMemo(() => {
    return [product.image, product.image2, product.image3].filter((img): img is string => Boolean(img?.trim()));
  }, [product.image, product.image2, product.image3]);

  const hasMultiple = images.length > 1;

  const handleNextImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const handlePrevImage = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const handleDotClick = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  }, []);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-lg block h-full"
      style={{ backgroundColor, borderColor: headingColor, borderWidth: '1px', borderStyle: 'solid', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}
    >
      <div className="flex flex-col h-full">
        <div
          className="relative w-full aspect-square bg-theme-secondary overflow-hidden flex-shrink-0"
          style={{ cursor: hasMultiple ? 'pointer' : 'default' }}
          onClick={hasMultiple ? handleNextImage : undefined}
        >
          {images.map((image, index) => (
            <ProductImage
              key={`${product.id}-img-${index}`}
              src={image}
              alt={index === 0 ? product.name : `${product.name} — вид ${index + 1}`}
              isActive={currentImageIndex === index}
            />
          ))}
          {hasMultiple && (
            <>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5 z-10">
                {images.map((_, index) => (
                  <DotIndicator
                    key={`${product.id}-dot-${index}`}
                    index={index}
                    isActive={currentImageIndex === index}
                    onClick={handleDotClick}
                  />
                ))}
              </div>
              <NavigationArrow direction="prev" onClick={handlePrevImage} />
              <NavigationArrow direction="next" onClick={handleNextImage} />
            </>
          )}
        </div>

        <div className="p-6 flex flex-col flex-grow">
          <h3 className="font-display text-xl font-semibold mb-2 transition-colors duration-300 line-clamp-2" style={{ color: headingColor }}>
            {product.name}
          </h3>
          <p className="mb-4 text-sm line-clamp-3" style={{ color: textColor }}>
            {product.description.split('\n')[0]}
          </p>
          <div className="mt-auto">
            <span className="font-bold text-xl" style={{ color: headingColor }}>
              {product.price !== null ? `Цена от ${formatPrice(product.price)} ₽` : 'Цена по запросу'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
};

// ─── Catalog ─────────────────────────────────────────────────────────────────

interface CatalogProps {
  limit?: number;
  showViewAll?: boolean;
  hideCategoryFilter?: boolean;
}

const Catalog = ({ limit, showViewAll = false, hideCategoryFilter = false }: CatalogProps) => {
  const { bg: backgroundColor, heading: headingColor, text: textColor } = SECTIONS.catalog;

  const [activeCategory, setActiveCategory] = useState('all');
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const categories = useMemo(() => getCategoriesForNav(), []);

  const syncCategoryFromUrl = useCallback(() => {
    if (pathname !== '/collection') return;
    const raw = searchParams.get('category');
    if (!raw) { setActiveCategory('all'); return; }
    const id = decodeURIComponent(raw);
    if (id === 'all' || categories.some((c) => c.id === id)) setActiveCategory(id === 'all' ? 'all' : id);
  }, [pathname, searchParams, categories]);

  useEffect(() => { syncCategoryFromUrl(); }, [syncCategoryFromUrl]);

  const handleCategoryChange = (id: string) => {
    setActiveCategory(id);
    if (pathname === '/collection') {
      const q = id === 'all' ? '' : `?category=${encodeURIComponent(id)}`;
      router.replace(`/collection${q}`, { scroll: false });
    }
  };

  const products = useMemo(() => {
    const seen = new Set<number>();
    const unique = getProductsByCategory(activeCategory).filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
    return limit && limit > 0 ? unique.slice(0, limit) : unique;
  }, [activeCategory, limit]);

  return (
    <section id="catalog" className="relative scroll-mt-28 pt-4 pb-20" style={{ backgroundColor }} suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: headingColor }}>
            Наша коллекция
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: textColor }}>
            {nbspAfterSi(
              'Откройте для себя мир изысканных украшений, созданных с любовью и вниманием к деталям'
            )}
          </p>
        </div>

        {!hideCategoryFilter && (
          <div className="mb-12 flex flex-nowrap items-center justify-center gap-4 overflow-x-auto overflow-y-hidden py-1 scroll-smooth touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {categories.map((category) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => handleCategoryChange(category.id)}
                  className="shrink-0 whitespace-nowrap px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-luxury"
                  aria-pressed={isActive}
                  style={{
                    backgroundColor: isActive ? headingColor : backgroundColor,
                    color: isActive ? backgroundColor : textColor,
                    borderColor: headingColor,
                    borderWidth: '1px',
                    borderStyle: 'solid',
                  }}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        )}

        {products.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <h3 className="font-display text-2xl md:text-3xl font-semibold mb-3" style={{ color: headingColor }}>
              Товары не найдены
            </h3>
            <p className="text-lg max-w-md text-center" style={{ color: textColor }}>
              В данной категории пока нет товаров.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 items-stretch">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  backgroundColor={backgroundColor}
                  headingColor={headingColor}
                  textColor={textColor}
                />
              ))}
            </div>
            {showViewAll && (
              <div className="text-center mt-12">
                <Link
                  href="/collection"
                  className="inline-block px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                  style={{ backgroundColor: headingColor, color: backgroundColor, borderColor: headingColor, borderWidth: '1px', borderStyle: 'solid' }}
                >
                  Посмотреть все
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Catalog;
