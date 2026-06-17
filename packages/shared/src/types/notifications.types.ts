export interface PushNotificationToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface NotificationResponse {
  id: string;
  payload: NotificationPayload;
  actionId?: string;
}
