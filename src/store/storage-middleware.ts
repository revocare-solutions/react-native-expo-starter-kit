import type { StateStorage } from 'zustand/middleware';
import { basekitConfig } from '@/config/basekit.config';

const memoryStorage = (): StateStorage => {
  const store = new Map<string, string>();
  return {
    getItem: (name) => store.get(name) ?? null,
    setItem: (name, value) => store.set(name, value),
    removeItem: (name) => { store.delete(name); },
  };
};

function createMMKVStorage(): StateStorage {
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
    console.warn('[zustand] MMKV not available, falling back to in-memory storage');
    return memoryStorage();
  }
}

function createAsyncStorageAdapter(): StateStorage {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return {
      getItem: async (name) => {
        const value = await AsyncStorage.getItem(name);
        return value ?? null;
      },
      setItem: async (name, value) => {
        await AsyncStorage.setItem(name, value);
      },
      removeItem: async (name) => {
        await AsyncStorage.removeItem(name);
      },
    };
  } catch {
    console.warn('[zustand] AsyncStorage not available, falling back to in-memory storage');
    return memoryStorage();
  }
}

let cachedStorage: StateStorage | null = null;

export function createZustandStorage(): StateStorage {
  if (cachedStorage) return cachedStorage;

  if (!basekitConfig.features.offlineStorage?.enabled) {
    cachedStorage = memoryStorage();
    return cachedStorage;
  }

  const provider = basekitConfig.features.offlineStorage?.provider;

  switch (provider) {
    case 'mmkv':
      cachedStorage = createMMKVStorage();
      break;
    case 'async-storage':
      cachedStorage = createAsyncStorageAdapter();
      break;
    default:
      cachedStorage = createMMKVStorage();
      break;
  }

  return cachedStorage;
}
