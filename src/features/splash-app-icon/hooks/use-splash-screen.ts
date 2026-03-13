import { useCallback, useState } from 'react';
import { starterConfig } from '@/config/starter.config';

export function useSplashScreen() {
  const [isReady, setIsReady] = useState(false);

  const hideSplash = useCallback(async () => {
    if (!starterConfig.features.splashAppIcon.enabled) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const SplashScreen = require('expo-splash-screen');
      await SplashScreen.hideAsync();
      setIsReady(true);
    } catch {
      // expo-splash-screen may not be available in all environments
      setIsReady(true);
    }
  }, []);

  const preventAutoHide = useCallback(async () => {
    if (!starterConfig.features.splashAppIcon.enabled) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const SplashScreen = require('expo-splash-screen');
      await SplashScreen.preventAutoHideAsync();
    } catch {
      // Silently fail if not available
    }
  }, []);

  return { isReady, hideSplash, preventAutoHide };
}
