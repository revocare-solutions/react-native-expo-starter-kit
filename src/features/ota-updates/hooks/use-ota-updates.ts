import { useCallback, useState } from 'react';
import { starterConfig } from '@/config/starter.config';

export interface OtaUpdateStatus {
  isChecking: boolean;
  isDownloading: boolean;
  isAvailable: boolean;
  error: string | null;
}

export function useOtaUpdates() {
  const [status, setStatus] = useState<OtaUpdateStatus>({
    isChecking: false,
    isDownloading: false,
    isAvailable: false,
    error: null,
  });

  const checkForUpdate = useCallback(async () => {
    if (!starterConfig.features.otaUpdates.enabled) return;

    try {
      setStatus((s) => ({ ...s, isChecking: true, error: null }));
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Updates = require('expo-updates');
      const result = await Updates.checkForUpdateAsync();
      setStatus((s) => ({
        ...s,
        isChecking: false,
        isAvailable: result.isAvailable,
      }));
    } catch (e) {
      setStatus((s) => ({
        ...s,
        isChecking: false,
        error: (e as Error).message,
      }));
    }
  }, []);

  const downloadAndApply = useCallback(async () => {
    if (!starterConfig.features.otaUpdates.enabled) return;

    try {
      setStatus((s) => ({ ...s, isDownloading: true, error: null }));
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const Updates = require('expo-updates');
      await Updates.fetchUpdateAsync();
      await Updates.reloadAsync();
    } catch (e) {
      setStatus((s) => ({
        ...s,
        isDownloading: false,
        error: (e as Error).message,
      }));
    }
  }, []);

  return { status, checkForUpdate, downloadAndApply };
}
