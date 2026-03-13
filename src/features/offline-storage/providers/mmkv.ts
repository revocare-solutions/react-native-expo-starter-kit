import type { StorageService } from '@/services/storage.interface';
import type { StorageValue } from '@/types';

function createMMKVInstance() {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { MMKV } = require('react-native-mmkv');
  return new MMKV({ id: 'app-storage' });
}

let storage: ReturnType<typeof createMMKVInstance>;

function getStorage() {
  if (!storage) {
    storage = createMMKVInstance();
  }
  return storage;
}

export const mmkvStorageService: StorageService = {
  get<T extends StorageValue>(key: string): T | null {
    const value = getStorage().getString(key);
    if (value === undefined) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  },

  set<T extends StorageValue>(key: string, value: T): void {
    getStorage().set(key, JSON.stringify(value));
  },

  delete(key: string): void {
    getStorage().delete(key);
  },

  contains(key: string): boolean {
    return getStorage().contains(key);
  },

  clearAll(): void {
    getStorage().clearAll();
  },

  getAllKeys(): string[] {
    return getStorage().getAllKeys();
  },
};
