import type { StateStorage } from 'zustand/middleware';
import { starterConfig } from '@/config/starter.config';

export function createZustandMMKVStorage(): StateStorage {
  if (!starterConfig.features.offlineStorage.enabled) {
    const memoryStore = new Map<string, string>();
    return {
      getItem: (name) => memoryStore.get(name) ?? null,
      setItem: (name, value) => memoryStore.set(name, value),
      removeItem: (name) => {
        memoryStore.delete(name);
      },
    };
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { MMKV } = require('react-native-mmkv');
    const storage = new MMKV({ id: 'zustand-storage' });

    return {
      getItem: (name) => storage.getString(name) ?? null,
      setItem: (name, value) => storage.set(name, value),
      removeItem: (name) => storage.delete(name),
    };
  } catch {
    // MMKV native module not available (Expo Go / web) — fall back to in-memory
    console.warn('[zustand] MMKV not available, using in-memory storage (state will not persist)');
    const memoryStore = new Map<string, string>();
    return {
      getItem: (name) => memoryStore.get(name) ?? null,
      setItem: (name, value) => memoryStore.set(name, value),
      removeItem: (name) => { memoryStore.delete(name); },
    };
  }
}
