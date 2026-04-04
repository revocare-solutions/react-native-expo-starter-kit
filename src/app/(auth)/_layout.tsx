import { Redirect, Stack } from 'expo-router';
import { basekitConfig } from '@/config/basekit.config';

export default function AuthLayout() {
  if (!basekitConfig.features.auth.enabled) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: 'Back',
      }}
    >
      <Stack.Screen name="login" options={{ title: 'Sign In', headerShown: false }} />
      <Stack.Screen name="register" options={{ title: 'Create Account' }} />
      <Stack.Screen name="confirm-email" options={{ title: 'Verify Email' }} />
      <Stack.Screen name="forgot-password" options={{ title: 'Reset Password' }} />
      <Stack.Screen name="verify-code" options={{ title: 'Verify Code' }} />
    </Stack>
  );
}
