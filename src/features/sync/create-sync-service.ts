import type { SyncService } from '@/services/sync.interface';
import { starterConfig } from '@/config/starter.config';
import { noOpSync } from './no-op-sync';

const providers: Record<string, () => Promise<SyncService>> = {
  backend: () => import('./providers/backend').then((m) => m.backendSyncService),
};

export async function createSyncService(): Promise<SyncService> {
  if (!starterConfig.features.sync.enabled) {
    return noOpSync;
  }

  const { provider } = starterConfig.features.sync;
  const factory = providers[provider];
  if (!factory) {
    console.warn(`[sync] Unknown sync provider: ${provider}. Falling back to no-op.`);
    return noOpSync;
  }

  try {
    return await factory();
  } catch (error) {
    console.warn(
      `[sync] Failed to load "${provider}" provider. Falling back to no-op.`,
      error instanceof Error ? error.message : error,
    );
    return noOpSync;
  }
}
