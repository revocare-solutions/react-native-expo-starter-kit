import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { TasksContext } from '../tasks-context';

export function useDeleteTask() {
  const service = useContext(TasksContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!service) throw new Error('TasksContext not available');
      return service.deleteTask(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
