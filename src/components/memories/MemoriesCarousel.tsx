'use client';

import type { MemoriesContent } from '@/types/memories';
import { useMemoriesAutoplay } from '@/hooks/useMemoriesAutoplay';
import PolaroidCard from './PolaroidCard';
import SlideNavArrows from './SlideNavArrows';

/** Угол поворота полароида зависит от индекса слайда и текущей позиции */
function getSlideRotation(index: number, currentIndex: number): number {
  const seed = (index * 17 + currentIndex * 23 + 31) % 100;
  return (seed % 7) - 3;
}

function getSlidePosition(index: number, currentIndex: number, slidesLength: number) {
  const diff = (index - currentIndex + slidesLength) % slidesLength;
  if (diff === 0) return 'center';
  if (diff === 1) return 'right1';
  if (diff === 2) return 'right2';
  if (diff === slidesLength - 1) return 'left1';
  if (diff === slidesLength - 2) return 'left2';
  return 'hidden';
}

const POS_MAP: Record<string, { tx: string; scale: number; zIndex: number; opacity: number; blur: string }> = {
  center: { tx: '0px', scale: 1, zIndex: 30, opacity: 1, blur: '' },
  left1: { tx: '-300px', scale: 0.75, zIndex: 20, opacity: 0.4, blur: 'blur-[2px]' },
  left2: { tx: '-500px', scale: 0.5, zIndex: 10, opacity: 0.2, blur: 'blur-[12px]' },
  right1: { tx: '300px', scale: 0.75, zIndex: 20, opacity: 0.4, blur: 'blur-[2px]' },
  right2: { tx: '500px', scale: 0.5, zIndex: 10, opacity: 0.2, blur: 'blur-[12px]' },
};

interface MemoriesCarouselProps {
  slides: MemoriesContent['slides'];
}

export default function MemoriesCarousel({ slides }: MemoriesCarouselProps) {
  const { currentIndex, isAnimating, navigate } = useMemoriesAutoplay(slides.length);

  return (
    <div className="relative w-full overflow-hidden">
      <div className="relative h-[700px] flex items-center justify-center">
        {slides.map((slide, index) => {
          const position = getSlidePosition(index, currentIndex, slides.length);
          if (position === 'hidden') return null;
          const rot = getSlideRotation(index, currentIndex);
          const p = POS_MAP[position];
          return (
            <div
              key={slide.id}
              className={`absolute ${p.blur}`}
              style={{
                transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: `translateX(${p.tx}) rotate(${rot}deg) scale(${p.scale})`,
                zIndex: p.zIndex,
                opacity: p.opacity,
              }}
            >
              <PolaroidCard slide={slide} isCenter={position === 'center'} />
            </div>
          );
        })}
      </div>
      <SlideNavArrows
        onPrev={() => navigate(-1)}
        onNext={() => navigate(1)}
        disabled={isAnimating}
      />
    </div>
  );
}
