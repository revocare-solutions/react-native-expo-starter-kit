import { createContext } from 'react';
import type { TaskService } from '@/services/tasks.interface';

export const TasksContext = createContext<TaskService | null>(null);
