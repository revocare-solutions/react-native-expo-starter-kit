import type { Task, TaskFilters, CreateTaskInput, UpdateTaskInput, PaginatedResult } from '@/types';

export interface TaskService {
  getTasks(filters?: TaskFilters): Promise<PaginatedResult<Task>>;
  getTask(id: string): Promise<Task>;
  createTask(input: CreateTaskInput): Promise<Task>;
  updateTask(id: string, input: UpdateTaskInput): Promise<Task>;
  deleteTask(id: string): Promise<void>;
}
