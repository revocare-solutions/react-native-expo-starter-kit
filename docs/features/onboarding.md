# Onboarding

## Overview

The onboarding feature provides a swipeable multi-page introduction flow shown to users on their first app launch. It persists completion state so users only see it once, and can be toggled on/off via configuration.

## Configuration

Enable or disable onboarding in `src/config/starter.config.ts`:

```typescript
features: {
  onboarding: { enabled: true },
}
```

When `enabled` is `false`, `useOnboarding().shouldShow` will always return `false`.

## Using the `useOnboarding` Hook

```typescript
import { useOnboarding } from '@/features/onboarding';

function MyComponent() {
  const { shouldShow, complete, reset, enabled } = useOnboarding();

  // shouldShow - true when onboarding is enabled AND not yet completed
  // complete() - marks onboarding as done (persisted via Zustand/MMKV)
  // reset()    - resets onboarding state (useful during development)
  // enabled    - whether the feature toggle is on
}
```

## Using the `OnboardingScreen` Component

`OnboardingScreen` renders the full onboarding flow with horizontal swiping, pagination dots, Skip button, and Next/Get Started button:

```typescript
import { OnboardingScreen } from '@/features/onboarding';

// Render conditionally based on onboarding state
function App() {
  const { shouldShow } = useOnboarding();

  if (shouldShow) {
    return <OnboardingScreen />;
  }

  return <MainApp />;
}
```

## Customizing Onboarding Pages

Edit the `PAGES` array in `src/features/onboarding/components/onboarding-screen.tsx`:

```typescript
const PAGES = [
  { title: 'Welcome', description: 'Get started with your new app.', icon: '\uD83D\uDC4B' },
  { title: 'Discover', description: 'Explore features built for you.', icon: '\uD83D\uDD0D' },
  { title: 'Ready', description: "You are all set. Let's go!", icon: '\uD83D\uDE80' },
];
```

Each page accepts:
- `title` - heading text
- `description` - body text
- `icon` (optional) - emoji or text displayed above the title

For more control, use `OnboardingPage` directly:

```typescript
import { OnboardingPage } from '@/features/onboarding';

<OnboardingPage title="Custom" description="Your custom page." icon="*" />
```

## Resetting Onboarding for Development

Use the `reset()` function from `useOnboarding`:

```typescript
const { reset } = useOnboarding();
reset(); // Onboarding will show again on next render
```

## Disabling the Feature

Set `onboarding.enabled` to `false` in `src/config/starter.config.ts`. The `shouldShow` flag will always be `false` regardless of completion state.
