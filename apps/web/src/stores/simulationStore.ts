// ── Simulation Store ──────────────────────────────────
import { create } from 'zustand';
import type { SimulationResult } from '@/lib/types';

export type SandboxStatus = 'idle' | 'validating' | 'running' | 'completed' | 'error';

export interface SimulationState {
  status: SandboxStatus;
  result: SimulationResult | null;
  currentStepIndex: number;
  isOpen: boolean;
  validationErrors: string[];

  open: () => void;
  close: () => void;
  toggle: () => void;
  setStatus: (status: SandboxStatus) => void;
  setResult: (result: SimulationResult) => void;
  advanceStep: () => void;
  setValidationErrors: (errors: string[]) => void;
  reset: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
  status: 'idle',
  result: null,
  currentStepIndex: -1,
  isOpen: false,
  validationErrors: [],

  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),

  setStatus: (status) => set({ status }),
  setResult: (result) => set({ result, status: 'completed' }),

  advanceStep: () => {
    const { currentStepIndex, result } = get();
    if (!result) return;
    if (currentStepIndex < result.steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 });
    }
  },

  setValidationErrors: (errors) =>
    set({ validationErrors: errors, status: 'error' }),

  reset: () =>
    set({
      status: 'idle',
      result: null,
      currentStepIndex: -1,
      validationErrors: [],
    }),
}));
