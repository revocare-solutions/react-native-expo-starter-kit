# Getting Started

## Prerequisites

| Tool | Version |
| --- | --- |
| Node.js | 18+ |
| pnpm | 10+ |
| Expo CLI | included via `npx expo` |
| iOS Simulator | Xcode 15+ (macOS only) |
| Android Emulator | Android Studio with an AVD configured |

## Installation

```bash
# 1. Clone the repository
git clone https://github.com/revocare-solutions/react-native-expo-starter-kit.git
cd react-native-expo-starter-kit

# 2. Install dependencies
pnpm install

# 3. Configure the starter kit
#    Edit src/config/starter.config.ts to enable/disable features
#    and choose providers.
```

## Running the App

```bash
# Start the Expo dev server (press a/i/w to pick a platform)
pnpm start

# Start directly on a platform
pnpm android
pnpm ios
pnpm web
```

## Project Structure

```
src/
  app/            # Expo Router file-based routes and layouts
  components/     # Shared UI components
  config/         # Central configuration (starter.config.ts)
  constants/      # Theme and other constants
  features/       # Feature modules (offline-storage, auth, etc.)
  hooks/          # Shared React hooks
  lib/            # Library wrappers (api, providers)
    api/          # Axios client, TanStack Query provider
    providers/    # AppProviders composition root
  services/       # Service interfaces (storage, auth, analytics, ...)
  store/          # Zustand stores and persistence middleware
  types/          # Shared TypeScript type definitions
```

## Path Aliases

The project defines two path aliases in `tsconfig.json`:

| Alias | Maps To |
| --- | --- |
| `@/*` | `./src/*` |
| `@assets/*` | `./assets/*` |

Usage:

```ts
import { starterConfig } from '@/config/starter.config';
import { useStorage } from '@/features/offline-storage';
```

## Testing

```bash
pnpm test            # run all tests
pnpm test:watch      # watch mode
pnpm test:coverage   # coverage report
```

The testing stack is Jest + React Native Testing Library. Test files live next to source code in `__tests__/` directories.

## Linting

```bash
pnpm lint
```

Uses the Expo ESLint preset (`eslint-config-expo`).
