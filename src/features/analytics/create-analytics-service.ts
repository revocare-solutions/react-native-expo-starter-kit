import type { AnalyticsService } from '@/services/analytics.interface';
import { starterConfig } from '@/config/starter.config';
import { noOpAnalytics } from './no-op-analytics';

const providers: Record<string, () => Promise<AnalyticsService>> = {
  amplify: async () => {
    const { createAmplifyAnalytics } = await import('./providers/amplify');
    return createAmplifyAnalytics();
  },
  backend: async () => {
    const { createBackendAnalytics } = await import('./providers/backend');
    return createBackendAnalytics();
  },
};

export async function createAnalyticsService(): Promise<AnalyticsService> {
  if (!starterConfig.features.analytics.enabled) {
    return noOpAnalytics;
  }

  const { provider } = starterConfig.features.analytics;
  const factory = providers[provider];
  if (!factory) throw new Error(`Unknown analytics provider: ${provider}`);

  try {
    return await factory();
  } catch {
    console.warn(
      `[analytics] Failed to load "${provider}" provider (native module not available). Falling back to no-op analytics. ` +
      `If you need analytics, install the provider SDK and create a dev build with: npx expo run:ios / npx expo run:android`,
    );
    return noOpAnalytics;
  }
}
