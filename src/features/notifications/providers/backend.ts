import { Platform } from 'react-native';
import { apiClient } from '@/lib/api';
import type { NotificationService } from '@/services/notifications.interface';
import type { PushNotificationToken, NotificationPayload, NotificationResponse } from '@/types';

export function createBackendNotifications(): NotificationService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const ExpoNotifications = require('expo-notifications');

  const service: NotificationService = {
    async initialize() {
      const token = await service.getToken();
      if (token) {
        try {
          await apiClient.post('/api/notifications/tokens', {
            token: token.token,
            platform: token.platform,
          });
        } catch {
          // Best-effort token registration
        }
      }
    },

    async requestPermission() {
      const { status } = await ExpoNotifications.requestPermissionsAsync();
      return status === 'granted';
    },

    async getToken(): Promise<PushNotificationToken | null> {
      try {
        const { data: token } = await ExpoNotifications.getExpoPushTokenAsync();
        return {
          token,
          platform: Platform.OS as 'ios' | 'android' | 'web',
        };
      } catch {
        return null;
      }
    },

    async sendLocalNotification(payload: NotificationPayload) {
      await ExpoNotifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data,
        },
        trigger: null,
      });
    },

    onNotificationReceived(callback: (response: NotificationResponse) => void) {
      const sub = ExpoNotifications.addNotificationReceivedListener(
        (notification: {
          request: {
            identifier: string;
            content: { title: string | null; body: string | null; data: Record<string, string> };
          };
        }) => {
          callback({
            id: notification.request.identifier,
            payload: {
              title: notification.request.content.title ?? '',
              body: notification.request.content.body ?? '',
              data: notification.request.content.data,
            },
          });
        },
      );
      return () => sub.remove();
    },

    onNotificationOpened(callback: (response: NotificationResponse) => void) {
      const sub = ExpoNotifications.addNotificationResponseReceivedListener(
        (response: {
          notification: {
            request: {
              identifier: string;
              content: { title: string | null; body: string | null; data: Record<string, string> };
            };
          };
          actionIdentifier: string;
        }) => {
          callback({
            id: response.notification.request.identifier,
            payload: {
              title: response.notification.request.content.title ?? '',
              body: response.notification.request.content.body ?? '',
              data: response.notification.request.content.data,
            },
            actionId: response.actionIdentifier,
          });
        },
      );
      return () => sub.remove();
    },
  };

  return service;
}
