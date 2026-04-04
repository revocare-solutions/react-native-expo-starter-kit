import type { PushNotificationToken, NotificationPayload, NotificationResponse } from '@/types';

export interface NotificationService {
  initialize(): Promise<void>;
  requestPermission(): Promise<boolean>;
  getToken(): Promise<PushNotificationToken | null>;
  sendLocalNotification(payload: NotificationPayload): Promise<void>;
  onNotificationReceived(callback: (response: NotificationResponse) => void): () => void;
  onNotificationOpened(callback: (response: NotificationResponse) => void): () => void;
}
