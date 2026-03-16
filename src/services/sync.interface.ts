import type { SyncPushItem, SyncRecord, SyncPushResult } from '@/types';

export interface SyncService {
  push(items: SyncPushItem[]): Promise<SyncPushResult>;
  pull(since?: number): Promise<SyncRecord[]>;
  getLastSyncVersion(): number | null;
}
