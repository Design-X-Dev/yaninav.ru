'use client';

import type { MemoriesContent } from '@/types/memories';
import MemoriesCarousel from './memories/MemoriesCarousel';

interface MemoriesSectionProps {
  memories: MemoriesContent;
}

export default function MemoriesSection({ memories }: MemoriesSectionProps) {
  return (
    <section id="memories" className="relative scroll-mt-28 bg-theme">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-12">
        <div className="text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-2 text-accent-primary">
            {memories.heading}
          </h2>
          <h3 className="font-display text-[1.5rem] sm:text-[1.8rem] lg:text-[2.1rem] font-medium mb-3 text-accent-primary">
            {memories.subheading}
          </h3>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed text-theme-secondary">
            {memories.description}
          </p>
        </div>
      </div>

      <MemoriesCarousel slides={memories.slides} />
    </section>
  );
}
