'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

const ANIM_MS = 800;
const AUTO_PLAY_MS = 5000;

export function useMemoriesAutoplay(slidesCount: number) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const isAnimatingRef = useRef(false);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const animTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const restartTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const stopAndRestartAutoPlay = useCallback(() => {
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current);
      autoPlayRef.current = null;
    }
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current);
      restartTimerRef.current = null;
    }

    restartTimerRef.current = setTimeout(() => {
      if (isAnimatingRef.current) return;
      autoPlayRef.current = setInterval(() => {
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;
        setIsAnimating(true);
        setCurrentIndex((i) => (i + 1) % slidesCount);
        animTimerRef.current = setTimeout(() => {
          isAnimatingRef.current = false;
          setIsAnimating(false);
        }, ANIM_MS);
      }, AUTO_PLAY_MS);
      restartTimerRef.current = null;
    }, ANIM_MS + 200);
  }, [slidesCount]);

  useEffect(() => {
    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        if (isAnimatingRef.current) return;
        isAnimatingRef.current = true;
        setIsAnimating(true);
        setCurrentIndex((i) => (i + 1) % slidesCount);
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
  }, [slidesCount]);

  useEffect(() => {
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
      if (restartTimerRef.current) clearTimeout(restartTimerRef.current);
    };
  }, []);

  const navigate = useCallback(
    (dir: 1 | -1) => {
      if (isAnimatingRef.current) return;
      isAnimatingRef.current = true;
      setIsAnimating(true);
      setCurrentIndex((i) => (i + dir + slidesCount) % slidesCount);
      if (animTimerRef.current) clearTimeout(animTimerRef.current);
      animTimerRef.current = setTimeout(() => {
        isAnimatingRef.current = false;
        setIsAnimating(false);
        stopAndRestartAutoPlay();
      }, ANIM_MS);
    },
    [slidesCount, stopAndRestartAutoPlay],
  );

  return { currentIndex, isAnimating, navigate };
}
