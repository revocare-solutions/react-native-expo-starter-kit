import type { NotificationService } from '@/services/notifications.interface';

export const noOpNotifications: NotificationService = {
  initialize: async () => {},
  requestPermission: async () => false,
  getToken: async () => null,
  sendLocalNotification: async () => {},
  onNotificationReceived: () => () => {},
  onNotificationOpened: () => () => {},
};
