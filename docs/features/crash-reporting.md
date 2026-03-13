# Crash Reporting

The crash reporting feature provides a unified interface for capturing errors, exceptions, and diagnostic breadcrumbs in your React Native Expo app.

## Configuration

### Enable/Disable

Toggle crash reporting in `src/config/starter.config.ts`:

```ts
crashReporting: { enabled: true, provider: 'sentry' },
```

Set `enabled: false` to disable crash reporting entirely. When disabled, all calls are no-ops with zero overhead.

### Environment Variables

| Variable | Description |
| --- | --- |
| `EXPO_PUBLIC_SENTRY_DSN` | Sentry DSN (required when using the Sentry provider) |

### Install the Provider SDK

When using Sentry, install the SDK:

```bash
pnpm add @sentry/react-native
```

Then create a development build:

```bash
npx expo run:ios
npx expo run:android
```

## Usage

Use the `useCrashReporting` hook inside any component:

```tsx
import { useCrashReporting } from '@/features/crash-reporting';

function MyComponent() {
  const crashReporting = useCrashReporting();

  // Capture an exception
  try {
    riskyOperation();
  } catch (error) {
    crashReporting.captureException(error as Error);
  }

  // Capture a message
  crashReporting.captureMessage('User completed onboarding', 'info');

  // Set user context
  crashReporting.setUser({ userId: '123', email: 'user@example.com' });

  // Add a breadcrumb
  crashReporting.addBreadcrumb('Navigated to settings', 'navigation');

  // Clear user on logout
  crashReporting.clearUser();
}
```

## Adding a New Provider

1. Create a new file at `src/features/crash-reporting/providers/<provider-name>.ts`.
2. Implement the `CrashReportingService` interface from `@/services/crash-reporting.interface`.
3. Export a factory function: `export function create<Name>CrashReporting(): CrashReportingService`.
4. Register the provider in `src/features/crash-reporting/create-crash-reporting-service.ts`:

```ts
const providers: Record<string, () => Promise<CrashReportingService>> = {
  sentry: async () => { /* ... */ },
  '<provider-name>': async () => {
    const { create<Name>CrashReporting } = await import('./providers/<provider-name>');
    return create<Name>CrashReporting();
  },
};
```

5. Add the provider name to the `StarterConfig` type in `src/config/starter.config.ts` if it is not already listed.

## Disabling the Feature

Set `enabled: false` in `src/config/starter.config.ts`:

```ts
crashReporting: { enabled: false, provider: 'sentry' },
```

When disabled:
- The `CrashReportingProvider` renders children directly without loading any SDK.
- The `useCrashReporting` hook returns a no-op implementation.
- No native modules are loaded, so no SDK installation is required.
