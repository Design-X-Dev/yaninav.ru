'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import { SECTIONS } from '@/utils/theme';

const slides = [
  { id: 1, image: '/images/001.jpeg', text: 'Сохраняем уникальные моменты' },
  { id: 2, image: '/images/002.jpeg', text: 'Превращаем эмоции в\u00A0чувства' },
  { id: 3, image: '/images/003.jpeg', text: 'Для\u00A0тех, кто верит в\u00A0любовь' },
  { id: 4, image: '/images/004.jpeg', text: 'Истинная ценность ювелирных изделий - в\u00A0эмоциональной связи' },
  { id: 5, image: '/images/005.jpeg', text: 'Созданы друг для\u00A0друга' },
] as const;

const ANIM_MS = 800;
const AUTO_PLAY_MS = 5000;

/** Угол поворота полароида зависит от индекса слайда и текущей позиции */
function getSlideRotation(index: number, currentIndex: number): number {
  const seed = (index * 17 + currentIndex * 23 + 31) % 100;
  return (seed % 7) - 3; // от -3 до 3 градусов
}

interface PolaroidCardProps {
  slide: typeof slides[number];
  isCenter: boolean;
  textColor: string;
}

function PolaroidCard({ slide, isCenter, textColor }: PolaroidCardProps) {
  return (
    <div
      className="relative"
      style={{
        width: '400px',
        padding: '12px 12px 130px 12px',
        backgroundColor: '#ffffff',
        backgroundImage: 'url(/images/texture.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: '8px',
        boxShadow: isCenter
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.7s ease-out',
      }}
    >
      <div className="relative w-full h-[400px] overflow-hidden bg-gray-100" style={{ borderRadius: '4px' }}>
        <Image
          src={slide.image}
          alt={slide.text}
          fill
          className="object-cover"
          sizes="400px"
          priority={isCenter}
        />
        {/* Внутренняя тень */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden
          style={{
            boxShadow:
              'inset 0 2px 8px rgba(0,0,0,0.11), inset 0 -2px 8px rgba(0,0,0,0.09), inset 2px 0 6px rgba(0,0,0,0.08), inset -2px 0 6px rgba(0,0,0,0.08)',
          }}
        />
      </div>
      <div className="absolute bottom-4 left-4 right-4 text-center" style={{ height: '100px' }}>
        <p
          className="flex items-center justify-center h-full px-2"
          style={{
            color: textColor,
            fontFamily: 'var(--font-disruptor-script), cursive',
            fontSize: '3.645rem',
            lineHeight: '0.4',
            transform: 'rotate(-3deg)',
          }}
        >
          {slide.text}
        </p>
      </div>
    </div>
  );
}

interface SlideNavArrowsProps {
  onPrev: () => void;
  onNext: () => void;
  disabled: boolean;
  backgroundColor: string;
  headingColor: string;
  textColor: string;
}

function SlideNavArrows({ onPrev, onNext, disabled, backgroundColor, headingColor, textColor }: SlideNavArrowsProps) {
  const btnCls =
    'absolute top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed';
  const btnStyle = { backgroundColor, color: textColor, borderColor: headingColor, borderWidth: '1px', borderStyle: 'solid' };
  return (
    <>
      <button onClick={onPrev} disabled={disabled} className={`${btnCls} left-4`} style={btnStyle} aria-label="Предыдущий слайд">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button onClick={onNext} disabled={disabled} className={`${btnCls} right-4`} style={btnStyle} aria-label="Следующий слайд">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7" />
        </svg>
      </button>
    </>
  );
}

const MemoriesSection = () => {
  const { bg: backgroundColor, heading: headingColor, subheading: subheadingColor, text: textColor } = SECTIONS.memories;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sliderType] = useState<'carousel' | 'polaroid'>('carousel');
  const [windowWidth, setWindowWidth] = useState(1920);
  const [mounted, setMounted] = useState(false);

  const isAnimatingRef = useRef(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Ширина окна
  useEffect(() => {
    if (typeof window === 'undefined') return;
    setMounted(true);
    const update = () => setWindowWidth(window.innerWidth);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Автопрокрутка
  useEffect(() => {
    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;
        setIsAnimating(true);
        setCurrentIndex((i) => (i + 1) % slides.length);
        animTimerRef.current = setTimeout(() => {
          isAnimatingRef.current = false;
          setIsAnimating(false);
          animTimerRef.current = null;
        }, ANIM_MS);
      }, AUTO_PLAY_MS);
    };

    const initTimer = setTimeout(startAutoPlay, 1000);

    return () => {
      clearTimeout(initTimer);
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
    };
  }, [sliderType]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    };
  }, []);

  const stopAndRestartAutoPlay = () => {
    if (autoPlayRef.current) { clearInterval(autoPlayRef.current); autoPlayRef.current = null; }
    if (restartTimerRef.current) { clearTimeout(restartTimerRef.current); restartTimerRef.current = null; }

    restartTimerRef.current = setTimeout(() => {
      if (isAnimatingRef.current) return;
      autoPlayRef.current = setInterval(() => {
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;
        setIsAnimating(true);
        setCurrentIndex((i) => (i + 1) % slides.length);
        animTimerRef.current = setTimeout(() => {
          isAnimatingRef.current = false;
          setIsAnimating(false);
        }, ANIM_MS);
      }, AUTO_PLAY_MS);
      restartTimerRef.current = null;
    }, ANIM_MS + 200);
  };

  const navigate = (dir: 1 | -1) => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsAnimating(true);
    setCurrentIndex((i) => (i + dir + slides.length) % slides.length);
    if (animTimerRef.current) clearTimeout(animTimerRef.current);
    animTimerRef.current = setTimeout(() => {
      isAnimatingRef.current = false;
      setIsAnimating(false);
      stopAndRestartAutoPlay();
    }, ANIM_MS);
  };

  // Carousel positions
  const getSlidePosition = (index: number) => {
    const diff = (index - currentIndex + slides.length) % slides.length;
    if (diff === 0) return 'center';
    if (diff === 1) return 'right1';
    if (diff === 2) return 'right2';
    if (diff === slides.length - 1) return 'left1';
    if (diff === slides.length - 2) return 'left2';
    return 'hidden';
  };

  // Polaroid fan positions
  const getPolaroidPosition = (index: number) => {
    const effectiveWidth = mounted ? windowWidth : 1920;
    const isWide = effectiveWidth > 1024;
    const isNarrow = effectiveWidth < 768;
    let baseX = 80, baseY = 30, baseRot = 10, baseScale = 0.1;
    if (isWide)   { baseX = Math.min(effectiveWidth * 0.15, 200); baseY = 40; baseRot = 12; baseScale = 0.12; }
    if (isNarrow) { baseX = 40; baseY = 20; baseRot = 6; baseScale = 0.08; }

    let diff = index - currentIndex;
    if (diff > slides.length / 2)  diff -= slides.length;
    if (diff < -slides.length / 2) diff += slides.length;
    const abs = Math.abs(diff);
    const rot = getSlideRotation(index, currentIndex);

    if (diff === 0) return { zIndex: 30, transform: `translateY(0) rotate(${rot}deg) scale(1)`, opacity: 1, hasShadow: true };
    const x = abs * baseX, y = abs * baseY, r = abs * baseRot + rot, s = 1 - abs * baseScale;
    const sign = diff > 0 ? 1 : -1;
    return {
      zIndex: diff > 0 ? Math.max(20 - abs, 15) : Math.max(10 - abs, 1),
      transform: `translateY(${y}px) translateX(${sign * x}px) rotate(${sign * r}deg) scale(${s})`,
      opacity: 1,
      hasShadow: false,
    };
  };

  return (
    <section id="memories" className="relative scroll-mt-28" style={{ backgroundColor }}>
      {/* Текст над слайдером */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-12">
        <div className="text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-2" style={{ color: headingColor }}>
            ЯНИНА В
          </h2>
          <h3
            className="font-display text-[1.5rem] sm:text-[1.8rem] lg:text-[2.1rem] font-medium mb-3"
            style={{ color: subheadingColor }}
          >
            Украшения, в которых живут воспоминания
          </h3>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: textColor }}>
            Главная цель и задача — сохранить ценные воспоминания и значимые моменты
          </p>
        </div>
      </div>

      {/* Слайдер: карусель */}
      {sliderType === 'carousel' && (
        <div className="relative w-full overflow-hidden">
          <div className="relative h-[700px] flex items-center justify-center">
            {slides.map((slide, index) => {
              const position = getSlidePosition(index);
              if (position === 'hidden') return null;
              const rot = getSlideRotation(index, currentIndex);
              const posMap: Record<string, { tx: string; scale: number; zIndex: number; opacity: number; blur: string }> = {
                center: { tx: '0px',    scale: 1,    zIndex: 30, opacity: 1,   blur: '' },
                left1:  { tx: '-300px', scale: 0.75, zIndex: 20, opacity: 0.4, blur: 'blur-[2px]' },
                left2:  { tx: '-500px', scale: 0.5,  zIndex: 10, opacity: 0.2, blur: 'blur-[12px]' },
                right1: { tx: '300px',  scale: 0.75, zIndex: 20, opacity: 0.4, blur: 'blur-[2px]' },
                right2: { tx: '500px',  scale: 0.5,  zIndex: 10, opacity: 0.2, blur: 'blur-[12px]' },
              };
              const p = posMap[position];
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
                  <PolaroidCard slide={slide} isCenter={position === 'center'} textColor={textColor} />
                </div>
              );
            })}
          </div>
          <SlideNavArrows
            onPrev={() => navigate(-1)}
            onNext={() => navigate(1)}
            disabled={isAnimating}
            backgroundColor={backgroundColor}
            headingColor={headingColor}
            textColor={textColor}
          />
        </div>
      )}

      {/* Слайдер: полароидный веер */}
      {sliderType === 'polaroid' && mounted && (
        <div className="relative w-full overflow-hidden">
          <div className="relative h-[700px] flex items-center justify-center">
            {slides.map((slide, index) => {
              const pos = getPolaroidPosition(index);
              if (pos.opacity <= 0) return null;
              return (
                <div
                  key={slide.id}
                  className="absolute"
                  style={{
                    zIndex: pos.zIndex,
                    transform: pos.transform,
                    opacity: pos.opacity,
                    transformOrigin: 'center center',
                    willChange: 'transform, opacity',
                    transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease-out, z-index 0s linear 0.4s',
                  }}
                >
                  <PolaroidCard slide={slide} isCenter={pos.hasShadow} textColor={textColor} />
                </div>
              );
            })}
          </div>
          <SlideNavArrows
            onPrev={() => navigate(-1)}
            onNext={() => navigate(1)}
            disabled={isAnimating}
            backgroundColor={backgroundColor}
            headingColor={headingColor}
            textColor={textColor}
          />
        </div>
      )}
    </section>
  );
};

export default MemoriesSection;
