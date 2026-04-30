'use client';

import { useState, useEffect, useRef } from 'react';
import { SECTIONS } from '@/utils/theme';

const Hero = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const tryPlay = () => {
      if (process.env.NODE_ENV === 'development') {
        video.play().catch((err) => console.warn('[Hero] video.play():', err));
      } else {
        video.play().catch(() => {});
      }
    };

    if (isVideoPlaying) {
      if (video.readyState >= 3) {
        tryPlay();
      } else {
        video.addEventListener('canplaythrough', tryPlay, { once: true });
      }
    } else {
      video.pause();
    }
  }, [isVideoPlaying]);

  const { bg } = SECTIONS.hero;

  return (
    <section
      id="hero"
      className="relative w-full h-screen min-h-screen overflow-hidden z-10 scroll-mt-28"
      style={{ backgroundColor: bg }}
      suppressHydrationWarning
    >
      <div className="w-full h-full relative">
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            className="w-full h-full object-cover object-center"
            poster="/videos/jewelry-hero.png"
            autoPlay
            muted
            loop
            playsInline
            controls={false}
            preload="auto"
          >
            <source src="/videos/jewelry-hero.mp4" type="video/mp4" />
            <source src="/videos/jewelry-hero.webm" type="video/webm" />
            Ваш браузер не поддерживает видео.
          </video>

          <div className="absolute inset-0 bg-black/20" />

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
