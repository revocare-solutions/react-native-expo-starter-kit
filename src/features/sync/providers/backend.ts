import { apiClient } from '@/lib/api';
import type { SyncService } from '@/services/sync.interface';
import type { SyncPushItem, SyncRecord, SyncPushResult } from '@/types';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'sync-backend' });
const LAST_SYNC_KEY = 'lastSyncVersion';

export const backendSyncService: SyncService = {
  async push(items: SyncPushItem[]): Promise<SyncPushResult> {
    const { data } = await apiClient.post<SyncPushResult>('/api/sync/push', { items });

    const maxVersion = Math.max(...data.accepted.map((a) => a.version), 0);
    if (maxVersion > 0) {
      storage.set(LAST_SYNC_KEY, maxVersion);
    }

    return data;
  },

  async pull(since?: number): Promise<SyncRecord[]> {
    const version = since ?? backendSyncService.getLastSyncVersion() ?? 0;
    const { data } = await apiClient.get<{ records: SyncRecord[] }>('/api/sync/pull', {
      params: { since: version },
    });

    const maxVersion = Math.max(...data.records.map((r) => r.version), version);
    if (maxVersion > version) {
      storage.set(LAST_SYNC_KEY, maxVersion);
    }

    return data.records;
  },

  getLastSyncVersion(): number | null {
    const version = storage.getNumber(LAST_SYNC_KEY);
    return version !== undefined ? version : null;
  },
};
