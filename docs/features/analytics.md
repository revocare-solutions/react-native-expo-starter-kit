# Analytics

The analytics feature provides a unified interface for tracking events, screen views, and user properties in your React Native Expo app.

## Configuration

### Enable/Disable

Toggle analytics in `src/config/starter.config.ts`:

```ts
analytics: { enabled: true, provider: 'amplify' },
```

Set `enabled: false` to disable analytics entirely. When disabled, all calls are no-ops with zero overhead.

### Install the Provider SDK

When using AWS Amplify, install the SDK:

```bash
pnpm add aws-amplify
```

Then create a development build:

```bash
npx expo run:ios
npx expo run:android
```

## Usage

Use the `useAnalytics` hook inside any component:

```tsx
import { useAnalytics } from '@/features/analytics';

function MyComponent() {
  const analytics = useAnalytics();

  // Track a custom event
  analytics.trackEvent({
    name: 'button_clicked',
    properties: { button: 'signup', screen: 'home' },
  });

  // Track a screen view
  analytics.trackScreen('HomeScreen', { referrer: 'deep_link' });

  // Set user properties
  analytics.setUserProperties({ userId: '123', plan: 'premium' });

  // Reset analytics (e.g., on logout)
  analytics.reset();
}
```

## Adding a New Provider

1. Create a new file at `src/features/analytics/providers/<provider-name>.ts`.
2. Implement the `AnalyticsService` interface from `@/services/analytics.interface`.
3. Export a factory function: `export function create<Name>Analytics(): AnalyticsService`.
4. Register the provider in `src/features/analytics/create-analytics-service.ts`:

```ts
const providers: Record<string, () => Promise<AnalyticsService>> = {
  amplify: async () => { /* ... */ },
  '<provider-name>': async () => {
    const { create<Name>Analytics } = await import('./providers/<provider-name>');
    return create<Name>Analytics();
  },
};
```

5. Add the provider name to the `StarterConfig` type in `src/config/starter.config.ts` if it is not already listed.

## Disabling the Feature

Set `enabled: false` in `src/config/starter.config.ts`:

```ts
analytics: { enabled: false, provider: 'amplify' },
```

When disabled:
- The `AnalyticsProvider` renders children directly without loading any SDK.
- The `useAnalytics` hook returns a no-op implementation.
- No native modules are loaded, so no SDK installation is required.
