'use client';

import { useState, useEffect } from 'react';
import { getFavoriteIds } from '@/utils/favorites';

export const FAVORITES_CHANGED_EVENT = 'favorites-changed' as const;

/** Хук для подписки на список ID избранных товаров (LocalStorage + событие) */
export function useFavoriteIds(): number[] {
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    const sync = () => setIds(getFavoriteIds());
    sync();
    window.addEventListener(FAVORITES_CHANGED_EVENT, sync);
    return () => window.removeEventListener(FAVORITES_CHANGED_EVENT, sync);
  }, []);

  return ids;
}
