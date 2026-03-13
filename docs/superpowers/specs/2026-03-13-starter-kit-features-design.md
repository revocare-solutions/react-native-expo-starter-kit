# React Native Expo Starter Kit — Feature Design Spec

**Date:** 2026-03-13
**Status:** Approved
**Goal:** Define the complete feature set for a plug-and-play React Native Expo starter kit that simplifies daily life for RN developers — solo devs and teams alike.

---

## Design Principles

1. **Plug and play** — clone, configure, build. Every feature works out of the box with a default implementation.
2. **Swappable** — service-backed features (auth, analytics, crash reporting, notifications, offline storage) expose a TypeScript interface. Swap AWS Amplify for Firebase, Sentry for Bugsnag — implement the interface, update the config. Built-in features (i18n, deep linking, onboarding, OTA updates, splash/icons, forms) are not swappable — they use specific libraries directly.
3. **Removable** — toggle `enabled: false` in config OR delete the feature folder entirely. No orphaned code. When disabled, hooks return no-op implementations so consumer code doesn't break.
4. **Documented** — every feature ships with a dev guide. No guessing.
5. **Platform-aware** — primary targets are iOS and Android. Web support is best-effort; features that lack web support (MMKV, expo-notifications, Sentry native crash reporting) degrade gracefully or are disabled on web.

---

## Architecture: Modular Feature Architecture

A single repo with a central config file (`starter.config.ts`) that toggles features, plus self-contained feature folders (`src/features/<name>/`). Each feature has its own provider, hooks, types, screens, and a registration pattern.

---

## Project Structure

```
src/
├── app/                          # Expo Router file-based routes
│   ├── _layout.tsx               # Root layout (providers wrapper)
│   ├── (auth)/                   # Auth route group
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   └── forgot-password.tsx
│   ├── (onboarding)/             # Onboarding route group
│   │   └── index.tsx
│   ├── (tabs)/                   # Main app tab group
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   └── explore.tsx
│   └── modal.tsx
├── components/                   # Shared reusable components
│   └── ui/                       # Base UI primitives
├── config/
│   └── starter.config.ts         # Central feature toggle config
├── constants/
│   └── theme.ts
├── features/                     # Self-contained feature modules
│   ├── auth/
│   ├── analytics/
│   ├── crash-reporting/
│   ├── deep-linking/
│   ├── forms/
│   ├── i18n/
│   ├── notifications/
│   ├── offline-storage/
│   ├── onboarding/
│   ├── ota-updates/
│   └── splash-app-icon/
├── hooks/                        # Shared hooks
├── lib/                          # Core utilities
│   ├── api/                      # Axios client + TanStack Query setup
│   └── providers/                # Root provider composition
├── services/                     # Service interfaces (contracts)
│   ├── auth.interface.ts
│   ├── analytics.interface.ts
│   ├── crash-reporting.interface.ts
│   ├── notifications.interface.ts
│   └── storage.interface.ts
├── store/                        # Zustand client state stores
└── types/                        # Shared TypeScript types
test/                             # Shared test utilities, mock factories
e2e/                              # Maestro E2E test flows
jest.config.ts                    # Jest configuration
```

> **Note:** `src/app/` is a non-default Expo Router root. The project's `package.json` `main` field and app.json config are already set up to support this.

---

## Central Configuration

```typescript
// src/config/starter.config.ts

interface StarterConfig {
  app: {
    name: string;
    bundleId: string;
    scheme: string;
  };
  features: {
    auth:            { enabled: boolean; provider: 'amplify' | 'firebase' | 'supabase' | 'clerk' };
    analytics:       { enabled: boolean; provider: 'amplify' | 'mixpanel' | 'segment' | 'posthog' };
    crashReporting:  { enabled: boolean; provider: 'sentry' | 'bugsnag' | 'datadog' };
    notifications:   { enabled: boolean; provider: 'amplify' | 'firebase' | 'onesignal' };
    i18n:            { enabled: boolean; defaultLocale: string };
    offlineStorage:  { enabled: boolean; provider: 'mmkv' | 'async-storage' };
    onboarding:      { enabled: boolean };
    otaUpdates:      { enabled: boolean };
    deepLinking:     { enabled: boolean };
    splashAppIcon:   { enabled: boolean };
    forms:           { enabled: boolean };
  };
  api: {
    baseUrl: string | undefined;
    timeout: number;
  };
};

export const starterConfig: StarterConfig = {
  app: {
    name: 'MyApp',
    bundleId: 'com.mycompany.myapp',
    scheme: 'myapp',
  },

  features: {
    auth:            { enabled: true, provider: 'amplify' },
    analytics:       { enabled: true, provider: 'amplify' },
    crashReporting:  { enabled: true, provider: 'sentry' },
    notifications:   { enabled: true, provider: 'amplify' },
    i18n:            { enabled: true, defaultLocale: 'en' },
    offlineStorage:  { enabled: true, provider: 'mmkv' },
    onboarding:      { enabled: true },
    otaUpdates:      { enabled: true },
    deepLinking:     { enabled: true },
    splashAppIcon:   { enabled: true },
    forms:           { enabled: true },
  },

  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    timeout: 30000,
  },
};
```

**How it works:**
- Features check `starterConfig.features.<name>.enabled` at the provider level.
- Disabled features don't mount their providers or register routes.
- `src/lib/providers/app-providers.tsx` composes only enabled feature providers.
- Type-safe — `StarterConfig` interface provides autocomplete; values are runtime-mutable (no `as const`) so devs can drive config from env vars.
- CI/CD and testing are configured via their own files (YAML workflows, `jest.config.ts`), not through this config.

---

## Core Infrastructure

### API Layer (`src/lib/api/`)

- **Axios client** (`client.ts`) — base URL from config, request/response interceptors, auth token injection, retry logic.
- **TanStack Query setup** (`query-client.ts`) — default stale times, retry config, error handling.
- **Query provider** (`query-provider.tsx`) — wraps app with `QueryClientProvider`.
- **Custom hooks pattern** — each feature defines its own query hooks (e.g., `useLogin`, `useUser`).

### State Management (`src/store/`)

- **Zustand** for client state — app state, UI state, user preferences.
- **TanStack Query** for server state — API data, caching, sync.
- **Store pattern** — one store per domain (e.g., `useAppStore`, `useUserStore`).
- **MMKV persistence** — Zustand middleware to persist stores to MMKV.

### Service Interface Pattern (`src/services/`)

Service-backed features (auth, analytics, crash reporting, notifications, offline storage) define a TypeScript interface in `src/services/`. Default implementations live inside the feature folder. Built-in features (i18n, deep linking, onboarding, OTA updates, splash/icons, forms) use specific libraries directly and are not swappable via interface.

**Service Resolution Pattern:**

Each swappable feature has a factory function that resolves the provider string from config to an implementation:

```typescript
// features/auth/create-auth-service.ts
import type { AuthService } from '@/services/auth.interface';
import { starterConfig } from '@/config/starter.config';

const providers: Record<string, () => Promise<AuthService>> = {
  amplify: () => import('./providers/amplify').then(m => m.amplifyAuthService),
  firebase: () => import('./providers/firebase').then(m => m.firebaseAuthService),
  supabase: () => import('./providers/supabase').then(m => m.supabaseAuthService),
};

export async function createAuthService(): Promise<AuthService> {
  const { provider } = starterConfig.features.auth;
  const factory = providers[provider];
  if (!factory) throw new Error(`Unknown auth provider: ${provider}`);
  return factory();
}
```

This pattern uses dynamic imports so unused providers are tree-shaken. Each swappable feature follows the same factory pattern.

**Interface example:**

```typescript
// services/auth.interface.ts
export interface AuthService {
  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(email: string, password: string, attrs?: Record<string, string>): Promise<AuthResult>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  onAuthStateChange(callback: (user: User | null) => void): () => void;
}
```

**Disabled Feature Behavior:**

When a feature is disabled (`enabled: false`), its hooks return no-op implementations:

```typescript
// features/auth/hooks/use-auth.ts
export function useAuth() {
  if (!starterConfig.features.auth.enabled) {
    return noOpAuth; // { signIn: async () => {}, user: null, ... }
  }
  return useAuthContext();
}
```

This ensures consumer code that imports `useAuth()` doesn't crash when auth is disabled. The no-op pattern applies to all feature hooks.

### Provider Composition (`src/lib/providers/app-providers.tsx`)

- Reads `starterConfig.features` and composes only enabled providers.
- Ordering (dependency-aware): SafeArea → Theme → QueryClient → OfflineStorage → Auth → Analytics (depends on Auth for user context) → CrashReporting (depends on Auth for user context) → i18n → Notifications → ...children.
- Each feature exports a `<FeatureProvider>` that conditionally renders based on its `enabled` flag. Disabled features render `{children}` directly (passthrough).

### Route Registration for Disabled Features

Expo Router uses file-based routing, so route files for disabled features (e.g., `(auth)/login.tsx`) still exist on disk. Disabled features handle this at the **layout level**:

```typescript
// app/(auth)/_layout.tsx
export default function AuthLayout() {
  if (!starterConfig.features.auth.enabled) {
    return <Redirect href="/(tabs)" />;
  }
  return <Stack />;
}
```

Each feature's route group has a `_layout.tsx` that redirects to the main app when the feature is disabled. This keeps routes physically present but functionally inactive.

---

## Features

### 1. Authentication (`src/features/auth/`)

- **Default provider:** AWS Amplify Cognito
- **Screens:** Login, Register, Forgot Password, Verify Code
- **Hooks:** `useAuth()`, `useCurrentUser()`, `useSession()`
- **Auth guard:** Protected route middleware via expo-router layout — redirects unauthenticated users to `(auth)/login`
- **Token management:** Auto-refresh, Axios interceptor injects Bearer token
- **Secure storage:** Tokens stored via MMKV with explicit encryption enabled (encryption key stored in iOS Keychain / Android Keystore)
- **Interface:** `AuthService` — swap to Firebase, Supabase, Clerk, or custom backend

### 2. Internationalization (`src/features/i18n/`)

- **Library:** `i18next` + `react-i18next` + `expo-localization`
- **Translation files:** `features/i18n/locales/{en,es,fr,...}.json`
- **Hooks:** `useTranslation()` (re-exported from react-i18next)
- **Features:** Auto-detect device locale, language switcher, RTL support
- **Config:** Default locale in `starter.config.ts`, add new locales by dropping a JSON file

### 3. Push Notifications (`src/features/notifications/`)

- **Default provider:** AWS Amplify + expo-notifications
- **Hooks:** `useNotifications()`, `useNotificationPermission()`
- **Features:** Permission request flow, foreground/background handlers, deep link from notification
- **Interface:** `NotificationService` — register, send local, handle received, get token

### 4. Deep Linking (`src/features/deep-linking/`)

- **Built on:** expo-router's built-in linking + expo-linking
- **Config:** URL scheme in `starter.config.ts` → flows into `app.json`
- **Features:** Universal links (iOS) / App links (Android) config templates, navigation handler, link generation utility
- **Doc:** Step-by-step for configuring associated domains / asset links

### 5. Offline Storage (`src/features/offline-storage/`)

- **Default provider:** `react-native-mmkv`
- **Hooks:** `useStorage()` — typed get/set/delete with serialization
- **Features:** Zustand persistence middleware, TanStack Query offline persistence, encrypted storage option
- **Interface:** `StorageService` — swap to AsyncStorage or other

### 6. Crash Reporting (`src/features/crash-reporting/`)

- **Default provider:** Sentry (`@sentry/react-native`)
- **Features:** Auto crash capture, breadcrumbs, user context attachment, source maps upload (EAS Build hook)
- **Hooks:** `useCrashReporting()` — manual error capture, set user context
- **Interface:** `CrashReportingService` — swap to Bugsnag, Datadog, etc.

### AWS Amplify Initialization Strategy

AWS Amplify is the default provider for auth, analytics, and notifications. To avoid coupling and bundle bloat:

- **Single initialization:** `src/lib/amplify/configure.ts` calls `Amplify.configure()` once at app start, only importing modules for enabled features.
- **Per-feature imports:** Each Amplify-backed feature imports only its specific module (e.g., `aws-amplify/auth`, `aws-amplify/analytics`) — not the full `aws-amplify` package.
- **Independent disabling:** Disabling analytics but keeping auth does NOT import the analytics module. The factory pattern + dynamic imports ensure tree-shaking works.
- **Full removal:** If no features use Amplify, the `aws-amplify` dependency can be uninstalled entirely.

### 7. Analytics (`src/features/analytics/`)

- **Default provider:** AWS Amplify Analytics (Pinpoint)
- **Features:** Screen tracking (auto via expo-router listener), event tracking, user properties
- **Hooks:** `useAnalytics()` — `trackEvent()`, `trackScreen()`, `setUserProperties()`
- **Interface:** `AnalyticsService` — swap to Mixpanel, Segment, PostHog, etc.

### 8. OTA Updates (`src/features/ota-updates/`)

- **Built on:** `expo-updates`
- **Features:** Check for update on app open, optional forced update flow, update available banner component
- **Hooks:** `useOTAUpdate()` — check, download, apply
- **Config:** EAS Update channel configuration

### 9. Onboarding (`src/features/onboarding/`)

- **Components:** `OnboardingScreen` — swipeable walkthrough with pages
- **Features:** Skip button, dot pagination, "Get Started" CTA, completion flag stored in MMKV
- **Flow:** Shows once on first launch → auth guard checks onboarding completion first
- **Customization:** Pass pages array with title, description, image

### 10. Splash Screen & App Icon (`src/features/splash-app-icon/`)

- **Built on:** `expo-splash-screen` + Expo config plugins
- **Features:** Animated splash transition, icon generation script (single source image → all sizes), config templates for `app.json`
- **Script:** `scripts/generate-icons.js` — takes one 1024x1024 image, outputs all required sizes

### 11. Forms & Validation (`src/features/forms/`)

- **Libraries:** React Hook Form + Zod
- **Components:** Pre-built form field wrappers (`FormInput`, `FormSelect`, `FormCheckbox`) with NativeWind styling and error display
- **Hooks:** `useAppForm()` — wraps `useForm` with Zod resolver pre-configured
- **Patterns:** Reusable schemas in `features/forms/schemas/`, composable validation rules

### 12. Testing

Testing infrastructure lives at the project root, not inside `src/features/`:

**Unit/Component testing:**
- Jest + React Native Testing Library
- `jest.config.ts` at project root
- `test/` directory at root for shared test utilities: custom render with providers, mock factories for auth/storage/api
- Tests co-located with source files (e.g., `src/features/auth/__tests__/use-auth.test.ts`)

**E2E testing:**
- Maestro flows in `e2e/` directory at project root
- Flows: login, onboarding, tab navigation, deep link handling
- CI-ready: runs in GitHub Actions pipeline

### 13. CI/CD (`.github/workflows/`)

- `lint-typecheck.yml` — runs on every PR
- `test.yml` — unit tests on every PR
- `e2e.yml` — Maestro flows on merge to main
- `eas-build.yml` — EAS Build triggers (preview on PR, production on tag)
- `eas-update.yml` — OTA update on merge to main

---

## Documentation Architecture

```
docs/
├── README.md                     # Docs hub — links to all guides
├── getting-started.md            # Quick start, prerequisites, installation
├── architecture.md               # Project structure, patterns, conventions
├── configuration.md              # starter.config.ts guide, env setup
├── features/
│   ├── auth.md
│   ├── analytics.md
│   ├── crash-reporting.md
│   ├── deep-linking.md
│   ├── forms.md
│   ├── i18n.md
│   ├── notifications.md
│   ├── offline-storage.md
│   ├── onboarding.md
│   ├── ota-updates.md
│   └── splash-app-icon.md
├── guides/
│   ├── swapping-providers.md
│   ├── adding-a-feature.md
│   ├── removing-a-feature.md
│   └── ci-cd.md
└── testing/
    ├── unit-testing.md
    └── e2e-testing.md
```

**Each feature doc follows a standard template:**
1. Overview — what it does, why it's included
2. Default implementation — which provider ships
3. Configuration — starter.config.ts options + env variables needed
4. Usage — code examples with hooks/components
5. Swapping the provider — step-by-step to replace with another service
6. Removing the feature — how to delete cleanly

**Root README.md** is updated after each feature with:
- Feature name + one-line description
- Link to its detailed doc in `docs/features/`
- Feature matrix table

---

## Agentic Development Workflow

Every feature follows this lifecycle:

1. **Create GitHub Issue** — titled `feat: <feature description>`
2. **Create feature branch** — `ft/<feature-name>`
3. **Implement the feature** — code in `src/features/<name>/`
4. **Write feature doc** — `docs/features/<name>.md` following the standard template
5. **Update root README.md** — add to feature matrix table
6. **Run lint + type check** — `pnpm lint`
7. **Commit** — conventional commit message (`feat:`, `fix:`, etc.)
8. **Push and create PR** — linked to issue (`Closes #XX`)
9. **Code review** — via review agent
10. **Merge to main**

**Rules:**
- Never start implementation without a GitHub issue.
- Every PR must include both code AND documentation updates.
- PR description references the issue number.
- Feature doc must follow the standard template.
- README feature matrix must be updated before PR is created.
- Lint must pass before commit.
