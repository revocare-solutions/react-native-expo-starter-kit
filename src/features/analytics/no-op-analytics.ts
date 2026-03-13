import type { AnalyticsService } from '@/services/analytics.interface';

export const noOpAnalytics: AnalyticsService = {
  initialize: () => Promise.resolve(),
  trackEvent: () => {},
  trackScreen: () => {},
  setUserProperties: () => {},
  reset: () => {},
};
