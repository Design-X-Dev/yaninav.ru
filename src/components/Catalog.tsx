'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import ColorControlPanel from './ColorControlPanel';
import { getProductsByCategory, getAllCategories, getProductImagePath, formatPrice, type Product } from '@/utils/products';

// Типы для ProductCard
export interface ProductCardProps {
  product: Product;
  backgroundColor: string;
  headingColor: string;
  textColor: string;
}

// Компонент изображения товара
const ProductImage = ({ 
  src, 
  alt, 
  isActive
}: { 
  src: string; 
  alt: string; 
  isActive: boolean;
}) => (
  <Image
    src={getProductImagePath(src)}
    alt={alt}
    fill
    className="object-cover transition-opacity duration-300"
    style={{
      opacity: isActive ? 1 : 0,
      position: 'absolute',
      zIndex: isActive ? 1 : 0
    }}
    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    onError={(e) => {
      const target = e.target as HTMLImageElement;
      target.src = '/images/placeholder.jpg';
    }}
  />
);

// Компонент индикатора точки
const DotIndicator = ({ 
  index, 
  isActive, 
  onClick 
}: { 
  index: number; 
  isActive: boolean; 
  onClick: (e: React.MouseEvent, index: number) => void;
}) => (
  <button
    onClick={(e) => onClick(e, index)}
    className="rounded-full transition-all duration-300 hover:scale-125"
    aria-label={`Показать изображение ${index + 1}`}
    style={{ 
      width: isActive ? '36px' : '14px',
      height: '14px',
      backgroundColor: isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.9)',
      minWidth: isActive ? '36px' : '14px',
      minHeight: '14px',
      cursor: 'pointer',
      flexShrink: 0,
      boxShadow: isActive 
        ? '0 3px 6px rgba(0, 0, 0, 0.4), 0 0 0 2px rgba(255, 255, 255, 0.2)' 
        : '0 1px 2px rgba(0, 0, 0, 0.2)',
      border: 'none',
      outline: 'none',
      transition: 'all 0.3s ease'
    }}
  />
);

// Компонент стрелки навигации
const NavigationArrow = ({ 
  direction, 
  onClick 
}: { 
  direction: 'prev' | 'next'; 
  onClick: (e: React.MouseEvent) => void;
}) => {
  const isPrev = direction === 'prev';
  const path = isPrev ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7';
  
  return (
    <button
      onClick={onClick}
      className={`absolute ${isPrev ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 z-30 opacity-0 group-hover:opacity-100 shadow-xl`}
      aria-label={isPrev ? 'Предыдущее изображение' : 'Следующее изображение'}
      style={{ pointerEvents: 'auto' }}
    >
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d={path} />
      </svg>
    </button>
  );
};

// Компонент карточки товара с переключением изображений
const ProductCard = ({ 
  product, 
  backgroundColor, 
  headingColor, 
  textColor 
}: ProductCardProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Собираем все доступные изображения
  const images = useMemo(() => {
    const imgArray = [product.image];
    if (product.image2?.trim()) {
      imgArray.push(product.image2);
    }
    return imgArray.filter(Boolean);
  }, [product.image, product.image2]);
  
  const hasMultipleImages = images.length > 1;

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

  const handleImageClick = useCallback((e: React.MouseEvent) => {
    if (hasMultipleImages) {
      handleNextImage(e);
    }
  }, [hasMultipleImages, handleNextImage]);

  const handleDotClick = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex(index);
  }, []);

  const cardStyle = {
    backgroundColor,
    borderColor: headingColor,
    borderWidth: '1px',
    borderStyle: 'solid',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
  };

  return (
    <Link
      href={`/products/${product.id}`}
      className="group rounded-2xl overflow-hidden transition-shadow duration-300 block h-full"
      style={cardStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col h-full">
      {/* Product Image Container */}
      <div 
        className="relative w-full aspect-square bg-theme-secondary overflow-hidden cursor-pointer flex-shrink-0" 
        onClick={hasMultipleImages ? handleImageClick : undefined}
      >
        {/* Images */}
        {images.map((image, index) => (
          <ProductImage
            key={`product-${product.id}-image-${index}`}
            src={image}
            alt={index === 0 ? product.name : `${product.name} - вид ${index + 1}`}
            isActive={currentImageIndex === index}
          />
        ))}
        
        {/* Dot Indicators */}
        {hasMultipleImages && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2.5 z-[100]">
            {images.map((_, index) => (
              <DotIndicator
                key={`product-${product.id}-dot-${index}`}
                index={index}
                isActive={currentImageIndex === index}
                onClick={handleDotClick}
              />
            ))}
          </div>
        )}
        
        {/* Navigation Arrows */}
        {hasMultipleImages && (
          <>
            <NavigationArrow direction="prev" onClick={handlePrevImage} />
            <NavigationArrow direction="next" onClick={handleNextImage} />
          </>
        )}
      </div>

      {/* Product Info */}
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="font-display text-xl font-semibold mb-2 transition-colors duration-300 line-clamp-2" style={{ color: headingColor }}>
          {product.name}
        </h3>
        <p className="mb-4 text-sm line-clamp-3" style={{ color: textColor }}>
          {product.description.split('\n')[0]}
        </p>
        <div className="flex flex-col mt-auto">
          <div className="mb-2">
            <span className="font-bold text-xl" style={{ color: headingColor }}>
              Цена от {formatPrice(product.price)} ₽
            </span>
          </div>
        </div>
      </div>
      </div>
    </Link>
  );
};

interface CatalogProps {
  backgroundColor?: string;
  onColorChange?: (color: string) => void;
  headingColor?: string;
  subheadingColor?: string;
  textColor?: string;
  onHeadingColorChange?: (color: string) => void;
  onSubheadingColorChange?: (color: string) => void;
  onTextColorChange?: (color: string) => void;
  limit?: number; // Ограничение количества товаров
  showViewAll?: boolean; // Показывать ли кнопку "Посмотреть все"
  hideCategoryFilter?: boolean; // Скрыть фильтр категорий
}

const Catalog = ({ 
  backgroundColor = '#f4f7f0', 
  onColorChange,
  headingColor = '#59151f',
  subheadingColor = '#59151f',
  textColor = '#616161',
  onHeadingColorChange,
  onSubheadingColorChange,
  onTextColorChange,
  limit,
  showViewAll = false,
  hideCategoryFilter = false,
}: CatalogProps) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = getAllCategories();
  
  // Используем useMemo для вычисления товаров
  const products = useMemo(() => {
    const allProducts = getProductsByCategory(activeCategory);
    // Гарантируем уникальность товаров по ID (совместимо с Safari)
    const seenIds = new Set<number>();
    const uniqueProducts = allProducts.filter((product) => {
      if (seenIds.has(product.id)) {
        return false;
      }
      seenIds.add(product.id);
      return true;
    });
    return limit && limit > 0 ? uniqueProducts.slice(0, limit) : uniqueProducts;
  }, [activeCategory, limit]);
  
  const showColorPanel = !!(onColorChange || onHeadingColorChange || onSubheadingColorChange || onTextColorChange);

  const renderContent = () => {
    // Если товаров нет, показываем сообщение
    if (!products || products.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-20">
          <h3 className="font-display text-2xl md:text-3xl font-semibold mb-3" style={{ color: headingColor }}>
            Товары не найдены
          </h3>
          <p className="text-lg max-w-md text-center mb-8" style={{ color: textColor }}>
            В данной категории пока нет товаров.
          </p>
        </div>
      );
    }

    return (
      <>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-8 items-stretch">
          {products.map((product, index) => (
            <ProductCard
              key={`catalog-product-${product.id}-${index}`}
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
              style={{ 
                backgroundColor: headingColor, 
                color: backgroundColor, 
                borderColor: headingColor, 
                borderWidth: '1px', 
                borderStyle: 'solid' 
              }}
            >
              Посмотреть все
            </Link>
          </div>
        )}
      </>
    );
  };

  return (
    <section id="catalog" className="relative pt-4 pb-20" style={{ backgroundColor }} suppressHydrationWarning>
      {showColorPanel && (
        <ColorControlPanel
          sectionId="catalog"
          backgroundColor={backgroundColor}
          headingColor={headingColor}
          subheadingColor={subheadingColor}
          textColor={textColor}
          onBackgroundColorChange={onColorChange}
          onHeadingColorChange={onHeadingColorChange}
          onSubheadingColorChange={onSubheadingColorChange}
          onTextColorChange={onTextColorChange}
        />
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4" style={{ color: headingColor }}>
            Наша коллекция
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: textColor }}>
            Откройте для себя мир изысканных украшений, созданных с любовью и вниманием к деталям
          </p>
        </div>

        {/* Category Filter */}
        {!hideCategoryFilter && (
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {categories.map((category, index) => {
              const isActive = activeCategory === category.id;
              return (
                <button
                  key={`category-${category.id}-${index}`}
                  onClick={() => setActiveCategory(category.id)}
                  className="px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-luxury"
                  style={{
                    backgroundColor: isActive ? headingColor : backgroundColor,
                    color: isActive ? backgroundColor : textColor,
                    borderColor: headingColor,
                    borderWidth: '1px',
                    borderStyle: 'solid'
                  }}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        )}

        {/* Products Content */}
        {renderContent()}
      </div>
    </section>
  );
};

export default Catalog;
export { ProductCard }; 