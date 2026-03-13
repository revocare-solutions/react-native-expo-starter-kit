import type { StorageService } from '@/services/storage.interface';
import { starterConfig } from '@/config/starter.config';
import { noOpStorage } from './no-op-storage';

const providers: Record<string, () => Promise<StorageService>> = {
  mmkv: () => import('./providers/mmkv').then((m) => m.mmkvStorageService),
  'async-storage': () =>
    import('./providers/async-storage').then((m) => m.asyncStorageService),
};

export async function createStorageService(): Promise<StorageService> {
  if (!starterConfig.features.offlineStorage.enabled) {
    return noOpStorage;
  }

  const { provider } = starterConfig.features.offlineStorage;
  const factory = providers[provider];
  if (!factory) throw new Error(`Unknown storage provider: ${provider}`);
  return factory();
}
