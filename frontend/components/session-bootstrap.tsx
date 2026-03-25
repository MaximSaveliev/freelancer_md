'use client';

import { useEffect, useState } from 'react';
import { ensureAccessToken } from '@/lib/session';

export function SessionBootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      await ensureAccessToken();
      if (!cancelled) setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready) return <div className="min-h-screen bg-background-dark" />;

  return <>{children}</>;
}
