'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoYV from '@/components/icons/LogoYV';
import DesktopNav from './DesktopNav';
import { MobileMenuToggle, MobileMenuDropdown } from './MobileMenu';
import HomeAnchorsNav from './HomeAnchorsNav';
import CategoriesScrollNav from './CategoriesScrollNav';
import ProductBreadcrumbs from './ProductBreadcrumbs';
import { HEADER_SHELL_DESKTOP } from './headerClasses';

export interface HeaderProps {
  categories?: { id: string; name: string }[];
  currentProduct?: { category: string; categorySlug: string; name: string };
}

export default function HeaderShell({ categories, currentProduct }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isCollectionPage = pathname === '/collection';
  const isProductPage = pathname.startsWith('/products/');

  return (
    <>
      <div
        aria-hidden
        className="fixed top-0 left-0 right-0 z-[90] pointer-events-none h-[min(26vh,11.5rem)]"
      >
        <div className="header-veil-tint absolute inset-0" />
        <div className="header-veil-blur absolute inset-0 bg-transparent backdrop-blur-md backdrop-saturate-150 sm:backdrop-blur-lg md:backdrop-blur-xl" />
      </div>

      <div className="fixed top-2.5 left-0 right-0 z-[100] flex flex-col pointer-events-none gap-2">
        <div className="px-2.5 sm:px-3 max-w-7xl mx-auto w-full pointer-events-auto">
          <header
            aria-label="Основная навигация"
            className="flex flex-col gap-2 md:flex-row md:items-stretch md:justify-between md:gap-3"
          >
            <div className="flex flex-row items-center justify-between gap-2 sm:gap-3 md:contents">
              <div
                className={`shadow-header flex shrink-0 items-center rounded-full bg-white/85 backdrop-blur-md border border-white/60 ${HEADER_SHELL_DESKTOP}`}
              >
                <div className="flex w-full items-center px-3 py-2.5 sm:px-4 sm:py-2.5 md:h-full md:px-5 md:py-0">
                  <Link
                    href="/"
                    className="flex items-center gap-2 sm:gap-2.5 min-w-0 leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/35 focus-visible:ring-offset-2 rounded-sm"
                  >
                    <LogoYV
                      title="ЯНИНА В"
                      className="block shrink-0 h-[1.225rem] sm:h-[1.4rem] w-auto text-theme-secondary"
                    />
                    <span className="font-display text-base sm:text-lg font-semibold text-theme-secondary whitespace-nowrap leading-none">
                      ЯНИНА В
                    </span>
                  </Link>
                </div>
              </div>

              <DesktopNav pathname={pathname} />

              <MobileMenuToggle
                isOpen={isMenuOpen}
                onToggle={() => setIsMenuOpen((v) => !v)}
              />
            </div>
          </header>
        </div>

        <MobileMenuDropdown
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
          pathname={pathname}
        />

        {isHome && <HomeAnchorsNav />}

        {isCollectionPage && categories && categories.length > 0 && (
          <Suspense fallback={<div className="h-12 max-w-7xl mx-auto w-full px-2.5 sm:px-3" aria-hidden />}>
            <CategoriesScrollNav categories={categories} />
          </Suspense>
        )}

        {isProductPage && currentProduct && (
          <Suspense fallback={<div className="h-12 max-w-7xl mx-auto w-full px-2.5 sm:px-3" aria-hidden />}>
            <ProductBreadcrumbs currentProduct={currentProduct} />
          </Suspense>
        )}
      </div>

      {!isHome && (
        <div
          className={isCollectionPage || isProductPage ? 'h-[8.75rem] shrink-0' : 'h-[6.5rem] shrink-0'}
          aria-hidden
        />
      )}
    </>
  );
}
