import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import type { TaskFilters } from '@/types';
import { TasksContext } from '../tasks-context';

export function useTasks(filters?: TaskFilters) {
  const service = useContext(TasksContext);

  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => {
      if (!service) throw new Error('TasksContext not available');
      return service.getTasks(filters);
    },
    enabled: !!service,
  });
}
