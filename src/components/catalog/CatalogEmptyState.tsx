'use client';

export default function CatalogEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <h3 className="font-display text-2xl md:text-3xl font-semibold mb-3 text-accent-primary">
        Товары не найдены
      </h3>
      <p className="text-lg max-w-md text-center text-theme-secondary">
        В данной категории пока нет товаров.
      </p>
    </div>
  );
}
