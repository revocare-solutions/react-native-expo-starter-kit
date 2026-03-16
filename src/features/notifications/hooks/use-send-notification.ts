import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface SendNotificationInput {
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}

export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SendNotificationInput) => {
      await apiClient.post('/api/notifications/send', input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-history'] });
    },
  });
}
