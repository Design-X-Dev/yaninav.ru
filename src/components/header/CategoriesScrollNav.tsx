'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { SubnavScrollChevron, subnavLinkClass } from './headerClasses';

interface CategoriesScrollNavProps {
  categories: { id: string; name: string }[];
}

export default function CategoriesScrollNav({ categories }: CategoriesScrollNavProps) {
  const searchParams = useSearchParams();
  const raw = searchParams.get('category');
  const activeCategoryId = raw ? decodeURIComponent(raw).toLowerCase().trim() : 'all';

  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollEdges = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const max = scrollWidth - clientWidth;
    setCanScrollLeft(scrollLeft > 2);
    setCanScrollRight(max > 2 && scrollLeft < max - 2);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollEdges();
    el.addEventListener('scroll', updateScrollEdges, { passive: true });
    const ro = new ResizeObserver(updateScrollEdges);
    ro.observe(el);
    window.addEventListener('resize', updateScrollEdges);
    return () => {
      el.removeEventListener('scroll', updateScrollEdges);
      ro.disconnect();
      window.removeEventListener('resize', updateScrollEdges);
    };
  }, [updateScrollEdges, categories.length, activeCategoryId]);

  const scrollByDir = (dir: -1 | 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const step = Math.max(140, Math.floor(el.clientWidth * 0.55));
    el.scrollBy({ left: dir * step, behavior: 'smooth' });
  };

  const scrollBtnClass =
    'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/85 bg-white/92 text-theme-secondary shadow-sm backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/35 disabled:pointer-events-none disabled:opacity-35';

  return (
    <div className="px-2.5 sm:px-3 max-w-7xl mx-auto w-full pointer-events-auto">
      <div className="flex min-w-0 items-center gap-1 sm:gap-1.5">
        <button
          type="button"
          className={scrollBtnClass}
          aria-label="Прокрутить категории влево"
          disabled={!canScrollLeft}
          onClick={() => scrollByDir(-1)}
        >
          <SubnavScrollChevron dir="left" />
        </button>

        <div
          ref={scrollRef}
          role="navigation"
          aria-label="Категории коллекции"
          className="flex min-w-0 flex-1 flex-nowrap items-center gap-2 sm:gap-2.5 overflow-x-auto overflow-y-hidden py-2 scroll-smooth touch-pan-x overscroll-x-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {categories.map(({ id, name }) => (
            <Link
              key={id}
              href={id === 'all' ? '/collection' : `/collection?category=${encodeURIComponent(id)}`}
              className={subnavLinkClass(id === activeCategoryId)}
              aria-current={id === activeCategoryId ? 'true' : undefined}
            >
              {name}
            </Link>
          ))}
        </div>

        <button
          type="button"
          className={scrollBtnClass}
          aria-label="Прокрутить категории вправо"
          disabled={!canScrollRight}
          onClick={() => scrollByDir(1)}
        >
          <SubnavScrollChevron dir="right" />
        </button>
      </div>
    </div>
  );
}
