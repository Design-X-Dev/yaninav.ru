'use client';

import Link from 'next/link';
import { HEADER_SHELL_DESKTOP, NAV_ITEMS, navLinkClass } from './headerClasses';

interface DesktopNavProps {
  pathname: string;
}

export default function DesktopNav({ pathname }: DesktopNavProps) {
  return (
    <div
      className={`shadow-header hidden md:flex min-w-0 flex-1 flex-col justify-center rounded-full bg-white/85 backdrop-blur-md border border-white/60 ${HEADER_SHELL_DESKTOP}`}
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
  );
}
