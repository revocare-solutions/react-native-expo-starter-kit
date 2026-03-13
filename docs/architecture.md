# Architecture

## Overview

The starter kit follows a **modular feature architecture**. Every capability (storage, auth, analytics, etc.) lives in its own feature folder under `src/features/` and can be toggled on or off from a single configuration file (`src/config/starter.config.ts`).

Cross-cutting concerns like API access and state management live in `src/lib/` and `src/store/`.

## Feature Folder Structure

Each swappable feature follows a consistent layout:

```
src/features/<feature>/
  index.ts                  # Public barrel exports
  create-<feature>-service.ts   # Factory with dynamic imports
  no-op-<feature>.ts        # No-op implementation (used when disabled)
  <feature>-provider.tsx    # React context provider
  hooks/
    use-<feature>.ts        # Hook consumed by app code
  providers/
    <provider-a>.ts         # Concrete implementation A
    <provider-b>.ts         # Concrete implementation B
  __tests__/
    ...                     # Unit tests
```

### Key conventions

- **Barrel export** (`index.ts`) -- only the provider, hook, and factory are exported. Internal files stay private.
- **No-op fallback** -- when a feature is disabled, hooks return a no-op implementation so consuming code never crashes.
- **Dynamic imports** -- concrete providers are loaded via `import()` in the factory so that unused provider code is tree-shaken.

## Service Interface Pattern

Every swappable feature defines a TypeScript interface in `src/services/`:

```
src/services/
  storage.interface.ts
  auth.interface.ts
  analytics.interface.ts
  crash-reporting.interface.ts
  notifications.interface.ts
```

The factory function for each feature returns a concrete implementation of the interface based on the provider selected in `starter.config.ts`. This keeps application code decoupled from any specific SDK.

```
starter.config.ts  -->  factory  -->  concrete provider
                         |
                         v
                   service interface (TypeScript contract)
```

## Provider Composition

All providers are composed in `src/lib/providers/app-providers.tsx` in a dependency-aware order:

```
SafeArea
  Theme
    QueryClient (TanStack Query)
      OfflineStorage
        Auth          (future)
          Analytics    (future)
            CrashReporting (future)
              i18n     (future)
                Notifications (future)
                  ...children (app routes)
```

Each provider checks its feature toggle. When disabled, it renders its children directly (pass-through), adding zero overhead.

## Disabled Feature Behavior

When a feature is disabled in `starter.config.ts`:

1. **Provider** -- renders children directly without wrapping.
2. **Hook** -- returns a no-op implementation (safe to call, does nothing).
3. **Factory** -- returns the no-op service immediately.

This means you can leave `useStorage()` calls in your code even when offline storage is disabled; they will silently return safe defaults.

## State Management

| Concern | Tool | Location |
| --- | --- | --- |
| Client state | Zustand | `src/store/` |
| Server state | TanStack Query | `src/lib/api/` |

### Zustand

Stores are created with `create()` and can use the `persist` middleware backed by MMKV for automatic rehydration across app restarts.

### TanStack Query

The `QueryProvider` in `src/lib/api/query-provider.tsx` wraps the app and supplies a shared `QueryClient`. The Axios-based `apiClient` (`src/lib/api/client.ts`) handles auth token injection and can be extended with custom interceptors.

## API Layer

`src/lib/api/client.ts` creates an Axios instance configured from `starter.config.ts`:

- **Base URL** from `EXPO_PUBLIC_API_URL` env var.
- **Timeout** from `api.timeout`.
- **Auth interceptor** -- automatically attaches a Bearer token when an auth token getter is registered via `setAuthTokenGetter()`.
