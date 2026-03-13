# React Native Expo Starter Kit

A production-ready React Native starter kit built on Expo SDK 54. Every feature is **plug-and-play** with swappable providers, feature toggles, and clean service interfaces -- enable only what you need, swap implementations without touching application code.

## Feature Matrix

| Feature | Status | Default Provider | Swappable | Doc |
| --- | --- | --- | --- | --- |
| Offline Storage | Done | MMKV | Yes | [docs](docs/features/offline-storage.md) |
| State Management | Done | Zustand + MMKV | -- | [docs](docs/features/state-management.md) |
| API Layer | Done | Axios + TanStack Query | -- | [docs](docs/architecture.md) |
| Testing | Done | Jest + RNTL | -- | [docs](docs/getting-started.md#testing) |
| NativeWind | Done | NativeWind v4 | -- | [docs](docs/nativewind.md) |
| Auth | Coming soon | Amplify | Yes | -- |
| Forms | Coming soon | -- | -- | -- |
| i18n | Coming soon | -- | -- | -- |
| Analytics | Coming soon | Amplify | Yes | -- |
| Crash Reporting | Coming soon | Sentry | Yes | -- |
| Notifications | Coming soon | Amplify | Yes | -- |
| Deep Linking | Coming soon | -- | -- | -- |
| OTA Updates | Coming soon | -- | -- | -- |
| Onboarding | Coming soon | -- | -- | -- |
| Splash / App Icon | Coming soon | -- | -- | -- |
| CI/CD | Coming soon | -- | -- | -- |

## Quick Start

```bash
# Clone
git clone https://github.com/revocare-solutions/react-native-expo-starter-kit.git
cd react-native-expo-starter-kit

# Install
pnpm install

# Configure (enable/disable features, choose providers)
# Edit src/config/starter.config.ts

# Run
pnpm start        # Expo dev server
pnpm android      # Android emulator
pnpm ios          # iOS simulator
pnpm web          # Web browser
```

## Documentation

| Doc | Description |
| --- | --- |
| [Docs Hub](docs/README.md) | Index of all documentation |
| [Getting Started](docs/getting-started.md) | Prerequisites, install, project structure |
| [Architecture](docs/architecture.md) | Modular design, service interfaces, providers |
| [Configuration](docs/configuration.md) | Feature toggles, environment variables |

## Tech Stack

- **Framework** -- [Expo SDK 54](https://expo.dev) + React Native 0.81
- **Routing** -- [Expo Router](https://docs.expo.dev/router/introduction/) (file-based)
- **Styling** -- [NativeWind v4](https://www.nativewind.dev/) (Tailwind CSS for RN)
- **State** -- [Zustand](https://github.com/pmndrs/zustand) (client) + [TanStack Query](https://tanstack.com/query) (server)
- **Storage** -- [react-native-mmkv](https://github.com/mrousavy/react-native-mmkv)
- **HTTP** -- [Axios](https://axios-http.com/)
- **Testing** -- [Jest](https://jestjs.io/) + [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- **Language** -- TypeScript 5.9

## License

MIT
