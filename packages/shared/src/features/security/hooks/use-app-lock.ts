import { useState, useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { AppLockConfig, BiometricResult } from '@/types';
import { useBiometrics } from './use-biometrics';

export function useAppLock(config: AppLockConfig) {
  const [isLocked, setIsLocked] = useState(config.requireOnLaunch);
  const { authenticate } = useBiometrics();
  const backgroundTimestamp = useRef<number | null>(null);

  const lock = useCallback(() => {
    setIsLocked(true);
  }, []);

  const unlock = useCallback(async (): Promise<BiometricResult> => {
    const result = await authenticate({ promptMessage: 'Unlock app' });
    if (result.success) {
      setIsLocked(false);
    }
    return result;
  }, [authenticate]);

  useEffect(() => {
    if (!config.lockOnBackground) return;

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background') {
        backgroundTimestamp.current = Date.now();
      } else if (nextState === 'active' && backgroundTimestamp.current) {
        const elapsed = (Date.now() - backgroundTimestamp.current) / 1000;
        if (elapsed >= config.backgroundTimeout) {
          setIsLocked(true);
        }
        backgroundTimestamp.current = null;
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [config.lockOnBackground, config.backgroundTimeout]);

  return { isLocked, lock, unlock };
}
