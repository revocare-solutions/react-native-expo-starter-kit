# Documentation Hub

Welcome to the React Native Expo Starter Kit documentation.

## Quick Links

- [Getting Started](./getting-started.md) -- prerequisites, installation, running the app
- [Architecture](./architecture.md) -- modular design, service interfaces, provider composition
- [Configuration](./configuration.md) -- feature toggles, provider selection, environment variables

## Feature Docs

| Feature | Status | Doc |
| --- | --- | --- |
| Offline Storage | Implemented | [offline-storage.md](./features/offline-storage.md) |
| State Management | Implemented | [state-management.md](./features/state-management.md) |
| API Layer | Implemented | _(covered in architecture)_ |
| Testing | Implemented | _(covered in getting-started)_ |
| NativeWind | Implemented | [nativewind.md](./nativewind.md) |
| Auth | Planned | -- |
| Forms | Planned | -- |
| i18n | Planned | -- |
| Analytics | Planned | -- |
| Crash Reporting | Planned | -- |
| Notifications | Planned | -- |
| Deep Linking | Planned | -- |
| OTA Updates | Planned | -- |
| Onboarding | Planned | -- |
| Splash / App Icon | Planned | -- |
| CI/CD | Planned | -- |

## Guides

- [NativeWind Integration](./nativewind.md)

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

Test utilities and mock factories live in `src/test/`.
