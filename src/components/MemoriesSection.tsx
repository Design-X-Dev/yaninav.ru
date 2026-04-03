'use client';

import Image from 'next/image';
import { useState, useEffect, useRef } from 'react';
import ColorControlPanel from './ColorControlPanel';

interface MemoriesSectionProps {
  backgroundColor?: string;
  onColorChange?: (color: string) => void;
  headingColor?: string;
  subheadingColor?: string;
  textColor?: string;
  onHeadingColorChange?: (color: string) => void;
  onSubheadingColorChange?: (color: string) => void;
  onTextColorChange?: (color: string) => void;
  showSliderToggle?: boolean; // Показывать ли кнопку переключения слайдера
}

const slides = [
  {
    id: 1,
    image: '/images/001.jpeg',
    text: 'Сохраняем уникальные моменты',
  },
  {
    id: 2,
    image: '/images/002.jpeg',
    text: 'Превращаем эмоции в\u00A0чувства',
  },
  {
    id: 3,
    image: '/images/003.jpeg',
    text: 'Для\u00A0тех, кто верит в\u00A0любовь',
  },
  {
    id: 4,
    image: '/images/004.jpeg',
    text: 'Истинная ценность ювелирных изделий - в\u00A0эмоциональной связи',
  },
  {
    id: 5,
    image: '/images/005.jpeg',
    text: 'Созданы друг для\u00A0друга',
  },
];

const MemoriesSection = ({ 
  backgroundColor = '#f4f7f0', 
  onColorChange,
  headingColor = '#59151f',
  subheadingColor = '#59151f',
  textColor = '#616161',
  onHeadingColorChange,
  onSubheadingColorChange,
  onTextColorChange,
  showSliderToggle = false,
}: MemoriesSectionProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [sliderType, setSliderType] = useState<'carousel' | 'polaroid'>('carousel');
  const [windowWidth, setWindowWidth] = useState(1920);
  const [mounted, setMounted] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isAnimatingRef = useRef(false);

  // Очистка таймеров при размонтировании или изменении слайдера
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [sliderType]);

  // Отслеживание ширины окна и установка mounted
  useEffect(() => {
    if (typeof window === 'undefined') return;

    setMounted(true);
    const updateWindowWidth = () => {
      setWindowWidth(window.innerWidth);
    };

    updateWindowWidth();
    window.addEventListener('resize', updateWindowWidth);
    return () => window.removeEventListener('resize', updateWindowWidth);
  }, []);

  // Автоматическое прокручивание каждые 5 секунд
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Очищаем предыдущий таймер
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }

    // Запускаем автопрокрутку
    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        if (!isAnimatingRef.current) {
          isAnimatingRef.current = true;
          setIsAnimating(true);
          setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
          setTimeout(() => {
            isAnimatingRef.current = false;
            setIsAnimating(false);
          }, 800);
        }
      }, 5000);
    };

    // Запускаем автопрокрутку с небольшой задержкой
    const timeoutId = setTimeout(() => {
      if (!isAnimatingRef.current) {
        startAutoPlay();
      }
    }, 1000);

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      clearTimeout(timeoutId);
    };
  }, [sliderType]); // Зависимость только от типа слайдера

  // Очистка таймеров при размонтировании компонента
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }
    };
  }, []);

  const restartAutoPlay = () => {
    if (typeof window === 'undefined') return;

    // Очищаем предыдущий таймер перезапуска
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    // Перезапускаем автопрокрутку через 5 секунд после завершения анимации
    restartTimeoutRef.current = setTimeout(() => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
        autoPlayRef.current = null;
      }
      if (!isAnimatingRef.current && typeof window !== 'undefined') {
        autoPlayRef.current = setInterval(() => {
          if (!isAnimatingRef.current) {
            isAnimatingRef.current = true;
            setIsAnimating(true);
            setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
            setTimeout(() => {
              isAnimatingRef.current = false;
              setIsAnimating(false);
            }, 800);
          }
        }, 5000);
      }
      restartTimeoutRef.current = null;
    }, 800);
  };

  const nextSlide = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsAnimating(true);
    // Сбрасываем автопрокрутку при ручном управлении
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
    setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      isAnimatingRef.current = false;
      setIsAnimating(false);
      restartAutoPlay();
    }, 800);
  };

  const prevSlide = () => {
    if (isAnimatingRef.current) return;
    isAnimatingRef.current = true;
    setIsAnimating(true);
    // Сбрасываем автопрокрутку при ручном управлении
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
    setCurrentIndex((prevIndex) => (prevIndex - 1 + slides.length) % slides.length);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      isAnimatingRef.current = false;
      setIsAnimating(false);
      restartAutoPlay();
    }, 800);
  };

  // Генерируем случайный поворот для каждого слайда (меняется при перелистывании)
  const getRandomRotation = (index: number) => {
    // Используем комбинацию индекса слайда и текущего индекса для генерации угла
    // При каждом перелистывании (изменении currentIndex) углы будут меняться
    const seed = (index * 17 + currentIndex * 23 + 31) % 100; // Комбинация для разнообразия
    const rotation = ((seed % 7) - 3); // От -3 до 3 градусов
    return rotation;
  };

  const getSlidePosition = (index: number) => {
    const diff = (index - currentIndex + slides.length) % slides.length;
    if (diff === 0) return 'center';
    if (diff === 1) return 'right1';
    if (diff === 2) return 'right2';
    if (diff === slides.length - 1) return 'left1';
    if (diff === slides.length - 2) return 'left2';
    return 'hidden';
  };

  // Позиции для полароидного слайдера (веер)
  const getPolaroidPosition = (index: number) => {
    const diff = index - currentIndex;
    const randomRotation = getRandomRotation(index);

    // Нормализуем diff для циклического массива
    let normalizedDiff = diff;
    if (normalizedDiff > slides.length / 2) {
      normalizedDiff = normalizedDiff - slides.length;
    } else if (normalizedDiff < -slides.length / 2) {
      normalizedDiff = normalizedDiff + slides.length;
    }

    const absNormalizedDiff = Math.abs(normalizedDiff);

    // Адаптивное позиционирование в зависимости от ширины экрана
    // Широкий экран (> 1024px) - фото дальше от центра
    // Узкий экран (< 768px) - фото ближе к центру (как стопка)
    // Используем дефолтное значение до монтирования компонента
    const effectiveWidth = mounted ? windowWidth : 1920;
    const isWideScreen = effectiveWidth > 1024;
    const isNarrowScreen = effectiveWidth < 768;

    // Базовые значения для среднего экрана
    let baseXOffset = 80; // Горизонтальное смещение
    let baseYOffset = 30; // Вертикальное смещение
    let baseRotation = 10; // Угол поворота
    let baseScale = 0.1; // Уменьшение масштаба

    if (isWideScreen) {
      // Широкий экран - разносим дальше
      baseXOffset = Math.min(effectiveWidth * 0.15, 200); // До 15% ширины экрана, максимум 200px
      baseYOffset = 40;
      baseRotation = 12;
      baseScale = 0.12;
    } else if (isNarrowScreen) {
      // Узкий экран - ближе к центру (стопка)
      baseXOffset = 40;
      baseYOffset = 20;
      baseRotation = 6;
      baseScale = 0.08;
    }

    if (normalizedDiff === 0) {
      // Текущий слайд - в центре, сверху (максимальный z-index)
      return {
        zIndex: 30,
        transform: `translateY(0) rotate(${randomRotation}deg) scale(1)`,
        opacity: 1,
        hasShadow: true, // Активная тень для текущего слайда
      };
    } else if (normalizedDiff > 0) {
      // Следующие слайды - справа, ниже, с поворотом (средний z-index)
      const xOffset = absNormalizedDiff * baseXOffset;
      const yOffset = absNormalizedDiff * baseYOffset;
      const rotation = absNormalizedDiff * baseRotation + randomRotation;
      const scale = 1 - absNormalizedDiff * baseScale;

      return {
        zIndex: Math.max(20 - absNormalizedDiff, 15), // От 19 до 15 для следующих слайдов
        transform: `translateY(${yOffset}px) translateX(${xOffset}px) rotate(${rotation}deg) scale(${scale})`,
        opacity: 1,
        hasShadow: false,
      };
    } else {
      // Предыдущие слайды - слева, ниже, с поворотом (минимальный z-index)
      const xOffset = absNormalizedDiff * baseXOffset;
      const yOffset = absNormalizedDiff * baseYOffset;
      const rotation = absNormalizedDiff * baseRotation + randomRotation;
      const scale = 1 - absNormalizedDiff * baseScale;

      return {
        zIndex: Math.max(10 - absNormalizedDiff, 1), // От 9 до 1 для предыдущих слайдов (минимальный)
        transform: `translateY(${yOffset}px) translateX(${-xOffset}px) rotate(${-rotation}deg) scale(${scale})`,
        opacity: 1,
        hasShadow: false,
      };
    }
  };

  return (
    <section className="relative" style={{ backgroundColor }}>
      {(onColorChange || onHeadingColorChange || onSubheadingColorChange || onTextColorChange) && (
        <ColorControlPanel
          sectionId="memories"
          backgroundColor={backgroundColor}
          headingColor={headingColor}
          subheadingColor={subheadingColor}
          textColor={textColor}
          onBackgroundColorChange={onColorChange}
          onHeadingColorChange={onHeadingColorChange}
          onSubheadingColorChange={onSubheadingColorChange}
          onTextColorChange={onTextColorChange}
        />
      )}

      {/* Текстовая секция над слайдером */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 lg:pt-20 pb-8 sm:pb-12">
        <div className="text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-2" style={{ color: headingColor }}>
            Yanina V
          </h2>
          <h3 className="font-display text-[1.5rem] sm:text-[1.8rem] lg:text-[2.1rem] font-medium mb-3" style={{ color: subheadingColor }}>
            Украшения, в которых живут воспоминания
          </h3>
          <p className="text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed" style={{ color: textColor }}>
            Главная цель и задача — сохранить ценные воспоминания и значимые моменты
          </p>
        </div>
      </div>

      {/* Кнопка переключения типа слайдера - только если showSliderToggle=true */}
      {showSliderToggle && (
        <div className="absolute top-4 left-4 z-[100]">
          <button
            onClick={() => setSliderType(sliderType === 'carousel' ? 'polaroid' : 'carousel')}
            className="w-10 h-10 rounded-full bg-white backdrop-blur-sm shadow-xl border-2 border-gray-800 hover:border-gray-900 transition-all duration-300 flex items-center justify-center group"
            title={sliderType === 'carousel' ? 'Переключить на полароидный слайдер' : 'Переключить на карусель'}
          >
            <svg className="w-5 h-5 text-gray-800 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {sliderType === 'carousel' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              )}
            </svg>
          </button>
        </div>
      )}

      {/* Слайдер 1: Карусель воспоминаний */}
      {sliderType === 'carousel' && (
        <div className="relative w-full overflow-hidden">
          <div className="relative h-[700px] flex items-center justify-center">
            {slides.map((slide, index) => {
              const position = getSlidePosition(index);
              if (position === 'hidden') return null;

              const randomRotation = getRandomRotation(index);
              
              // Определяем translate-x, scale, z-index и opacity в зависимости от позиции
              let translateX = '0px';
              let scale = 1;
              let zIndex = 20;
              let opacity = 1;
              let blur = 'blur-0';
              
              if (position === 'center') {
                translateX = '0px';
                scale = 1;
                zIndex = 30;
                opacity = 1;
                blur = 'blur-0';
              } else if (position === 'left1') {
                translateX = '-300px';
                scale = 0.75;
                zIndex = 20;
                opacity = 0.4;
                blur = 'blur-[2px]';
              } else if (position === 'left2') {
                translateX = '-500px';
                scale = 0.5;
                zIndex = 10;
                opacity = 0.2;
                blur = 'blur-[12px]';
              } else if (position === 'right1') {
                translateX = '300px';
                scale = 0.75;
                zIndex = 20;
                opacity = 0.4;
                blur = 'blur-[2px]';
              } else if (position === 'right2') {
                translateX = '500px';
                scale = 0.5;
                zIndex = 10;
                opacity = 0.2;
                blur = 'blur-[12px]';
              }
              
              return (
                <div
                  key={slide.id}
                  className={`absolute transition-all duration-700 ${blur}`}
                  style={{
                    transition: 'all 0.7s cubic-bezier(0.4, 0, 0.2, 1)',
                    transform: `translateX(${translateX}) rotate(${randomRotation}deg) scale(${scale})`,
                    zIndex,
                    opacity,
                  }}
                >
                  {/* Полароидная рамка */}
                  <div
                    className="relative"
                    style={{
                      width: '400px',
                      padding: '12px 12px 130px 12px',
                      backgroundColor: '#ffffff',
                      backgroundImage: 'url(/images/texture.jpg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      borderRadius: '8px',
                      boxShadow: position === 'center' ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      transition: 'box-shadow 0.7s ease-out',
                    }}
                  >
                    {/* Изображение */}
                    <div className="relative w-full h-[400px] overflow-hidden bg-gray-100" style={{ borderRadius: '4px' }}>
                      <Image
                        src={slide.image}
                        alt={slide.text}
                        fill
                        className="object-cover"
                        sizes="400px"
                        priority={position === 'center'}
                      />
                      {/* Overlay для внутренней тени */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.11), inset 0 -2px 8px rgba(0, 0, 0, 0.09), inset 2px 0 6px rgba(0, 0, 0, 0.08), inset -2px 0 6px rgba(0, 0, 0, 0.08)',
                        }}
                      />
                    </div>
                    {/* Текст внизу полароида */}
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
                </div>
              );
            })}
          </div>

          {/* Кнопки навигации */}
          <button
            onClick={prevSlide}
            disabled={isAnimating}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor, color: textColor, borderColor: headingColor, borderWidth: '1px', borderStyle: 'solid' }}
            aria-label="Предыдущий слайд"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            disabled={isAnimating}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor, color: textColor, borderColor: headingColor, borderWidth: '1px', borderStyle: 'solid' }}
            aria-label="Следующий слайд"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}

      {/* Слайдер 2: Полароидная галерея */}
      {sliderType === 'polaroid' && mounted && (
        <div className="relative w-full overflow-hidden">
          <div className="relative h-[700px] flex items-center justify-center">
            {slides.map((slide, index) => {
              const position = getPolaroidPosition(index);
              if (position.opacity <= 0) return null;

              return (
                <div
                  key={slide.id}
                  className="absolute"
                  style={{
                    zIndex: position.zIndex,
                    transform: position.transform,
                    opacity: position.opacity,
                    transformOrigin: 'center center',
                    willChange: 'transform, opacity',
                    transition: 'transform 0.8s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.8s ease-out, z-index 0s linear 0.4s',
                  }}
                >
                  {/* Полароидная рамка */}
                  <div
                    className="relative"
                    style={{
                      width: '400px',
                      padding: '12px 12px 130px 12px', // Padding снизу 180px
                      backgroundColor: '#ffffff',
                      backgroundImage: 'url(/images/texture.jpg)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      backgroundRepeat: 'no-repeat',
                      borderRadius: '8px',
                      boxShadow: position.hasShadow ? '0 25px 50px -12px rgba(0, 0, 0, 0.5)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      transition: 'box-shadow 0.8s ease-out',
                    }}
                  >
                    {/* Изображение */}
                    <div className="relative w-full h-[400px] overflow-hidden bg-gray-100" style={{ borderRadius: '4px' }}>
                      <Image
                        src={slide.image}
                        alt={slide.text}
                        fill
                        className="object-cover"
                        priority={index === currentIndex}
                      />
                      {/* Overlay для внутренней тени */}
                      <div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          boxShadow: 'inset 0 2px 8px rgba(0, 0, 0, 0.11), inset 0 -2px 8px rgba(0, 0, 0, 0.09), inset 2px 0 6px rgba(0, 0, 0, 0.08), inset -2px 0 6px rgba(0, 0, 0, 0.08)',
                        }}
                      />
                    </div>
                    {/* Текст внизу полароида (большая нижняя часть) */}
                    <div className="absolute bottom-4 left-4 right-4 text-center" style={{ height: '100px' }}> {/* Увеличили высоту блока для текста (было 120px, теперь 140px) */}
                      <p
                        className="flex items-center justify-center h-full px-2"
                        style={{
                          color: textColor, // Основной текст
                          fontFamily: 'var(--font-disruptor-script), cursive',
                          fontSize: '3.645rem', // Уменьшили еще на 10% (было 4.05rem, теперь 3.645rem)
                          lineHeight: '0.4', // Уменьшили межстрочное расстояние в 3 раза (было leading-tight ~1.25, теперь ~0.4)
                          transform: 'rotate(-3deg)', // Поворот против часовой стрелки на 10 градусов
                        }}
                      >
                        {slide.text}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Кнопки навигации */}
          <button
            onClick={prevSlide}
            disabled={isAnimating}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor, color: textColor, borderColor: headingColor, borderWidth: '1px', borderStyle: 'solid' }}
            aria-label="Предыдущий слайд"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            disabled={isAnimating}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor, color: textColor, borderColor: headingColor, borderWidth: '1px', borderStyle: 'solid' }}
            aria-label="Следующий слайд"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
};

export default MemoriesSection;
