export interface SyncPushItem {
  key: string;
  value: unknown;
  version: number;
  deleted: boolean;
}

export interface SyncRecord {
  key: string;
  value: unknown;
  version: number;
  deleted: boolean;
}

export interface SyncPushResult {
  accepted: { key: string; version: number }[];
  conflicts: {
    key: string;
    serverVersion: number;
    serverValue: unknown;
    clientVersion: number;
  }[];
}
