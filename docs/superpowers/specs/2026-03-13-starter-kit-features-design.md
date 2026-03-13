# React Native Expo Starter Kit — Feature Design Spec

**Date:** 2026-03-13
**Status:** Approved
**Goal:** Define the complete feature set for a plug-and-play React Native Expo starter kit that simplifies daily life for RN developers — solo devs and teams alike.

---

## Design Principles

1. **Plug and play** — clone, configure, build. Every feature works out of the box with a default implementation.
2. **Swappable** — every service-backed feature exposes a TypeScript interface. Swap AWS Amplify for Firebase, Sentry for Bugsnag — implement the interface, update the config.
3. **Removable** — toggle `enabled: false` in config OR delete the feature folder entirely. No orphaned code.
4. **Documented** — every feature ships with a dev guide. No guessing.

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
```

---

## Central Configuration

```typescript
// src/config/starter.config.ts
export const starterConfig = {
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
  },

  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    timeout: 30000,
  },

  testing: {
    unit:  { enabled: true },
    e2e:   { enabled: true },
  },

  ci: {
    provider: 'github-actions',
    easBuild: true,
  },
} as const;
```

**How it works:**
- Features check `starterConfig.features.<name>.enabled` at the provider level.
- Disabled features don't mount their providers or register routes.
- `src/lib/providers/app-providers.tsx` composes only enabled feature providers.
- Type-safe — `as const` ensures autocomplete and narrowing.

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

Each swappable service defines a TypeScript interface. Default implementations live inside the feature folder. To swap: create a new file implementing the interface, update `starter.config.ts` provider value.

Example:

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

### Provider Composition (`src/lib/providers/app-providers.tsx`)

- Reads `starterConfig.features` and composes only enabled providers.
- Ordering: SafeArea → Theme → QueryClient → Auth → Analytics → i18n → ...children.
- Each feature exports a `<FeatureProvider>` that wraps children conditionally.

---

## Features

### 1. Authentication (`src/features/auth/`)

- **Default provider:** AWS Amplify Cognito
- **Screens:** Login, Register, Forgot Password, Verify Code
- **Hooks:** `useAuth()`, `useCurrentUser()`, `useSession()`
- **Auth guard:** Protected route middleware via expo-router layout — redirects unauthenticated users to `(auth)/login`
- **Token management:** Auto-refresh, Axios interceptor injects Bearer token
- **Secure storage:** Tokens stored via MMKV (encrypted)
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

### 12. Testing (`src/features/testing/`)

**Unit/Component testing:**
- Jest + React Native Testing Library
- Pre-configured `jest.config.ts` with transformers, mocks for RN modules
- Test utilities: custom render with providers, mock factories for auth/storage/api

**E2E testing:**
- Maestro flows in `e2e/` directory
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
│   ├── splash-app-icon.md
│   └── state-management.md
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
