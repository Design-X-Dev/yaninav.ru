'use client';

import { useState, useEffect, useRef } from 'react';
import ColorControlPanel from './ColorControlPanel';

interface HeroProps {
  backgroundColor?: string;
  onColorChange?: (color: string) => void;
}

const Hero = ({ backgroundColor = '#f4f7f0', onColorChange }: HeroProps) => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [heroHeight, setHeroHeight] = useState('100vh');
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Управление воспроизведением видео
    if (videoRef.current) {
      if (isVideoPlaying) {
        videoRef.current.play().catch(console.error);
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVideoPlaying]);

  useEffect(() => {
    // Автоматический запуск видео после монтирования
    const video = videoRef.current;
    if (video) {
      const handleVideoLoad = () => {
        video.play().catch(console.error);
      };

      if (video.readyState >= 3) {
        video.play().catch(console.error);
      } else {
        video.addEventListener('canplaythrough', handleVideoLoad, { once: true });
      }
    }
  }, []);

  useEffect(() => {
    // Вычисляем высоту Hero как viewport минус высота Header
    const updateHeroHeight = () => {
      if (typeof window === 'undefined') return;

      const header = document.querySelector('header');
      if (header) {
        const headerHeight = header.offsetHeight;
        setHeroHeight(`calc(100vh - ${headerHeight}px)`);
      }
    };

    // Обновляем при монтировании
    updateHeroHeight();

    // Обновляем при изменении размера окна
    window.addEventListener('resize', updateHeroHeight);

    // Обновляем при изменении видимости (для мобильного меню)
    const observer = new MutationObserver(updateHeroHeight);
    const header = document.querySelector('header');
    if (header) {
      observer.observe(header, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['class', 'style']
      });
    }

    return () => {
      window.removeEventListener('resize', updateHeroHeight);
      observer.disconnect();
    };
  }, []);

  return (
    <section
      className="relative w-full overflow-hidden z-10"
      style={{
        backgroundColor,
        height: heroHeight,
        minHeight: heroHeight
      }}
      suppressHydrationWarning
    >
      {onColorChange && (
        <ColorControlPanel
          sectionId="hero"
          backgroundColor={backgroundColor}
          headingColor="#59151f"
          subheadingColor="#59151f"
          textColor="#616161"
          onBackgroundColorChange={onColorChange}
        />
      )}
      {/* Video Background - full width and height */}
      <div className="w-full h-full relative">
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            className="w-full h-full"
            poster="/videos/jewelry-hero.png"
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            preload="auto"
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center'
            }}
          >
            <source src="/videos/jewelry-hero.mp4" type="video/mp4" />
            <source src="/videos/jewelry-hero.webm" type="video/webm" />
            Ваш браузер не поддерживает видео.
          </video>

          {/* Video Overlay */}
          <div className="absolute inset-0 bg-black/20"></div>

          {/* Control Button - Bottom Right Corner of Video */}
          {isVideoPlaying ? (
            <button
              onClick={() => setIsVideoPlaying(false)}
              className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-all duration-300 transform hover:scale-110 border border-white/40 z-10"
              title="Остановить видео"
            >
              <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
              </svg>
            </button>
          ) : (
            <>
              {/* Play Button - Center */}
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="text-center">
                  <button
                    onClick={() => setIsVideoPlaying(true)}
                    className="w-24 h-24 sm:w-28 sm:h-28 mx-auto mb-6 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all duration-300 transform hover:scale-110 border-2 border-white/30"
                  >
                    <svg className="w-12 h-12 sm:w-14 sm:h-14 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </button>
                  <p className="text-white font-display text-xl sm:text-2xl drop-shadow-md">Смотреть видео</p>
                </div>
              </div>
              {/* Pause Button - Bottom Right Corner */}
              <button
                onClick={() => setIsVideoPlaying(true)}
                className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm flex items-center justify-center hover:bg-black/80 transition-all duration-300 transform hover:scale-110 border border-white/40 z-10"
                title="Воспроизвести видео"
              >
                <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};

export default Hero; 