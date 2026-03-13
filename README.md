![CI](https://github.com/revocare-solutions/react-native-expo-starter-kit/actions/workflows/ci.yml/badge.svg)

# React Native Expo Starter Kit

A production-ready, plug-and-play React Native starter kit built on Expo SDK 54. Every feature ships with swappable providers, feature toggles, and clean service interfaces -- enable only what you need and swap implementations without touching application code.

## Feature Matrix

| Feature | Default Provider | Swappable | Doc |
| --- | --- | --- | --- |
| Auth | AWS Amplify | Yes | [docs](docs/features/auth.md) |
| Analytics | AWS Amplify | Yes | [docs](docs/features/analytics.md) |
| Crash Reporting | Sentry | Yes | [docs](docs/features/crash-reporting.md) |
| Notifications | AWS Amplify | Yes | [docs](docs/features/notifications.md) |
| Offline Storage | MMKV | Yes | [docs](docs/features/offline-storage.md) |
| i18n | i18next | -- | [docs](docs/features/i18n.md) |
| Forms | React Hook Form + Zod | -- | [docs](docs/features/forms.md) |
| Deep Linking | expo-linking | -- | [docs](docs/features/deep-linking.md) |
| OTA Updates | expo-updates | -- | [docs](docs/features/ota-updates.md) |
| Onboarding | Built-in | -- | [docs](docs/features/onboarding.md) |
| Splash / App Icon | expo-splash-screen | -- | [docs](docs/features/splash-app-icon.md) |
| State Management | Zustand + TanStack Query | -- | [docs](docs/features/state-management.md) |
| E2E Testing | Maestro | -- | [docs](docs/features/e2e-testing.md) |
| CI/CD | GitHub Actions | -- | [docs](docs/features/ci-cd.md) |

## Quick Start

```bash
# Clone
git clone https://github.com/revocare-solutions/react-native-expo-starter-kit.git
cd react-native-expo-starter-kit

# Install
pnpm install

# Configure -- enable/disable features and choose providers
# Edit src/config/starter.config.ts

# Run
pnpm start        # Expo dev server
pnpm android      # Android emulator
pnpm ios          # iOS simulator
pnpm web          # Web browser
```

## Configuration

All features are controlled from a single file: `src/config/starter.config.ts`. Toggle any feature on or off and select providers without changing application code.

```ts
export const starterConfig: StarterConfig = {
  features: {
    auth:           { enabled: true,  provider: 'amplify' },
    analytics:      { enabled: true,  provider: 'amplify' },
    crashReporting: { enabled: true,  provider: 'sentry' },
    notifications:  { enabled: true,  provider: 'amplify' },
    offlineStorage: { enabled: true,  provider: 'mmkv' },
    i18n:           { enabled: true,  defaultLocale: 'en' },
    onboarding:     { enabled: true },
    otaUpdates:     { enabled: true },
    deepLinking:    { enabled: true },
    splashAppIcon:  { enabled: true },
    forms:          { enabled: true },
  },
  // ...
};
```

See the full [Configuration guide](docs/configuration.md) for environment variables and provider options.

## Project Structure

```
src/
  app/            # Expo Router file-based routes and layouts
  components/     # Shared UI components
  config/         # Central configuration (starter.config.ts)
  constants/      # Theme and other constants
  features/       # Feature modules (auth, i18n, forms, onboarding, ...)
  hooks/          # Shared React hooks
  lib/            # Library wrappers (api, providers)
    api/          # Axios client, TanStack Query provider
    providers/    # AppProviders composition root
  services/       # Service interfaces (storage, auth, analytics, ...)
  store/          # Zustand stores and persistence middleware
  types/          # Shared TypeScript type definitions
docs/             # Documentation
e2e/              # Maestro E2E test flows
```

## Available Scripts

| Script | Description |
| --- | --- |
| `pnpm start` | Start the Expo dev server |
| `pnpm android` | Launch on Android emulator |
| `pnpm ios` | Launch on iOS simulator |
| `pnpm web` | Launch in web browser |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run TypeScript type checking |
| `pnpm test` | Run unit tests with Jest |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Generate test coverage report |
| `pnpm test:e2e` | Run Maestro E2E tests |

## Documentation

| Doc | Description |
| --- | --- |
| [Docs Hub](docs/README.md) | Index of all documentation |
| [Getting Started](docs/getting-started.md) | Prerequisites, install, project structure |
| [Architecture](docs/architecture.md) | Modular design, service interfaces, providers |
| [Configuration](docs/configuration.md) | Feature toggles, environment variables |
| [NativeWind](docs/nativewind.md) | Tailwind CSS styling guide |

## Tech Stack

- **Framework** -- [Expo SDK 54](https://expo.dev) + React Native 0.81
- **Routing** -- [Expo Router](https://docs.expo.dev/router/introduction/) (file-based)
- **Styling** -- [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS for RN)
- **State** -- [Zustand](https://github.com/pmndrs/zustand) (client) + [TanStack Query](https://tanstack.com/query) (server)
- **Storage** -- [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- **HTTP** -- [Axios](https://axios-http.com/)
- **Auth** -- [AWS Amplify](https://docs.amplify.aws/) (swappable)
- **Forms** -- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **i18n** -- [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/)
- **Crash Reporting** -- [Sentry](https://sentry.io/) (swappable)
- **E2E Testing** -- [Maestro](https://maestro.mobile.dev/)
- **Unit Testing** -- [Jest](https://jestjs.io/) + [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- **CI/CD** -- [GitHub Actions](https://github.com/features/actions)
- **Language** -- TypeScript 5.9

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.)
4. Push to your fork and open a Pull Request

## License

MIT
