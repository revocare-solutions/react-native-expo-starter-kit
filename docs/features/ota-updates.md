# OTA Updates

Over-the-air (OTA) updates allow you to push JavaScript and asset changes to your app without going through the app store review process. This feature uses `expo-updates` under the hood.

## How It Works

When your app launches (or when you explicitly check), `expo-updates` contacts the update server to see if a new bundle is available. If one is found, it can be downloaded and applied — either immediately with a reload or on the next app launch.

## Configuration

Toggle OTA updates in `src/config/starter.config.ts`:

```typescript
export const starterConfig: StarterConfig = {
  features: {
    otaUpdates: { enabled: true },
  },
};
```

When `enabled` is `false`, the `useOtaUpdates` hook becomes a no-op — no network requests are made and no updates are checked or applied.

## Using the `useOtaUpdates` Hook

```typescript
import { useOtaUpdates } from '@/features/ota-updates';

function MyComponent() {
  const { status, checkForUpdate, downloadAndApply } = useOtaUpdates();

  // status.isChecking    — true while checking for an update
  // status.isDownloading — true while downloading an update
  // status.isAvailable   — true if an update was found
  // status.error         — error message string, or null

  return (
    <View>
      <Button title="Check for updates" onPress={checkForUpdate} />
      {status.isAvailable && (
        <Button title="Download & restart" onPress={downloadAndApply} />
      )}
      {status.error && <Text>Error: {status.error}</Text>}
    </View>
  );
}
```

## Example: Check on App Foreground

You can automatically check for updates each time the app returns to the foreground:

```typescript
import { useEffect } from 'react';
import { AppState } from 'react-native';
import { useOtaUpdates } from '@/features/ota-updates';

export function useAutoUpdateCheck() {
  const { checkForUpdate } = useOtaUpdates();

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        checkForUpdate();
      }
    });

    return () => subscription.remove();
  }, [checkForUpdate]);
}
```

## EAS Update Setup

To publish OTA updates you need [EAS Update](https://docs.expo.dev/eas-update/introduction/) configured:

1. Install the EAS CLI:
   ```bash
   pnpm add -g eas-cli
   ```

2. Configure your project:
   ```bash
   eas update:configure
   ```

3. Publish an update:
   ```bash
   eas update --branch production --message "Bug fixes"
   ```

Make sure `expo-updates` is installed as a dependency for standalone builds:

```bash
pnpm add expo-updates
```

The `expo-updates` package is part of the Expo ecosystem but must be installed separately. In Expo Go, update checking is not available — the hook uses `require('expo-updates')` at runtime to avoid import errors in that environment.

## Disabling the Feature

Set `features.otaUpdates.enabled` to `false` in `starter.config.ts`. The `useOtaUpdates` hook will return the default status (all `false`/`null`) and calling `checkForUpdate` or `downloadAndApply` will be no-ops. No `expo-updates` code will be executed.
