import type { TaskService } from '@/services/tasks.interface';

export const noOpTasks: TaskService = {
  getTasks: async () => ({ content: [], page: 0, size: 0, totalElements: 0, totalPages: 0 }),
  getTask: async () => ({ id: '', title: '', description: null, status: 'todo', priority: 'medium', dueDate: null, createdAt: '', updatedAt: '' }),
  createTask: async (input) => ({ id: '', title: input.title, description: null, status: 'todo', priority: 'medium', dueDate: null, createdAt: '', updatedAt: '' }),
  updateTask: async () => ({ id: '', title: '', description: null, status: 'todo', priority: 'medium', dueDate: null, createdAt: '', updatedAt: '' }),
  deleteTask: async () => {},
};
