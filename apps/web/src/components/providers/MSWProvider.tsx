"use client";
// ── MSW Provider — only initialises mock service worker when API_MODE=mock ──

import { useEffect, useState } from 'react';

const API_MODE = process.env.NEXT_PUBLIC_API_MODE || 'mock';

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(API_MODE !== 'mock');

  useEffect(() => {
    if (API_MODE !== 'mock') return;
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
