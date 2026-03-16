import type { TaskService } from '@/services/tasks.interface';
import { starterConfig } from '@/config/starter.config';
import { noOpTasks } from './no-op-tasks';

const providers: Record<string, () => Promise<TaskService>> = {
  backend: () => import('./providers/backend').then((m) => m.backendTaskService),
};

export async function createTasksService(): Promise<TaskService> {
  if (!starterConfig.features.tasks.enabled) {
    return noOpTasks;
  }

  const { provider } = starterConfig.features.tasks;
  const factory = providers[provider];
  if (!factory) {
    console.warn(`[tasks] Unknown tasks provider: ${provider}. Falling back to no-op.`);
    return noOpTasks;
  }

  try {
    return await factory();
  } catch (error) {
    console.warn(
      `[tasks] Failed to load "${provider}" provider. Falling back to no-op.`,
      error instanceof Error ? error.message : error,
    );
    return noOpTasks;
  }
}
