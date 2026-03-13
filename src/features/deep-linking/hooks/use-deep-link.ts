import { useEffect, useState } from 'react';
import * as Linking from 'expo-linking';
import { starterConfig } from '@/config/starter.config';

export function useDeepLink() {
  const [lastUrl, setLastUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!starterConfig.features.deepLinking.enabled) return;

    // Get initial URL (app opened via deep link)
    Linking.getInitialURL().then((url) => {
      if (url) setLastUrl(url);
    });

    // Listen for incoming URLs while app is open
    const subscription = Linking.addEventListener('url', (event) => {
      setLastUrl(event.url);
    });

    return () => subscription.remove();
  }, []);

  return { lastUrl };
}
