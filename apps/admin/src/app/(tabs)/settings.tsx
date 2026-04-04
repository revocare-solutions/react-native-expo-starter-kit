import { View, Text, Pressable } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/features/auth';
import { basekitConfig } from '@/config/basekit.config';
import { env } from '@/config/env';

export default function SettingsScreen() {
  const { signOut } = useAuth();

  return (
    <ThemedView className="flex-1 p-6 pt-16">
      <ThemedText type="title" className="mb-2">Settings</ThemedText>
      <ThemedText className="text-gray-500 dark:text-gray-400 mb-6">
        App configuration and account
      </ThemedText>

      <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-4">
        <ThemedText type="defaultSemiBold" className="mb-3">App Info</ThemedText>
        <View className="gap-2">
          <View className="flex-row justify-between">
            <Text className="text-gray-500">App Name</Text>
            <ThemedText>{basekitConfig.app.name}</ThemedText>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-500">Environment</Text>
            <ThemedText>{env.EXPO_PUBLIC_APP_ENV}</ThemedText>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-500">Auth Provider</Text>
            <ThemedText>{basekitConfig.features.auth.provider}</ThemedText>
          </View>
        </View>
      </View>

      <Pressable
        className="bg-red-600 rounded-lg py-3.5 items-center active:bg-red-700 mt-4"
        onPress={signOut}
      >
        <Text className="text-white font-semibold text-base">Sign Out</Text>
      </Pressable>
    </ThemedView>
  );
}
