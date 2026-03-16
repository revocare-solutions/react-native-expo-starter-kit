import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Pressable, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useDeleteTask } from '@/features/tasks/hooks/use-delete-task';
import { useTasks } from '@/features/tasks/hooks/use-tasks';
import type { Task, TaskPriority, TaskStatus } from '@/types';

const STATUS_OPTIONS: (TaskStatus | 'all')[] = ['all', 'todo', 'in_progress', 'done'];
const PRIORITY_OPTIONS: (TaskPriority | 'all')[] = ['all', 'low', 'medium', 'high'];

const STATUS_COLORS: Record<TaskStatus, string> = {
  todo: 'bg-gray-200 dark:bg-gray-700',
  in_progress: 'bg-blue-200 dark:bg-blue-800',
  done: 'bg-green-200 dark:bg-green-800',
};

const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: 'bg-gray-200 dark:bg-gray-700',
  medium: 'bg-yellow-200 dark:bg-yellow-800',
  high: 'bg-red-200 dark:bg-red-800',
};

function StatusBadge({ status }: { status: TaskStatus }) {
  return (
    <View className={`px-2 py-0.5 rounded-full ${STATUS_COLORS[status]}`}>
      <ThemedText className="text-xs font-semibold">{status.replace('_', ' ')}</ThemedText>
    </View>
  );
}

function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <View className={`px-2 py-0.5 rounded-full ${PRIORITY_COLORS[priority]}`}>
      <ThemedText className="text-xs font-semibold">{priority}</ThemedText>
    </View>
  );
}

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`px-3 py-1.5 rounded-full mr-2 ${
        active ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
      }`}>
      <ThemedText
        className={`text-xs font-semibold ${active ? 'text-white' : ''}`}>
        {label.replace('_', ' ')}
      </ThemedText>
    </Pressable>
  );
}

function TaskRow({ task, onDelete }: { task: Task; onDelete: (id: string) => void }) {
  return (
    <View className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-3 mx-4">
      <View className="flex-row items-center justify-between mb-2">
        <ThemedText className="text-base font-semibold flex-1 mr-2" numberOfLines={1}>
          {task.title}
        </ThemedText>
        <Pressable
          onPress={() =>
            Alert.alert('Delete Task', `Delete "${task.title}"?`, [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Delete', style: 'destructive', onPress: () => onDelete(task.id) },
            ])
          }
          className="px-2 py-1">
          <ThemedText className="text-red-500 text-sm font-semibold">Delete</ThemedText>
        </Pressable>
      </View>
      <View className="flex-row items-center gap-2 mb-1">
        <StatusBadge status={task.status} />
        <PriorityBadge priority={task.priority} />
      </View>
      {task.dueDate && (
        <ThemedText className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Due: {new Date(task.dueDate).toLocaleDateString()}
        </ThemedText>
      )}
    </View>
  );
}

export default function TasksScreen() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<TaskStatus | undefined>();
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | undefined>();

  const { data, isLoading, refetch, isRefetching } = useTasks({
    status: statusFilter,
    priority: priorityFilter,
  });
  const deleteTask = useDeleteTask();

  const tasks: Task[] = data?.content ?? (Array.isArray(data) ? data : []);

  return (
    <ThemedView className="flex-1 pt-12">
      <View className="flex-row items-center justify-between px-4 mb-4">
        <ThemedText type="title">Tasks</ThemedText>
        <Pressable
          onPress={() => router.push('/tasks/create')}
          className="bg-blue-500 rounded-full w-10 h-10 items-center justify-center">
          <ThemedText className="text-white text-2xl font-bold leading-none">+</ThemedText>
        </Pressable>
      </View>

      <View className="px-4 mb-2">
        <ThemedText className="text-xs text-gray-500 dark:text-gray-400 mb-1">Status</ThemedText>
        <View className="flex-row mb-3">
          {STATUS_OPTIONS.map((s) => (
            <FilterChip
              key={s}
              label={s}
              active={s === 'all' ? !statusFilter : statusFilter === s}
              onPress={() => setStatusFilter(s === 'all' ? undefined : s)}
            />
          ))}
        </View>
        <ThemedText className="text-xs text-gray-500 dark:text-gray-400 mb-1">Priority</ThemedText>
        <View className="flex-row">
          {PRIORITY_OPTIONS.map((p) => (
            <FilterChip
              key={p}
              label={p}
              active={p === 'all' ? !priorityFilter : priorityFilter === p}
              onPress={() => setPriorityFilter(p === 'all' ? undefined : p)}
            />
          ))}
        </View>
      </View>

      {isLoading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TaskRow task={item} onDelete={(id) => deleteTask.mutate(id)} />
          )}
          refreshing={isRefetching}
          onRefresh={refetch}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
          ListEmptyComponent={
            <View className="flex-1 items-center justify-center py-20">
              <ThemedText className="text-gray-500 dark:text-gray-400 text-lg">
                No tasks yet
              </ThemedText>
              <ThemedText className="text-gray-400 dark:text-gray-500 text-sm mt-1">
                Tap + to create your first task
              </ThemedText>
            </View>
          }
        />
      )}
    </ThemedView>
  );
}
