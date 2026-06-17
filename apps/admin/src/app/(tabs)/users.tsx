import { View, Text, FlatList } from 'react-native';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';

export default function UsersScreen() {
  return (
    <ThemedView className="flex-1 p-6 pt-16">
      <ThemedText type="title" className="mb-2">Users</ThemedText>
      <ThemedText className="text-gray-500 dark:text-gray-400 mb-6">
        Manage user accounts and roles
      </ThemedText>

      <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 items-center">
        <Text className="text-4xl mb-3">👥</Text>
        <ThemedText type="defaultSemiBold" className="mb-1">No users yet</ThemedText>
        <ThemedText className="text-sm text-gray-500 text-center">
          Users will appear here once they register through the client app.
        </ThemedText>
      </View>
    </ThemedView>
  );
}
