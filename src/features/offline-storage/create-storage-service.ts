import type { StorageService } from '@/services/storage.interface';
import { basekitConfig } from '@/config/basekit.config';
import { noOpStorage } from './no-op-storage';

const providers: Record<string, () => Promise<StorageService>> = {
  mmkv: () => import('./providers/mmkv').then((m) => m.mmkvStorageService),
  'async-storage': () =>
    import('./providers/async-storage').then((m) => m.asyncStorageService),
};

export async function createStorageService(): Promise<StorageService> {
  if (!basekitConfig.features.offlineStorage.enabled) {
    return noOpStorage;
  }

  const { provider } = basekitConfig.features.offlineStorage;
  const factory = providers[provider];
  if (!factory) throw new Error(`Unknown storage provider: ${provider}`);

  try {
    return await factory();
  } catch {
    console.warn(
      `[offline-storage] Failed to load "${provider}" provider (native module not available). Falling back to no-op storage. ` +
      `If you need persistence, create a dev build with: npx expo run:ios / npx expo run:android`,
    );
    return noOpStorage;
  }
}
