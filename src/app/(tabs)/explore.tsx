import { View } from 'react-native';

import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { starterConfig } from '@/config/starter.config';
import { Fonts } from '@/constants/theme';

interface FeatureItem {
  name: string;
  enabled: boolean;
  provider?: string;
  description: string;
}

function getFeatures(): FeatureItem[] {
  const { features } = starterConfig;
  return [
    {
      name: 'Authentication',
      enabled: features.auth.enabled,
      provider: features.auth.provider,
      description: 'Sign in, sign up, password reset, and session management with swappable providers.',
    },
    {
      name: 'Analytics',
      enabled: features.analytics.enabled,
      provider: features.analytics.provider,
      description: 'Track events, screen views, and user properties across your app.',
    },
    {
      name: 'Crash Reporting',
      enabled: features.crashReporting.enabled,
      provider: features.crashReporting.provider,
      description: 'Capture exceptions, breadcrumbs, and error context in production.',
    },
    {
      name: 'Push Notifications',
      enabled: features.notifications.enabled,
      provider: features.notifications.provider,
      description: 'Request permissions, get push tokens, send local notifications, and handle responses.',
    },
    {
      name: 'Offline Storage',
      enabled: features.offlineStorage.enabled,
      provider: features.offlineStorage.provider,
      description: 'Persistent key-value storage with MMKV or AsyncStorage backends.',
    },
    {
      name: 'Internationalization',
      enabled: features.i18n.enabled,
      description: `Multi-language support with auto locale detection. Default: ${features.i18n.defaultLocale}`,
    },
    {
      name: 'Forms & Validation',
      enabled: features.forms.enabled,
      description: 'React Hook Form + Zod schema validation with ready-made input components.',
    },
    {
      name: 'Deep Linking',
      enabled: features.deepLinking.enabled,
      description: `URL scheme routing via expo-router. Scheme: ${starterConfig.app.scheme}://`,
    },
    {
      name: 'OTA Updates',
      enabled: features.otaUpdates.enabled,
      description: 'Check for and apply over-the-air updates without app store resubmission.',
    },
    {
      name: 'Onboarding',
      enabled: features.onboarding.enabled,
      description: 'Swipeable onboarding flow with persisted completion state.',
    },
    {
      name: 'Splash & App Icon',
      enabled: features.splashAppIcon.enabled,
      description: 'Splash screen timing control and app icon configuration helpers.',
    },
  ];
}

function FeatureBadge({ enabled }: { enabled: boolean }) {
  return (
    <View
      className={`px-2 py-0.5 rounded-full ${enabled ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
      <ThemedText
        className={`text-xs font-semibold ${enabled ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`}>
        {enabled ? 'Enabled' : 'Disabled'}
      </ThemedText>
    </View>
  );
}

export default function ExploreScreen() {
  const features = getFeatures();
  const enabledCount = features.filter((f) => f.enabled).length;

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          className="bottom-[-90px] left-[-35px] absolute"
        />
      }>
      <ThemedView className="flex-row gap-2">
        <ThemedText type="title" style={{ fontFamily: Fonts.rounded }}>
          Features
        </ThemedText>
      </ThemedView>

      <ThemedText>
        This starter kit includes {features.length} plug-and-play features.{' '}
        <ThemedText type="defaultSemiBold">{enabledCount}</ThemedText> are currently enabled.
      </ThemedText>

      <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        Toggle features in{' '}
        <ThemedText type="defaultSemiBold" className="text-sm">
          src/config/starter.config.ts
        </ThemedText>
      </ThemedText>

      <Collapsible title="Core Infrastructure">
        <ThemedText>
          <ThemedText type="defaultSemiBold">State Management</ThemedText> — Zustand for client
          state, TanStack Query for server state, both pre-configured.
        </ThemedText>
        <ThemedText className="mt-2">
          <ThemedText type="defaultSemiBold">API Layer</ThemedText> — Axios client with auth token
          interceptor, wired into TanStack Query.
        </ThemedText>
        <ThemedText className="mt-2">
          <ThemedText type="defaultSemiBold">Styling</ThemedText> — NativeWind v4 (Tailwind CSS)
          with dark mode support.
        </ThemedText>
        <ThemedText className="mt-2">
          <ThemedText type="defaultSemiBold">Routing</ThemedText> — expo-router file-based
          navigation with typed routes.
        </ThemedText>
      </Collapsible>

      {features.map((feature) => (
        <Collapsible key={feature.name} title={feature.name}>
          <View className="flex-row items-center gap-2 mb-2">
            <FeatureBadge enabled={feature.enabled} />
            {feature.provider && (
              <View className="px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900">
                <ThemedText className="text-xs font-semibold text-blue-700 dark:text-blue-300">
                  {feature.provider}
                </ThemedText>
              </View>
            )}
          </View>
          <ThemedText>{feature.description}</ThemedText>
        </Collapsible>
      ))}

      <Collapsible title="Testing & CI/CD">
        <ThemedText>
          <ThemedText type="defaultSemiBold">Unit Tests</ThemedText> — Jest + React Native Testing
          Library with 80+ tests.
        </ThemedText>
        <ThemedText className="mt-2">
          <ThemedText type="defaultSemiBold">E2E Tests</ThemedText> — Maestro flow files for smoke
          tests and navigation.
        </ThemedText>
        <ThemedText className="mt-2">
          <ThemedText type="defaultSemiBold">CI/CD</ThemedText> — GitHub Actions for lint,
          typecheck, and test on every PR. EAS Build on demand.
        </ThemedText>
      </Collapsible>
    </ParallaxScrollView>
  );
}
