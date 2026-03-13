# Starter Kit Features — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement all 13 features of the React Native Expo starter kit with modular feature architecture, central config, service interfaces, and full documentation.

**Architecture:** Modular feature folders (`src/features/<name>/`) with a central config (`src/config/starter.config.ts`), service interfaces for swappable features, factory pattern with dynamic imports for provider resolution, and no-op hooks for disabled features. Each feature is self-contained and removable.

**Tech Stack:** Expo SDK 54, React Native 0.81, TypeScript (strict), NativeWind v4, expo-router, Zustand, TanStack Query, Axios, React Hook Form, Zod, MMKV, AWS Amplify, Sentry, i18next, Maestro, Jest + RNTL

**Spec:** `docs/superpowers/specs/2026-03-13-starter-kit-features-design.md`

---

## Dependency Graph & Implementation Order

```
Phase 1: Foundation (must be first — everything depends on this)
  Task 1: Central config + types + service interfaces
  Task 2: Testing infrastructure (Jest + RNTL)
  Task 3: Offline storage (MMKV) — needed by state management and auth
  Task 4: API layer (Axios + TanStack Query)
  Task 5: State management (Zustand + MMKV persistence)
  Task 6: Provider composition + root layout refactor
  Task 7: Foundation documentation + README update

Phase 2: Core Features (sequential — each builds on the previous)
  Task 8: Forms & validation (React Hook Form + Zod)
  Task 9: Authentication (AWS Amplify + auth guard)
  Task 10: Internationalization (i18next)

Phase 3: Independent Features (can be parallelized)
  Task 11: Crash reporting (Sentry)
  Task 12: Analytics (AWS Amplify Pinpoint)
  Task 13: Push notifications (AWS Amplify + expo-notifications)
  Task 14: Deep linking
  Task 15: OTA updates (expo-updates)
  Task 16: Onboarding screens
  Task 17: Splash screen & app icon pipeline

Phase 4: CI/CD & E2E (after all features)
  Task 18: CI/CD pipelines (GitHub Actions)
  Task 19: E2E testing (Maestro)
  Task 20: Final documentation (guides, docs hub, architecture doc)
```

**Agentic workflow per task:** Each task follows: Create GitHub Issue → Create branch `ft/<name>` → Implement → Write `docs/features/<name>.md` → Update README feature matrix → Lint → Commit → Push → Create PR (Closes #issue) → Code review → Merge.

**Phase 1 note:** Foundation tasks (1-7) are grouped into a single GitHub issue and branch (`ft/foundation`) since they are tightly coupled and form one coherent unit. Each task is a separate commit on that branch. Tasks 2-6 do not need individual GitHub issues — they all contribute to the same deliverable. The PR is created at Task 7.

**Provider ordering reference:** When adding providers to `app-providers.tsx`, always follow this order (spec-defined):
SafeArea → Theme → QueryClient → OfflineStorage → Auth → Analytics → CrashReporting → i18n → Notifications → ...children.

---

## Chunk 1: Foundation

### Task 1: Central Config + Types + Service Interfaces

**Files:**
- Create: `src/config/starter.config.ts`
- Create: `src/types/index.ts`
- Create: `src/types/auth.types.ts`
- Create: `src/types/analytics.types.ts`
- Create: `src/types/storage.types.ts`
- Create: `src/types/notifications.types.ts`
- Create: `src/types/crash-reporting.types.ts`
- Create: `src/services/auth.interface.ts`
- Create: `src/services/analytics.interface.ts`
- Create: `src/services/crash-reporting.interface.ts`
- Create: `src/services/notifications.interface.ts`
- Create: `src/services/storage.interface.ts`

- [ ] **Step 1: Create GitHub issue**

```bash
gh issue create --title "feat: central config, types, and service interfaces" --body "Set up starter.config.ts with feature toggles, shared TypeScript types, and service interfaces for swappable features (auth, analytics, crash reporting, notifications, storage)."
```

- [ ] **Step 2: Create feature branch**

```bash
git checkout main && git pull
git checkout -b ft/central-config-and-interfaces
```

- [ ] **Step 3: Create shared types**

Create `src/types/auth.types.ts`:

```typescript
export interface AuthResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  emailVerified: boolean;
  attributes?: Record<string, string>;
}

export interface Session {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
```

Create `src/types/analytics.types.ts`:

```typescript
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
}

export interface AnalyticsUserProperties {
  userId?: string;
  traits?: Record<string, string | number | boolean>;
}
```

Create `src/types/storage.types.ts`:

```typescript
export type StorageValue = string | number | boolean | object;
```

Create `src/types/notifications.types.ts`:

```typescript
export interface PushNotificationToken {
  token: string;
  platform: 'ios' | 'android' | 'web';
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface NotificationResponse {
  id: string;
  payload: NotificationPayload;
  actionId?: string;
}
```

Create `src/types/crash-reporting.types.ts`:

```typescript
export type SeverityLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

export interface CrashReportContext {
  userId?: string;
  email?: string;
  extras?: Record<string, string | number | boolean>;
}
```

Create `src/types/index.ts`:

```typescript
export type { AuthResult, User, Session } from './auth.types';
export type { AnalyticsEvent, AnalyticsUserProperties } from './analytics.types';
export type { StorageValue } from './storage.types';
export type { PushNotificationToken, NotificationPayload, NotificationResponse } from './notifications.types';
export type { SeverityLevel, CrashReportContext } from './crash-reporting.types';
```

- [ ] **Step 4: Create service interfaces**

Create `src/services/auth.interface.ts`:

```typescript
import type { AuthResult, User, Session } from '@/types';

export interface AuthService {
  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(email: string, password: string, attrs?: Record<string, string>): Promise<AuthResult>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  confirmResetPassword(email: string, code: string, newPassword: string): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  getSession(): Promise<Session | null>;
  onAuthStateChange(callback: (user: User | null) => void): () => void;
}
```

Create `src/services/analytics.interface.ts`:

```typescript
import type { AnalyticsEvent, AnalyticsUserProperties } from '@/types';

export interface AnalyticsService {
  initialize(): Promise<void>;
  trackEvent(event: AnalyticsEvent): void;
  trackScreen(screenName: string, properties?: Record<string, string>): void;
  setUserProperties(properties: AnalyticsUserProperties): void;
  reset(): void;
}
```

Create `src/services/crash-reporting.interface.ts`:

```typescript
import type { SeverityLevel, CrashReportContext } from '@/types';

export interface CrashReportingService {
  initialize(): void;
  captureException(error: Error, context?: CrashReportContext): void;
  captureMessage(message: string, level?: SeverityLevel): void;
  setUser(user: CrashReportContext): void;
  clearUser(): void;
  addBreadcrumb(message: string, category?: string, data?: Record<string, string>): void;
}
```

Create `src/services/notifications.interface.ts`:

```typescript
import type { PushNotificationToken, NotificationPayload, NotificationResponse } from '@/types';

export interface NotificationService {
  initialize(): Promise<void>;
  requestPermission(): Promise<boolean>;
  getToken(): Promise<PushNotificationToken | null>;
  sendLocalNotification(payload: NotificationPayload): Promise<void>;
  onNotificationReceived(callback: (response: NotificationResponse) => void): () => void;
  onNotificationOpened(callback: (response: NotificationResponse) => void): () => void;
}
```

Create `src/services/storage.interface.ts`:

```typescript
import type { StorageValue } from '@/types';

export interface StorageService {
  get<T extends StorageValue>(key: string): T | null;
  set<T extends StorageValue>(key: string, value: T): void;
  delete(key: string): void;
  contains(key: string): boolean;
  clearAll(): void;
  getAllKeys(): string[];
}
```

- [ ] **Step 5: Create central config**

Create `src/config/starter.config.ts`:

```typescript
export interface StarterConfig {
  app: {
    name: string;
    bundleId: string;
    scheme: string;
  };
  features: {
    auth: { enabled: boolean; provider: 'amplify' | 'firebase' | 'supabase' | 'clerk' };
    analytics: { enabled: boolean; provider: 'amplify' | 'mixpanel' | 'segment' | 'posthog' };
    crashReporting: { enabled: boolean; provider: 'sentry' | 'bugsnag' | 'datadog' };
    notifications: { enabled: boolean; provider: 'amplify' | 'firebase' | 'onesignal' };
    i18n: { enabled: boolean; defaultLocale: string };
    offlineStorage: { enabled: boolean; provider: 'mmkv' | 'async-storage' };
    onboarding: { enabled: boolean };
    otaUpdates: { enabled: boolean };
    deepLinking: { enabled: boolean };
    splashAppIcon: { enabled: boolean };
    forms: { enabled: boolean };
  };
  api: {
    baseUrl: string | undefined;
    timeout: number;
  };
}

export const starterConfig: StarterConfig = {
  app: {
    name: 'MyApp',
    bundleId: 'com.mycompany.myapp',
    scheme: 'myapp',
  },

  features: {
    auth: { enabled: true, provider: 'amplify' },
    analytics: { enabled: true, provider: 'amplify' },
    crashReporting: { enabled: true, provider: 'sentry' },
    notifications: { enabled: true, provider: 'amplify' },
    i18n: { enabled: true, defaultLocale: 'en' },
    offlineStorage: { enabled: true, provider: 'mmkv' },
    onboarding: { enabled: true },
    otaUpdates: { enabled: true },
    deepLinking: { enabled: true },
    splashAppIcon: { enabled: true },
    forms: { enabled: true },
  },

  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    timeout: 30000,
  },
};
```

- [ ] **Step 6: Run lint**

```bash
pnpm lint
```

Expected: PASS (no errors)

- [ ] **Step 7: Commit**

```bash
git add src/config/ src/types/ src/services/
git commit -m "feat: add central config, shared types, and service interfaces"
```

---

### Task 2: Testing Infrastructure

**Files:**
- Create: `jest.config.ts`
- Create: `test/setup.ts`
- Create: `test/test-utils.tsx`
- Create: `test/mocks/storage.mock.ts`
- Modify: `package.json` (add test scripts and devDependencies)

- [ ] **Step 1: Install testing dependencies**

```bash
pnpm add -D jest jest-expo @testing-library/react-native @testing-library/jest-native @types/jest ts-jest react-test-renderer
```

- [ ] **Step 2: Create Jest config**

Create `jest.config.ts`:

```typescript
import type { Config } from 'jest';

const config: Config = {
  preset: 'jest-expo',
  setupFilesAfterSetup: ['./test/setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@assets/(.*)$': '<rootDir>/assets/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg)',
  ],
  testPathIgnorePatterns: ['<rootDir>/e2e/'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/types/**',
    '!src/services/**',
  ],
};

export default config;
```

- [ ] **Step 3: Create test setup**

Create `test/setup.ts`:

```typescript
import '@testing-library/jest-native/extend-expect';
```

- [ ] **Step 4: Create test utilities**

Create `test/test-utils.tsx`:

```typescript
import React, { type ReactElement } from 'react';
import { render, type RenderOptions } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

function AllProviders({ children }: { children: React.ReactNode }) {
  return (
    <SafeAreaProvider>{children}</SafeAreaProvider>
  );
}

function customRender(ui: ReactElement, options?: Omit<RenderOptions, 'wrapper'>) {
  return render(ui, { wrapper: AllProviders, ...options });
}

export * from '@testing-library/react-native';
export { customRender as render };
```

- [ ] **Step 5: Create storage mock**

Create `test/mocks/storage.mock.ts`:

```typescript
import type { StorageService } from '@/services/storage.interface';

export function createMockStorage(): StorageService {
  const store = new Map<string, string>();

  return {
    get: <T>(key: string) => {
      const value = store.get(key);
      if (value === undefined) return null;
      return JSON.parse(value) as T;
    },
    set: <T>(key: string, value: T) => {
      store.set(key, JSON.stringify(value));
    },
    delete: (key: string) => {
      store.delete(key);
    },
    contains: (key: string) => store.has(key),
    clearAll: () => store.clear(),
    getAllKeys: () => Array.from(store.keys()),
  };
}
```

- [ ] **Step 6: Add test script to package.json**

Add to `package.json` scripts:

```json
"test": "jest",
"test:watch": "jest --watch",
"test:coverage": "jest --coverage"
```

- [ ] **Step 7: Run tests to verify setup**

```bash
pnpm test -- --passWithNoTests
```

Expected: PASS

- [ ] **Step 8: Commit**

```bash
git add jest.config.ts test/ package.json pnpm-lock.yaml
git commit -m "feat: add testing infrastructure with Jest and RNTL"
```

---

### Task 3: Offline Storage (MMKV)

**Files:**
- Create: `src/features/offline-storage/index.ts`
- Create: `src/features/offline-storage/providers/mmkv.ts`
- Create: `src/features/offline-storage/providers/async-storage.ts`
- Create: `src/features/offline-storage/create-storage-service.ts`
- Create: `src/features/offline-storage/hooks/use-storage.ts`
- Create: `src/features/offline-storage/storage-provider.tsx`
- Create: `src/features/offline-storage/no-op-storage.ts`
- Test: `src/features/offline-storage/__tests__/use-storage.test.ts`
- Create: `docs/features/offline-storage.md`

- [ ] **Step 1: Install dependencies**

```bash
pnpm add react-native-mmkv @react-native-async-storage/async-storage
```

- [ ] **Step 2: Write failing test for storage hook**

Create `src/features/offline-storage/__tests__/use-storage.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useStorage } from '../hooks/use-storage';

// Mock the config to enable offline storage
jest.mock('@/config/starter.config', () => ({
  starterConfig: {
    features: {
      offlineStorage: { enabled: true, provider: 'mmkv' },
    },
  },
}));

// Mock MMKV
jest.mock('react-native-mmkv', () => ({
  MMKV: jest.fn().mockImplementation(() => ({
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    contains: jest.fn().mockReturnValue(false),
    clearAll: jest.fn(),
    getAllKeys: jest.fn().mockReturnValue([]),
  })),
}));

describe('useStorage', () => {
  it('returns storage service methods', () => {
    const { result } = renderHook(() => useStorage());
    expect(result.current.get).toBeDefined();
    expect(result.current.set).toBeDefined();
    expect(result.current.delete).toBeDefined();
    expect(result.current.contains).toBeDefined();
    expect(result.current.clearAll).toBeDefined();
    expect(result.current.getAllKeys).toBeDefined();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
pnpm test -- src/features/offline-storage/__tests__/use-storage.test.ts
```

Expected: FAIL

- [ ] **Step 4: Implement MMKV provider**

Create `src/features/offline-storage/providers/mmkv.ts`:

```typescript
import { MMKV } from 'react-native-mmkv';
import type { StorageService } from '@/services/storage.interface';
import type { StorageValue } from '@/types';

const storage = new MMKV({ id: 'app-storage' });

export const mmkvStorageService: StorageService = {
  get<T extends StorageValue>(key: string): T | null {
    const value = storage.getString(key);
    if (value === undefined) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  },

  set<T extends StorageValue>(key: string, value: T): void {
    storage.set(key, JSON.stringify(value));
  },

  delete(key: string): void {
    storage.delete(key);
  },

  contains(key: string): boolean {
    return storage.contains(key);
  },

  clearAll(): void {
    storage.clearAll();
  },

  getAllKeys(): string[] {
    return storage.getAllKeys();
  },
};
```

Create `src/features/offline-storage/providers/async-storage.ts`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StorageService } from '@/services/storage.interface';
import type { StorageValue } from '@/types';

// Note: AsyncStorage is async but our interface is sync.
// This adapter uses a sync cache backed by async persistence.
const cache = new Map<string, string>();
let initialized = false;

async function hydrate() {
  if (initialized) return;
  const keys = await AsyncStorage.getAllKeys();
  const pairs = await AsyncStorage.multiGet(keys);
  pairs.forEach(([key, value]) => {
    if (value !== null) cache.set(key, value);
  });
  initialized = true;
}

export const asyncStorageService: StorageService = {
  get<T extends StorageValue>(key: string): T | null {
    const value = cache.get(key);
    if (value === undefined) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as T;
    }
  },

  set<T extends StorageValue>(key: string, value: T): void {
    const serialized = JSON.stringify(value);
    cache.set(key, serialized);
    AsyncStorage.setItem(key, serialized);
  },

  delete(key: string): void {
    cache.delete(key);
    AsyncStorage.removeItem(key);
  },

  contains(key: string): boolean {
    return cache.has(key);
  },

  clearAll(): void {
    cache.clear();
    AsyncStorage.clear();
  },

  getAllKeys(): string[] {
    return Array.from(cache.keys());
  },
};

export { hydrate as hydrateAsyncStorage };
```

- [ ] **Step 5: Create no-op storage and factory**

Create `src/features/offline-storage/no-op-storage.ts`:

```typescript
import type { StorageService } from '@/services/storage.interface';

export const noOpStorage: StorageService = {
  get: () => null,
  set: () => {},
  delete: () => {},
  contains: () => false,
  clearAll: () => {},
  getAllKeys: () => [],
};
```

Create `src/features/offline-storage/create-storage-service.ts`:

```typescript
import type { StorageService } from '@/services/storage.interface';
import { starterConfig } from '@/config/starter.config';
import { noOpStorage } from './no-op-storage';

const providers: Record<string, () => Promise<StorageService>> = {
  mmkv: () => import('./providers/mmkv').then(m => m.mmkvStorageService),
  'async-storage': () => import('./providers/async-storage').then(m => m.asyncStorageService),
};

export async function createStorageService(): Promise<StorageService> {
  if (!starterConfig.features.offlineStorage.enabled) {
    return noOpStorage;
  }

  const { provider } = starterConfig.features.offlineStorage;
  const factory = providers[provider];
  if (!factory) throw new Error(`Unknown storage provider: ${provider}`);
  return factory();
}
```

- [ ] **Step 6: Create storage hook and provider**

Create `src/features/offline-storage/hooks/use-storage.ts`:

```typescript
import { useContext } from 'react';
import { StorageContext } from '../storage-provider';
import { noOpStorage } from '../no-op-storage';
import { starterConfig } from '@/config/starter.config';

export function useStorage() {
  if (!starterConfig.features.offlineStorage.enabled) {
    return noOpStorage;
  }
  const storage = useContext(StorageContext);
  if (!storage) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return storage;
}
```

Create `src/features/offline-storage/storage-provider.tsx`:

```typescript
import React, { createContext, useEffect, useState } from 'react';
import type { StorageService } from '@/services/storage.interface';
import { starterConfig } from '@/config/starter.config';
import { createStorageService } from './create-storage-service';
import { noOpStorage } from './no-op-storage';

export const StorageContext = createContext<StorageService | null>(null);

export function StorageProvider({ children }: { children: React.ReactNode }) {
  if (!starterConfig.features.offlineStorage.enabled) {
    return <>{children}</>;
  }

  const [storage, setStorage] = useState<StorageService | null>(null);

  useEffect(() => {
    createStorageService().then(setStorage);
  }, []);

  if (!storage) return null; // Loading state while async factory resolves

  return (
    <StorageContext.Provider value={storage}>
      {children}
    </StorageContext.Provider>
  );
}
```

Create `src/features/offline-storage/index.ts`:

```typescript
export { StorageProvider } from './storage-provider';
export { useStorage } from './hooks/use-storage';
export { createStorageService } from './create-storage-service';
```

- [ ] **Step 7: Run test to verify it passes**

```bash
pnpm test -- src/features/offline-storage/__tests__/use-storage.test.ts
```

Expected: PASS

- [ ] **Step 8: Write feature doc**

Create `docs/features/offline-storage.md` following the standard template (overview, default implementation, configuration, usage, swapping provider, removing feature).

- [ ] **Step 9: Update README.md feature matrix**

Add offline storage row to the feature matrix table in README.md.

- [ ] **Step 10: Lint and commit**

```bash
pnpm lint
git add src/features/offline-storage/ src/services/storage.interface.ts docs/features/offline-storage.md README.md package.json pnpm-lock.yaml
git commit -m "feat: add offline storage feature with MMKV and AsyncStorage providers"
```

---

### Task 4: API Layer (Axios + TanStack Query)

**Files:**
- Create: `src/lib/api/client.ts`
- Create: `src/lib/api/query-client.ts`
- Create: `src/lib/api/query-provider.tsx`
- Create: `src/lib/api/index.ts`
- Test: `src/lib/api/__tests__/client.test.ts`

- [ ] **Step 1: Install dependencies**

```bash
pnpm add axios @tanstack/react-query
```

- [ ] **Step 2: Write failing test for API client**

Create `src/lib/api/__tests__/client.test.ts`:

```typescript
import { apiClient } from '../client';

jest.mock('@/config/starter.config', () => ({
  starterConfig: {
    api: { baseUrl: 'https://api.test.com', timeout: 5000 },
  },
}));

describe('apiClient', () => {
  it('has correct base URL from config', () => {
    expect(apiClient.defaults.baseURL).toBe('https://api.test.com');
  });

  it('has correct timeout from config', () => {
    expect(apiClient.defaults.timeout).toBe(5000);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
pnpm test -- src/lib/api/__tests__/client.test.ts
```

Expected: FAIL

- [ ] **Step 4: Implement API client**

Create `src/lib/api/client.ts`:

```typescript
import axios from 'axios';
import { starterConfig } from '@/config/starter.config';

export const apiClient = axios.create({
  baseURL: starterConfig.api.baseUrl,
  timeout: starterConfig.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Auth token interceptor — will be wired up by auth feature
let getAccessToken: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  getAccessToken = getter;
}

apiClient.interceptors.request.use(async (config) => {
  if (getAccessToken) {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired — auth feature handles refresh
    }
    return Promise.reject(error);
  },
);
```

- [ ] **Step 5: Create TanStack Query client and provider**

Create `src/lib/api/query-client.ts`:

```typescript
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});
```

Create `src/lib/api/query-provider.tsx`:

```typescript
import React from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './query-client';

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

Create `src/lib/api/index.ts`:

```typescript
export { apiClient, setAuthTokenGetter } from './client';
export { queryClient } from './query-client';
export { QueryProvider } from './query-provider';
```

- [ ] **Step 6: Run test to verify it passes**

```bash
pnpm test -- src/lib/api/__tests__/client.test.ts
```

Expected: PASS

- [ ] **Step 7: Lint and commit**

```bash
pnpm lint
git add src/lib/api/ package.json pnpm-lock.yaml
git commit -m "feat: add API layer with Axios client and TanStack Query"
```

---

### Task 5: State Management (Zustand + MMKV Persistence)

**Files:**
- Create: `src/store/app-store.ts`
- Create: `src/store/mmkv-storage-middleware.ts`
- Create: `src/store/index.ts`
- Test: `src/store/__tests__/app-store.test.ts`

- [ ] **Step 1: Install dependencies**

```bash
pnpm add zustand
```

- [ ] **Step 2: Write failing test for app store**

Create `src/store/__tests__/app-store.test.ts`:

```typescript
import { useAppStore } from '../app-store';

describe('useAppStore', () => {
  it('has default state', () => {
    const state = useAppStore.getState();
    expect(state.hasCompletedOnboarding).toBe(false);
    expect(state.theme).toBe('system');
  });

  it('can set onboarding completed', () => {
    useAppStore.getState().setHasCompletedOnboarding(true);
    expect(useAppStore.getState().hasCompletedOnboarding).toBe(true);
  });

  it('can set theme', () => {
    useAppStore.getState().setTheme('dark');
    expect(useAppStore.getState().theme).toBe('dark');
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

```bash
pnpm test -- src/store/__tests__/app-store.test.ts
```

Expected: FAIL

- [ ] **Step 4: Create MMKV persistence middleware**

Create `src/store/mmkv-storage-middleware.ts`:

```typescript
import type { StateStorage } from 'zustand/middleware';
import { starterConfig } from '@/config/starter.config';

export function createZustandMMKVStorage(): StateStorage {
  if (!starterConfig.features.offlineStorage.enabled) {
    // Fallback to in-memory if offline storage disabled
    const memoryStore = new Map<string, string>();
    return {
      getItem: (name) => memoryStore.get(name) ?? null,
      setItem: (name, value) => memoryStore.set(name, value),
      removeItem: (name) => { memoryStore.delete(name); },
    };
  }

  // Lazy require to avoid importing MMKV when not needed
  const { MMKV } = require('react-native-mmkv');
  const storage = new MMKV({ id: 'zustand-storage' });

  return {
    getItem: (name) => storage.getString(name) ?? null,
    setItem: (name, value) => storage.set(name, value),
    removeItem: (name) => storage.delete(name),
  };
}
```

- [ ] **Step 5: Create app store**

Create `src/store/app-store.ts`:

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createZustandMMKVStorage } from './mmkv-storage-middleware';

interface AppState {
  hasCompletedOnboarding: boolean;
  theme: 'light' | 'dark' | 'system';
  setHasCompletedOnboarding: (value: boolean) => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hasCompletedOnboarding: false,
      theme: 'system',
      setHasCompletedOnboarding: (value) => set({ hasCompletedOnboarding: value }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'app-store',
      storage: createJSONStorage(() => createZustandMMKVStorage()),
    },
  ),
);
```

Create `src/store/index.ts`:

```typescript
export { useAppStore } from './app-store';
```

- [ ] **Step 6: Run test to verify it passes**

```bash
pnpm test -- src/store/__tests__/app-store.test.ts
```

Expected: PASS

- [ ] **Step 7: Lint and commit**

```bash
pnpm lint
git add src/store/ package.json pnpm-lock.yaml
git commit -m "feat: add Zustand state management with MMKV persistence"
```

---

### Task 6: Provider Composition + Root Layout Refactor

**Files:**
- Create: `src/lib/providers/app-providers.tsx`
- Create: `src/lib/providers/index.ts`
- Modify: `src/app/_layout.tsx`

- [ ] **Step 1: Create app providers composition**

Create `src/lib/providers/app-providers.tsx`:

```typescript
import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from '@/lib/api';
import { StorageProvider } from '@/features/offline-storage';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();

  // Provider ordering (spec-defined, dependency-aware):
  // SafeArea → Theme → QueryClient → OfflineStorage → Auth → Analytics → CrashReporting → i18n → Notifications → ...children
  // Future tasks will add providers in this exact order.
  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <QueryProvider>
          <StorageProvider>
            {/* Auth, Analytics, CrashReporting, i18n, Notifications providers added here by Tasks 9-13 */}
            {children}
          </StorageProvider>
        </QueryProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
```

Create `src/lib/providers/index.ts`:

```typescript
export { AppProviders } from './app-providers';
```

- [ ] **Step 2: Refactor root layout to use AppProviders**

Modify `src/app/_layout.tsx`:

```typescript
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import '../../global.css';

import { AppProviders } from '@/lib/providers';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AppProviders>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      <StatusBar style="auto" />
    </AppProviders>
  );
}
```

- [ ] **Step 3: Verify the app starts**

```bash
pnpm start --web
```

Expected: App loads without errors

- [ ] **Step 4: Lint and commit**

```bash
pnpm lint
git add src/lib/providers/ src/app/_layout.tsx
git commit -m "feat: add provider composition and refactor root layout"
```

---

### Task 7: Foundation Documentation + README Update

**Files:**
- Create: `docs/README.md`
- Create: `docs/getting-started.md`
- Create: `docs/architecture.md`
- Create: `docs/configuration.md`
- Create: `docs/features/state-management.md`
- Modify: `README.md`

- [ ] **Step 1: Create docs hub**

Create `docs/README.md` linking to all sub-docs.

- [ ] **Step 2: Create getting-started.md**

Prerequisites, installation steps, running the app, project structure overview.

- [ ] **Step 3: Create architecture.md**

Feature architecture, service interface pattern, factory pattern, provider composition, disabled feature behavior.

- [ ] **Step 4: Create configuration.md**

`starter.config.ts` guide, all feature options, environment variables.

- [ ] **Step 5: Create state-management.md**

Zustand + TanStack Query patterns, store creation guide, persistence middleware.

- [ ] **Step 6: Update root README.md**

Add feature matrix table with columns: Feature | Default Provider | Swappable | Doc Link. Add rows for all planned features (mark unimplemented as "Coming Soon"). Add links to docs hub.

- [ ] **Step 7: Lint and commit**

```bash
pnpm lint
git add docs/ README.md
git commit -m "docs: add foundation documentation, architecture guide, and feature matrix"
```

- [ ] **Step 8: Push and create PR**

```bash
git push -u origin ft/central-config-and-interfaces
gh pr create --title "feat: foundation - config, interfaces, storage, API, state, providers" --body "Closes #<issue_number>

## Summary
- Central config with feature toggles
- Service interfaces for swappable features
- Offline storage (MMKV + AsyncStorage)
- API layer (Axios + TanStack Query)
- Zustand state management with MMKV persistence
- Provider composition pattern
- Testing infrastructure (Jest + RNTL)
- Foundation documentation

## Test plan
- [ ] pnpm test passes
- [ ] pnpm lint passes
- [ ] App starts on web/device
- [ ] Feature toggle disabling works (set enabled: false, no crash)"
```

---

## Chunk 2: Core Features

### Task 8: Forms & Validation

**Files:**
- Create: `src/features/forms/index.ts`
- Create: `src/features/forms/hooks/use-app-form.ts`
- Create: `src/features/forms/components/form-input.tsx`
- Create: `src/features/forms/components/form-select.tsx`
- Create: `src/features/forms/components/form-checkbox.tsx`
- Create: `src/features/forms/components/index.ts`
- Create: `src/features/forms/schemas/common.ts`
- Test: `src/features/forms/__tests__/form-input.test.tsx`
- Create: `docs/features/forms.md`

- [ ] **Step 1: Create GitHub issue and branch**

```bash
gh issue create --title "feat: forms and validation with React Hook Form + Zod" --body "Add form components (FormInput, FormSelect, FormCheckbox) with NativeWind styling, useAppForm hook with Zod resolver, and reusable validation schemas."
git checkout main && git pull && git checkout -b ft/forms-validation
```

- [ ] **Step 2: Install dependencies**

```bash
pnpm add react-hook-form zod @hookform/resolvers
```

- [ ] **Step 3: Write failing test for FormInput**

Create `src/features/forms/__tests__/form-input.test.tsx`:

```typescript
import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { FormInput } from '../components/form-input';
import { useForm, FormProvider } from 'react-hook-form';

function Wrapper({ children }: { children: React.ReactNode }) {
  const methods = useForm({ defaultValues: { email: '' } });
  return <FormProvider {...methods}>{children}</FormProvider>;
}

describe('FormInput', () => {
  it('renders with label', () => {
    render(
      <Wrapper>
        <FormInput name="email" label="Email" />
      </Wrapper>,
    );
    expect(screen.getByText('Email')).toBeTruthy();
  });
});
```

- [ ] **Step 4: Implement form components**

Create `src/features/forms/components/form-input.tsx`:

```typescript
import React from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';

interface FormInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  name: string;
  label: string;
}

export function FormInput({ name, label, ...props }: FormInputProps) {
  const { control, formState: { errors } } = useFormContext();
  const error = errors[name];

  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </Text>
      <Controller
        control={control}
        name={name}
        render={({ field: { onChange, onBlur, value } }) => (
          <TextInput
            className="border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-3 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            {...props}
          />
        )}
      />
      {error && (
        <Text className="text-sm text-red-500 mt-1">
          {error.message as string}
        </Text>
      )}
    </View>
  );
}
```

Create `src/features/forms/components/form-select.tsx`, `form-checkbox.tsx`, and `index.ts` similarly.

Create `src/features/forms/hooks/use-app-form.ts`:

```typescript
import { useForm, type UseFormProps } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodSchema } from 'zod';
import { starterConfig } from '@/config/starter.config';

export function useAppForm<T extends Record<string, unknown>>(
  schema: ZodSchema<T>,
  options?: Omit<UseFormProps<T>, 'resolver'>,
) {
  if (!starterConfig.features.forms.enabled) {
    // Return a minimal useForm without Zod resolver when forms feature is disabled
    return useForm<T>(options);
  }

  return useForm<T>({
    resolver: zodResolver(schema),
    ...options,
  });
}
```

Create `src/features/forms/schemas/common.ts`:

```typescript
import { z } from 'zod';

export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');
export const requiredString = z.string().min(1, 'This field is required');
```

- [ ] **Step 5: Run tests, lint, write docs, update README, commit, push, create PR**

Follow the standard agentic workflow: test → lint → `docs/features/forms.md` → README update → commit → push → PR (Closes #issue).

---

### Task 9: Authentication (AWS Amplify)

**Files:**
- Create: `src/features/auth/index.ts`
- Create: `src/features/auth/create-auth-service.ts`
- Create: `src/features/auth/providers/amplify.ts`
- Create: `src/features/auth/hooks/use-auth.ts`
- Create: `src/features/auth/hooks/use-current-user.ts`
- Create: `src/features/auth/hooks/use-session.ts`
- Create: `src/features/auth/auth-provider.tsx`
- Create: `src/features/auth/no-op-auth.ts`
- Create: `src/lib/amplify/configure.ts`
- Create: `src/app/(auth)/_layout.tsx`
- Create: `src/app/(auth)/login.tsx`
- Create: `src/app/(auth)/register.tsx`
- Create: `src/app/(auth)/forgot-password.tsx`
- Create: `src/app/(auth)/verify-code.tsx`
- Modify: `src/app/_layout.tsx` (add auth route group)
- Modify: `src/lib/providers/app-providers.tsx` (add AuthProvider)
- Modify: `src/lib/api/client.ts` (wire auth token getter)
- Test: `src/features/auth/__tests__/use-auth.test.ts`
- Create: `docs/features/auth.md`

- [ ] **Step 1: Create GitHub issue and branch**

```bash
gh issue create --title "feat: authentication with AWS Amplify Cognito" --body "Add auth feature with login, register, forgot password screens, auth guard, token management, and swappable AuthService interface. Default provider: AWS Amplify Cognito."
git checkout main && git pull && git checkout -b ft/auth
```

- [ ] **Step 2: Install dependencies**

```bash
pnpm add aws-amplify @aws-amplify/react-native amazon-cognito-identity-js @react-native-community/netinfo
```

- [ ] **Step 3: Create Amplify configuration**

Create `src/lib/amplify/configure.ts`:

```typescript
import { Amplify } from 'aws-amplify';
import { starterConfig } from '@/config/starter.config';

const amplifyFeatures = ['auth', 'analytics', 'notifications'] as const;

export function configureAmplify() {
  const hasAmplifyFeature = amplifyFeatures.some(
    (f) => starterConfig.features[f].enabled && starterConfig.features[f].provider === 'amplify',
  );

  if (!hasAmplifyFeature) return;

  Amplify.configure({
    Auth: starterConfig.features.auth.enabled && starterConfig.features.auth.provider === 'amplify'
      ? {
          Cognito: {
            userPoolId: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID ?? '',
            userPoolClientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID ?? '',
            identityPoolId: process.env.EXPO_PUBLIC_COGNITO_IDENTITY_POOL_ID,
          },
        }
      : undefined,
  });
}
```

- [ ] **Step 4: Implement auth service, no-op, factory, provider, hooks**

Follow the same pattern as offline storage:
- `no-op-auth.ts` — returns `{ user: null, signIn: async () => ({ success: false }), ... }`
- `create-auth-service.ts` — factory with dynamic imports
- `auth-provider.tsx` — React context wrapping the resolved service + auth state
- `use-auth.ts` — returns no-op if disabled, otherwise uses context
- `use-current-user.ts`, `use-session.ts` — derived hooks

- [ ] **Step 5: Create auth screens**

Create `src/app/(auth)/_layout.tsx` with config-based redirect when disabled.
Create `src/app/(auth)/login.tsx`, `register.tsx`, `forgot-password.tsx` using FormInput components.

- [ ] **Step 6: Wire auth into providers and API client**

Add `AuthProvider` to `app-providers.tsx` after `StorageProvider`.
Wire `setAuthTokenGetter` in auth provider initialization.

- [ ] **Step 7: Add auth guard to root layout**

In `src/app/_layout.tsx`, check auth state and redirect unauthenticated users.

- [ ] **Step 8: Write tests, lint, docs, README, commit, push, create PR**

Follow the standard agentic workflow.

---

### Task 10: Internationalization (i18next)

**Files:**
- Create: `src/features/i18n/index.ts`
- Create: `src/features/i18n/i18n.ts`
- Create: `src/features/i18n/i18n-provider.tsx`
- Create: `src/features/i18n/hooks/use-app-translation.ts`
- Create: `src/features/i18n/locales/en.json`
- Create: `src/features/i18n/locales/es.json`
- Modify: `src/lib/providers/app-providers.tsx`
- Test: `src/features/i18n/__tests__/i18n.test.ts`
- Create: `docs/features/i18n.md`

- [ ] **Step 1: Create GitHub issue and branch**

```bash
gh issue create --title "feat: internationalization with i18next" --body "Add i18n support with i18next, react-i18next, expo-localization. Auto-detect device locale, language switcher, RTL support."
git checkout main && git pull && git checkout -b ft/i18n
```

- [ ] **Step 2: Install dependencies**

```bash
pnpm add i18next react-i18next expo-localization
```

- [ ] **Step 3: Implement i18n setup, provider, hooks, locale files**

Follow disabled-feature pattern (passthrough provider when disabled).

- [ ] **Step 4: Write tests, lint, docs, README, commit, push, create PR**

Follow the standard agentic workflow.

---

## Chunk 3: Independent Features

> Tasks 11-17 can be executed in parallel via subagents. Each follows the full agentic workflow (issue → branch → implement → test → docs → README → PR).

### Task 11: Crash Reporting (Sentry)

**Files:**
- Create: `src/features/crash-reporting/index.ts`
- Create: `src/features/crash-reporting/create-crash-reporting-service.ts`
- Create: `src/features/crash-reporting/providers/sentry.ts`
- Create: `src/features/crash-reporting/hooks/use-crash-reporting.ts`
- Create: `src/features/crash-reporting/crash-reporting-provider.tsx`
- Create: `src/features/crash-reporting/no-op-crash-reporting.ts`
- Test: `src/features/crash-reporting/__tests__/use-crash-reporting.test.ts`
- Modify: `src/lib/providers/app-providers.tsx` (add CrashReportingProvider AFTER Auth per ordering)
- Create: `docs/features/crash-reporting.md`

Install: `pnpm add @sentry/react-native`

- [ ] **Step 1: Create GitHub issue and branch**
- [ ] **Step 2: Write failing test for use-crash-reporting hook**
- [ ] **Step 3: Implement no-op, factory (dynamic imports), provider, hook**
- [ ] **Step 4: Implement Sentry provider**
- [ ] **Step 5: Add CrashReportingProvider to app-providers.tsx after Auth**
- [ ] **Step 6: Run tests, lint, write docs/features/crash-reporting.md, update README**
- [ ] **Step 7: Commit, push, create PR**

---

### Task 12: Analytics (AWS Amplify Pinpoint)

**Files:**
- Create: `src/features/analytics/index.ts`
- Create: `src/features/analytics/create-analytics-service.ts`
- Create: `src/features/analytics/providers/amplify.ts`
- Create: `src/features/analytics/hooks/use-analytics.ts`
- Create: `src/features/analytics/analytics-provider.tsx`
- Create: `src/features/analytics/no-op-analytics.ts`
- Create: `src/features/analytics/use-screen-tracking.ts` (expo-router listener)
- Test: `src/features/analytics/__tests__/use-analytics.test.ts`
- Modify: `src/lib/providers/app-providers.tsx` (add AnalyticsProvider AFTER Auth per ordering)
- Modify: `src/lib/amplify/configure.ts` (add Analytics config when analytics uses amplify)
- Create: `docs/features/analytics.md`

- [ ] **Step 1: Create GitHub issue and branch**
- [ ] **Step 2: Write failing test for use-analytics hook**
- [ ] **Step 3: Implement no-op, factory (dynamic imports), provider, hook**
- [ ] **Step 4: Implement Amplify analytics provider**
- [ ] **Step 5: Add screen tracking hook using expo-router listener**
- [ ] **Step 6: Extend src/lib/amplify/configure.ts with Analytics module config**
- [ ] **Step 7: Add AnalyticsProvider to app-providers.tsx after Auth**
- [ ] **Step 8: Run tests, lint, write docs/features/analytics.md, update README**
- [ ] **Step 9: Commit, push, create PR**

---

### Task 13: Push Notifications (AWS Amplify + expo-notifications)

**Files:**
- Create: `src/features/notifications/index.ts`
- Create: `src/features/notifications/create-notification-service.ts`
- Create: `src/features/notifications/providers/amplify.ts`
- Create: `src/features/notifications/hooks/use-notifications.ts`
- Create: `src/features/notifications/hooks/use-notification-permission.ts`
- Create: `src/features/notifications/notification-provider.tsx`
- Create: `src/features/notifications/no-op-notifications.ts`
- Test: `src/features/notifications/__tests__/use-notifications.test.ts`
- Modify: `src/lib/providers/app-providers.tsx` (add NotificationProvider LAST per ordering)
- Modify: `src/lib/amplify/configure.ts` (add Notifications config when using amplify)
- Create: `docs/features/notifications.md`

Install: `pnpm add expo-notifications expo-device`

- [ ] **Step 1: Create GitHub issue and branch**
- [ ] **Step 2: Write failing test for use-notifications hook**
- [ ] **Step 3: Implement no-op, factory (dynamic imports), provider, hooks**
- [ ] **Step 4: Implement Amplify notifications provider**
- [ ] **Step 5: Extend src/lib/amplify/configure.ts with Notifications module config**
- [ ] **Step 6: Add NotificationProvider to app-providers.tsx (last in chain)**
- [ ] **Step 7: Run tests, lint, write docs/features/notifications.md, update README**
- [ ] **Step 8: Commit, push, create PR**

---

### Task 14: Deep Linking

**Files:**
- Create: `src/features/deep-linking/index.ts`
- Create: `src/features/deep-linking/hooks/use-deep-link.ts`
- Create: `src/features/deep-linking/utils/link-generator.ts`
- Create: `src/features/deep-linking/deep-linking-config.ts`
- Test: `src/features/deep-linking/__tests__/link-generator.test.ts`
- Create: `docs/features/deep-linking.md`

Built-in feature (not swappable). Uses expo-router linking + expo-linking (already installed).

- [ ] **Step 1: Create GitHub issue and branch**
- [ ] **Step 2: Write failing test for link-generator utility**
- [ ] **Step 3: Implement config, hook, link generator**
- [ ] **Step 4: Run tests, lint, write docs/features/deep-linking.md, update README**
- [ ] **Step 5: Commit, push, create PR**

---

### Task 15: OTA Updates (expo-updates)

**Files:**
- Create: `src/features/ota-updates/index.ts`
- Create: `src/features/ota-updates/hooks/use-ota-update.ts`
- Create: `src/features/ota-updates/components/update-banner.tsx`
- Test: `src/features/ota-updates/__tests__/use-ota-update.test.ts`
- Create: `docs/features/ota-updates.md`

Install: `pnpm add expo-updates`

Built-in feature (not swappable).

- [ ] **Step 1: Create GitHub issue and branch**
- [ ] **Step 2: Write failing test for use-ota-update hook**
- [ ] **Step 3: Implement hook and update banner component**
- [ ] **Step 4: Run tests, lint, write docs/features/ota-updates.md, update README**
- [ ] **Step 5: Commit, push, create PR**

---

### Task 16: Onboarding Screens

**Files:**
- Create: `src/features/onboarding/index.ts`
- Create: `src/features/onboarding/components/onboarding-screen.tsx`
- Create: `src/features/onboarding/components/onboarding-page.tsx`
- Create: `src/features/onboarding/components/dot-pagination.tsx`
- Create: `src/features/onboarding/hooks/use-onboarding.ts`
- Create: `src/app/(onboarding)/_layout.tsx`
- Create: `src/app/(onboarding)/index.tsx`
- Test: `src/features/onboarding/__tests__/use-onboarding.test.ts`
- Test: `src/features/onboarding/__tests__/onboarding-screen.test.tsx`
- Create: `docs/features/onboarding.md`

Built-in feature. Uses MMKV (via useStorage) to track completion. Layout redirects to `/(tabs)` when disabled or completed.

- [ ] **Step 1: Create GitHub issue and branch**
- [ ] **Step 2: Write failing test for use-onboarding hook**
- [ ] **Step 3: Implement onboarding components, hook, route group with _layout.tsx redirect**
- [ ] **Step 4: Write failing test for OnboardingScreen component**
- [ ] **Step 5: Run tests, lint, write docs/features/onboarding.md, update README**
- [ ] **Step 6: Commit, push, create PR**

---

### Task 17: Splash Screen & App Icon Pipeline

**Files:**
- Create: `src/features/splash-app-icon/index.ts`
- Create: `src/features/splash-app-icon/animated-splash.tsx`
- Create: `scripts/generate-icons.js`
- Test: `scripts/__tests__/generate-icons.test.js`
- Modify: `app.json` (splash screen config)
- Create: `docs/features/splash-app-icon.md`

Built-in feature. Uses expo-splash-screen (already installed).

- [ ] **Step 1: Create GitHub issue and branch**
- [ ] **Step 2: Write test for icon generation script**
- [ ] **Step 3: Implement animated splash component and icon generation script**
- [ ] **Step 4: Update app.json with splash config**
- [ ] **Step 5: Run tests, lint, write docs/features/splash-app-icon.md, update README**
- [ ] **Step 6: Commit, push, create PR**

---

## Chunk 4: CI/CD & Final Documentation

### Task 18: CI/CD Pipelines (GitHub Actions)

**Files:**
- Create: `.github/workflows/lint-typecheck.yml`
- Create: `.github/workflows/test.yml`
- Create: `.github/workflows/e2e.yml`
- Create: `.github/workflows/eas-build.yml`
- Create: `.github/workflows/eas-update.yml`
- Create: `docs/guides/ci-cd.md`

- [ ] **Step 1: Create GitHub issue and branch**
- [ ] **Step 2: Create lint + typecheck workflow**
- [ ] **Step 3: Create unit test workflow**
- [ ] **Step 4: Create E2E test workflow**
- [ ] **Step 5: Create EAS Build workflow**
- [ ] **Step 6: Create EAS Update workflow**
- [ ] **Step 7: Write CI/CD guide doc**
- [ ] **Step 8: Update README, commit, push, create PR**

---

### Task 19: E2E Testing (Maestro)

**Files:**
- Create: `e2e/login.yaml`
- Create: `e2e/onboarding.yaml`
- Create: `e2e/tab-navigation.yaml`
- Create: `e2e/deep-link.yaml`
- Create: `docs/testing/e2e-testing.md`

- [ ] **Step 1: Create GitHub issue and branch**
- [ ] **Step 2: Write Maestro test flows**
- [ ] **Step 3: Write E2E testing guide**
- [ ] **Step 4: Update README, commit, push, create PR**

---

### Task 20: Final Documentation

**Files:**
- Create: `docs/guides/swapping-providers.md`
- Create: `docs/guides/adding-a-feature.md`
- Create: `docs/guides/removing-a-feature.md`
- Create: `docs/testing/unit-testing.md`
- Update: `docs/README.md` (ensure all links work)
- Update: `README.md` (final feature matrix, badges, screenshots)

- [ ] **Step 1: Create GitHub issue and branch**
- [ ] **Step 2: Write swapping-providers guide**
- [ ] **Step 3: Write adding-a-feature guide**
- [ ] **Step 4: Write removing-a-feature guide**
- [ ] **Step 5: Write unit-testing guide**
- [ ] **Step 6: Final README polish**
- [ ] **Step 7: Commit, push, create PR**
