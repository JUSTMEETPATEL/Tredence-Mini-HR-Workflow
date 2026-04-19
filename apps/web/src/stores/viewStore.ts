import { create } from 'zustand';

export type ViewId = 'dashboard' | 'compliance' | 'scheduler' | 'analytics' | 'integrations' | 'repository';

interface ViewState {
  activeView: ViewId;
  setActiveView: (view: ViewId) => void;
}

export const useViewStore = create<ViewState>((set) => ({
  activeView: 'dashboard',
  setActiveView: (view) => set({ activeView: view }),
}));
