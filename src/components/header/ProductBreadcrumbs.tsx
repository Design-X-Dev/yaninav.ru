'use client';

import Link from 'next/link';
import { BreadcrumbDot, subnavLinkClass } from './headerClasses';

interface ProductBreadcrumbsProps {
  currentProduct: { category: string; categorySlug: string; name: string };
}

export default function ProductBreadcrumbs({ currentProduct }: ProductBreadcrumbsProps) {
  const { category, categorySlug, name } = currentProduct;

  return (
    <div className="px-2.5 sm:px-3 max-w-7xl mx-auto w-full pointer-events-auto">
      <nav aria-label="Хлебные крошки" className="w-full min-w-0">
        <div className="w-full min-w-0 overflow-x-auto overflow-y-hidden py-2 scroll-smooth touch-pan-x overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <ol className="mx-auto flex w-max max-w-none flex-nowrap items-center justify-center gap-x-1.5 sm:gap-x-2">
            <li className="flex shrink-0 items-center justify-center">
              <Link href="/collection" className={subnavLinkClass(false)}>
                Коллекция
              </Link>
            </li>
            <BreadcrumbDot />
            <li className="flex shrink-0 items-center justify-center">
              <Link
                href={
                  categorySlug
                    ? `/collection?category=${encodeURIComponent(categorySlug)}`
                    : '/collection'
                }
                className={subnavLinkClass(false)}
              >
                {category}
              </Link>
            </li>
            <BreadcrumbDot />
            <li className="flex shrink-0 items-center justify-center">
              <span className={subnavLinkClass(true)} aria-current="page">
                {name}
              </span>
            </li>
          </ol>
        </div>
      </nav>
    </div>
  );
}
