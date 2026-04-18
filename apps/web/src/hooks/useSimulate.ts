// ── useSimulate — TanStack Query mutation for POST /simulate ──

import { useMutation } from '@tanstack/react-query';
import type { SimulationResult } from '@/lib/types';
import { apiUrl } from '@/lib/api-config';

interface SimulatePayload {
  nodes: Array<{ id: string; type: string; data: Record<string, unknown> }>;
  edges: Array<{ id: string; source: string; target: string }>;
}

export function useSimulate() {
  return useMutation<SimulationResult, Error, SimulatePayload>({
    mutationFn: async (payload) => {
      const res = await fetch(apiUrl('/simulate'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.violations?.[0]?.message || 'Simulation failed');
      }
      return res.json();
    },
  });
}
