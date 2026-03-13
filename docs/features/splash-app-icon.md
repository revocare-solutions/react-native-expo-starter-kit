# Splash Screen & App Icon

The splash screen is the first thing users see when your app launches. Combined with a polished app icon, it sets the tone for the entire experience. This feature provides a `useSplashScreen` hook for controlling splash screen visibility and documents how to customise both the splash screen and app icon.

## Configuration

Toggle the feature in `src/config/starter.config.ts`:

```typescript
export const starterConfig: StarterConfig = {
  features: {
    splashAppIcon: { enabled: true },
  },
};
```

When `enabled` is `false`, the `useSplashScreen` hook becomes a no-op — calling `hideSplash` or `preventAutoHide` will do nothing.

## Using the `useSplashScreen` Hook

```typescript
import { useSplashScreen } from '@/features/splash-app-icon';

function App() {
  const { isReady, hideSplash, preventAutoHide } = useSplashScreen();

  // isReady         — true after the splash screen has been hidden
  // hideSplash      — hides the splash screen
  // preventAutoHide — prevents the splash screen from hiding automatically
}
```

## Splash Screen Customisation

### Basic Configuration in `app.json`

The splash screen is configured through the `expo-splash-screen` plugin in `app.json`:

```json
{
  "expo": {
    "plugins": [
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff",
          "dark": {
            "backgroundColor": "#000000"
          }
        }
      ]
    ]
  }
}
```

| Property          | Description                                                      |
| ----------------- | ---------------------------------------------------------------- |
| `image`           | Path to the splash image asset                                   |
| `imageWidth`      | Width of the splash image in pixels                              |
| `resizeMode`      | How the image fits the screen: `contain`, `cover`, or `native`   |
| `backgroundColor` | Background colour behind the splash image                        |
| `dark`            | Dark-mode overrides (e.g. a different `backgroundColor`)         |

### Preventing Auto-Hide for Data Loading

By default the splash screen hides as soon as the app is ready. If you need to load data (fonts, API calls, etc.) before showing the UI, prevent auto-hide and manually dismiss:

```typescript
import { useEffect } from 'react';
import { useSplashScreen } from '@/features/splash-app-icon';

export function AppRoot() {
  const { hideSplash, preventAutoHide } = useSplashScreen();

  useEffect(() => {
    preventAutoHide();
  }, [preventAutoHide]);

  useEffect(() => {
    async function prepare() {
      // Load fonts, fetch initial data, etc.
      await loadResources();
      await hideSplash();
    }
    prepare();
  }, [hideSplash]);

  return <MainNavigator />;
}
```

### Custom Animated Splash Screen

You can build a custom animated splash transition by keeping the native splash visible until your animated component is ready, then fading or sliding it away:

```typescript
import { useEffect } from 'react';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { useSplashScreen } from '@/features/splash-app-icon';

export function AnimatedSplash({ children }: { children: React.ReactNode }) {
  const opacity = useSharedValue(1);
  const { hideSplash, preventAutoHide } = useSplashScreen();

  useEffect(() => {
    preventAutoHide();
  }, [preventAutoHide]);

  const onReady = async () => {
    await hideSplash();
    opacity.value = withTiming(0, { duration: 500 });
  };

  return (
    <>
      {children}
      <Animated.View
        style={{ opacity, ...StyleSheet.absoluteFillObject }}
        pointerEvents="none"
      >
        {/* Your custom splash content */}
      </Animated.View>
    </>
  );
}
```

## App Icon Customisation

### iOS Icon

Set the main icon in `app.json`:

```json
{
  "expo": {
    "icon": "./assets/images/icon.png"
  }
}
```

- **Size**: 1024x1024 pixels (required by App Store Connect)
- **Format**: PNG without transparency (iOS does not support transparent icons)
- Expo automatically generates all required sizes from this single source image

### Android Adaptive Icon

Android uses adaptive icons with separate foreground and background layers:

```json
{
  "expo": {
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png",
        "backgroundColor": "#E6F4FE"
      }
    }
  }
}
```

| Property          | Description                                                        |
| ----------------- | ------------------------------------------------------------------ |
| `foregroundImage` | The icon foreground layer (512x512, centred with safe-zone padding) |
| `backgroundImage` | The icon background layer (512x512) — or use `backgroundColor`     |
| `monochromeImage` | Monochrome version for themed icons (Android 13+)                  |
| `backgroundColor` | Flat colour used as background if `backgroundImage` is not set     |

**Important**: Keep the foreground content within the inner 66% safe zone (approximately 340x340 of the 512x512 canvas) so it is not clipped on devices that use circular or squircle masks.

### Using Expo's Icon Generator

You can use [Expo's icon guidelines](https://docs.expo.dev/develop/user-interface/app-icons/) and tools:

1. Design a 1024x1024 icon for iOS
2. Design 512x512 foreground and background layers for Android adaptive icons
3. Place images in `assets/images/`
4. Reference them in `app.json` as shown above
5. Run `npx expo prebuild` to generate platform-specific icon sets

## Favicon (Web)

For the web build, set a favicon in `app.json`:

```json
{
  "expo": {
    "web": {
      "favicon": "./assets/images/favicon.png"
    }
  }
}
```

The favicon should be a square PNG, ideally 48x48 or larger. Expo will use this for the browser tab icon.

## Disabling the Feature

Set `features.splashAppIcon.enabled` to `false` in `starter.config.ts`. The `useSplashScreen` hook will still return its API surface, but `hideSplash` and `preventAutoHide` become no-ops. The native splash screen and app icon configuration in `app.json` remain unaffected — this toggle only controls the hook behaviour.
