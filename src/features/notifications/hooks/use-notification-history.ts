import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { PaginatedResult } from '@/types';

interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  status: string;
  sentAt: string | null;
  createdAt: string;
}

export function useNotificationHistory(page = 0, size = 20) {
  return useQuery({
    queryKey: ['notification-history', page, size],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResult<NotificationHistoryItem>>(
        '/api/notifications/history',
        { params: { page, size } },
      );
      return data;
    },
  });
}
