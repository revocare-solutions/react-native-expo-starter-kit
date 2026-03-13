import { MMKV } from 'react-native-mmkv';
import type { StorageService } from '@/services/storage.interface';
import type { StorageValue } from '@/types';

const storage = new MMKV({ id: 'app-storage' });

export const mmkvStorageService: StorageService = {
  get<T extends StorageValue>(key: string): T | null {
    const value = storage.getString(key);
    if (value === undefined) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  },

  set<T extends StorageValue>(key: string, value: T): void {
    storage.set(key, JSON.stringify(value));
  },

  delete(key: string): void {
    storage.delete(key);
  },

  contains(key: string): boolean {
    return storage.contains(key);
  },

  clearAll(): void {
    storage.clearAll();
  },

  getAllKeys(): string[] {
    return storage.getAllKeys();
  },
};
