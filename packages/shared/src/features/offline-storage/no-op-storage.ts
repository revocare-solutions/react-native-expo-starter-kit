import type { StorageService } from '@/services/storage.interface';

export const noOpStorage: StorageService = {
  get: () => null,
  set: () => {},
  delete: () => {},
  contains: () => false,
  clearAll: () => {},
  getAllKeys: () => [],
};
