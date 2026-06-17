import type { NotificationService } from '@/services/notifications.interface';
import type { NotificationPayload, NotificationResponse } from '@/types';

export function createAmplifyNotifications(): NotificationService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Notifications = require('expo-notifications');

  return {
    async initialize() {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance?.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    },

    async requestPermission() {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      if (existingStatus === 'granted') return true;

      const { status } = await Notifications.requestPermissionsAsync();
      return status === 'granted';
    },

    async getToken() {
      const tokenData = await Notifications.getExpoPushTokenAsync();
      return {
        token: tokenData.data,
        platform: (await import('react-native')).Platform.OS === 'ios' ? 'ios' : 'android',
      };
    },

    async sendLocalNotification(payload: NotificationPayload) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data,
        },
        trigger: null,
      });
    },

    onNotificationReceived(callback: (response: NotificationResponse) => void) {
      const subscription = Notifications.addNotificationReceivedListener(
        (notification: { request: { identifier: string; content: { title: string; body: string; data: Record<string, string> } } }) => {
          callback({
            id: notification.request.identifier,
            payload: {
              title: notification.request.content.title,
              body: notification.request.content.body,
              data: notification.request.content.data,
            },
          });
        },
      );
      return () => subscription.remove();
    },

    onNotificationOpened(callback: (response: NotificationResponse) => void) {
      const subscription = Notifications.addNotificationResponseReceivedListener(
        (response: { notification: { request: { identifier: string; content: { title: string; body: string; data: Record<string, string> } } }; actionIdentifier: string }) => {
          callback({
            id: response.notification.request.identifier,
            payload: {
              title: response.notification.request.content.title,
              body: response.notification.request.content.body,
              data: response.notification.request.content.data,
            },
            actionId: response.actionIdentifier,
          });
        },
      );
      return () => subscription.remove();
    },
  };
}
