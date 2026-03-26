![CI](https://github.com/revocare-solutions/react-native-expo-starter-kit/actions/workflows/ci.yml/badge.svg)

# Basekit

A production-ready React Native starter kit built on Expo SDK 54. Clone it, run the interactive setup wizard, and get a clean project with only the features you need. Every feature ships with swappable providers and clean service interfaces.

## Quick Start

```bash
# Clone
git clone https://github.com/revocare-solutions/react-native-expo-starter-kit.git my-app
cd my-app
pnpm install

# Run the setup wizard
pnpm run setup

# Start developing
pnpm start
```

The setup wizard asks you to pick a theme preset, backend provider, and features. It strips everything you don't select — unneeded feature directories, unused dependencies, provider files — and commits a clean project.

### Setup Modes

```bash
pnpm run setup                          # Interactive wizard
pnpm run setup --quick                  # Sensible defaults (minimal theme, no backend, storage + i18n + forms)
pnpm run setup --from basekit.scaffold.yaml   # Reproducible setup from config file
pnpm run setup --dry-run --quick        # Preview what would change without modifying files
```

## Feature Matrix

| Feature | Providers | Doc |
| --- | --- | --- |
| Authentication | AWS Amplify, Firebase*, Supabase*, Custom* | [docs](docs/features/auth.md) |
| Analytics | AWS Amplify, Firebase* | [docs](docs/features/analytics.md) |
| Crash Reporting | Sentry | [docs](docs/features/crash-reporting.md) |
| Push Notifications | AWS Amplify, Firebase* | [docs](docs/features/notifications.md) |
| Offline Storage | MMKV, AsyncStorage | [docs](docs/features/offline-storage.md) |
| Security | Biometrics, Secure Storage, SSL Pinning | -- |
| Theme System | Minimal, Bold, Corporate presets | -- |
| i18n | i18next (EN, ES) | [docs](docs/features/i18n.md) |
| Forms | React Hook Form + Zod | [docs](docs/features/forms.md) |
| Deep Linking | expo-linking | [docs](docs/features/deep-linking.md) |
| OTA Updates | expo-updates | [docs](docs/features/ota-updates.md) |
| Onboarding | Built-in | [docs](docs/features/onboarding.md) |
| Splash / App Icon | expo-splash-screen | [docs](docs/features/splash-app-icon.md) |

*\* Planned — provider interface exists, implementation coming soon.*

## Theme Presets

The setup wizard offers three design token presets. Each defines colors, typography, spacing, border radii, and shadows in a single `theme.config.ts` that feeds both NativeWind/Tailwind classes and a runtime `useTheme()` hook.

| Preset | Vibe | Primary Color | Font |
| --- | --- | --- | --- |
| Minimal | Clean, subtle, white space | Slate blue `#6366f1` | Inter |
| Bold | Vibrant, high contrast | Electric blue `#2563eb` | Plus Jakarta Sans |
| Corporate | Professional, muted | Navy `#1e3a5f` | IBM Plex Sans |

## Security

The security feature module provides three capabilities:

- **Biometric auth** — `useBiometrics()` hook wrapping `expo-local-authentication`
- **Secure storage** — `useSecureStorage()` hook wrapping `expo-secure-store` (iOS Keychain / Android Keystore)
- **App lock** — `useAppLock()` hook combining biometrics with background timeout for automatic locking
- **SSL pinning** — configurable certificate pinning (disabled in dev for proxy tools)

## Configuration

After setup, features are controlled from `src/config/basekit.config.ts`:

```ts
export const basekitConfig = {
  app: {
    name: 'my-app',
    bundleId: 'com.mycompany.myapp',
    scheme: 'myapp',
  },
  features: {
    auth:           { enabled: true, provider: 'amplify' },
    analytics:      { enabled: true, provider: 'amplify' },
    crashReporting: { enabled: true, provider: 'sentry' },
    offlineStorage: { enabled: true, provider: 'mmkv' },
    i18n:           { enabled: true },
    security:       { enabled: true },
    theme:          { enabled: true, preset: 'minimal' },
    // ...
  },
  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    timeout: 30000,
  },
};
```

## Config File Setup

For teams standardizing project setup across multiple apps:

```yaml
# basekit.scaffold.yaml
app:
  name: my-app
  bundleId: com.acme.myapp
  scheme: myapp
theme: corporate
backend: supabase
features:
  - auth
  - analytics
  - security
  - i18n
  - forms
packageManager: pnpm
```

```bash
pnpm run setup --from basekit.scaffold.yaml
```

## Project Structure

```
setup/              # Setup wizard (self-deletes after running)
src/
  app/              # Expo Router file-based routes and layouts
  components/       # Shared UI components
  config/           # basekit.config.ts, theme.config.ts
  constants/        # Theme and other constants
  features/         # Feature modules
    auth/           #   Authentication (swappable providers)
    analytics/      #   Event & screen tracking
    crash-reporting/#   Error capture
    notifications/  #   Push & local notifications
    offline-storage/#   Key-value persistence (MMKV / AsyncStorage)
    security/       #   Biometrics, secure storage, SSL pinning
    theme/          #   Design tokens, presets, Tailwind generator
    i18n/           #   Internationalization
    forms/          #   Form components with validation
    onboarding/     #   First-run flow
    deep-linking/   #   URL scheme handling
    ota-updates/    #   Over-the-air updates
    splash-app-icon/#   Launch screen control
  hooks/            # Shared React hooks
  lib/              # Library wrappers (api, providers)
  services/         # Service interfaces
  store/            # Zustand stores and persistence
  types/            # Shared TypeScript types
docs/               # Documentation
e2e/                # Maestro E2E test flows
basekit.manifest.json  # Feature metadata (used by setup wizard)
```

## Available Scripts

| Script | Description |
| --- | --- |
| `pnpm run setup` | Run the interactive setup wizard |
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

## Tech Stack

- **Framework** -- [Expo SDK 54](https://expo.dev) + React Native 0.81
- **Routing** -- [Expo Router](https://docs.expo.dev/router/introduction/) (file-based)
- **Styling** -- [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS for RN)
- **State** -- [Zustand](https://github.com/pmndrs/zustand) (client) + [TanStack Query](https://tanstack.com/query) (server)
- **Storage** -- [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- **HTTP** -- [Axios](https://axios-http.com/)
- **Auth** -- [AWS Amplify](https://docs.amplify.aws/) (swappable)
- **Security** -- [expo-local-authentication](https://docs.expo.dev/versions/latest/sdk/local-authentication/) + [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/)
- **Theming** -- Design tokens feeding NativeWind + React context
- **Forms** -- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/)
- **i18n** -- [i18next](https://www.i18next.com/) + [react-i18next](https://react.i18next.com/)
- **Crash Reporting** -- [Sentry](https://sentry.io/) (swappable)
- **E2E Testing** -- [Maestro](https://maestro.mobile.dev/)
- **Unit Testing** -- [Jest](https://jestjs.io/) + [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- **CI/CD** -- [GitHub Actions](https://github.com/features/actions)
- **Language** -- TypeScript 5.9

## Documentation

| Doc | Description |
| --- | --- |
| [Docs Hub](docs/README.md) | Index of all documentation |
| [Getting Started](docs/getting-started.md) | Prerequisites, install, project structure |
| [Architecture](docs/architecture.md) | Modular design, service interfaces, providers |
| [Configuration](docs/configuration.md) | Feature toggles, environment variables |
| [NativeWind](docs/nativewind.md) | Tailwind CSS styling guide |

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Commit your changes following [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `docs:`, etc.)
4. Push to your fork and open a Pull Request

## License

MIT
