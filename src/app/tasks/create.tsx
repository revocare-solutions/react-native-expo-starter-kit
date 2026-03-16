import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, TextInput, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useCreateTask } from '@/features/tasks/hooks/use-create-task';
import type { TaskPriority, TaskStatus } from '@/types';

const STATUS_OPTIONS: TaskStatus[] = ['todo', 'in_progress', 'done'];
const PRIORITY_OPTIONS: TaskPriority[] = ['low', 'medium', 'high'];

function OptionPicker<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: T[];
  value: T;
  onChange: (val: T) => void;
}) {
  return (
    <View className="mb-4">
      <ThemedText className="text-sm font-semibold mb-2">{label}</ThemedText>
      <View className="flex-row gap-2">
        {options.map((opt) => (
          <Pressable
            key={opt}
            onPress={() => onChange(opt)}
            className={`px-3 py-2 rounded-lg ${
              value === opt ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}>
            <ThemedText
              className={`text-sm font-medium ${value === opt ? 'text-white' : ''}`}>
              {opt.replace('_', ' ')}
            </ThemedText>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

export default function CreateTaskScreen() {
  const router = useRouter();
  const createTask = useCreateTask();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('todo');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required.');
      return;
    }

    createTask.mutate(
      {
        title: title.trim(),
        description: description.trim() || undefined,
        status,
        priority,
        dueDate: dueDate.trim() || undefined,
      },
      {
        onSuccess: () => router.back(),
        onError: (error) =>
          Alert.alert('Error', error instanceof Error ? error.message : 'Failed to create task'),
      },
    );
  };

  return (
    <ThemedView className="flex-1">
      <ScrollView className="flex-1 px-4 pt-4" keyboardShouldPersistTaps="handled">
        <View className="mb-4">
          <ThemedText className="text-sm font-semibold mb-2">Title *</ThemedText>
          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Task title"
            placeholderTextColor="#9ca3af"
            className="bg-white dark:bg-gray-800 rounded-lg px-4 py-3 text-base text-black dark:text-white"
          />
        </View>

        <View className="mb-4">
          <ThemedText className="text-sm font-semibold mb-2">Description</ThemedText>
          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Task description"
            placeholderTextColor="#9ca3af"
            multiline
            numberOfLines={4}
            className="bg-white dark:bg-gray-800 rounded-lg px-4 py-3 text-base text-black dark:text-white min-h-[100px]"
            textAlignVertical="top"
          />
        </View>

        <OptionPicker label="Status" options={STATUS_OPTIONS} value={status} onChange={setStatus} />

        <OptionPicker
          label="Priority"
          options={PRIORITY_OPTIONS}
          value={priority}
          onChange={setPriority}
        />

        <View className="mb-4">
          <ThemedText className="text-sm font-semibold mb-2">Due Date</ThemedText>
          <TextInput
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#9ca3af"
            className="bg-white dark:bg-gray-800 rounded-lg px-4 py-3 text-base text-black dark:text-white"
          />
        </View>

        <Pressable
          onPress={handleSubmit}
          disabled={createTask.isPending}
          className={`rounded-lg py-4 items-center mt-2 mb-8 ${
            createTask.isPending ? 'bg-blue-300' : 'bg-blue-500'
          }`}>
          <ThemedText className="text-white font-bold text-base">
            {createTask.isPending ? 'Creating...' : 'Create Task'}
          </ThemedText>
        </Pressable>
      </ScrollView>
    </ThemedView>
  );
}
