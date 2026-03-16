import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import { SyncContext } from '../sync-context';

export function useSync() {
  const service = useContext(SyncContext);
  const [isSyncing, setIsSyncing] = useState(false);
  const isSyncingRef = useRef(false);
  const [lastSyncVersion, setLastSyncVersion] = useState<number | null>(
    service?.getLastSyncVersion() ?? null,
  );

  const syncNow = useCallback(async () => {
    if (!service || isSyncingRef.current) return;

    isSyncingRef.current = true;
    setIsSyncing(true);
    try {
      await service.pull();
      setLastSyncVersion(service.getLastSyncVersion());
    } catch (error) {
      console.warn('[sync] Pull failed:', error instanceof Error ? error.message : error);
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [service]);

  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        syncNow();
      }
    });

    return () => sub.remove();
  }, [syncNow]);

  return { syncNow, isSyncing, lastSyncVersion };
}
