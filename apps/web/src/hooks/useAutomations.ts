// ── useAutomations — TanStack Query hook for GET /automations ──

import { useQuery } from '@tanstack/react-query';
import type { Automation } from '@/lib/types';
import { apiUrl } from '@/lib/api-config';

export function useAutomations() {
  return useQuery<Automation[]>({
    queryKey: ['automations'],
    queryFn: async () => {
      const res = await fetch(apiUrl('/automations'));
      if (!res.ok) throw new Error('Failed to fetch automations');
      return res.json();
    },
  });
}
