import type { Manifest } from '../generator';

export interface CommandDefinition {
  id: string;
  name: string;
  description: string;
  templateFile: string;
  condition?: (selectedFeatures: Record<string, string>, manifest: Manifest) => boolean;
}

export interface FeatureSectionDefinition {
  featureKey: string;
  title: string;
  files: string[];
  patterns: string[];
}

export const commands: CommandDefinition[] = [
  {
    id: 'add-feature',
    name: '/add-feature',
    description: 'Scaffold a new feature module',
    templateFile: 'commands/add-feature.md',
  },
  {
    id: 'new-screen',
    name: '/new-screen',
    description: 'Create a new route/screen',
    templateFile: 'commands/new-screen.md',
  },
  {
    id: 'add-provider',
    name: '/add-provider',
    description: 'Add provider to existing feature',
    templateFile: 'commands/add-provider.md',
    condition: (selected, manifest) =>
      Object.keys(selected).some((f) => {
        const feature = manifest.features[f];
        return feature && Object.keys(feature.providers).length > 0;
      }),
  },
  {
    id: 'run-checks',
    name: '/run-checks',
    description: 'Lint + typecheck + test',
    templateFile: 'commands/run-checks.md',
  },
  {
    id: 'new-component',
    name: '/new-component',
    description: 'Scaffold a component',
    templateFile: 'commands/new-component.md',
  },
  {
    id: 'create-issue',
    name: '/create-issue',
    description: 'Create a GitHub issue',
    templateFile: 'commands/create-issue.md',
  },
  {
    id: 'create-branch',
    name: '/create-branch',
    description: 'Create a feature branch',
    templateFile: 'commands/create-branch.md',
  },
  {
    id: 'evaluate',
    name: '/evaluate',
    description: 'Scan codebase and update workflow files',
    templateFile: 'commands/evaluate.md',
  },
];

export const featureSections: FeatureSectionDefinition[] = [
  {
    featureKey: 'auth',
    title: 'Authentication',
    files: ['src/services/auth.interface.ts', 'src/features/auth/auth-provider.tsx', 'src/features/auth/create-auth-service.ts'],
    patterns: [
      'Service interface at src/services/auth.interface.ts — all providers implement this',
      'Add new providers in src/features/auth/providers/ following existing pattern',
      'Auth state managed in AuthProvider via React Context',
      'Token getter wired into API client automatically',
    ],
  },
  {
    featureKey: 'analytics',
    title: 'Analytics',
    files: ['src/services/analytics.interface.ts', 'src/features/analytics/analytics-provider.tsx', 'src/features/analytics/create-analytics-service.ts'],
    patterns: [
      'Track events via useAnalytics() hook',
      'Add providers following amplify.ts pattern in providers/',
    ],
  },
  {
    featureKey: 'crash-reporting',
    title: 'Crash Reporting',
    files: ['src/services/crash-reporting.interface.ts', 'src/features/crash-reporting/crash-reporting-provider.tsx'],
    patterns: [
      'Capture errors via useCrashReporting() hook',
      'Sentry provider at providers/sentry.ts',
    ],
  },
  {
    featureKey: 'notifications',
    title: 'Push Notifications',
    files: ['src/services/notifications.interface.ts', 'src/features/notifications/notification-provider.tsx'],
    patterns: [
      'Request permissions, send local notifications via useNotifications()',
      'Add providers following amplify.ts pattern',
    ],
  },
  {
    featureKey: 'offline-storage',
    title: 'Offline Storage',
    files: ['src/services/storage.interface.ts', 'src/features/offline-storage/storage-provider.tsx', 'src/features/offline-storage/create-storage-service.ts'],
    patterns: [
      'Key-value storage via useStorage() hook',
      'MMKV or AsyncStorage providers available',
    ],
  },
  {
    featureKey: 'i18n',
    title: 'Internationalization',
    files: ['src/features/i18n/i18n-provider.tsx', 'src/features/i18n/i18n.ts', 'src/features/i18n/locales/en.json'],
    patterns: [
      'Add translations in src/features/i18n/locales/',
      'Use useAppTranslation() hook in components',
    ],
  },
  {
    featureKey: 'forms',
    title: 'Forms & Validation',
    files: ['src/features/forms/hooks/use-app-form.ts', 'src/features/forms/components/form-input.tsx', 'src/features/forms/schemas/common.ts'],
    patterns: [
      'Zod schemas in schemas/, form components in components/',
      'Use useAppForm(schema) hook for form state',
    ],
  },
  {
    featureKey: 'security',
    title: 'Security',
    files: ['src/features/security/security-provider.tsx', 'src/features/security/hooks/use-biometrics.ts', 'src/features/security/hooks/use-app-lock.ts', 'src/features/security/config/pinning.ts'],
    patterns: [
      'Biometrics via useBiometrics() hook',
      'Secure storage via useSecureStorage() hook',
      'App lock via useAppLock() hook',
      'SSL pinning config in config/pinning.ts',
    ],
  },
  {
    featureKey: 'theme',
    title: 'Theme System',
    files: ['src/config/theme.config.ts', 'src/features/theme/hooks/use-theme.ts', 'src/features/theme/utils/generate-tailwind.ts'],
    patterns: [
      'Edit theme.config.ts to change design tokens — no component changes needed',
      'useTheme() hook for runtime values (colors, spacing, shadows)',
      'Tailwind classes auto-generated from tokens (bg-primary-500, etc.)',
      'useThemeColors() is a safe wrapper that falls back when theme is disabled',
    ],
  },
  {
    featureKey: 'onboarding',
    title: 'Onboarding',
    files: ['src/features/onboarding/hooks/use-onboarding.ts', 'src/features/onboarding/components/onboarding-screen.tsx'],
    patterns: [
      'Completion persisted in Zustand store',
      'Check useOnboarding().shouldShow to decide whether to show onboarding',
    ],
  },
  {
    featureKey: 'deep-linking',
    title: 'Deep Linking',
    files: ['src/features/deep-linking/hooks/use-deep-link.ts', 'src/features/deep-linking/utils/build-deep-link.ts'],
    patterns: [
      'Monitor incoming URLs via useDeepLink() hook',
      'Build links with buildDeepLink() utility',
    ],
  },
  {
    featureKey: 'ota-updates',
    title: 'OTA Updates',
    files: ['src/features/ota-updates/hooks/use-ota-updates.ts'],
    patterns: ['Check and apply updates via useOtaUpdates() hook'],
  },
  {
    featureKey: 'splash-app-icon',
    title: 'Splash Screen & App Icon',
    files: ['src/features/splash-app-icon/hooks/use-splash-screen.ts'],
    patterns: ['Control splash visibility via useSplashScreen() hook'],
  },
];
