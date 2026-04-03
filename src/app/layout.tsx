import type { Metadata } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import AppLoader from "@/components/AppLoader";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const disruptorScript = localFont({
  src: "../fonts/DisruptorScript.otf",
  variable: "--font-disruptor-script",
  display: "swap",
});

export const metadata: Metadata = {
  title: "YANINA V - Ювелирная студия | Эксклюзивные украшения",
  description: "Ювелирная студия YANINA V - помолвочные и обручальные кольца, эксклюзивные украшения ручной работы. Индивидуальный подход к каждому клиенту.",
  keywords: "ювелирная студия, помолвочные кольца, обручальные кольца, эксклюзивные украшения, ювелирные изделия на заказ",
  openGraph: {
    title: "YANINA V - Ювелирная студия",
    description: "Эксклюзивные украшения ручной работы",
    type: "website",
    locale: "ru_RU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${playfair.variable} ${inter.variable} ${disruptorScript.variable} antialiased`}
      >
        <AppLoader />
        {children}
      </body>
    </html>
  );
}
