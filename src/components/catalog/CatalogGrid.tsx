'use client';

import Link from 'next/link';
import type { Product } from '@/utils/products';
import ProductCard from '@/components/ProductCard';

interface CatalogGridProps {
  products: Product[];
  showViewAll?: boolean;
}

export default function CatalogGrid({ products, showViewAll = false }: CatalogGridProps) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 items-stretch">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      {showViewAll && (
        <div className="text-center mt-12">
          <Link
            href="/collection"
            className="inline-block px-8 py-3 rounded-full font-medium transition-all duration-300 transform hover:scale-105 shadow-lg bg-accent-primary text-theme-inverse border border-accent-primary"
          >
            Посмотреть все
          </Link>
        </div>
      )}
    </>
  );
}
