'use client';

import { useState } from 'react';
import Link from 'next/link';
import { generateHeaderShadow } from '@/utils/shadowUtils';

interface HeaderProps {
  sectionColor?: string;
}

const Header = ({ sectionColor = '#f4f7f0' }: HeaderProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const shadowStyle = generateHeaderShadow(sectionColor);

  const scrollToHomeSection = (sectionId: string) => {
    if (typeof window === 'undefined') return;
    if (window.location.pathname !== '/') return;
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${sectionId}`);
    }
  };

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50" style={shadowStyle}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex justify-between items-center py-4">
          {/* Logo YV - слева */}
          <div className="flex-1">
            <Link href="/">
              <span
                className="font-display text-theme-secondary"
                style={{
                  letterSpacing: '-0.37em',
                  fontWeight: 400,
                  fontSize: '2.5em'
                }}
              >
                YV
              </span>
            </Link>
          </div>

          {/* ЯНИНА В - по центру */}
          <span className="absolute left-1/2 transform -translate-x-1/2 font-display text-2xl font-semibold text-theme-secondary">
            ЯНИНА В
          </span>

          {/* Desktop Navigation - справа */}
          <div className="flex-1 flex justify-end">
            <nav className="hidden md:flex flex-wrap justify-end gap-x-6 gap-y-2">
              <Link href="/collection" className="text-base text-theme-secondary hover:text-accent-primary transition-colors duration-300">
                Коллекции
              </Link>
              <Link href="/custom-orders" className="text-base text-theme-secondary hover:text-accent-primary transition-colors duration-300">
                Индивидуальный заказ
              </Link>
              <Link
                href="/#about-description"
                className="text-base text-theme-secondary hover:text-accent-primary transition-colors duration-300"
                onClick={(e) => {
                  if (typeof window !== 'undefined' && window.location.pathname === '/') {
                    e.preventDefault();
                    scrollToHomeSection('about-description');
                  }
                }}
              >
                О студии
              </Link>
              <Link
                href="/#contact-reach"
                className="text-base text-theme-secondary hover:text-accent-primary transition-colors duration-300"
                onClick={(e) => {
                  if (typeof window !== 'undefined' && window.location.pathname === '/') {
                    e.preventDefault();
                    scrollToHomeSection('contact-reach');
                  }
                }}
              >
                Контакты
              </Link>
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-theme-secondary hover:text-accent-primary transition-colors duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <nav className="flex flex-col space-y-4">
              <Link href="/collection" className="text-base text-theme-secondary hover:text-accent-primary transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>
                Коллекции
              </Link>
              <Link href="/custom-orders" className="text-base text-theme-secondary hover:text-accent-primary transition-colors duration-300" onClick={() => setIsMenuOpen(false)}>
                Индивидуальный заказ
              </Link>
              <Link
                href="/#about-description"
                className="text-base text-theme-secondary hover:text-accent-primary transition-colors duration-300"
                onClick={(e) => {
                  if (typeof window !== 'undefined' && window.location.pathname === '/') {
                    e.preventDefault();
                    scrollToHomeSection('about-description');
                  }
                  setIsMenuOpen(false);
                }}
              >
                О студии
              </Link>
              <Link
                href="/#contact-reach"
                className="text-base text-theme-secondary hover:text-accent-primary transition-colors duration-300"
                onClick={(e) => {
                  if (typeof window !== 'undefined' && window.location.pathname === '/') {
                    e.preventDefault();
                    scrollToHomeSection('contact-reach');
                  }
                  setIsMenuOpen(false);
                }}
              >
                Контакты
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header; 