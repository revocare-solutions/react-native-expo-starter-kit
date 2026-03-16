import React, { useEffect, useState } from 'react';
import type { TaskService } from '@/services/tasks.interface';
import { starterConfig } from '@/config/starter.config';
import { TasksContext } from './tasks-context';
import { createTasksService } from './create-tasks-service';

function TasksProviderInner({ children }: { children: React.ReactNode }) {
  const [service, setService] = useState<TaskService | null>(null);

  useEffect(() => {
    createTasksService().then(setService);
  }, []);

  if (!service) return null;

  return (
    <TasksContext.Provider value={service}>
      {children}
    </TasksContext.Provider>
  );
}

export function TasksProvider({ children }: { children: React.ReactNode }) {
  if (!starterConfig.features.tasks.enabled) {
    return <>{children}</>;
  }

  return <TasksProviderInner>{children}</TasksProviderInner>;
}
