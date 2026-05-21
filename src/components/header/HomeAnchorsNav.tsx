'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { scrollToHomeSection } from '@/utils/navigation';
import { HOME_PAGE_ANCHORS, subnavLinkClass } from './headerClasses';

export default function HomeAnchorsNav() {
  const [activeHomeAnchorId, setActiveHomeAnchorId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
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
  }, []);

  return (
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
  );
}
