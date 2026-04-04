import { Redirect, Stack } from 'expo-router';
import { basekitConfig } from '@/config/basekit.config';

export default function AuthLayout() {
  if (!basekitConfig.features.auth.enabled) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack screenOptions={{ headerShown: true, headerBackTitle: 'Back' }}>
      <Stack.Screen name="login" options={{ title: 'Admin Sign In', headerShown: false }} />
    </Stack>
  );
}
