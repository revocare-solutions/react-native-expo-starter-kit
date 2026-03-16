export interface StarterConfig {
  app: {
    name: string;
    bundleId: string;
    scheme: string;
  };
  features: {
    auth: { enabled: boolean; provider: 'amplify' | 'firebase' | 'supabase' | 'clerk' | 'backend' };
    analytics: { enabled: boolean; provider: 'amplify' | 'mixpanel' | 'segment' | 'posthog' | 'backend' };
    crashReporting: { enabled: boolean; provider: 'sentry' | 'bugsnag' | 'datadog' | 'backend' };
    notifications: { enabled: boolean; provider: 'amplify' | 'firebase' | 'onesignal' | 'backend' };
    i18n: { enabled: boolean; defaultLocale: string };
    offlineStorage: { enabled: boolean; provider: 'mmkv' | 'async-storage' };
    onboarding: { enabled: boolean };
    otaUpdates: { enabled: boolean };
    deepLinking: { enabled: boolean };
    splashAppIcon: { enabled: boolean };
    forms: { enabled: boolean };
    tasks: { enabled: boolean; provider: 'backend' };
    sync: { enabled: boolean; provider: 'backend' };
  };
  api: {
    baseUrl: string | undefined;
    timeout: number;
  };
}

export const starterConfig: StarterConfig = {
  app: {
    name: 'MyApp',
    bundleId: 'com.mycompany.myapp',
    scheme: 'myapp',
  },

  features: {
    auth: { enabled: true, provider: 'backend' },
    analytics: { enabled: true, provider: 'backend' },
    crashReporting: { enabled: true, provider: 'backend' },
    notifications: { enabled: true, provider: 'backend' },
    i18n: { enabled: true, defaultLocale: 'en' },
    offlineStorage: { enabled: true, provider: 'mmkv' },
    onboarding: { enabled: true },
    otaUpdates: { enabled: true },
    deepLinking: { enabled: true },
    splashAppIcon: { enabled: true },
    forms: { enabled: true },
    tasks: { enabled: true, provider: 'backend' },
    sync: { enabled: true, provider: 'backend' },
  },

  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    timeout: 30000,
  },
};
