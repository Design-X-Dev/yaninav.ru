'use client';

import { useEffect, useState } from 'react';
import Logo from './Logo';

interface LoaderProps {
  onLoadComplete: () => void;
}

const Loader = ({ onLoadComplete }: LoaderProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Время показа лоадера - 1.4 секунды
    const loadTime = 1400;
    const startTime = Date.now();

    const checkLoadComplete = () => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, loadTime - elapsed);

      setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => {
          onLoadComplete();
        }, 300); // Анимация исчезновения
      }, remainingTime);
    };

    // Проверяем загрузку видео
    const video = document.querySelector('video');
    if (video) {
      const handleVideoLoad = () => {
        checkLoadComplete();
      };

      if (video.readyState >= 3) { // HAVE_FUTURE_DATA
        checkLoadComplete();
      } else {
        video.addEventListener('canplaythrough', handleVideoLoad, { once: true });
      }
    } else {
      // Если видео нет, просто ждем минимальное время
      checkLoadComplete();
    }

    // Fallback - максимум 2 секунды
    const fallbackTimeout = setTimeout(() => {
      checkLoadComplete();
    }, 2000);

    return () => {
      clearTimeout(fallbackTimeout);
    };
  }, [onLoadComplete]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-white z-[9999] flex flex-col items-center justify-center min-h-screen w-full pb-[50vh]" style={{ height: '150dvh', minHeight: '-webkit-fill-available', top: 0, bottom: '-50vh' }}>
      <div style={{ height: '80px', width: '98.24px', flexShrink: 0 }} className="mb-8">
        <Logo
          fillColor="#000000"
          height={75}
        />
      </div>

      {/* Text under logo */}
      <p className="text-black font-display tracking-wide mb-8 whitespace-nowrap" style={{ fontSize: '1.35rem' }}>
        YANINA V – JEWELRY STUDIO
      </p>

      {/* Progress Bar */}
      <div className="w-60 h-1 bg-gray-200 rounded-full overflow-hidden">
        <div className="h-full bg-black rounded-full animate-pulse" style={{
          animation: 'loading 2s ease-in-out infinite'
        }}></div>
      </div>

      <style jsx>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default Loader;
