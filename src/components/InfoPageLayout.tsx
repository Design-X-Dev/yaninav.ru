import type { ReactNode } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import LegalFooterDivider from '@/components/LegalFooterDivider';
import { THEME } from '@/utils/theme';

interface InfoPageLayoutProps {
  children: ReactNode;
  showLegalDivider?: boolean;
}

/**
 * Общий layout для информационных страниц:
 * Header + article с максимальной шириной + опциональный LegalFooterDivider + Footer
 */
export default function InfoPageLayout({ children, showLegalDivider }: InfoPageLayoutProps) {
  return (
    <main className="min-h-screen" style={{ backgroundColor: THEME.bg }}>
      <Header sectionColor={THEME.bg} />
      <article className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 md:py-16 pb-24">
        {children}
      </article>
      {showLegalDivider && <LegalFooterDivider />}
      <Footer />
    </main>
  );
}
