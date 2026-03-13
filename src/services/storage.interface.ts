import type { StorageValue } from '@/types';

export interface StorageService {
  get<T extends StorageValue>(key: string): T | null;
  set<T extends StorageValue>(key: string, value: T): void;
  delete(key: string): void;
  contains(key: string): boolean;
  clearAll(): void;
  getAllKeys(): string[];
}
