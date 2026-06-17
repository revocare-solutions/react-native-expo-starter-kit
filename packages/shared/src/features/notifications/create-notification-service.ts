import type { NotificationService } from '@/services/notifications.interface';
import { basekitConfig } from '@/config/basekit.config';
import { noOpNotifications } from './no-op-notifications';

const providers: Record<string, () => Promise<NotificationService>> = {
  amplify: async () => {
    const { createAmplifyNotifications } = await import('./providers/amplify');
    return createAmplifyNotifications();
  },
};

export async function createNotificationService(): Promise<NotificationService> {
  if (!basekitConfig.features.notifications.enabled) {
    return noOpNotifications;
  }

  const { provider } = basekitConfig.features.notifications;
  const factory = providers[provider];
  if (!factory) throw new Error(`Unknown notifications provider: ${provider}`);

  try {
    return await factory();
  } catch {
    console.warn(
      `[notifications] Failed to load "${provider}" provider (native module not available). Falling back to no-op notifications. ` +
      `If you need notifications, install the provider SDK and create a dev build with: npx expo run:ios / npx expo run:android`,
    );
    return noOpNotifications;
  }
}
