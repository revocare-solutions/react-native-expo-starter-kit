import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../../global.css';

import { AppProviders } from '@/lib/providers';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { Toast, toastConfig } from '@/components/ui/toast';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <AppProviders>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          </Stack>
          <StatusBar style="auto" />
          <Toast config={toastConfig} />
        </AppProviders>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}
