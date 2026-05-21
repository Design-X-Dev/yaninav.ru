'use client';

interface SlideNavArrowsProps {
  onPrev: () => void;
  onNext: () => void;
  disabled: boolean;
}

export default function SlideNavArrows({ onPrev, onNext, disabled }: SlideNavArrowsProps) {
  const btnCls =
    'memories-nav-btn absolute top-1/2 -translate-y-1/2 z-30 w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed';
  return (
    <>
      <button onClick={onPrev} disabled={disabled} className={`${btnCls} left-4`} aria-label="Предыдущий слайд">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <button onClick={onNext} disabled={disabled} className={`${btnCls} right-4`} aria-label="Следующий слайд">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </>
  );
}
