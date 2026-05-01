import '../globals.css';

import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import localFont from 'next/font/local';
import AppLoader from '@/components/AppLoader';
import ContactMessengerFab from '@/components/ContactMessengerFab';
import { siteUrlNormalized } from '@/lib/seoHelpers';

const siteBaseUrl = siteUrlNormalized();

const playfair = Playfair_Display({
  variable: '--font-playfair',
  subsets: ['latin', 'cyrillic'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin', 'cyrillic'],
});

const disruptorScript = localFont({
  src: '../../fonts/DisruptorScript.otf',
  variable: '--font-disruptor-script',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteBaseUrl),
  title: 'ЯНИНА В - Ювелирная студия | Эксклюзивные украшения',
  description:
    'Ювелирная студия ЯНИНА В - помолвочные и обручальные кольца, эксклюзивные украшения ручной работы. Индивидуальный подход к каждому клиенту.',
  keywords:
    'ювелирная студия, помолвочные кольца, обручальные кольца, эксклюзивные украшения, ювелирные изделия на заказ',
  openGraph: {
    title: 'ЯНИНА В - Ювелирная студия',
    description: 'Эксклюзивные украшения ручной работы',
    type: 'website',
    locale: 'ru_RU',
  },
};

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${playfair.variable} ${inter.variable} ${disruptorScript.variable}`}
    >
      <body className="antialiased min-h-screen">
        <AppLoader />
        {children}
        <ContactMessengerFab />
      </body>
    </html>
  );
}
