# Documentation Hub

Welcome to the React Native Expo Starter Kit documentation.

## Quick Links

- [Getting Started](./getting-started.md) -- prerequisites, installation, running the app
- [Architecture](./architecture.md) -- modular design, service interfaces, provider composition
- [Configuration](./configuration.md) -- feature toggles, provider selection, environment variables

## Feature Docs

| Feature | Doc |
| --- | --- |
| Auth | [auth.md](./features/auth.md) |
| Analytics | [analytics.md](./features/analytics.md) |
| Crash Reporting | [crash-reporting.md](./features/crash-reporting.md) |
| Notifications | [notifications.md](./features/notifications.md) |
| Offline Storage | [offline-storage.md](./features/offline-storage.md) |
| i18n | [i18n.md](./features/i18n.md) |
| Forms | [forms.md](./features/forms.md) |
| Deep Linking | [deep-linking.md](./features/deep-linking.md) |
| OTA Updates | [ota-updates.md](./features/ota-updates.md) |
| Onboarding | [onboarding.md](./features/onboarding.md) |
| Splash / App Icon | [splash-app-icon.md](./features/splash-app-icon.md) |
| State Management | [state-management.md](./features/state-management.md) |
| E2E Testing | [e2e-testing.md](./features/e2e-testing.md) |
| CI/CD | [ci-cd.md](./features/ci-cd.md) |

## Guides

- [NativeWind Integration](./nativewind.md)
- [Architecture](./architecture.md)
- [Configuration](./configuration.md)

## Testing

Run the full test suite:

```bash
pnpm test
```

Run in watch mode during development:

```bash
pnpm test:watch
```

Generate a coverage report:

```bash
pnpm test:coverage
```

Type checking:

```bash
pnpm typecheck
```

Run E2E tests with Maestro:

```bash
pnpm test:e2e
```

Test utilities and mock factories live in `src/test/`.
