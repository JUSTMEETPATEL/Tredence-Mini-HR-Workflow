"use client";

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { MSWProvider } from './MSWProvider';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: { staleTime: 60_000, retry: 1 },
    },
  }));

  return (
    <MSWProvider>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </MSWProvider>
  );
}
