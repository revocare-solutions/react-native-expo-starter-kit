# Notifications

The notifications feature provides a unified interface for push notifications and local notifications in your React Native Expo app.

## Configuration

### Enable/Disable

Toggle notifications in `src/config/starter.config.ts`:

```ts
notifications: { enabled: true, provider: 'amplify' },
```

Set `enabled: false` to disable notifications entirely. When disabled, all calls are no-ops with zero overhead.

### Environment Variables

No additional environment variables are required for the default Amplify provider. The Expo push token is obtained automatically via `expo-notifications`.

### Install the Provider SDK

When using the Amplify provider, install the SDK:

```bash
pnpm add expo-notifications
```

Then create a development build:

```bash
npx expo run:ios
npx expo run:android
```

## Usage

Use the `useNotifications` hook inside any component:

```tsx
import { useNotifications } from '@/features/notifications';

function MyComponent() {
  const notifications = useNotifications();

  // Request permission
  const granted = await notifications.requestPermission();

  // Get push token
  const token = await notifications.getToken();

  // Send a local notification
  await notifications.sendLocalNotification({
    title: 'Hello',
    body: 'This is a local notification',
    data: { screen: 'home' },
  });

  // Listen for incoming notifications
  const unsubscribe = notifications.onNotificationReceived((response) => {
    console.log('Received:', response.payload.title);
  });

  // Listen for notification taps
  const unsubscribeTap = notifications.onNotificationOpened((response) => {
    console.log('Opened:', response.payload.title);
  });

  // Clean up listeners
  unsubscribe();
  unsubscribeTap();
}
```

## Adding a New Provider

1. Create a new file at `src/features/notifications/providers/<provider-name>.ts`.
2. Implement the `NotificationService` interface from `@/services/notifications.interface`.
3. Export a factory function: `export function create<Name>Notifications(): NotificationService`.
4. Register the provider in `src/features/notifications/create-notification-service.ts`:

```ts
const providers: Record<string, () => Promise<NotificationService>> = {
  amplify: async () => { /* ... */ },
  '<provider-name>': async () => {
    const { create<Name>Notifications } = await import('./providers/<provider-name>');
    return create<Name>Notifications();
  },
};
```

5. Add the provider name to the `StarterConfig` type in `src/config/starter.config.ts` if it is not already listed.

## Disabling the Feature

Set `enabled: false` in `src/config/starter.config.ts`:

```ts
notifications: { enabled: false, provider: 'amplify' },
```

When disabled:
- The `NotificationProvider` renders children directly without loading any SDK.
- The `useNotifications` hook returns a no-op implementation.
- No native modules are loaded, so no SDK installation is required.
