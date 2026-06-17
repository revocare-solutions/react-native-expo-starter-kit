import type { AnalyticsService } from '@/services/analytics.interface';

export function createAmplifyAnalytics(): AnalyticsService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { record, identifyUser } = require('aws-amplify/analytics');

  return {
    async initialize() {
      // Amplify Analytics is auto-initialized with Amplify config
    },

    trackEvent(event) {
      record({
        name: event.name,
        attributes: event.properties,
      });
    },

    trackScreen(screenName, properties) {
      record({
        name: 'screen_view',
        attributes: { screen_name: screenName, ...properties },
      });
    },

    setUserProperties(properties) {
      const { userId, ...rest } = properties;
      identifyUser({
        userId: userId ?? 'anonymous',
        userProfile: {
          customProperties: rest,
        },
      });
    },

    reset() {
      // Amplify handles reset via auth signout
    },
  };
}
