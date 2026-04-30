'use client';

import { useState, useEffect } from 'react';
import Loader from './Loader';

export default function AppLoader() {
  const [isLoading, setIsLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLoadComplete = () => {
    setIsLoading(false);
  };

  // Не рендерим Loader на сервере, только на клиенте после монтирования
  if (!mounted) {
    return null;
  }

  return (
    <div suppressHydrationWarning>
      {isLoading && <Loader onLoadComplete={handleLoadComplete} />}
    </div>
  );
}

