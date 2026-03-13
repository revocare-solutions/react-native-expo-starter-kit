import type { StorageService } from '@/services/storage.interface';

export function createMockStorage(): StorageService {
  const store = new Map<string, string>();

  return {
    get: <T,>(key: string) => {
      const value = store.get(key);
      if (value === undefined) return null;
      return JSON.parse(value) as T;
    },
    set: <T,>(key: string, value: T) => {
      store.set(key, JSON.stringify(value));
    },
    delete: (key: string) => {
      store.delete(key);
    },
    contains: (key: string) => store.has(key),
    clearAll: () => store.clear(),
    getAllKeys: () => Array.from(store.keys()),
  };
}
