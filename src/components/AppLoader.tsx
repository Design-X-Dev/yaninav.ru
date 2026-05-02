'use client';

import { useCallback, useState } from 'react';
import Loader from './Loader';

export default function AppLoader() {
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  return (
    <div suppressHydrationWarning>
      {isLoading && <Loader onLoadComplete={handleLoadComplete} />}
    </div>
  );
}

