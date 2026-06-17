import type { AnalyticsEvent, AnalyticsUserProperties } from '@/types';

export interface AnalyticsService {
  initialize(): Promise<void>;
  trackEvent(event: AnalyticsEvent): void;
  trackScreen(screenName: string, properties?: Record<string, string>): void;
  setUserProperties(properties: AnalyticsUserProperties): void;
  reset(): void;
}
