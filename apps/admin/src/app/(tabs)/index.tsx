import { View, Text } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function DashboardScreen() {
  return (
    <ThemedView className="flex-1 p-6 pt-16">
      <ThemedText type="title" className="mb-2">Dashboard</ThemedText>
      <ThemedText className="text-gray-500 dark:text-gray-400 mb-8">
        Admin overview and analytics
      </ThemedText>

      <View className="flex-row gap-4 mb-6">
        <View className="flex-1 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
          <Text className="text-2xl font-bold text-blue-600">0</Text>
          <Text className="text-sm text-gray-500 mt-1">Total Users</Text>
        </View>
        <View className="flex-1 bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
          <Text className="text-2xl font-bold text-green-600">0</Text>
          <Text className="text-sm text-gray-500 mt-1">Active Today</Text>
        </View>
      </View>

      <View className="flex-row gap-4">
        <View className="flex-1 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-4">
          <Text className="text-2xl font-bold text-purple-600">0</Text>
          <Text className="text-sm text-gray-500 mt-1">New Signups</Text>
        </View>
        <View className="flex-1 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-4">
          <Text className="text-2xl font-bold text-orange-600">0</Text>
          <Text className="text-sm text-gray-500 mt-1">Pending</Text>
        </View>
      </View>
    </ThemedView>
  );
}
