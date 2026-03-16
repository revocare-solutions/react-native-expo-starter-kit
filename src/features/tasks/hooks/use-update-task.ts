import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import type { UpdateTaskInput, Task, PaginatedResult } from '@/types';
import { TasksContext } from '../tasks-context';

export function useUpdateTask() {
  const service = useContext(TasksContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) => {
      if (!service) throw new Error('TasksContext not available');
      return service.updateTask(id, input);
    },
    onMutate: async ({ id, input }) => {
      await queryClient.cancelQueries({ queryKey: ['tasks'], exact: false });
      const previousTasks = queryClient.getQueriesData<PaginatedResult<Task>>({
        queryKey: ['tasks'],
        predicate: (query) => query.queryKey.length === 1 || (query.queryKey.length === 2 && typeof query.queryKey[1] === 'object'),
      });

      previousTasks.forEach(([key]) => {
        queryClient.setQueryData<PaginatedResult<Task>>(key, (old) => {
          if (!old?.content) return old;
          return {
            ...old,
            content: old.content.map((t) => (t.id === id ? { ...t, ...input } : t)),
          };
        });
      });

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      context?.previousTasks.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
