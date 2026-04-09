'use client';

import { useState, useEffect, useRef, useCallback, Suspense, type CSSProperties } from 'react';
import Link from 'next/link';
import { usePathname, useParams, useSearchParams } from 'next/navigation';
import { generateHeaderShadow } from '@/utils/shadowUtils';
import { getCategoriesForNav, getProductById, getCategorySlug } from '@/utils/products';
import { scrollToHomeSection } from '@/utils/navigation';

const MenuHeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

interface HeaderProps {
  sectionColor?: string;
}

const HOME_PAGE_ANCHORS: { id: string; label: string }[] = [
  { id: 'memories', label: 'Воспоминания' },
  { id: 'catalog',  label: 'Коллекция' },
  { id: 'about-description', label: 'О студии' },
  { id: 'contact-reach',     label: 'Контакты' },
];

const NAV_ITEMS: { href: string; label: string; matchFn: (p: string) => boolean; icon?: React.ReactNode }[] = [
  { href: '/',                  label: 'Главная',              matchFn: (p) => p === '/' },
  { href: '/collection',        label: 'Коллекции',            matchFn: (p) => p === '/collection' || p.startsWith('/products/') },
  { href: '/custom-orders',     label: 'Индивидуальный заказ', matchFn: (p) => p.startsWith('/custom-orders') },
  { href: '/gift-certificate',  label: 'Подарочный сертификат', matchFn: (p) => p.startsWith('/gift-certificate') },
  { href: '/favorites',         label: 'Избранное',            matchFn: (p) => p === '/favorites', icon: <MenuHeartIcon className="w-5 h-5" /> },
];

/** Стиль капсулы меню (desktop/mobile, active/inactive) */
const navLinkClass = (active: boolean, mobile: boolean) =>
  [
    mobile
      ? 'flex w-full items-center justify-center rounded-full border px-4 py-2.5 text-base font-medium transition-all duration-300'
      : 'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-300',
    active
      ? 'bg-accent-primary text-white border-accent-primary-dark shadow-md font-semibold'
      : 'bg-transparent text-theme-secondary border-transparent hover:bg-accent-primary/12 hover:text-accent-primary hover:border-accent-primary/25 hover:shadow-sm',
  ].join(' ');

/** Стиль капсулы подменю (одинаковый для главной и коллекции) */
const subnavLinkClass = (active: boolean) =>
  [
    'inline-flex items-center justify-center rounded-full border px-3 py-2 sm:py-1.5 text-sm font-medium transition-all duration-300 shadow-sm shrink-0 whitespace-nowrap',
    active
      ? 'bg-accent-primary text-white border-accent-primary-dark shadow-md font-semibold'
      : 'bg-white/92 backdrop-blur-md border border-white/85 text-theme-secondary hover:bg-white hover:border-white hover:text-accent-primary',
  ].join(' ');

// ─── Подменю категорий коллекции ────────────────────────────────────────────

const SubnavScrollChevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d={dir === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
    />
  </svg>
);

function HeaderCollectionCategoryNav() {
  const searchParams = useSearchParams();
  const categories = getCategoriesForNav();
  const raw = searchParams.get('category');
  const activeCategoryId = raw ? decodeURIComponent(raw) : 'all';

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

// ─── Хлебные крошки на странице товара (второй ряд шапки) ─────────────────────

const BreadcrumbDot = () => (
  <li className="flex shrink-0 items-center self-center" aria-hidden role="presentation">
    <span className="h-1.5 w-1.5 rounded-full bg-white ring-1 ring-white/80 shadow-[0_1px_2px_rgba(0,0,0,0.22),0_2px_6px_rgba(0,0,0,0.16)]" />
  </li>
);

function HeaderProductBreadcrumbs() {
  const params = useParams();
  const rawId = params?.id;
  const idStr = Array.isArray(rawId) ? rawId[0] : rawId;
  const id = idStr ? parseInt(idStr, 10) : NaN;
  const product = Number.isFinite(id) ? getProductById(id) : undefined;

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
            {product && (
              <>
                <BreadcrumbDot />
                <li className="flex shrink-0 items-center justify-center">
                  <Link
                    href={`/collection?category=${encodeURIComponent(getCategorySlug(product.category))}`}
                    className={subnavLinkClass(false)}
                  >
                    {product.category}
                  </Link>
                </li>
                <BreadcrumbDot />
                <li className="flex shrink-0 items-center justify-center">
                  <span className={subnavLinkClass(true)} aria-current="page">
                    {product.name}
                  </span>
                </li>
              </>
            )}
          </ol>
        </div>
      </nav>
    </div>
  );
}

// ─── Header ──────────────────────────────────────────────────────────────────

const Header = ({ sectionColor = '#f4f7f0' }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === '/';
  const isCollectionPage = pathname === '/collection';
  const isProductPage = pathname.startsWith('/products/');

  const shadowStyle = generateHeaderShadow(sectionColor);

  const veilBlurMaskStyle: CSSProperties = {
    WebkitMaskImage:
      'linear-gradient(to bottom, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.35) 72%, rgba(0,0,0,0) 100%)',
    maskImage:
      'linear-gradient(to bottom, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.75) 40%, rgba(0,0,0,0.35) 72%, rgba(0,0,0,0) 100%)',
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
  };

  /** Маска слоя цвета: сверху без «дырки» (alpha = 1), затем как у размытия */
  const veilTintMaskStyle: CSSProperties = {
    WebkitMaskImage:
      'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,0.92) 30%, rgba(0,0,0,0.75) 42%, rgba(0,0,0,0.35) 72%, rgba(0,0,0,0) 100%)',
    maskImage:
      'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 18%, rgba(0,0,0,0.92) 30%, rgba(0,0,0,0.75) 42%, rgba(0,0,0,0.35) 72%, rgba(0,0,0,0) 100%)',
    WebkitMaskSize: '100% 100%',
    maskSize: '100% 100%',
  };

  /** Основной фон: сплошной sectionColor у верхней кромки, затем в прозрачность */
  const veilTintStyle: CSSProperties = {
    ...veilTintMaskStyle,
    background: `linear-gradient(to bottom, ${sectionColor} 0%, ${sectionColor} 22%, color-mix(in srgb, ${sectionColor} 45%, transparent) 52%, color-mix(in srgb, ${sectionColor} 12%, transparent) 82%, transparent 100%)`,
  };

  /** Активный якорь подменю главной */
  const [activeHomeAnchorId, setActiveHomeAnchorId] = useState<string | null>(null);

  useEffect(() => {
    if (!isHome || typeof window === 'undefined') return;
    const ids = HOME_PAGE_ANCHORS.map((a) => a.id);
    const OFFSET = 160;

    const updateFromScroll = () => {
      const line = window.scrollY + OFFSET;
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        if (el.getBoundingClientRect().top + window.scrollY <= line) current = id;
      }
      setActiveHomeAnchorId(current);
    };

    const syncFromHash = () => {
      const h = window.location.hash.slice(1);
      if (h && ids.includes(h)) setActiveHomeAnchorId(h);
    };

    updateFromScroll();
    syncFromHash();
    window.addEventListener('scroll', updateFromScroll, { passive: true });
    window.addEventListener('resize', updateFromScroll);
    window.addEventListener('hashchange', syncFromHash);
    return () => {
      window.removeEventListener('scroll', updateFromScroll);
      window.removeEventListener('resize', updateFromScroll);
      window.removeEventListener('hashchange', syncFromHash);
    };
  }, [isHome]);

  const headerShellDesktop = 'md:min-h-[3.5rem] md:box-border';

  return (
    <>
      {/* Зона под шапкой: цвет фона → прозрачность + размытие */}
      <div
        aria-hidden
        className="fixed top-0 left-0 right-0 z-[90] pointer-events-none h-[min(39.6vh,15.3rem)] sm:h-[min(36vh,16.2rem)] md:h-[min(32.4vh,17.1rem)]"
      >
        <div className="absolute inset-0" style={veilTintStyle} />
        <div
          className="absolute inset-0 bg-transparent backdrop-blur-md backdrop-saturate-150 sm:backdrop-blur-lg md:backdrop-blur-xl"
          style={veilBlurMaskStyle}
        />
      </div>

      <div className="fixed top-2.5 left-0 right-0 z-[100] flex flex-col pointer-events-none gap-2">
        <div className="px-2.5 sm:px-3 max-w-7xl mx-auto w-full pointer-events-auto">
          <header
            aria-label="Основная навигация"
            className="flex flex-col gap-2 md:flex-row md:items-stretch md:justify-between md:gap-3"
          >
            {/* Верхний ряд: логотип | десктоп-меню | круг с бургером (моб.) */}
            <div className="flex flex-row items-center justify-between gap-2 sm:gap-3 md:contents">
              {/* Капсула логотипа */}
              <div
                className={`flex shrink-0 items-center rounded-full bg-white/85 backdrop-blur-md border border-white/60 ${headerShellDesktop}`}
                style={shadowStyle}
              >
                <div className="flex w-full items-center px-3 py-2.5 sm:px-4 sm:py-2.5 md:h-full md:px-5 md:py-0">
                  <Link href="/" className="flex items-center gap-4 sm:gap-5 min-w-0 transition-opacity hover:opacity-90">
                    <span
                      className="font-display text-theme-secondary inline-block leading-none"
                      style={{ letterSpacing: '-0.37em', fontWeight: 400, fontSize: '1.65rem' }}
                    >
                      YV
                    </span>
                    <span className="font-display text-base sm:text-lg font-semibold text-theme-secondary whitespace-nowrap leading-none">
                      ЯНИНА В
                    </span>
                  </Link>
                </div>
              </div>

              {/* Десктоп: растянутая капсула с пунктами меню */}
              <div
                className={`hidden md:flex min-w-0 flex-1 flex-col justify-center rounded-full bg-white/85 backdrop-blur-md border border-white/60 ${headerShellDesktop}`}
                style={shadowStyle}
              >
                <div className="flex min-w-0 w-full items-center justify-end gap-2 overflow-hidden px-3 md:h-full md:py-0 md:flex-1">
                  <nav
                    className="flex max-w-full flex-nowrap items-center justify-end gap-x-4 md:gap-x-5 overflow-x-auto overflow-y-hidden py-1 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    aria-label="Разделы сайта"
                  >
                    {NAV_ITEMS.map(({ href, label, matchFn, icon }) => {
                      const active = matchFn(pathname);
                      return (
                        <Link
                          key={href}
                          href={href}
                          className={navLinkClass(active, false)}
                          aria-current={active ? 'page' : undefined}
                          aria-label={icon ? label : undefined}
                          title={icon ? label : undefined}
                        >
                          {icon ?? label}
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </div>

              {/* Мобильный: только круг с бургером */}
              <button
                type="button"
                className="md:hidden flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/85 backdrop-blur-md text-theme-secondary shadow-md transition-all duration-300 hover:text-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary-dark focus-visible:ring-offset-2"
                style={shadowStyle}
                onClick={() => setIsMenuOpen((v) => !v)}
                aria-expanded={isMenuOpen}
                aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </header>
        </div>

        {/* Мобильное меню: вне max-w-7xl, на всю ширину экрана (с теми же боковыми отступами, что и у шапки) */}
        {isMenuOpen && (
          <div className="pointer-events-auto w-full min-w-0 md:hidden px-2.5 sm:px-3">
            <div
              className="w-full animate-fade-in rounded-3xl border border-white/60 bg-white/92 backdrop-blur-md px-3 py-3 shadow-lg"
              style={shadowStyle}
            >
              <nav className="flex flex-col gap-4" aria-label="Разделы сайта">
                {NAV_ITEMS.map(({ href, label, matchFn, icon }) => {
                  const active = matchFn(pathname);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={navLinkClass(active, true)}
                      aria-current={active ? 'page' : undefined}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {icon ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          {icon}
                          {label}
                        </span>
                      ) : (
                        label
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Подменю главной — группа ссылок по центру; при узком экране — горизонтальный скролл */}
        {isHome && (
          <div className="px-2.5 sm:px-3 max-w-7xl mx-auto w-full pointer-events-auto">
            <div className="flex w-full justify-center">
              <nav
                aria-label="Навигация по главной странице"
                className="inline-flex max-w-full flex-nowrap items-center justify-center gap-2 sm:gap-3 overflow-x-auto overflow-y-hidden py-1 scroll-smooth touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              >
                {HOME_PAGE_ANCHORS.map(({ id, label }) => {
                  const isActive = activeHomeAnchorId === id;
                  return (
                    <Link
                      key={id}
                      href={`/#${id}`}
                      className={subnavLinkClass(isActive)}
                      aria-current={isActive ? 'true' : undefined}
                      onClick={(e: React.MouseEvent) => {
                        if (typeof window !== 'undefined' && window.location.pathname === '/') {
                          e.preventDefault();
                          scrollToHomeSection(id);
                          setActiveHomeAnchorId(id);
                        }
                      }}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        )}

        {/* Подменю категорий коллекции */}
        {isCollectionPage && (
          <Suspense fallback={<div className="h-12 max-w-7xl mx-auto w-full px-2.5 sm:px-3" aria-hidden />}>
            <HeaderCollectionCategoryNav />
          </Suspense>
        )}

        {/* Хлебные крошки на странице товара */}
        {isProductPage && (
          <Suspense fallback={<div className="h-12 max-w-7xl mx-auto w-full px-2.5 sm:px-3" aria-hidden />}>
            <HeaderProductBreadcrumbs />
          </Suspense>
        )}
      </div>

      {/* Spacer — только не на главной (там hero на весь экран) */}
      {!isHome && (
        <div
          className={isCollectionPage || isProductPage ? 'h-[8.75rem] shrink-0' : 'h-[6.5rem] shrink-0'}
          aria-hidden
        />
      )}
    </>
  );
};

export default Header;
