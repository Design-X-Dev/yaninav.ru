'use client';

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

/**
 * Хук для проверки режима редактирования через GET-параметр
 * Использование: ?edit=true в URL для показа кнопок редактирования
 * 
 * Примеры:
 * - ?edit=true - включить режим редактирования
 * - ?edit=1 - включить режим редактирования
 * - без параметра - режим редактирования выключен
 */
export function useEditMode(): boolean {
  const searchParams = useSearchParams();
  
  return useMemo(() => {
    if (!searchParams) return false;
    const editParam = searchParams.get('edit');
    return editParam === 'true' || editParam === '1';
  }, [searchParams]);
}

