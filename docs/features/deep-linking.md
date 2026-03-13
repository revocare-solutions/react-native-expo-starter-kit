# Deep Linking

Deep linking allows users to open specific screens in your app via URLs. Expo Router handles most of the heavy lifting automatically — every route in your `app/` directory is already a valid deep link target.

## How It Works

Expo Router uses file-based routing, which means deep links map directly to your file structure:

| URL | Route File |
| --- | --- |
| `myapp://home` | `app/home.tsx` |
| `myapp://profile/123` | `app/profile/[id].tsx` |
| `myapp://settings` | `app/settings.tsx` |

No additional route configuration is needed. Expo Router and `expo-linking` handle the URL-to-route mapping automatically.

## Configuration

### URL Scheme

The URL scheme is configured in `src/config/starter.config.ts`:

```typescript
export const starterConfig: StarterConfig = {
  app: {
    scheme: 'myapp', // Your custom URL scheme
  },
  features: {
    deepLinking: { enabled: true },
  },
};
```

The scheme is also set in `app.json` / `app.config.ts` under the `scheme` field, which Expo uses at build time. Make sure both values match.

## Utilities

### `useDeepLink` Hook

Listens for incoming deep links and provides the most recent URL:

```typescript
import { useDeepLink } from '@/features/deep-linking';

export default function RootLayout() {
  const { lastUrl } = useDeepLink();

  useEffect(() => {
    if (lastUrl) {
      console.log('App opened with URL:', lastUrl);
    }
  }, [lastUrl]);

  return <Stack />;
}
```

The hook handles two scenarios:
- **Cold start**: The app was opened via a deep link (uses `Linking.getInitialURL()`)
- **Warm resume**: A deep link arrived while the app was already running (uses `Linking.addEventListener`)

When `features.deepLinking.enabled` is `false`, the hook skips all listeners and returns `null`.

### `buildDeepLink` Utility

Constructs a deep link URL using the configured scheme:

```typescript
import { buildDeepLink } from '@/features/deep-linking';

const url = buildDeepLink('/profile/123');
// => 'myapp://profile/123'

const url2 = buildDeepLink('settings');
// => 'myapp://settings'
```

This is useful for generating share links or triggering navigation programmatically via `Linking.openURL()`.

## Universal Links (HTTPS Deep Links)

For production apps, you should also configure universal links (iOS) and app links (Android) so that HTTPS URLs open your app:

1. **iOS**: Add an `apple-app-site-association` file to your web domain
2. **Android**: Add `assetlinks.json` to your web domain's `.well-known` directory
3. **Expo Config**: Add `intentFilters` (Android) and `associatedDomains` (iOS) to your `app.json`

Refer to the [Expo deep linking guide](https://docs.expo.dev/guides/deep-linking/) for detailed setup instructions.

## Disabling Deep Linking

Set `features.deepLinking.enabled` to `false` in `starter.config.ts`. This disables the `useDeepLink` hook listener. Note that expo-router still handles basic URL routing — this flag only controls the custom hook and utilities provided by this feature.

## Testing Deep Links

Use the `uri-scheme` CLI to test deep links during development:

```bash
# iOS Simulator
npx uri-scheme open myapp://profile/123 --ios

# Android Emulator
npx uri-scheme open myapp://profile/123 --android

# Or use adb directly
adb shell am start -a android.intent.action.VIEW -d "myapp://profile/123"
```

You can also test from a terminal with Expo Go running:

```bash
npx expo start --dev-client
# Then open a deep link in another terminal
```
