'use client';

interface CategoryFilterPillsProps {
  categories: { id: string; name: string }[];
  activeCategory: string;
  onChange: (id: string) => void;
}

export default function CategoryFilterPills({
  categories,
  activeCategory,
  onChange,
}: CategoryFilterPillsProps) {
  return (
    <div className="mb-12 flex flex-nowrap items-center justify-center gap-4 overflow-x-auto overflow-y-hidden py-1 scroll-smooth touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((category) => {
        const isActive = activeCategory === category.id;
        return (
          <button
            key={category.id}
            type="button"
            onClick={() => onChange(category.id)}
            className="catalog-pill shrink-0 whitespace-nowrap px-6 py-3 rounded-full font-medium transition-all duration-300 shadow-luxury border"
            aria-pressed={isActive}
          >
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
