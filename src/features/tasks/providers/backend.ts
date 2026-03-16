import { apiClient } from '@/lib/api';
import type { TaskService } from '@/services/tasks.interface';
import type { Task, TaskFilters, CreateTaskInput, UpdateTaskInput, PaginatedResult } from '@/types';

export const backendTaskService: TaskService = {
  async getTasks(filters?: TaskFilters): Promise<PaginatedResult<Task>> {
    const params: Record<string, string | number> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.priority) params.priority = filters.priority;
    if (filters?.page !== undefined) params.page = filters.page;
    if (filters?.size !== undefined) params.size = filters.size;

    const { data } = await apiClient.get<PaginatedResult<Task>>('/api/tasks', { params });
    return data;
  },

  async getTask(id: string): Promise<Task> {
    const { data } = await apiClient.get<Task>(`/api/tasks/${id}`);
    return data;
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    const { data } = await apiClient.post<Task>('/api/tasks', input);
    return data;
  },

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    const { data } = await apiClient.put<Task>(`/api/tasks/${id}`, input);
    return data;
  },

  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/api/tasks/${id}`);
  },
};
