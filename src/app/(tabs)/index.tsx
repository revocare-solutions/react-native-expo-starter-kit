import { View } from 'react-native';
import { Image } from 'expo-image';
import { Link } from 'expo-router';

import { HelloWave } from '@/components/hello-wave';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { basekitConfig } from '@/config/basekit.config';

function QuickStartStep({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <ThemedView className="gap-1 mb-4">
      <View className="flex-row items-center gap-2">
        <View className="w-6 h-6 rounded-full bg-blue-500 items-center justify-center">
          <ThemedText className="text-white text-xs font-bold">{number}</ThemedText>
        </View>
        <ThemedText type="subtitle">{title}</ThemedText>
      </View>
      <View className="ml-8">{children}</View>
    </ThemedView>
  );
}

function TechBadge({ label }: { label: string }) {
  return (
    <View className="px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800">
      <ThemedText className="text-xs font-semibold">{label}</ThemedText>
    </View>
  );
}

export default function HomeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@assets/images/partial-react-logo.png')}
          className="h-[178px] w-[290px] bottom-0 left-0 absolute"
        />
      }>
      <ThemedView className="flex-row items-center gap-2">
        <ThemedText type="title">Starter Kit</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedText>
        A production-ready React Native starter built on Expo SDK 54. Every feature is plug-and-play
        — enable what you need, swap providers without touching app code.
      </ThemedText>

      <View className="bg-blue-500 p-4 rounded-xl my-2">
        <ThemedText className="text-white font-bold text-center text-base">
          {basekitConfig.app.name} — Ready to build
        </ThemedText>
      </View>

      <ThemedView className="gap-2 mb-2">
        <ThemedText type="subtitle">Tech Stack</ThemedText>
        <View className="flex-row flex-wrap gap-2">
          <TechBadge label="Expo SDK 54" />
          <TechBadge label="React Native 0.81" />
          <TechBadge label="TypeScript" />
          <TechBadge label="NativeWind v4" />
          <TechBadge label="expo-router" />
          <TechBadge label="Zustand" />
          <TechBadge label="TanStack Query" />
          <TechBadge label="Axios" />
          <TechBadge label="Jest" />
        </View>
      </ThemedView>

      <ThemedText type="subtitle" className="mt-2">
        Quick Start
      </ThemedText>

      <QuickStartStep number="1" title="Configure">
        <ThemedText>
          Open{' '}
          <ThemedText type="defaultSemiBold">src/config/basekit.config.ts</ThemedText> and toggle
          features, choose providers, and set your app name.
        </ThemedText>
      </QuickStartStep>

      <QuickStartStep number="2" title="Environment">
        <ThemedText>
          Copy{' '}
          <ThemedText type="defaultSemiBold">.env.example</ThemedText> to{' '}
          <ThemedText type="defaultSemiBold">.env.local</ThemedText> and fill in your API keys for
          enabled providers (Amplify, Sentry, etc).
        </ThemedText>
      </QuickStartStep>

      <QuickStartStep number="3" title="Explore">
        <ThemedText>
          Tap the{' '}
          <Link href="/(tabs)/explore">
            <ThemedText type="link">Explore tab</ThemedText>
          </Link>{' '}
          to see all {Object.keys(basekitConfig.features).length} features with their current
          status and providers.
        </ThemedText>
      </QuickStartStep>

      <QuickStartStep number="4" title="Build">
        <ThemedText>
          Start building your app. Each feature lives in{' '}
          <ThemedText type="defaultSemiBold">src/features/</ThemedText> with hooks, providers, and
          tests — all self-contained and ready to customize.
        </ThemedText>
      </QuickStartStep>

      <View className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl mt-2">
        <ThemedText className="text-sm text-center">
          Check out the{' '}
          <ThemedText type="defaultSemiBold" className="text-sm">
            docs/
          </ThemedText>{' '}
          folder for guides on every feature, architecture decisions, and configuration reference.
        </ThemedText>
      </View>
    </ParallaxScrollView>
  );
}
