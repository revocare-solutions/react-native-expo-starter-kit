# Backend Integration Design Spec

**Date:** 2026-03-16
**Goal:** Wire the React Native Expo starter kit frontend to the Spring Boot backend, connecting all 7 API modules end-to-end using the existing provider architecture.

## Overview

The backend exposes 7 modules: Auth, Analytics, Crash Reporting, Notifications, Tasks, Sync, and I18n. The frontend already has service interfaces and provider patterns for Auth, Analytics, Crash Reporting, Notifications, and Storage. This integration adds a `backend` provider implementation for each existing service, creates new service interfaces for Tasks and Sync, and builds demo screens to exercise every endpoint.

## Architecture

### Approach: New Backend Provider Per Service

Each service gets a new `backend.ts` provider that calls the Spring Boot REST API. Providers are selected via `starter.config.ts` — setting a feature's provider to `'backend'` activates the backend implementation. Existing providers (Amplify, Sentry, etc.) remain untouched.

### Data Flow

```
Screen → TanStack Query Hook → Service Provider (backend) → Axios Client → Spring Boot API → PostgreSQL/Cognito/SNS
```

### Provider Pattern (Existing)

All providers follow this established pattern:
1. Service interface in `src/services/`
2. Type definitions in `src/types/`
3. Provider implementation in `src/features/<module>/providers/`
4. Factory function in `src/features/<module>/create-<module>-service.ts`
5. React context + provider component in `src/features/<module>/`
6. No-op fallback for when the feature is disabled
7. Hooks in `src/features/<module>/hooks/`

## Module Designs

### 1. Configuration Changes

**`src/config/starter.config.ts`:**
- Add `'backend'` as provider option for auth, analytics, crashReporting, notifications
- Add new feature flags: `tasks: { enabled: boolean; provider: 'backend' }` and `sync: { enabled: boolean; provider: 'backend' }`
- Expand `api` config:
  ```typescript
  api: {
    baseUrl: string | undefined;
    timeout: number;
  }
  ```

**`.env.example`:** Document `EXPO_PUBLIC_API_URL=http://localhost:8080`

### 2. API Client Changes

**`src/lib/api/client.ts`:**
- Add a 401 response interceptor that:
  1. Detects 401 responses (excluding `/api/auth/login` and `/api/auth/refresh`)
  2. Attempts token refresh via `POST /api/auth/refresh` using the stored refresh token
  3. Retries the original request with the new access token
  4. If refresh fails, triggers sign-out and redirects to login

No other structural changes needed — the existing Axios client with `setAuthTokenGetter` handles everything.

### 3. Auth Module — Backend Provider

**New file:** `src/features/auth/providers/backend.ts`

Implements the existing `AuthService` interface:

| Method | Endpoint | Notes |
|---|---|---|
| `signUp()` | `POST /api/auth/register` | Returns 201 with no body. Treat any 2xx as success. User must verify email then sign in. |
| `signIn()` | `POST /api/auth/login` | Returns access + refresh tokens |
| `signOut()` | `POST /api/auth/logout` | Invalidates server-side |
| `resetPassword()` | `POST /api/auth/forgot-password` | Sends reset email |
| `confirmResetPassword()` | `POST /api/auth/confirm-reset` | Code + new password |
| `getCurrentUser()` | `GET /api/auth/me` | Returns user profile |
| `getSession()` | Reads from MMKV | Tokens stored locally |
| `onAuthStateChange()` | Event emitter | Fires on sign-in/sign-out/refresh |

**Token storage:** JWT access and refresh tokens stored in MMKV via the existing `StorageService`. On app launch, restores session from storage.

**Interface additions to `AuthService`:**
- `verifyEmail(email: string, code: string): Promise<void>` — maps to `POST /api/auth/verify-email` (returns 200 with no body). No-op default in other providers.
- `updateProfile(data: { displayName?: string; avatarUrl?: string }): Promise<User>` — maps to `PUT /api/auth/me`. No-op default in other providers.
- `deleteAccount(): Promise<void>` — maps to `DELETE /api/auth/me`. No-op default in other providers.

These are optional methods with no-op defaults so existing providers are unaffected.

**Factory update:** Add `'backend'` entry to `create-auth-service.ts` providers map.

### 4. Tasks Module — New Service (No Existing Interface)

**New interface** at `src/services/tasks.interface.ts`:
```typescript
export interface TaskService {
  getTasks(filters?: TaskFilters): Promise<PaginatedResult<Task>>;
  getTask(id: string): Promise<Task>;
  createTask(input: CreateTaskInput): Promise<Task>;
  updateTask(id: string, input: UpdateTaskInput): Promise<Task>;
  deleteTask(id: string): Promise<void>;
}
```

**New types** at `src/types/tasks.types.ts`:
- `Task` — id (string, UUID), title, description, status (`todo` | `in_progress` | `done`), priority (`low` | `medium` | `high`), dueDate (string | null, ISO date), createdAt, updatedAt
- `TaskFilters` — status?, priority?, page?, size?
- `CreateTaskInput` / `UpdateTaskInput` — partial task fields
- `PaginatedResult<T>` — content, totalElements, totalPages, page (current page, 0-indexed), size. Matches the backend's `PagedResponse<T>` DTO.

**Provider** at `src/features/tasks/providers/backend.ts`:
- Maps to `GET/POST/PUT/DELETE /api/tasks/*`

**Feature module files:**
- `src/features/tasks/create-tasks-service.ts` — factory
- `src/features/tasks/tasks-provider.tsx` — React context provider
- `src/features/tasks/tasks-context.ts` — context definition
- `src/features/tasks/no-op-tasks.ts` — no-op fallback

**TanStack Query hooks:**
- `use-tasks.ts` — `useQuery` for task list with filters
- `use-task.ts` — `useQuery` for single task
- `use-create-task.ts` — `useMutation` with query cache invalidation
- `use-update-task.ts` — `useMutation` with optimistic update
- `use-delete-task.ts` — `useMutation` with query cache invalidation

### 5. Analytics — Backend Provider

**New file:** `src/features/analytics/providers/backend.ts`

| Method | Endpoint |
|---|---|
| `initialize()` | No-op |
| `trackEvent()` | `POST /api/analytics/events` |
| `trackScreen()` | `POST /api/analytics/events` (category: `screen_view`) |
| `setUserProperties()` | Stores in memory, attaches to events |
| `reset()` | Clears stored user properties |

**Batch optimization:** Buffer events locally, flush via `POST /api/analytics/events/batch` every 30 seconds or when buffer reaches 10 events. Flush on app background via `AppState` listener.

**Factory update:** Add `'backend'` to `create-analytics-service.ts`.

### 6. Crash Reporting — Backend Provider

**New file:** `src/features/crash-reporting/providers/backend.ts`

| Method | Endpoint |
|---|---|
| `initialize()` | Sets up global error handler (`ErrorUtils`) |
| `captureException()` | `POST /api/crash-reports` (stack trace + context) |
| `captureMessage()` | `POST /api/crash-reports` (message as description) |
| `setUser()` / `clearUser()` | Stores context in memory |
| `addBreadcrumb()` | Ring buffer (max 50), sent with next crash |

**Factory update:** Add `'backend'` to `create-crash-reporting-service.ts`.

### 7. Notifications — Backend Provider

**New file:** `src/features/notifications/providers/backend.ts`

| Method | Endpoint |
|---|---|
| `initialize()` | Registers Expo push token via `POST /api/notifications/tokens` |
| `requestPermission()` | Uses `expo-notifications` for OS permission |
| `getToken()` | Gets Expo push token locally |
| `sendLocalNotification()` | Uses `expo-notifications` locally |
| `onNotificationReceived()` | `expo-notifications` listener |
| `onNotificationOpened()` | `expo-notifications` listener |

**Additional backend-specific methods** (not on the interface — called directly from the provider or via hooks):
- `unregisterToken(token)` → `DELETE /api/notifications/tokens/{token}` — called on sign-out
- `sendTestNotification(title, body)` → `POST /api/notifications/send` — used by the Activity screen's "Send Test Notification" button

**New hooks:**
- `src/features/notifications/hooks/use-notification-history.ts` — `useQuery` for `GET /api/notifications/history` (paginated, accepts page/size params)
- `src/features/notifications/hooks/use-send-notification.ts` — `useMutation` for `POST /api/notifications/send`

**Factory update:** Add `'backend'` to `create-notification-service.ts`.

### 8. Sync Module — New Service (No Existing Interface)

**New interface** at `src/services/sync.interface.ts`:
```typescript
export interface SyncService {
  push(items: SyncPushItem[]): Promise<SyncPushResult>;
  pull(since?: number): Promise<SyncRecord[]>;
  getLastSyncVersion(): number | null;
}
```

**New types** at `src/types/sync.types.ts`:
- `SyncPushItem` — key (string), value (unknown), version (number), deleted (boolean)
- `SyncRecord` — key (string), value (unknown), version (number), deleted (boolean)
- `SyncPushResult` — accepted (array of `{ key, version }`), conflicts (array of `{ key, serverVersion, serverValue, clientVersion }`)

These types match the backend's `SyncPushRequest.SyncPushItem`, `SyncPullResponse.SyncRecordItem`, and `SyncPushResponse` DTOs.

**Provider** at `src/features/sync/providers/backend.ts`:
- `push()` → `POST /api/sync/push`
- `pull()` → `GET /api/sync/pull?since={version}` (version is epoch-based long)
- `getLastSyncVersion()` → reads from MMKV

**Hook** at `src/features/sync/hooks/use-sync.ts`:
- Exposes `syncNow()`, `lastSyncVersion`, `isSyncing`
- Auto-sync on app foreground via `AppState` listener
- Stores last sync version in MMKV

**Feature module files:**
- `create-sync-service.ts`, `sync-provider.tsx`, `sync-context.ts`, `no-op-sync.ts`

### 9. I18n — Backend Translation Loading

**New file:** `src/features/i18n/backend-plugin.ts`

Custom i18next backend plugin:
1. On init, fetches `GET /api/i18n/{locale}` for current locale
2. Merges remote translations with local bundles (remote wins on conflicts)
3. Falls back to local translations on network failure
4. Caches fetched translations in MMKV with 1-hour TTL

**Available locales:** Fetch `GET /api/i18n/locales` on app start to populate language picker. Falls back to locally defined locales.

### 10. Screens & Navigation

**Tab structure (4 tabs):**

| Tab | Route | Content |
|---|---|---|
| Home | `(tabs)/index.tsx` | Existing starter kit overview |
| Tasks | `(tabs)/tasks.tsx` | Task list with CRUD, status/priority badges, pull-to-refresh, filter by status/priority |
| Activity | `(tabs)/activity.tsx` | Collapsible sections: Analytics events, Crash reports, Notification history, Sync status |
| Settings | `(tabs)/settings.tsx` | User profile (GET/PUT /api/auth/me), language picker, sign-out |

**Modal routes:**
- `src/app/tasks/create.tsx` — create/edit task form

**Removed:**
- `(tabs)/explore.tsx` — replaced by working feature screens. This is an intentional breaking change: the feature showcase screen is superseded by the actual functional demo screens.

**Activity screen sections:**
- **Analytics** — recent tracked events list, "Fire Test Event" button
- **Crash Reports** — submitted reports list, "Trigger Test Crash" button
- **Notifications** — notification history from backend, "Send Test Notification" button
- **Sync** — last synced timestamp, manual "Sync Now" button, sync log

### 11. Provider Chain Update

**`src/lib/providers/app-providers.tsx`** — add TasksProvider and SyncProvider:

```
ThemeProvider → QueryProvider → StorageProvider → AuthProvider → AnalyticsProvider
  → CrashReportingProvider → I18nProvider → NotificationProvider
  → TasksProvider → SyncProvider → ...children
```

## File Inventory

### New Files (~30)

**Service interfaces:**
- `src/services/tasks.interface.ts`
- `src/services/sync.interface.ts`

**Types:**
- `src/types/tasks.types.ts`
- `src/types/sync.types.ts`

**Backend providers:**
- `src/features/auth/providers/backend.ts`
- `src/features/analytics/providers/backend.ts`
- `src/features/crash-reporting/providers/backend.ts`
- `src/features/notifications/providers/backend.ts`
- `src/features/tasks/providers/backend.ts`
- `src/features/sync/providers/backend.ts`

**Tasks module:**
- `src/features/tasks/create-tasks-service.ts`
- `src/features/tasks/tasks-provider.tsx`
- `src/features/tasks/tasks-context.ts`
- `src/features/tasks/no-op-tasks.ts`
- `src/features/tasks/hooks/use-tasks.ts`
- `src/features/tasks/hooks/use-task.ts`
- `src/features/tasks/hooks/use-create-task.ts`
- `src/features/tasks/hooks/use-update-task.ts`
- `src/features/tasks/hooks/use-delete-task.ts`

**Sync module:**
- `src/features/sync/create-sync-service.ts`
- `src/features/sync/sync-provider.tsx`
- `src/features/sync/sync-context.ts`
- `src/features/sync/no-op-sync.ts`
- `src/features/sync/hooks/use-sync.ts`

**Other features:**
- `src/features/notifications/hooks/use-notification-history.ts`
- `src/features/notifications/hooks/use-send-notification.ts`
- `src/features/i18n/backend-plugin.ts`

**Screens:**
- `src/app/(tabs)/tasks.tsx`
- `src/app/(tabs)/activity.tsx`
- `src/app/(tabs)/settings.tsx`
- `src/app/tasks/create.tsx`

### Modified Files (~11)
- `src/config/starter.config.ts`
- `src/services/auth.interface.ts`
- `src/features/auth/create-auth-service.ts`
- `src/features/analytics/create-analytics-service.ts`
- `src/features/crash-reporting/create-crash-reporting-service.ts`
- `src/features/notifications/create-notification-service.ts`
- `src/lib/api/client.ts`
- `src/lib/providers/app-providers.tsx`
- `src/app/(tabs)/_layout.tsx`
- `.env.example`

**Note:** `src/lib/providers/app-providers.tsx` is already listed above (provider chain update). When auth provider is `'backend'`, skip `configureAmplify()` call.

## Running the Integration

1. Start the backend: `cd react-native-expo-starter-kit-backend && docker-compose up`
2. Set `EXPO_PUBLIC_API_URL=http://localhost:8080` in `.env`
3. Set all providers to `'backend'` in `starter.config.ts`
4. Start the frontend: `pnpm start`
5. Register a user, verify email, sign in — full flow through all screens
