import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { TasksContext } from '../tasks-context';

export function useTask(id: string) {
  const service = useContext(TasksContext);

  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => {
      if (!service) throw new Error('TasksContext not available');
      return service.getTask(id);
    },
    enabled: !!service && !!id,
  });
}
