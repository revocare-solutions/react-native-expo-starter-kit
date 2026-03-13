# Configuration

All starter-kit settings live in a single file:

```
src/config/starter.config.ts
```

## Config Reference

### `app`

| Key | Type | Description |
| --- | --- | --- |
| `name` | `string` | Display name of the application |
| `bundleId` | `string` | iOS bundle ID / Android application ID |
| `scheme` | `string` | Deep-link URL scheme |

### `features`

Every feature has an `enabled` boolean. Swappable features also have a `provider` field.

| Feature | Options | Default |
| --- | --- | --- |
| `auth` | `amplify`, `firebase`, `supabase`, `clerk` | `amplify` |
| `analytics` | `amplify`, `mixpanel`, `segment`, `posthog` | `amplify` |
| `crashReporting` | `sentry`, `bugsnag`, `datadog` | `sentry` |
| `notifications` | `amplify`, `firebase`, `onesignal` | `amplify` |
| `i18n` | `defaultLocale` string | `en` |
| `offlineStorage` | `mmkv`, `async-storage` | `mmkv` |
| `onboarding` | -- | enabled |
| `otaUpdates` | -- | enabled |
| `deepLinking` | -- | enabled |
| `splashAppIcon` | -- | enabled |
| `forms` | -- | enabled |

### `api`

| Key | Type | Default | Description |
| --- | --- | --- | --- |
| `baseUrl` | `string \| undefined` | `EXPO_PUBLIC_API_URL` | Base URL for the Axios client |
| `timeout` | `number` | `30000` | Request timeout in milliseconds |

## Feature Toggles

Set `enabled: false` on any feature to disable it at build time. The feature's provider becomes a pass-through, and its hook returns a no-op implementation.

```ts
features: {
  offlineStorage: { enabled: false, provider: 'mmkv' },
}
```

## Swapping Providers

Change the `provider` value to switch implementations without touching application code:

```ts
features: {
  offlineStorage: { enabled: true, provider: 'async-storage' },
}
```

The feature's factory will dynamically import the corresponding concrete provider.

## Environment Variables

Expo loads variables prefixed with `EXPO_PUBLIC_` into the client bundle.

| Variable | Used By | Description |
| --- | --- | --- |
| `EXPO_PUBLIC_API_URL` | `api.baseUrl` | Base URL for the API layer |

Create a `.env` file at the project root (it is git-ignored):

```
EXPO_PUBLIC_API_URL=https://api.example.com
```

Access in code via `process.env.EXPO_PUBLIC_API_URL` or through `starterConfig.api.baseUrl`.
