import type { SyncService } from '@/services/sync.interface';

export const noOpSync: SyncService = {
  push: async () => ({ accepted: [], conflicts: [] }),
  pull: async () => [],
  getLastSyncVersion: () => null,
};
