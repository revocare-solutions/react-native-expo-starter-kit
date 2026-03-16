import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import type { CreateTaskInput } from '@/types';
import { TasksContext } from '../tasks-context';

export function useCreateTask() {
  const service = useContext(TasksContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => {
      if (!service) throw new Error('TasksContext not available');
      return service.createTask(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
