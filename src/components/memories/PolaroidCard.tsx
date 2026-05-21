'use client';

import Image from 'next/image';
import type { MemoriesContent } from '@/types/memories';

interface PolaroidCardProps {
  slide: MemoriesContent['slides'][number];
  isCenter: boolean;
}

export default function PolaroidCard({ slide, isCenter }: PolaroidCardProps) {
  return (
    <div className={`polaroid-card relative ${isCenter ? 'polaroid-card--center' : ''}`}>
      <div className="polaroid-card__image-wrap relative w-full overflow-hidden bg-gray-100">
        <Image
          src={slide.image}
          alt={slide.text}
          fill
          className="object-cover"
          sizes="(max-width: 480px) 92vw, 400px"
          priority={isCenter}
        />
        <div className="polaroid-card__inset-shadow absolute inset-0 pointer-events-none" aria-hidden />
      </div>
      <div className="polaroid-card__caption absolute bottom-4 left-4 right-4 text-center">
        <p className="polaroid-card__text flex items-center justify-center h-full px-2 text-theme-secondary">
          {slide.text}
        </p>
      </div>
    </div>
  );
}
