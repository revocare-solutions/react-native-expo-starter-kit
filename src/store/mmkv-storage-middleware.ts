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

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MMKV } = require('react-native-mmkv');
  const storage = new MMKV({ id: 'zustand-storage' });

  return {
    getItem: (name) => storage.getString(name) ?? null,
    setItem: (name, value) => storage.set(name, value),
    removeItem: (name) => storage.delete(name),
  };
}
