import { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useLanguage } from '@/features/i18n/hooks/use-language';

function ProfileSection() {
  const { user, updateProfile, deleteAccount } = useAuth();
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({ displayName: displayName.trim() });
      setEditing(false);
      Alert.alert('Success', 'Profile updated.');
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAccount();
              Alert.alert('Account Deleted', 'Your account has been deleted.');
            } catch (error) {
              Alert.alert(
                'Error',
                error instanceof Error ? error.message : 'Failed to delete account',
              );
            }
          },
        },
      ],
    );
  };

  return (
    <View className="mb-6">
      <ThemedText type="subtitle" className="mb-3">
        User Profile
      </ThemedText>
      <View className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <ThemedText className="text-sm text-gray-500 dark:text-gray-400">Email</ThemedText>
        <ThemedText className="text-base mb-3">{user?.email ?? 'Not signed in'}</ThemedText>

        <ThemedText className="text-sm text-gray-500 dark:text-gray-400">Display Name</ThemedText>
        {editing ? (
          <View className="mt-1">
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="Display name"
              placeholderTextColor="#9ca3af"
              className="bg-gray-100 dark:bg-gray-700 rounded-lg px-3 py-2 text-base text-black dark:text-white mb-2"
            />
            <View className="flex-row gap-2">
              <Pressable
                onPress={handleSave}
                disabled={saving}
                className="bg-blue-500 rounded-lg px-4 py-2">
                <ThemedText className="text-white text-sm font-semibold">
                  {saving ? 'Saving...' : 'Save'}
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => {
                  setEditing(false);
                  setDisplayName(user?.displayName ?? '');
                }}
                className="bg-gray-200 dark:bg-gray-600 rounded-lg px-4 py-2">
                <ThemedText className="text-sm font-semibold">Cancel</ThemedText>
              </Pressable>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center justify-between mt-1">
            <ThemedText className="text-base">{user?.displayName ?? 'Not set'}</ThemedText>
            <Pressable onPress={() => setEditing(true)}>
              <ThemedText className="text-blue-500 text-sm font-semibold">Edit</ThemedText>
            </Pressable>
          </View>
        )}
      </View>

      <Pressable
        onPress={handleDelete}
        className="bg-red-50 dark:bg-red-900/20 rounded-lg py-3 items-center mt-3">
        <ThemedText className="text-red-500 font-semibold">Delete Account</ThemedText>
      </Pressable>
    </View>
  );
}

function LanguageSection() {
  const { language, setLanguage, availableLanguages } = useLanguage();

  return (
    <View className="mb-6">
      <ThemedText type="subtitle" className="mb-3">
        Language
      </ThemedText>
      <View className="bg-white dark:bg-gray-800 rounded-lg p-4">
        <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          Current: {language}
        </ThemedText>
        <View className="flex-row gap-2">
          {availableLanguages.map((lang) => (
            <Pressable
              key={lang}
              onPress={() => setLanguage(lang)}
              className={`px-4 py-2 rounded-lg ${
                language === lang
                  ? 'bg-blue-500 dark:bg-blue-600'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}>
              <ThemedText
                className={`text-sm font-semibold ${language === lang ? 'text-white' : ''}`}>
                {lang.toUpperCase()}
              </ThemedText>
            </Pressable>
          ))}
        </View>
      </View>
    </View>
  );
}

export default function SettingsScreen() {
  const { signOut } = useAuth();

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        onPress: async () => {
          try {
            await signOut();
          } catch (error) {
            Alert.alert(
              'Error',
              error instanceof Error ? error.message : 'Failed to sign out',
            );
          }
        },
      },
    ]);
  };

  return (
    <ThemedView className="flex-1 pt-12">
      <View className="px-4 mb-4">
        <ThemedText type="title">Settings</ThemedText>
      </View>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <ProfileSection />
        <LanguageSection />

        <Pressable
          onPress={handleSignOut}
          className="bg-gray-200 dark:bg-gray-700 rounded-lg py-4 items-center">
          <ThemedText className="font-bold text-base">Sign Out</ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}
