import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createZustandStorage } from './storage-middleware';

interface AppState {
  hasCompletedOnboarding: boolean;
  theme: 'light' | 'dark' | 'system';
  setHasCompletedOnboarding: (value: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      theme: 'system',
      setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => createZustandStorage()),
    },
  ),
);
