'use client';

import { useEffect, useRef, useState } from 'react';

interface LoaderProps {
  onLoadComplete: () => void;
}

const Loader = ({ onLoadComplete }: LoaderProps) => {
  const [isVisible, setIsVisible] = useState(true);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadTime = 1400;
    const startTime = Date.now();

    const finish = () => {
      const remaining = Math.max(0, loadTime - (Date.now() - startTime));
      const t1 = setTimeout(() => {
        if (!isMountedRef.current) return;
        setIsVisible(false);
        const t2 = setTimeout(() => {
          if (!isMountedRef.current) return;
          onLoadComplete();
        }, 300);
        return () => clearTimeout(t2);
      }, remaining);
      return t1;
    };

    let t1: ReturnType<typeof setTimeout>;
    const video = document.querySelector('video');
    if (video) {
      if (video.readyState >= 3) {
        t1 = finish();
      } else {
        video.addEventListener('canplaythrough', () => { t1 = finish(); }, { once: true });
      }
    } else {
      t1 = finish();
    }

    const fallback = setTimeout(() => { if (isMountedRef.current) { t1 = finish(); } }, 2000);

    return () => {
      clearTimeout(t1);
      clearTimeout(fallback);
    };
  }, [onLoadComplete]);

  return (
    <div
      className="loader-overlay flex flex-col items-center justify-center min-h-screen w-full pb-[50vh]"
      data-visible={isVisible}
    >
      <div className="loader-brand flex flex-col items-center justify-center gap-4 px-6">
        <div className="loader-title-top font-display text-theme-secondary text-center leading-none tracking-wide">
          ЯНИНА В
        </div>

        <div className="loader-separator flex items-center w-full max-w-[min(90vw,28rem)] gap-3 sm:gap-4">
          <div className="loader-arm">
            <span className="loader-dot" aria-hidden />
            <span className="loader-line loader-line-left" aria-hidden />
          </div>
          <span className="loader-mid-label font-display text-theme-secondary text-center uppercase whitespace-nowrap">
            ЮВЕЛИРНАЯ СТУДИЯ
          </span>
          <div className="loader-arm">
            <span className="loader-line loader-line-right" aria-hidden />
            <span className="loader-dot" aria-hidden />
          </div>
        </div>

        <div className="loader-title-bottom -mt-2 font-display text-theme-secondary text-center leading-none tracking-wide">
          YANINA V
        </div>
      </div>
    </div>
  );
};

export default Loader;
