'use client';

import type { ReactNode } from 'react';

export const MenuHeartIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
    />
  </svg>
);

export const HOME_PAGE_ANCHORS: { id: string; label: string }[] = [
  { id: 'catalog', label: 'Коллекция' },
  { id: 'about-description', label: 'О студии' },
  { id: 'contact-reach', label: 'Контакты' },
];

export const NAV_ITEMS: {
  href: string;
  label: string;
  matchFn: (p: string) => boolean;
  icon?: ReactNode;
}[] = [
  { href: '/', label: 'Главная', matchFn: (p) => p === '/' },
  { href: '/collection', label: 'Коллекции', matchFn: (p) => p === '/collection' || p.startsWith('/products/') },
  { href: '/custom-orders', label: 'Индивидуальный заказ', matchFn: (p) => p.startsWith('/custom-orders') },
  { href: '/gift-certificate', label: 'Подарочный сертификат', matchFn: (p) => p.startsWith('/gift-certificate') },
  {
    href: '/favorites',
    label: 'Избранное',
    matchFn: (p) => p === '/favorites',
    icon: <MenuHeartIcon className="w-5 h-5" />,
  },
];

/** Стиль капсулы меню (desktop/mobile, active/inactive) */
export const navLinkClass = (active: boolean, mobile: boolean) =>
  [
    mobile
      ? 'flex w-full items-center justify-center rounded-full border px-4 py-2.5 text-base font-medium transition-all duration-300'
      : 'inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-all duration-300',
    active
      ? 'bg-accent-primary text-white border-accent-primary-dark shadow-md font-semibold'
      : 'bg-transparent text-theme-secondary border-transparent hover:bg-accent-primary/12 hover:text-accent-primary hover:border-accent-primary/25 hover:shadow-sm',
  ].join(' ');

/** Стиль капсулы подменю (одинаковый для главной и коллекции) */
export const subnavLinkClass = (active: boolean) =>
  [
    'inline-flex items-center justify-center rounded-full border px-3 py-2 sm:py-1.5 text-sm font-medium transition-all duration-300 shadow-sm shrink-0 whitespace-nowrap',
    active
      ? 'bg-accent-primary text-white border-accent-primary-dark shadow-md font-semibold'
      : 'bg-white/92 backdrop-blur-md border border-white/85 text-theme-secondary hover:bg-white hover:border-white hover:text-accent-primary',
  ].join(' ');

export const SubnavScrollChevron = ({ dir }: { dir: 'left' | 'right' }) => (
  <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d={dir === 'left' ? 'M15 19l-7-7 7-7' : 'M9 5l7 7-7 7'}
    />
  </svg>
);

export const BreadcrumbDot = () => (
  <li className="flex shrink-0 items-center self-center" aria-hidden role="presentation">
    <span className="h-1.5 w-1.5 rounded-full bg-white ring-1 ring-white/80 shadow-[0_1px_2px_rgba(0,0,0,0.22),0_2px_6px_rgba(0,0,0,0.16)]" />
  </li>
);

export const HEADER_SHELL_DESKTOP = 'md:min-h-[3.5rem] md:box-border';
