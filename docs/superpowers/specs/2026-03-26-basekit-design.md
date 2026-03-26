# Basekit — Cross-Platform Starter Kit Design

## Overview

Basekit is a CLI-driven, cross-platform React Native Expo starter kit. Developers scaffold production-ready apps by selecting features, backend providers, and theme presets through an interactive CLI. Every feature is a composable overlay applied on top of a minimal base template.

**Target audience:** Solo devs, agency teams, enterprise teams, and the open-source community.

**CLI package:** `create-basekit-app` (scaffolding) + `@basekit/cli` (post-scaffold commands)

---

## 1. Project Structure

### Monorepo Layout

```
basekit/
├── packages/
│   ├── cli/                    # create-basekit-app + basekit commands
│   │   ├── src/
│   │   │   ├── commands/       # create, add, remove, list, doctor
│   │   │   ├── prompts/        # Interactive wizard prompts
│   │   │   ├── generators/     # Template merging engine
│   │   │   └── utils/
│   │   └── package.json
│   └── template/               # The app template
│       ├── base/               # Core files every project gets
│       ├── overlays/           # Feature overlays
│       │   ├── auth-amplify/
│       │   ├── auth-firebase/
│       │   ├── auth-supabase/
│       │   ├── auth-custom/
│       │   ├── analytics-amplify/
│       │   ├── analytics-firebase/
│       │   ├── security/
│       │   ├── theme-minimal/
│       │   ├── theme-bold/
│       │   ├── theme-corporate/
│       │   ├── payments-stripe/
│       │   ├── i18n/
│       │   ├── notifications/
│       │   ├── offline-storage/
│       │   └── ...
│       └── basekit.manifest.json  # Overlay metadata & dependencies
├── docs/                       # Documentation site
├── e2e/                        # CLI integration tests
└── package.json                # pnpm workspace root
```

### Overlay Structure

Each feature overlay follows this structure:

```
overlays/<feature-name>/
├── overlay.json                # Metadata, dependencies, conflicts, file operations
├── files/                      # Files to copy/merge into the project
├── patches/                    # Targeted patches to base files
│   ├── app-providers.patch     # Add provider to chain
│   ├── package.json.merge      # Dependencies to add
│   └── basekit.config.patch    # Enable feature in config
└── templates/                  # Handlebars templates for dynamic content
```

### Template Merge Engine

The CLI processes overlays in dependency order:
1. Copies base template
2. For each selected overlay:
   - Copies overlay `files/` into project
   - Applies `patches/` to modify base files (provider chain, config, package.json)
   - Renders `templates/` with project variables (app name, bundle ID, etc.)
3. Runs package manager install
4. Runs `basekit doctor` to validate

---

## 2. Base Template

The minimal app every project starts with — before any overlays.

### Contents

- Expo SDK 54 + React Native + TypeScript (strict)
- expo-router with file-based routing
- NativeWind v4 + TailwindCSS for styling
- Light/dark mode support
- Basic themed components (ThemedText, ThemedView, IconSymbol, Collapsible)
- Path aliases (`@/`, `@assets/`)
- ESLint, pnpm, dev tooling configured
- `basekit.config.ts` with all features toggled off

### What's NOT in the base

- No auth, analytics, crash reporting, notifications, storage, i18n, forms, payments, security
- No backend dependencies (no Amplify, Firebase, Supabase)
- No feature providers in the provider chain

A zero-feature scaffold produces a clean, running Expo app.

---

## 3. Security Feature Design

Single overlay (`overlays/security/`) providing three capabilities.

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

When security overlay is present, auth providers automatically use secure storage for tokens instead of MMKV/AsyncStorage.

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

### 3.5 Overlay Files

```
overlays/security/
├── overlay.json
├── files/
│   └── src/features/security/
│       ├── security-provider.tsx
│       ├── hooks/
│       │   ├── use-biometrics.ts
│       │   ├── use-secure-storage.ts
│       │   └── use-app-lock.ts
│       ├── config/pinning.ts
│       ├── utils/secure-auth-storage.ts
│       └── __tests__/
├── patches/
│   ├── app-providers.patch
│   ├── package.json.merge
│   └── basekit.config.patch
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

---

## 5. CLI Wizard Flow

### 5.1 Interactive Mode

```
$ npx create-basekit-app my-app

  Welcome to Basekit! Let's build your app.

  App name: my-app
  Bundle ID: com.mycompany.myapp
  Scheme (deep linking): myapp

  Choose a theme preset:
    > Minimal / Bold / Corporate

  Choose a backend provider:
    > None / AWS Amplify / Firebase / Supabase / Custom

  Select features: (space to toggle)
    Authentication, Analytics, Crash Reporting, Push Notifications,
    Offline Storage, i18n, Forms, Security, Payments, Onboarding,
    OTA Updates, Deep Linking

  Package manager:
    > pnpm / npm / yarn / bun

  Creating project...
    Applied overlays, installed dependencies, validated.

  Done! cd my-app && pnpm start
```

### 5.2 Quick Mode

```
$ npx create-basekit-app my-app --quick
  Theme: minimal | Backend: none | Features: offline-storage, i18n, forms
```

### 5.3 Config File Mode

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
$ npx create-basekit-app --from basekit.scaffold.yaml
```

Note: `basekit.scaffold.yaml` is the CLI input config for reproducible project creation. This is distinct from `basekit.config.ts`, which is the runtime feature toggle config inside the generated app.

### 5.4 Post-Scaffold Commands

| Command | Purpose |
|---------|---------|
| `basekit add <feature>` | Add feature overlay to existing project |
| `basekit remove <feature>` | Remove feature and clean up |
| `basekit list` | Show features and their status |
| `basekit doctor` | Validate project health |

### 5.5 Feature Dependencies

```
notifications  -> requires auth
security       -> enhances auth (swaps to secure token storage)
payments       -> requires auth
onboarding     -> requires offline-storage
```

CLI auto-prompts when a dependency is missing.

### 5.6 CLI Tech Stack

| Tool | Purpose |
|------|---------|
| `@clack/prompts` | Terminal UI |
| `commander` | Command parsing |
| `fs-extra` | File operations |
| `diff-match-patch` | Patch application |
| `handlebars` | Template rendering |
| `execa` | Running install commands |
| `picocolors` | Terminal colors |

---

## 6. Supported Backend Providers

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

## 7. Available Features (11 + 2 new)

| Feature | Overlays | Status |
|---------|----------|--------|
| Authentication | auth-amplify, auth-firebase, auth-supabase, auth-custom | Existing (needs Firebase/Supabase/Custom providers) |
| Analytics | analytics-amplify, analytics-firebase | Existing (needs Firebase provider) |
| Crash Reporting | crash-reporting-sentry | Existing |
| Push Notifications | notifications-amplify, notifications-firebase | Existing (needs Firebase provider) |
| Offline Storage | offline-storage-mmkv, offline-storage-async | Existing |
| Internationalization | i18n | Existing |
| Forms & Validation | forms | Existing |
| Onboarding | onboarding | Existing |
| OTA Updates | ota-updates | Existing |
| Deep Linking | deep-linking | Existing |
| Splash & App Icon | splash-app-icon | Existing |
| **Security** | **security** | **New** |
| **Theming** | **theme-minimal, theme-bold, theme-corporate** | **New** |

---

## 8. Overlay Schema

### 8.1 `overlay.json` Definition

Every overlay must include an `overlay.json` at its root:

```json
{
  "name": "auth-amplify",
  "displayName": "Authentication (AWS Amplify)",
  "version": "1.0.0",
  "description": "AWS Cognito authentication with sign in, sign up, and password reset",
  "category": "auth",
  "requires": [],
  "enhances": [],
  "conflicts": ["auth-firebase", "auth-supabase", "auth-custom"],
  "dependencies": {
    "aws-amplify": "^6.16.3",
    "@aws-amplify/react-native": "^1.3.3",
    "amazon-cognito-identity-js": "^6.3.16"
  },
  "devDependencies": {},
  "envVars": {
    "required": ["EXPO_PUBLIC_COGNITO_USER_POOL_ID", "EXPO_PUBLIC_COGNITO_CLIENT_ID"],
    "optional": ["EXPO_PUBLIC_COGNITO_IDENTITY_POOL_ID"]
  },
  "files": {
    "copy": ["files/"],
    "templates": ["templates/"],
    "patches": [
      { "target": "src/lib/providers/app-providers.tsx", "patch": "patches/app-providers.patch" },
      { "target": "src/config/basekit.config.ts", "patch": "patches/basekit.config.patch" }
    ],
    "merge": [
      { "target": "package.json", "source": "patches/package.json.merge" }
    ]
  },
  "providerChain": {
    "component": "AuthProvider",
    "import": "@/features/auth",
    "order": 30
  }
}
```

**Field reference:**

| Field | Required | Description |
|-------|----------|-------------|
| `name` | Yes | Unique overlay identifier (kebab-case) |
| `displayName` | Yes | Human-readable name for CLI display |
| `version` | Yes | Semver version of the overlay |
| `description` | Yes | One-line description |
| `category` | Yes | Feature category (auth, analytics, theme, etc.) |
| `requires` | Yes | Overlay names that must be present (hard dependency) |
| `enhances` | Yes | Overlay categories this improves when present (soft dependency) |
| `conflicts` | Yes | Overlay names that cannot coexist |
| `dependencies` | Yes | npm dependencies to add to package.json |
| `devDependencies` | Yes | npm devDependencies to add |
| `envVars` | Yes | Required and optional environment variables |
| `files.copy` | Yes | Directories to copy into the project |
| `files.templates` | No | Handlebars templates to render |
| `files.patches` | No | Diff patches to apply to existing files |
| `files.merge` | No | JSON deep-merge operations (for package.json, tsconfig, etc.) |
| `providerChain` | No | Where to insert this overlay's provider (component name, import, and numeric order) |

### 8.2 `basekit.manifest.json`

Auto-generated registry at the template root. Aggregates all overlay metadata for the CLI to read without scanning directories:

```json
{
  "version": "1.0.0",
  "overlays": {
    "auth-amplify": { "path": "overlays/auth-amplify", "category": "auth" },
    "auth-firebase": { "path": "overlays/auth-firebase", "category": "auth" },
    "security": { "path": "overlays/security", "category": "security" },
    "theme-minimal": { "path": "overlays/theme-minimal", "category": "theme" }
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

`exclusive: true` means only one overlay per category (e.g., you can't have both `auth-amplify` and `auth-firebase`).

### 8.3 Patch & Merge Formats

**`.patch` files** — Standard unified diff format, applied via `diff-match-patch`:

```diff
--- a/src/lib/providers/app-providers.tsx
+++ b/src/lib/providers/app-providers.tsx
@@ -1,4 +1,5 @@
 import { ThemeProvider } from '@react-navigation/native'
+import { AuthProvider } from '@/features/auth'

 export const AppProviders = ({ children }: Props) => (
   <ThemeProvider value={colorScheme}>
+    <AuthProvider>
       {children}
+    </AuthProvider>
   </ThemeProvider>
 )
```

**`.merge` files** — JSON deep-merge operations. Keys are merged recursively; arrays are concatenated:

```json
{
  "dependencies": {
    "aws-amplify": "^6.16.3",
    "@aws-amplify/react-native": "^1.3.3"
  },
  "scripts": {
    "amplify:pull": "amplify pull"
  }
}
```

---

## 9. Feature Removal Strategy

`basekit remove <feature>` is scoped to **clean removal** with documented limitations.

### How it works

1. **Read the project's `basekit.lock.json`** — a file generated at scaffold time and updated by `basekit add`. It records exactly which files were added and which patches were applied per overlay.
2. **Check for dependents** — if other features depend on the one being removed, warn and abort (e.g., can't remove auth if notifications is installed).
3. **Remove overlay files** — delete all files that were copied from the overlay's `files/` directory.
4. **Reverse patches** — for files modified by patches, attempt to reverse the patch. If the file has been modified by the user since the patch was applied, flag it for manual review instead of silently failing.
5. **Remove dependencies** — uninstall npm packages that are exclusive to this overlay (not shared with other overlays).
6. **Update config** — disable the feature in `basekit.config.ts`.
7. **Run `basekit doctor`** — validate the project is still healthy.

### `basekit.lock.json`

Generated and maintained automatically:

```json
{
  "appliedOverlays": {
    "auth-amplify": {
      "version": "1.0.0",
      "appliedAt": "2026-03-26T10:00:00Z",
      "filesAdded": [
        "src/features/auth/auth-provider.tsx",
        "src/features/auth/hooks/use-auth.ts"
      ],
      "patchesApplied": [
        { "target": "src/lib/providers/app-providers.tsx", "hash": "abc123" }
      ],
      "dependenciesAdded": ["aws-amplify", "@aws-amplify/react-native"]
    }
  }
}
```

### Limitations

- If the user has heavily modified patched files, reversal may require manual intervention. The CLI will show a diff and ask for confirmation.
- Removal does not delete user code that references the feature (e.g., `analytics.trackEvent()` calls). The CLI warns about these and `basekit doctor` flags them.

---

## 10. Error Handling & Edge Cases

### Conflict detection

If a user runs `basekit add auth-firebase` on a project with `auth-amplify`:
```
  Error: auth-firebase conflicts with auth-amplify.
  Run `basekit remove auth-amplify` first, then add auth-firebase.
```

### Partial failure during scaffolding

The merge engine applies overlays transactionally per overlay:
1. All operations for an overlay are staged in a temp directory
2. If any step fails (patch doesn't apply, template error), the entire overlay is rolled back
3. The CLI reports which overlay failed and continues with remaining overlays
4. `basekit doctor` runs at the end to report the final state

### Dependency version conflicts

When two overlays require different versions of the same package, the CLI:
1. Uses the higher version if semver ranges overlap
2. Warns if ranges are incompatible and asks the user to resolve

### `basekit doctor` capabilities

- Validates `basekit.config.ts` matches installed overlays
- Checks provider chain in `app-providers.tsx` matches enabled features
- Detects orphaned feature files (files from removed overlays)
- Checks required environment variables are set
- Reports-only — does not auto-fix (to avoid destructive changes)

---

## 11. Provider Roadmap

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

New providers to be built as overlays:

| Feature | Provider | Priority |
|---------|----------|----------|
| Auth | Firebase, Supabase, Custom (JWT/OAuth) | High |
| Analytics | Firebase | High |
| Crash Reporting | Crashlytics (Firebase) | Medium |
| Notifications | FCM (Firebase) | Medium |
| Payments | Stripe, RevenueCat | Medium |

### Deferred

Providers from the existing `starter.config.ts` that are deferred to community contributions or future versions: Clerk (auth), Mixpanel/Segment/PostHog (analytics), Bugsnag/Datadog (crash reporting), OneSignal (notifications). These can be added as overlays following the established pattern without changes to the core system.

---

## 12. Theme vs Base Template Boundary

### What lives in the base template

- `useColorScheme()` hook (system light/dark detection)
- `useThemeColor()` hook (resolves colors from constants)
- `ThemedText` and `ThemedView` components
- `src/constants/theme.ts` with hardcoded light/dark color values
- Basic NativeWind/Tailwind setup

### What theme overlays add

- `src/config/theme.config.ts` — design token file (replaces `constants/theme.ts`)
- `src/features/theme/theme-provider.tsx` — enhanced provider with token resolution
- `src/features/theme/hooks/use-theme.ts` — full token-aware hook (replaces `useThemeColor`)
- `src/features/theme/utils/generate-tailwind.ts` — token-to-Tailwind config generator
- Preset fonts in `assets/fonts/`
- Patches to `tailwind.config.js` to wire up token generation

Theme overlays replace the base theme constants with the full token system. `ThemedText` and `ThemedView` continue to work — they use the enhanced `useTheme()` hook when a theme overlay is present, or fall back to the base constants when not.

---

## 13. Testing Strategy

### CLI Testing

| Layer | Tool | What's tested |
|-------|------|--------------|
| Unit | Vitest | Merge engine, patch application, config parsing, dependency resolution |
| Integration | Vitest + fs fixtures | Full overlay application against snapshot projects |
| E2E | Vitest + execa | Full `create-basekit-app` runs, verifying generated projects build |
| Snapshot | Vitest | Generated project structure compared against known-good snapshots |

### Generated App Testing

Each overlay includes `__tests__/` with unit tests. The generated app inherits:
- Jest + React Native Testing Library (from base template)
- Feature-specific tests (from each applied overlay)
- `pnpm test` works out of the box

---

## 14. Publishing & Distribution

- `create-basekit-app` published to npm — the scaffolding entry point
- `@basekit/cli` published to npm — post-scaffold commands (`add`, `remove`, `list`, `doctor`)
- Templates are **bundled** into the CLI package (not fetched remotely) for offline support and version consistency
- CLI version is pinned in the generated project's `basekit.lock.json` for reproducibility
- Updates: `npm update @basekit/cli` to get new overlays and fixes
