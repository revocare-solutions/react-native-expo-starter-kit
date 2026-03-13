import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageService } from '@/services/storage.interface';
import type { StorageValue } from '@/types';

const cache = new Map<string, string>();
let initialized = false;

async function hydrate() {
  if (initialized) return;
  const keys = await AsyncStorage.getAllKeys();
  const entries = await AsyncStorage.getMany(keys);
  Object.entries(entries).forEach(([key, value]) => {
    if (value !== null) cache.set(key, value);
  });
  initialized = true;
}

export const asyncStorageService: StorageService = {
  get<T extends StorageValue>(key: string): T | null {
    const value = cache.get(key);
    if (value === undefined) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  },

  set<T extends StorageValue>(key: string, value: T): void {
    const serialized = JSON.stringify(value);
    cache.set(key, serialized);
    AsyncStorage.setItem(key, serialized);
  },

  delete(key: string): void {
    cache.delete(key);
    AsyncStorage.removeItem(key);
  },

  contains(key: string): boolean {
    return cache.has(key);
  },

  clearAll(): void {
    cache.clear();
    AsyncStorage.clear();
  },

  getAllKeys(): string[] {
    return Array.from(cache.keys());
  },
};

export { hydrate as hydrateAsyncStorage };
