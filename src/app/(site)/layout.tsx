import '../globals.css';

import type { Metadata } from 'next';
import { Playfair_Display, Inter } from 'next/font/google';
import localFont from 'next/font/local';
import { Suspense } from 'react';
import AppLoader from '@/components/AppLoader';
import ContactMessengerFab from '@/components/ContactMessengerFab';
import TopMailRu from '@/components/TopMailRu';
import TopMailRuPageView from '@/components/TopMailRuPageView';
import { phoneHrefToWhatsAppLink } from '@/lib/contact.defaults';
import { getSiteContactChannels } from '@/lib/contact.server';
import {
  HOMEPAGE_DEFAULT_DESCRIPTION,
  HOMEPAGE_DEFAULT_OG_DESCRIPTION,
  HOMEPAGE_DEFAULT_OG_TITLE,
  HOMEPAGE_DEFAULT_TITLE,
} from '@/lib/homepageMeta.defaults';
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
  title: HOMEPAGE_DEFAULT_TITLE,
  description: HOMEPAGE_DEFAULT_DESCRIPTION,
  keywords:
    'ювелирная студия, помолвочные кольца, обручальные кольца, эксклюзивные украшения, ювелирные изделия на заказ',
  openGraph: {
    title: HOMEPAGE_DEFAULT_OG_TITLE,
    description: HOMEPAGE_DEFAULT_OG_DESCRIPTION,
    type: 'website',
    locale: 'ru_RU',
  },
};

export default async function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const channels = await getSiteContactChannels();
  const whatsappHref = phoneHrefToWhatsAppLink(channels.phoneHref);

  return (
    <html
      lang="ru"
      className={`${playfair.variable} ${inter.variable} ${disruptorScript.variable}`}
    >
      <body className="antialiased min-h-screen">
        <TopMailRu />
        <Suspense fallback={null}>
          <TopMailRuPageView />
        </Suspense>
        <AppLoader />
        {children}
        <ContactMessengerFab whatsappHref={whatsappHref} />
      </body>
    </html>
  );
}
