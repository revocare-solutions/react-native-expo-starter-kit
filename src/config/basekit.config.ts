export interface BasekitConfig {
  app: {
    name: string;
    bundleId: string;
    scheme: string;
  };
  features: {
    auth: { enabled: boolean; provider: 'amplify' | 'supabase' };
    analytics: { enabled: boolean; provider: 'amplify' };
    crashReporting: { enabled: boolean; provider: 'sentry' };
    notifications: { enabled: boolean; provider: 'amplify' };
    i18n: { enabled: boolean; defaultLocale: string };
    offlineStorage: { enabled: boolean; provider: 'mmkv' | 'async-storage' };
    onboarding: { enabled: boolean };
    otaUpdates: { enabled: boolean };
    deepLinking: { enabled: boolean };
    splashAppIcon: { enabled: boolean };
    forms: { enabled: boolean };
    security: { enabled: boolean };
    theme: { enabled: boolean; preset: 'minimal' | 'bold' | 'corporate' };
  };
  api: {
    baseUrl: string | undefined;
    timeout: number;
  };
}

export const basekitConfig: BasekitConfig = {
  app: {
    name: 'MyApp',
    bundleId: 'com.mycompany.myapp',
    scheme: 'myapp',
  },

  features: {
    auth: { enabled: true, provider: 'supabase' },
    analytics: { enabled: true, provider: 'amplify' },
    crashReporting: { enabled: true, provider: 'sentry' },
    notifications: { enabled: true, provider: 'amplify' },
    i18n: { enabled: true, defaultLocale: 'en' },
    offlineStorage: { enabled: true, provider: 'mmkv' },
    onboarding: { enabled: true },
    otaUpdates: { enabled: true },
    deepLinking: { enabled: true },
    splashAppIcon: { enabled: true },
    forms: { enabled: true },
    security: { enabled: true },
    theme: { enabled: true, preset: 'minimal' },
  },

  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    timeout: 30000,
  },
};
