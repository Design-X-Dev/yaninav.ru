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
      className="loader-root fixed inset-0 z-[9999] flex flex-col items-center justify-center min-h-screen w-full pb-[50vh]"
      style={{
        height: '150dvh',
        minHeight: '-webkit-fill-available',
        top: 0,
        bottom: '-50vh',
        backgroundColor: '#ffffff',
        opacity: isVisible ? 1 : 0,
        transition: 'opacity 300ms ease-out',
        pointerEvents: isVisible ? 'auto' : 'none',
      }}
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

      <style jsx>{`
        .loader-title-top,
        .loader-title-bottom {
          font-size: clamp(2.5rem, 8vw, 5rem);
        }

        .loader-mid-label {
          font-size: clamp(0.6rem, 1.5vw, 0.85rem);
          letter-spacing: 0.25em;
          opacity: 0;
          animation: loader-mid-fade 0.3s ease-out 0.35s forwards;
        }

        .loader-arm {
          display: flex;
          align-items: center;
          flex: 1;
          min-width: 0;
          gap: 6px;
        }

        .loader-dot {
          width: 4px;
          height: 4px;
          flex-shrink: 0;
          border-radius: 50%;
          background-color: var(--text-secondary);
          opacity: 0;
          animation: loader-dot-in 0.2s ease-out 0.52s forwards;
        }

        .loader-line {
          flex: 1;
          min-width: 0;
          height: 1px;
          background-color: var(--text-secondary);
          transform: scaleX(0);
        }

        .loader-line-left {
          transform-origin: right center;
          animation: loader-line-grow 0.5s ease-out 0.1s forwards;
        }

        .loader-line-right {
          transform-origin: left center;
          animation: loader-line-grow 0.5s ease-out 0.1s forwards;
        }

        @keyframes loader-dot-in {
          to { opacity: 1; }
        }

        .loader-title-top {
          opacity: 0;
          animation: loader-reveal-up 0.4s ease-out 0.5s forwards;
        }

        .loader-title-bottom {
          opacity: 0;
          animation: loader-reveal-up 0.4s ease-out 0.65s forwards;
        }

        @keyframes loader-line-grow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }

        @keyframes loader-mid-fade {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes loader-reveal-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
