"use client";
// ── MSW Provider — initialises mock service worker in dev ──

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    async function init() {
      const { worker } = await import('@/mocks/browser');
      await worker.start({ onUnhandledRequest: 'bypass' });
      setReady(true);
    }

    init();
  }, []);

  if (!ready) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[var(--canvas-bg)]">
        <div className="animate-pulse text-sm text-[var(--text-tertiary)]">Initialising mock API...</div>
      </div>
    );
  }

  return <>{children}</>;
}
