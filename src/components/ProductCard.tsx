'use client';

import { useState, useMemo, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { formatPrice, type Product } from '@/utils/products';

interface ProductImageProps {
  src: string;
  alt: string;
  isActive: boolean;
  isFirstImage?: boolean;
  shouldRender?: boolean;
}

const ProductImage = ({ src, alt, isActive, isFirstImage = false, shouldRender = true }: ProductImageProps) => {
  // Не рендерим изображение, если оно не видно и не должно быть предзагружено
  if (!shouldRender) return null;

  return (
    <Image
      src={src?.trim() ? src : '/images/placeholder.jpg'}
      alt={alt}
      fill
      className="object-cover transition-opacity duration-300"
      style={{ opacity: isActive ? 1 : 0, position: 'absolute', zIndex: isActive ? 1 : 0 }}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      quality={80}
      // Первая картинка грузится с приоритетом в первых 8 карточках, остальные — лениво
      priority={isFirstImage && shouldRender}
      loading={isFirstImage ? 'eager' : 'lazy'}
      onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
        e.currentTarget.src = '/images/placeholder.jpg';
      }}
    />
  );
};

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

const NavigationArrow = ({
  direction,
  onClick,
}: {
  direction: 'prev' | 'next';
  onClick: (e: React.MouseEvent) => void;
}) => {
  const isPrev = direction === 'prev';
  return (
    <button
      onClick={onClick}
      className={`absolute ${isPrev ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 w-9 h-9 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full flex items-center justify-center transition-all duration-300 z-30 opacity-0 group-hover:opacity-100 shadow-xl focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-white`}
      aria-label={isPrev ? 'Предыдущее изображение' : 'Следующее изображение'}
    >
      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={3}
          d={isPrev ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
        />
      </svg>
    </button>
  );
};

export interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hasInteracted, setHasInteracted] = useState(false);

  const images = useMemo(() => {
    return [product.image, product.image2, product.image3].filter((img): img is string => Boolean(img?.trim()));
  }, [product.image, product.image2, product.image3]);

  const hasMultiple = images.length > 1;

  const handleNextImage = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setHasInteracted(true);
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    },
    [images.length],
  );

  const handlePrevImage = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setHasInteracted(true);
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    },
    [images.length],
  );

  const handleDotClick = useCallback((e: React.MouseEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    setHasInteracted(true);
    setCurrentImageIndex(index);
  }, []);

  return (
    <Link
      href={`/products/${product.id}`}
      className="group product-card rounded-2xl overflow-hidden transition-shadow duration-300 hover:shadow-lg block h-full border"
    >
      <div className="flex flex-col h-full">
        <div
          className="relative w-full aspect-square bg-theme-secondary overflow-hidden flex-shrink-0"
          style={{ cursor: hasMultiple ? 'pointer' : 'default' }}
          onClick={hasMultiple ? handleNextImage : undefined}
          onMouseEnter={() => setHasInteracted(true)}
        >
          {images.map((image, index) => {
            // Рендерим первую картинку всегда, остальные — только после взаимодействия
            const shouldRender = index === 0 || hasInteracted;

            return (
              <ProductImage
                key={`${product.id}-img-${index}`}
                src={image}
                alt={index === 0 ? product.name : `${product.name} — вид ${index + 1}`}
                isActive={currentImageIndex === index}
                isFirstImage={index === 0}
                shouldRender={shouldRender}
              />
            );
          })}
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
          <h3 className="font-display text-xl font-semibold mb-2 transition-colors duration-300 line-clamp-2 text-accent-primary">
            {product.name}
          </h3>
          <p className="mb-4 text-sm line-clamp-3 text-theme-secondary">
            {product.description.split('\n')[0]}
          </p>
          <div className="mt-auto">
            <span className="font-bold text-xl text-accent-primary">
              {product.price !== null ? `Цена от ${formatPrice(product.price)} ₽` : 'Цена по запросу'}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
