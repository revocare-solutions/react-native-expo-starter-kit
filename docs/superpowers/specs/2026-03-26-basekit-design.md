# Basekit — Cross-Platform Starter Kit Design

## Overview

Basekit is a cross-platform React Native Expo starter kit with an interactive setup wizard. Developers clone or fork the repo, run `pnpm setup`, and the wizard strips away features they don't need — leaving a clean, production-ready project with only the selected features, providers, and theme.

**Target audience:** Solo devs, agency teams, enterprise teams, and the open-source community.

**Distribution model (phased):**
- **Phase 1:** GitHub template repo + interactive `pnpm setup` script (current focus)
- **Phase 2:** Published `create-basekit-app` npm package (future)

---

## 1. Project Structure

### Repository Layout

```
basekit/
├── setup/                        # Setup wizard (self-deletes after running)
│   ├── index.ts                  # Entry point: pnpm setup
│   ├── prompts.ts                # Interactive wizard questions
│   ├── generator.ts              # Feature strip/keep logic
│   ├── providers.ts              # Provider chain rewriter
│   └── utils.ts                  # File ops, config updates, dep removal
├── src/
│   ├── app/                      # Expo Router routes
│   │   ├── _layout.tsx           # Root layout with AppProviders
│   │   ├── modal.tsx
│   │   ├── (auth)/               # Auth screens
│   │   │   ├── _layout.tsx
│   │   │   ├── login.tsx
│   │   │   ├── register.tsx
│   │   │   ├── forgot-password.tsx
│   │   │   └── verify-code.tsx
│   │   └── (tabs)/               # Tab navigation
│   │       ├── _layout.tsx
│   │       └── index.tsx
│   ├── components/               # Shared UI components
│   │   └── ui/
│   ├── config/
│   │   ├── basekit.config.ts     # Runtime feature toggles
│   │   └── theme.config.ts       # Design tokens (when theme feature selected)
│   ├── constants/
│   │   └── theme.ts              # Base light/dark colors (replaced by theme.config.ts if theme selected)
│   ├── features/                 # ALL feature modules — setup strips unselected ones
│   │   ├── auth/
│   │   │   ├── auth-provider.tsx
│   │   │   ├── create-auth-service.ts
│   │   │   ├── no-op-auth.ts
│   │   │   ├── hooks/
│   │   │   ├── providers/
│   │   │   │   ├── amplify.ts
│   │   │   │   ├── firebase.ts
│   │   │   │   ├── supabase.ts
│   │   │   │   └── custom.ts
│   │   │   └── __tests__/
│   │   ├── analytics/
│   │   │   ├── providers/
│   │   │   │   ├── amplify.ts
│   │   │   │   └── firebase.ts
│   │   │   └── ...
│   │   ├── crash-reporting/
│   │   ├── notifications/
│   │   ├── offline-storage/
│   │   ├── i18n/
│   │   ├── forms/
│   │   ├── onboarding/
│   │   ├── deep-linking/
│   │   ├── ota-updates/
│   │   ├── splash-app-icon/
│   │   ├── security/              # New
│   │   └── theme/                 # New
│   ├── hooks/
│   ├── lib/
│   │   ├── api/
│   │   └── providers/
│   │       └── app-providers.tsx  # Provider chain — setup rewrites this
│   ├── services/                  # Service interfaces
│   ├── store/
│   └── types/
├── assets/
├── docs/
├── basekit.manifest.json          # Feature metadata for the setup script
├── package.json
├── app.json
├── tsconfig.json
├── tailwind.config.js
└── README.md
```

### Key Difference from Overlay Approach

Instead of overlays that are *applied*, all features ship in the repo and the setup script *strips* the ones you don't want. This is simpler:

- No patch files, no merge files, no overlay.json schemas
- The setup script reads `basekit.manifest.json` to know which files belong to which feature
- Unselected features are deleted entirely (files, providers from chain, deps from package.json)
- Selected provider variants are kept; others are deleted (e.g., keep `auth/providers/firebase.ts`, delete `amplify.ts`, `supabase.ts`, `custom.ts`)

### `basekit.manifest.json`

Maps features to their files, dependencies, and provider chain position:

```json
{
  "features": {
    "auth": {
      "displayName": "Authentication",
      "category": "auth",
      "exclusive": true,
      "providers": {
        "amplify": {
          "files": ["src/features/auth/providers/amplify.ts"],
          "dependencies": {
            "aws-amplify": "^6.16.3",
            "@aws-amplify/react-native": "^1.3.3",
            "amazon-cognito-identity-js": "^6.3.16"
          },
          "envVars": {
            "required": ["EXPO_PUBLIC_COGNITO_USER_POOL_ID", "EXPO_PUBLIC_COGNITO_CLIENT_ID"],
            "optional": ["EXPO_PUBLIC_COGNITO_IDENTITY_POOL_ID"]
          }
        },
        "firebase": {
          "files": ["src/features/auth/providers/firebase.ts"],
          "dependencies": {
            "@react-native-firebase/app": "^21.0.0",
            "@react-native-firebase/auth": "^21.0.0"
          },
          "envVars": { "required": [], "optional": [] }
        },
        "supabase": {
          "files": ["src/features/auth/providers/supabase.ts"],
          "dependencies": {
            "@supabase/supabase-js": "^2.45.0"
          },
          "envVars": { "required": ["EXPO_PUBLIC_SUPABASE_URL", "EXPO_PUBLIC_SUPABASE_ANON_KEY"], "optional": [] }
        },
        "custom": {
          "files": ["src/features/auth/providers/custom.ts"],
          "dependencies": {},
          "envVars": { "required": ["EXPO_PUBLIC_API_URL"], "optional": [] }
        }
      },
      "sharedFiles": [
        "src/features/auth/auth-provider.tsx",
        "src/features/auth/auth-context.ts",
        "src/features/auth/create-auth-service.ts",
        "src/features/auth/no-op-auth.ts",
        "src/features/auth/hooks/",
        "src/features/auth/__tests__/"
      ],
      "sharedDependencies": {},
      "requires": [],
      "enhancedBy": ["security"],
      "providerChain": {
        "component": "AuthProvider",
        "import": "@/features/auth",
        "order": 30
      },
      "routes": ["src/app/(auth)/"]
    },
    "security": {
      "displayName": "Security",
      "category": "security",
      "exclusive": false,
      "providers": {},
      "sharedFiles": [
        "src/features/security/"
      ],
      "sharedDependencies": {
        "expo-local-authentication": "^15.0.0",
        "expo-secure-store": "^14.0.0"
      },
      "requires": [],
      "enhancedBy": [],
      "providerChain": {
        "component": "SecurityProvider",
        "import": "@/features/security",
        "order": 25
      },
      "routes": []
    },
    "theme": {
      "displayName": "Theme System",
      "category": "theme",
      "exclusive": true,
      "providers": {
        "minimal": {
          "files": ["src/features/theme/presets/minimal.ts", "assets/fonts/inter/"],
          "dependencies": {}
        },
        "bold": {
          "files": ["src/features/theme/presets/bold.ts", "assets/fonts/plus-jakarta-sans/"],
          "dependencies": {}
        },
        "corporate": {
          "files": ["src/features/theme/presets/corporate.ts", "assets/fonts/ibm-plex-sans/"],
          "dependencies": {}
        }
      },
      "sharedFiles": [
        "src/features/theme/theme-provider.tsx",
        "src/features/theme/hooks/",
        "src/features/theme/utils/",
        "src/config/theme.config.ts"
      ],
      "sharedDependencies": {},
      "requires": [],
      "enhancedBy": [],
      "providerChain": {
        "component": "BasekitThemeProvider",
        "import": "@/features/theme",
        "order": 5
      },
      "routes": []
    }
  },
  "featureDependencies": {
    "notifications": ["auth"],
    "payments": ["auth"],
    "onboarding": ["offline-storage"]
  },
  "categories": {
    "auth": { "exclusive": true, "label": "Authentication" },
    "analytics": { "exclusive": true, "label": "Analytics" },
    "theme": { "exclusive": true, "label": "Theme Preset" },
    "crash-reporting": { "exclusive": true, "label": "Crash Reporting" },
    "notifications": { "exclusive": true, "label": "Push Notifications" },
    "offline-storage": { "exclusive": true, "label": "Offline Storage" },
    "security": { "exclusive": false, "label": "Security" },
    "i18n": { "exclusive": false, "label": "Internationalization" },
    "forms": { "exclusive": false, "label": "Forms & Validation" },
    "onboarding": { "exclusive": false, "label": "Onboarding" },
    "ota-updates": { "exclusive": false, "label": "OTA Updates" },
    "deep-linking": { "exclusive": false, "label": "Deep Linking" },
    "payments": { "exclusive": true, "label": "Payments" }
  }
}
```

---

## 2. Setup Wizard

### User Flow

```
# Step 1: Clone or use GitHub template
gh repo create my-app --template basekit/basekit
cd my-app

# Step 2: Run setup
pnpm setup
```

### 2.1 Interactive Mode

```
$ pnpm setup

  Welcome to Basekit! Let's configure your app.

  App name: my-app
  Bundle ID: com.mycompany.myapp
  Scheme (deep linking): myapp

  Choose a theme preset:
    > Minimal / Bold / Corporate / None

  Choose a backend provider:
    > None / AWS Amplify / Firebase / Supabase / Custom

  Select features: (space to toggle)
    ◼ Authentication
    ◼ Analytics
    ◻ Crash Reporting
    ◻ Push Notifications
    ◼ Offline Storage
    ◼ Internationalization
    ◼ Forms & Validation
    ◻ Security (biometrics, secure storage, SSL pinning)
    ◻ Payments
    ◻ Onboarding Flow
    ◻ OTA Updates
    ◻ Deep Linking

  Configuring project...
    ✔ Updated app.json with app name and bundle ID
    ✔ Kept: auth (firebase), analytics (firebase), offline-storage, i18n, forms
    ✔ Removed: crash-reporting, notifications, security, payments, onboarding, ota-updates, deep-linking
    ✔ Removed unused provider files (amplify, supabase, custom)
    ✔ Applied theme preset: minimal
    ✔ Rewrote app-providers.tsx
    ✔ Updated basekit.config.ts
    ✔ Cleaned package.json (removed 12 unused dependencies)
    ✔ Updated .env.example
    ✔ Ran pnpm install
    ✔ Removed setup/ directory
    ✔ Created initial commit

  Done! pnpm start
```

### 2.2 Quick Mode

```
$ pnpm setup --quick

  Configuring with defaults...
    Theme: minimal | Backend: none | Features: offline-storage, i18n, forms
    ✔ Done in 8s

  pnpm start
```

Quick mode defaults are chosen for the fastest possible start — no backend, no accounts to configure, just a styled app with local storage, translations, and forms.

### 2.3 Config File Mode

For teams standardizing project setup:

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

```
$ pnpm setup --from basekit.scaffold.yaml
```

Note: `basekit.scaffold.yaml` is the setup input config. This is distinct from `basekit.config.ts`, which is the runtime feature toggle config inside the generated app.

### 2.4 What the Setup Script Does

1. **Prompts** — collects app name, bundle ID, theme, backend, features
2. **Strips unselected features** — deletes entire feature directories for features not chosen
3. **Strips unselected providers** — within selected features, deletes provider files for backends not chosen (e.g., if Firebase selected, delete `providers/amplify.ts`, `providers/supabase.ts`)
4. **Rewrites `app-providers.tsx`** — regenerates the provider chain with only selected feature providers, in correct nesting order
5. **Updates `basekit.config.ts`** — sets enabled/disabled flags and provider names
6. **Updates `app.json`** — injects app name, bundle ID, scheme
7. **Cleans `package.json`** — removes dependencies belonging to stripped features
8. **Updates `.env.example`** — keeps only env vars for selected features
9. **Strips unused routes** — removes `(auth)/` route group if auth not selected
10. **Applies theme preset** — copies preset values into `theme.config.ts`, deletes other presets
11. **Runs `pnpm install`** — clean install with reduced dependencies
12. **Self-destructs** — deletes `setup/` directory and `basekit.manifest.json`
13. **Commits** — creates "Initial project setup" commit

After setup, no trace of the wizard remains. The project is a clean, standalone Expo app.

### 2.5 Setup Tech Stack

| Tool | Purpose |
|------|---------|
| `@clack/prompts` | Beautiful terminal UI |
| `fs-extra` | File operations (delete, copy) |
| `yaml` | Parse scaffold config files |
| `execa` | Running pnpm install, git commit |
| `picocolors` | Terminal colors |

These are devDependencies that get removed along with the setup/ directory.

### 2.6 Feature Dependencies

```
notifications  -> requires auth
security       -> enhances auth (swaps to secure token storage)
payments       -> requires auth
onboarding     -> requires offline-storage
```

If a user selects `notifications` without `auth`, the wizard prompts:

```
  ⚠ Notifications requires Authentication.
    Add auth as well? (Y/n)
```

---

## 3. Security Feature Design

Single feature module (`src/features/security/`) providing three capabilities.

### 3.1 Biometric Authentication

```typescript
interface UseBiometrics {
  isAvailable: boolean
  biometricType: 'fingerprint' | 'facial' | 'iris' | null
  authenticate(options?: BiometricOptions): Promise<BiometricResult>
}

interface BiometricOptions {
  promptMessage?: string
  cancelLabel?: string
  fallbackToPasscode?: boolean
}

interface BiometricResult {
  success: boolean
  error?: 'user_cancel' | 'not_available' | 'not_enrolled' | 'lockout' | 'unknown'
}
```

**Library:** `expo-local-authentication`

### 3.2 Secure Token Storage

```typescript
interface UseSecureStorage {
  get(key: string): Promise<string | null>
  set(key: string, value: string): Promise<void>
  remove(key: string): Promise<void>
  clear(): Promise<void>
}
```

**Library:** `expo-secure-store` (iOS Keychain / Android Keystore)

When security feature is present alongside auth, auth providers automatically use secure storage for tokens instead of MMKV/AsyncStorage.

### 3.3 SSL Certificate Pinning

```typescript
interface PinningConfig {
  enabled: boolean
  pins: Array<{
    hostname: string
    sha256: string[]
  }>
  environment: {
    development: boolean    // false — allows proxy tools
    staging: boolean
    production: boolean     // always true
  }
}
```

**Library:** `react-native-ssl-pinning` or native config via expo-config-plugin

### 3.4 App Lock Hook

Combines biometrics + background timeout into a single hook:

```typescript
interface UseAppLock {
  isLocked: boolean
  lock(): void
  unlock(): Promise<BiometricResult>
  config: {
    lockOnBackground: boolean
    backgroundTimeout: number     // seconds, default: 30
    requireOnLaunch: boolean
  }
}
```

### 3.5 Feature Files

```
src/features/security/
├── security-provider.tsx
├── hooks/
│   ├── use-biometrics.ts
│   ├── use-secure-storage.ts
│   └── use-app-lock.ts
├── config/
│   └── pinning.ts
├── utils/
│   └── secure-auth-storage.ts
└── __tests__/
```

---

## 4. Theming & Design Token System

### 4.1 Theme Config

Single source of truth for all design tokens:

```typescript
// src/config/theme.config.ts
export const themeConfig: ThemeConfig = {
  colors: {
    primary:   { 50: '...', ..., 950: '...' },
    secondary: { 50: '...', ..., 950: '...' },
    accent:    { 50: '...', ..., 950: '...' },
    neutral:   { 50: '...', ..., 950: '...' },
    semantic:  { success, warning, error, info },
    surface: {
      light: { background, card, border },
      dark:  { background, card, border },
    },
  },
  typography: {
    fontFamily: { sans: 'Inter', mono: 'JetBrains Mono' },
    scale: { xs, sm, base, lg, xl, '2xl', '3xl', '4xl' },
  },
  spacing:      { unit: 4 },
  borderRadius: { none, sm, md, lg, xl, full },
  shadows:      { sm, md, lg },
}
```

### 4.2 Token Flow

```
theme.config.ts
       |
       +---> tailwind.config.js    (build time - generates Tailwind classes)
       |       className="bg-primary-500 text-lg rounded-lg shadow-md"
       |
       +---> ThemeProvider          (runtime - React context)
               const { colors, typography } = useTheme()
```

Both paths read from the same source. No drift.

### 4.3 Runtime Hook

```typescript
interface UseTheme {
  colors: ResolvedColors
  typography: TypographyScale
  spacing(n: number): number
  borderRadius: BorderRadiusScale
  shadows: ShadowScale
  mode: 'light' | 'dark'
  setMode(mode: 'light' | 'dark' | 'system'): void
  isDark: boolean
}
```

### 4.4 Theme Presets

| Preset | Vibe | Primary | Font |
|--------|------|---------|------|
| Minimal | Clean, subtle, white space | Slate blue #6366f1 | Inter |
| Bold | Vibrant, high contrast | Electric blue #2563eb | Plus Jakarta Sans |
| Corporate | Professional, muted | Navy #1e3a5f | IBM Plex Sans |

During setup, the user picks a preset. The setup script copies that preset's values into `theme.config.ts` and deletes the other preset files.

### 4.5 Tailwind Integration

```javascript
// tailwind.config.js
const { generateTailwindTheme } = require('./src/features/theme/utils/generate-tailwind')
const { themeConfig } = require('./src/config/theme.config')

module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: generateTailwindTheme(themeConfig),
  },
}
```

Edit `theme.config.ts` and both Tailwind classes and `useTheme()` update automatically.

### 4.6 Theme vs Base Template Boundary

**What lives in the base (no theme feature selected):**
- `useColorScheme()` hook (system light/dark detection)
- `useThemeColor()` hook (resolves colors from constants)
- `ThemedText` and `ThemedView` components
- `src/constants/theme.ts` with hardcoded light/dark color values
- Basic NativeWind/Tailwind setup

**What the theme feature adds:**
- `src/config/theme.config.ts` — design token file (replaces `constants/theme.ts`)
- `src/features/theme/theme-provider.tsx` — enhanced provider with token resolution
- `src/features/theme/hooks/use-theme.ts` — full token-aware hook (replaces `useThemeColor`)
- `src/features/theme/utils/generate-tailwind.ts` — token-to-Tailwind config generator
- Preset fonts in `assets/fonts/`
- Updated `tailwind.config.js` to wire up token generation

`ThemedText` and `ThemedView` use `useTheme()` when the theme feature is present, or fall back to base constants when it's not.

---

## 5. Supported Backend Providers

| Provider | Auth | Analytics | Crash Reporting | Notifications | Storage |
|----------|------|-----------|-----------------|---------------|---------|
| AWS Amplify | Cognito | Amplify Analytics | — | Amplify Push | — |
| Firebase | Firebase Auth | Firebase Analytics | Crashlytics | FCM | — |
| Supabase | Supabase Auth | — | — | — | — |
| Custom | JWT/OAuth | — | — | — | — |
| Sentry | — | — | Sentry | — | — |
| MMKV | — | — | — | — | MMKV |
| AsyncStorage | — | — | — | — | AsyncStorage |

Providers are mixed and matched. A project can use Supabase for auth, Firebase for analytics, and Sentry for crash reporting.

---

## 6. Available Features (11 + 2 new)

| Feature | Providers | Status |
|---------|-----------|--------|
| Authentication | amplify, firebase, supabase, custom | Existing (needs Firebase/Supabase/Custom providers) |
| Analytics | amplify, firebase | Existing (needs Firebase provider) |
| Crash Reporting | sentry | Existing |
| Push Notifications | amplify, firebase | Existing (needs Firebase provider) |
| Offline Storage | mmkv, async-storage | Existing |
| Internationalization | — | Existing |
| Forms & Validation | — | Existing |
| Onboarding | — | Existing |
| OTA Updates | — | Existing |
| Deep Linking | — | Existing |
| Splash & App Icon | — | Existing |
| **Security** | **—** | **New** |
| **Theming** | **minimal, bold, corporate** | **New** |

---

## 7. Provider Roadmap

### Current (v1.0)

Providers carried over from the existing starter kit:

| Feature | Provider |
|---------|----------|
| Auth | AWS Amplify (Cognito) |
| Analytics | AWS Amplify |
| Crash Reporting | Sentry |
| Notifications | AWS Amplify |
| Offline Storage | MMKV, AsyncStorage |

### Planned (v1.x)

New providers to be built:

| Feature | Provider | Priority |
|---------|----------|----------|
| Auth | Firebase, Supabase, Custom (JWT/OAuth) | High |
| Analytics | Firebase | High |
| Crash Reporting | Crashlytics (Firebase) | Medium |
| Notifications | FCM (Firebase) | Medium |
| Payments | Stripe, RevenueCat | Medium |

### Deferred

Providers from the existing `starter.config.ts` that are deferred to community contributions or future versions: Clerk (auth), Mixpanel/Segment/PostHog (analytics), Bugsnag/Datadog (crash reporting), OneSignal (notifications). These can be added following the established feature module pattern.

---

## 8. Error Handling & Edge Cases

### Feature dependency conflicts

If a user selects `notifications` without `auth`, the wizard prompts to add auth. If they decline, notifications is deselected with an explanation.

### Provider exclusivity

Categories marked `exclusive: true` in the manifest allow only one provider. The wizard enforces this — selecting Firebase auth automatically deselects Amplify auth.

### Setup failure recovery

If the setup script fails mid-execution:
- No files have been committed yet (commit happens last)
- The user can `git checkout .` to restore the original state
- The user can re-run `pnpm setup` from scratch

### Missing environment variables

After setup, `.env.example` lists only the required variables for selected features. `pnpm start` will warn if `.env` is missing required values.

---

## 9. Testing Strategy

### Setup Script Testing

| Layer | Tool | What's tested |
|-------|------|--------------|
| Unit | Vitest | Feature stripping logic, provider chain rewriting, config updates |
| Integration | Vitest + fs fixtures | Full setup runs against snapshot project structures |
| Snapshot | Vitest | Generated project structure for each feature combination |

### Generated App Testing

Each feature includes `__tests__/` with unit tests. After setup:
- Jest + React Native Testing Library work out of the box
- `pnpm test` runs only tests for selected features (unselected ones were deleted)
- `pnpm test:coverage` for coverage reports

---

## 10. Phase 2: Published CLI (Future)

When the project matures, the setup logic is extracted into a published npm package:

```
npx create-basekit-app my-app          # Interactive — clones template + runs setup
npx create-basekit-app my-app --quick  # Quick mode with defaults
```

The generator logic is the same — it clones the template repo and runs the same strip/configure flow. Additional Phase 2 commands:

| Command | Purpose |
|---------|---------|
| `basekit add <feature>` | Re-add a feature that was stripped during setup |
| `basekit list` | Show available and installed features |
| `basekit doctor` | Validate project health |

`basekit add` works by fetching the feature files from the template repo at the matching version and applying them to the project. This requires a `basekit.lock.json` to track what was configured:

```json
{
  "basekitVersion": "1.0.0",
  "configuredAt": "2026-03-26T10:00:00Z",
  "features": {
    "auth": { "enabled": true, "provider": "firebase" },
    "analytics": { "enabled": true, "provider": "firebase" },
    "security": { "enabled": false },
    "theme": { "enabled": true, "preset": "minimal" }
  }
}
```

Phase 2 is out of scope for the current design. This section documents intent only.

---

## 11. API Configuration & Backend Integration

### API Config in Base Template

The base template includes API client setup in `basekit.config.ts`:

```typescript
api: {
  baseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000',
  timeout: 30000,
}
```

This powers the pre-configured Axios client (`src/lib/api/client.ts`) with auth token interceptor. All features that make API calls use this shared client.

### Relationship to Backend Design

The existing backend design spec (`docs/superpowers/specs/2026-03-13-starter-kit-backend-design.md`) describes a Spring Boot backend with Cognito JWT auth, user profiles, translations, analytics, and notification endpoints. The `custom` auth provider is designed to work with this backend and any REST/GraphQL API that follows standard JWT/OAuth patterns.

When a developer selects the "Custom" backend option during setup:
- `auth/providers/custom.ts` provides JWT token management, refresh interceptor, and configurable auth endpoints
- The API client is pre-configured with the `baseUrl` from environment variables
- Endpoint paths are configurable, not hardcoded

### `basekit.config.ts` Runtime Shape

```typescript
interface BasekitConfig {
  app: {
    name: string
    bundleId: string
    scheme: string
  }
  features: {
    auth: { enabled: boolean; provider: string }
    analytics: { enabled: boolean; provider: string }
    crashReporting: { enabled: boolean; provider: string }
    notifications: { enabled: boolean; provider: string }
    i18n: { enabled: boolean; defaultLocale: string }
    offlineStorage: { enabled: boolean; provider: string }
    onboarding: { enabled: boolean }
    otaUpdates: { enabled: boolean }
    deepLinking: { enabled: boolean }
    splashAppIcon: { enabled: boolean }
    forms: { enabled: boolean }
    security: { enabled: boolean }
    payments: { enabled: boolean; provider: string }
    theme: { enabled: boolean; preset: string }
  }
  api: {
    baseUrl: string
    timeout: number
  }
}
```
