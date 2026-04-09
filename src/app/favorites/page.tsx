'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ProductCard } from '@/components/Catalog';
import { useFavoriteIds } from '@/hooks/useFavoriteIds';
import { getAllProducts } from '@/utils/products';
import { SECTIONS } from '@/utils/theme';

const { bg, heading, text } = SECTIONS.hero;

export default function FavoritesPage() {
  const favoriteIds = useFavoriteIds();

  const products = useMemo(() => {
    const idSet = new Set(favoriteIds);
    return getAllProducts().filter((p) => idSet.has(p.id));
  }, [favoriteIds]);

  return (
    <main>
      <Header sectionColor={bg} />
      <section className="pt-8 pb-20 px-4 sm:px-6 lg:px-8 min-h-[50vh]" style={{ backgroundColor: bg }}>
        <div className="max-w-7xl mx-auto">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4 text-center" style={{ color: heading }}>
            Избранное
          </h1>
          <p className="text-lg max-w-2xl mx-auto text-center mb-12" style={{ color: text }}>
            Сохранённые украшения
          </p>

          {products.length === 0 ? (
            <div className="flex flex-col items-center py-16">
              <p className="mb-6 text-center max-w-md" style={{ color: text }}>
                Пока нет товаров в избранном. Загляните в коллекцию и выберите понравившиеся модели.
              </p>
              <Link
                href="/collection"
                className="inline-block px-8 py-3 rounded-full font-medium transition-all duration-300 hover:opacity-90"
                style={{ backgroundColor: heading, color: bg }}
              >
                В коллекцию
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 items-stretch">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  backgroundColor={bg}
                  headingColor={heading}
                  textColor={text}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}
