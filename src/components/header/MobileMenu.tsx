'use client';

import Link from 'next/link';
import { NAV_ITEMS, navLinkClass } from './headerClasses';

interface MobileMenuToggleProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function MobileMenuToggle({ isOpen, onToggle }: MobileMenuToggleProps) {
  return (
    <button
      type="button"
      className="shadow-header md:hidden flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/60 bg-white/85 backdrop-blur-md text-theme-secondary transition-all duration-300 hover:text-accent-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary-dark focus-visible:ring-offset-2"
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
        {isOpen ? (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        ) : (
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        )}
      </svg>
    </button>
  );
}

interface MobileMenuDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  pathname: string;
}

export function MobileMenuDropdown({ isOpen, onClose, pathname }: MobileMenuDropdownProps) {
  if (!isOpen) return null;

  return (
    <div className="pointer-events-auto w-full min-w-0 md:hidden px-2.5 sm:px-3">
      <div className="shadow-header w-full animate-fade-in rounded-3xl border border-white/60 bg-white/92 backdrop-blur-md px-3 py-3">
        <nav className="flex flex-col gap-4" aria-label="Разделы сайта">
          {NAV_ITEMS.map(({ href, label, matchFn, icon }) => {
            const active = matchFn(pathname);
            return (
              <Link
                key={href}
                href={href}
                className={navLinkClass(active, true)}
                aria-current={active ? 'page' : undefined}
                onClick={onClose}
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
  );
}
