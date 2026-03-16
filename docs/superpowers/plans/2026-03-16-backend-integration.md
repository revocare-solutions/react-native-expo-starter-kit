# Backend Integration Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the React Native Expo starter kit to the Spring Boot backend across all 7 API modules using the existing provider architecture.

**Architecture:** Each backend module gets a new `backend.ts` provider implementing existing service interfaces. Two new modules (Tasks, Sync) get new interfaces + providers. Demo screens exercise every endpoint. All wired via `starter.config.ts` provider selection.

**Tech Stack:** TypeScript, React Native, Expo SDK 54, NativeWind, expo-router, TanStack Query, Axios, i18next, MMKV

**Spec:** `docs/superpowers/specs/2026-03-16-backend-integration-design.md`

---

## Chunk 1: Foundation — Config, Types, API Client, Auth Provider

### Task 1: Add new types for Tasks, Sync, and PaginatedResult

**Files:**
- Create: `src/types/tasks.types.ts`
- Create: `src/types/sync.types.ts`
- Create: `src/types/paginated.types.ts`
- Modify: `src/types/index.ts`

- [ ] **Step 1: Create task types**

```typescript
// src/types/tasks.types.ts
export type TaskStatus = 'todo' | 'in_progress' | 'done';
export type TaskPriority = 'low' | 'medium' | 'high';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: TaskPriority;
  page?: number;
  size?: number;
}

export interface CreateTaskInput {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
}
```

- [ ] **Step 2: Create sync types**

```typescript
// src/types/sync.types.ts
export interface SyncPushItem {
  key: string;
  value: unknown;
  version: number;
  deleted: boolean;
}

export interface SyncRecord {
  key: string;
  value: unknown;
  version: number;
  deleted: boolean;
}

export interface SyncPushResult {
  accepted: Array<{ key: string; version: number }>;
  conflicts: Array<{
    key: string;
    serverVersion: number;
    serverValue: unknown;
    clientVersion: number;
  }>;
}
```

- [ ] **Step 3: Create paginated result type**

```typescript
// src/types/paginated.types.ts
export interface PaginatedResult<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}
```

- [ ] **Step 4: Re-export new types from index**

Add to `src/types/index.ts`:
```typescript
export type { Task, TaskStatus, TaskPriority, TaskFilters, CreateTaskInput, UpdateTaskInput } from './tasks.types';
export type { SyncPushItem, SyncRecord, SyncPushResult } from './sync.types';
export type { PaginatedResult } from './paginated.types';
```

- [ ] **Step 5: Run lint**

Run: `pnpm lint`
Expected: PASS (no errors)

- [ ] **Step 6: Commit**

```bash
git add src/types/tasks.types.ts src/types/sync.types.ts src/types/paginated.types.ts src/types/index.ts
git commit -m "feat: add task, sync, and paginated result types"
```

---

### Task 2: Update starter config with backend provider options

**Files:**
- Modify: `src/config/starter.config.ts`

- [ ] **Step 1: Add backend provider option and new feature flags**

Update the `StarterConfig` interface to add `'backend'` to existing provider unions and add `tasks` and `sync` feature flags:

```typescript
export interface StarterConfig {
  app: {
    name: string;
    bundleId: string;
    scheme: string;
  };
  features: {
    auth: { enabled: boolean; provider: 'amplify' | 'firebase' | 'supabase' | 'clerk' | 'backend' };
    analytics: { enabled: boolean; provider: 'amplify' | 'mixpanel' | 'segment' | 'posthog' | 'backend' };
    crashReporting: { enabled: boolean; provider: 'sentry' | 'bugsnag' | 'datadog' | 'backend' };
    notifications: { enabled: boolean; provider: 'amplify' | 'firebase' | 'onesignal' | 'backend' };
    i18n: { enabled: boolean; defaultLocale: string };
    offlineStorage: { enabled: boolean; provider: 'mmkv' | 'async-storage' };
    onboarding: { enabled: boolean };
    otaUpdates: { enabled: boolean };
    deepLinking: { enabled: boolean };
    splashAppIcon: { enabled: boolean };
    forms: { enabled: boolean };
    tasks: { enabled: boolean; provider: 'backend' };
    sync: { enabled: boolean; provider: 'backend' };
  };
  api: {
    baseUrl: string | undefined;
    timeout: number;
  };
}
```

Update the config values to use `'backend'` for all providers and enable tasks/sync:

```typescript
export const starterConfig: StarterConfig = {
  app: {
    name: 'MyApp',
    bundleId: 'com.mycompany.myapp',
    scheme: 'myapp',
  },

  features: {
    auth: { enabled: true, provider: 'backend' },
    analytics: { enabled: true, provider: 'backend' },
    crashReporting: { enabled: true, provider: 'backend' },
    notifications: { enabled: true, provider: 'backend' },
    i18n: { enabled: true, defaultLocale: 'en' },
    offlineStorage: { enabled: true, provider: 'mmkv' },
    onboarding: { enabled: true },
    otaUpdates: { enabled: true },
    deepLinking: { enabled: true },
    splashAppIcon: { enabled: true },
    forms: { enabled: true },
    tasks: { enabled: true, provider: 'backend' },
    sync: { enabled: true, provider: 'backend' },
  },

  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    timeout: 30000,
  },
};
```

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/config/starter.config.ts
git commit -m "feat: add backend provider option and tasks/sync feature flags to config"
```

---

### Task 3: Update auth service interface with new optional methods

**Files:**
- Modify: `src/services/auth.interface.ts`
- Modify: `src/features/auth/no-op-auth.ts`
- Modify: `src/features/auth/auth-context.ts`
- Modify: `src/features/auth/auth-provider.tsx`

- [ ] **Step 1: Add verifyEmail, updateProfile, deleteAccount to AuthService interface**

```typescript
// src/services/auth.interface.ts
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
  verifyEmail?(email: string, code: string): Promise<void>;
  updateProfile?(data: { displayName?: string; avatarUrl?: string }): Promise<User>;
  deleteAccount?(): Promise<void>;
}
```

- [ ] **Step 2: Add no-op defaults for new methods**

Add to `src/features/auth/no-op-auth.ts`:
```typescript
  verifyEmail: async () => {},
  updateProfile: async () => ({ id: '', email: '', emailVerified: false }),
  deleteAccount: async () => {},
```

- [ ] **Step 3: Add new methods to AuthContextValue and AuthProvider**

Add to `AuthContextValue` in `src/features/auth/auth-context.ts`:
```typescript
  verifyEmail: (email: string, code: string) => Promise<void>;
  updateProfile: (data: { displayName?: string; avatarUrl?: string }) => Promise<User>;
  deleteAccount: () => Promise<void>;
```

Add corresponding `useCallback` handlers in `src/features/auth/auth-provider.tsx` that delegate to `serviceRef.current`. Since these are optional methods on the interface, guard calls with optional chaining:

```typescript
const verifyEmail = useCallback(async (email: string, code: string): Promise<void> => {
  const service = serviceRef.current;
  if (!service?.verifyEmail) return;
  await service.verifyEmail(email, code);
}, []);

const updateProfile = useCallback(async (data: { displayName?: string; avatarUrl?: string }): Promise<User> => {
  const service = serviceRef.current;
  if (!service?.updateProfile) return { id: '', email: '', emailVerified: false };
  const user = await service.updateProfile(data);
  setUser(user);
  return user;
}, []);

const deleteAccount = useCallback(async (): Promise<void> => {
  const service = serviceRef.current;
  if (!service?.deleteAccount) return;
  await service.deleteAccount();
  setUser(null);
}, []);
```

Include them in the context value and useMemo deps.

- [ ] **Step 4: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/services/auth.interface.ts src/features/auth/no-op-auth.ts src/features/auth/auth-context.ts src/features/auth/auth-provider.tsx
git commit -m "feat: add verifyEmail, updateProfile, deleteAccount to auth interface"
```

---

### Task 4: Add 401 token refresh interceptor to API client

**Files:**
- Modify: `src/lib/api/client.ts`

- [ ] **Step 1: Implement 401 response interceptor with token refresh**

Replace the existing no-op response interceptor in `src/lib/api/client.ts` with:

```typescript
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
}

let getRefreshToken: (() => Promise<string | null>) | null = null;
let onTokenRefreshed: ((accessToken: string, refreshToken: string, expiresIn: number) => void) | null = null;
let onRefreshFailed: (() => void) | null = null;

export function setRefreshTokenHandlers(handlers: {
  getRefreshToken: () => Promise<string | null>;
  onTokenRefreshed: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  onRefreshFailed: () => void;
}) {
  getRefreshToken = handlers.getRefreshToken;
  onTokenRefreshed = handlers.onTokenRefreshed;
  onRefreshFailed = handlers.onRefreshFailed;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url ?? '';

    // Skip refresh for auth endpoints
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      url.includes('/api/auth/login') ||
      url.includes('/api/auth/refresh') ||
      url.includes('/api/auth/register')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await getRefreshToken?.();
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await apiClient.post<{ accessToken: string; refreshToken: string; expiresIn: number }>(
        '/api/auth/refresh',
        { refreshToken },
      );
      onTokenRefreshed?.(data.accessToken, data.refreshToken, data.expiresIn);
      processQueue(null, data.accessToken);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      onRefreshFailed?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
```

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/api/client.ts
git commit -m "feat: add 401 token refresh interceptor to API client"
```

---

### Task 5: Create backend auth provider

**Files:**
- Create: `src/features/auth/providers/backend.ts`
- Modify: `src/features/auth/create-auth-service.ts`

- [ ] **Step 1: Create the backend auth provider**

```typescript
// src/features/auth/providers/backend.ts
import { apiClient, setRefreshTokenHandlers } from '@/lib/api';
import type { AuthService } from '@/services/auth.interface';
import type { User, Session } from '@/types';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'auth-backend' });

type AuthChangeCallback = (user: User | null) => void;
const listeners = new Set<AuthChangeCallback>();

function notifyListeners(user: User | null) {
  listeners.forEach((cb) => cb(user));
}

function storeTokens(accessToken: string, refreshToken: string, expiresIn: number) {
  storage.set('accessToken', accessToken);
  storage.set('refreshToken', refreshToken);
  storage.set('expiresAt', Date.now() + expiresIn * 1000);
}

function clearTokens() {
  storage.delete('accessToken');
  storage.delete('refreshToken');
  storage.delete('expiresAt');
}

function getStoredSession(): Session | null {
  const accessToken = storage.getString('accessToken');
  const refreshToken = storage.getString('refreshToken');
  const expiresAt = storage.getNumber('expiresAt');
  if (!accessToken || !refreshToken || !expiresAt) return null;
  return { accessToken, refreshToken, expiresAt };
}

function mapUserProfile(data: {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}): User {
  return {
    id: data.id,
    email: data.email,
    displayName: data.displayName ?? undefined,
    avatarUrl: data.avatarUrl ?? undefined,
    emailVerified: true,
  };
}

// Wire refresh token handlers for the 401 interceptor
setRefreshTokenHandlers({
  getRefreshToken: async () => storage.getString('refreshToken') ?? null,
  onTokenRefreshed: (accessToken, refreshToken, expiresIn) => {
    storeTokens(accessToken, refreshToken, expiresIn);
  },
  onRefreshFailed: () => {
    clearTokens();
    notifyListeners(null);
  },
});

export const backendAuthService: AuthService = {
  async signIn(email, password) {
    try {
      const { data } = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        idToken: string;
        expiresIn: number;
      }>('/api/auth/login', { email, password });

      storeTokens(data.accessToken, data.refreshToken, data.expiresIn);

      const user = await backendAuthService.getCurrentUser();
      if (user) notifyListeners(user);
      return { success: true, user: user ?? undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign-in failed',
      };
    }
  },

  async signUp(email, password, attrs) {
    try {
      await apiClient.post('/api/auth/register', {
        email,
        password,
        displayName: attrs?.displayName,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign-up failed',
      };
    }
  },

  async signOut() {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // Best-effort server-side logout
    }
    clearTokens();
    notifyListeners(null);
  },

  async resetPassword(email) {
    await apiClient.post('/api/auth/forgot-password', { email });
  },

  async confirmResetPassword(email, code, newPassword) {
    await apiClient.post('/api/auth/confirm-reset', { email, code, newPassword });
  },

  async getCurrentUser() {
    const session = getStoredSession();
    if (!session) return null;

    try {
      const { data } = await apiClient.get<{
        id: string;
        email: string;
        displayName: string | null;
        avatarUrl: string | null;
      }>('/api/auth/me');
      return mapUserProfile(data);
    } catch {
      return null;
    }
  },

  async getSession() {
    return getStoredSession();
  },

  onAuthStateChange(callback) {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  },

  async verifyEmail(email, code) {
    await apiClient.post('/api/auth/verify-email', { email, code });
  },

  async updateProfile(data) {
    const { data: updated } = await apiClient.put<{
      id: string;
      email: string;
      displayName: string | null;
      avatarUrl: string | null;
    }>('/api/auth/me', data);
    const user = mapUserProfile(updated);
    notifyListeners(user);
    return user;
  },

  async deleteAccount() {
    await apiClient.delete('/api/auth/me');
    clearTokens();
    notifyListeners(null);
  },
};
```

- [ ] **Step 2: Register backend provider in factory**

Add to providers map in `src/features/auth/create-auth-service.ts`:
```typescript
backend: () => import('./providers/backend').then((m) => m.backendAuthService),
```

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/features/auth/providers/backend.ts src/features/auth/create-auth-service.ts
git commit -m "feat: add backend auth provider with JWT token management"
```

---

### Task 6: Conditionally skip Amplify configuration

**Files:**
- Modify: `src/lib/providers/app-providers.tsx`

- [ ] **Step 1: Guard configureAmplify with provider check**

In `src/lib/providers/app-providers.tsx`, update the `useEffect`:

```typescript
useEffect(() => {
  const { auth, analytics, notifications } = starterConfig.features;
  const usesAmplify =
    auth.provider === 'amplify' ||
    analytics.provider === 'amplify' ||
    notifications.provider === 'amplify';

  if (usesAmplify) {
    configureAmplify();
  }
}, []);
```

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/providers/app-providers.tsx
git commit -m "feat: conditionally skip Amplify config when using backend providers"
```

---

## Chunk 2: Tasks Module — Full CRUD with Provider Pattern

### Task 7: Create tasks service interface

**Files:**
- Create: `src/services/tasks.interface.ts`

- [ ] **Step 1: Create the interface**

```typescript
// src/services/tasks.interface.ts
import type { Task, TaskFilters, CreateTaskInput, UpdateTaskInput, PaginatedResult } from '@/types';

export interface TaskService {
  getTasks(filters?: TaskFilters): Promise<PaginatedResult<Task>>;
  getTask(id: string): Promise<Task>;
  createTask(input: CreateTaskInput): Promise<Task>;
  updateTask(id: string, input: UpdateTaskInput): Promise<Task>;
  deleteTask(id: string): Promise<void>;
}
```

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/services/tasks.interface.ts
git commit -m "feat: add TaskService interface"
```

---

### Task 8: Create tasks module scaffolding (no-op, context, factory, provider component)

**Files:**
- Create: `src/features/tasks/no-op-tasks.ts`
- Create: `src/features/tasks/tasks-context.ts`
- Create: `src/features/tasks/create-tasks-service.ts`
- Create: `src/features/tasks/tasks-provider.tsx`
- Create: `src/features/tasks/index.ts`

- [ ] **Step 1: Create no-op tasks fallback**

```typescript
// src/features/tasks/no-op-tasks.ts
import type { TaskService } from '@/services/tasks.interface';

export const noOpTasks: TaskService = {
  getTasks: async () => ({ content: [], page: 0, size: 0, totalElements: 0, totalPages: 0 }),
  getTask: async () => ({ id: '', title: '', description: null, status: 'todo', priority: 'medium', dueDate: null, createdAt: '', updatedAt: '' }),
  createTask: async (input) => ({ id: '', title: input.title, description: null, status: 'todo', priority: 'medium', dueDate: null, createdAt: '', updatedAt: '' }),
  updateTask: async (_id, _input) => ({ id: '', title: '', description: null, status: 'todo', priority: 'medium', dueDate: null, createdAt: '', updatedAt: '' }),
  deleteTask: async () => {},
};
```

- [ ] **Step 2: Create tasks context**

```typescript
// src/features/tasks/tasks-context.ts
import { createContext } from 'react';
import type { TaskService } from '@/services/tasks.interface';

export const TasksContext = createContext<TaskService | null>(null);
```

- [ ] **Step 3: Create tasks factory**

```typescript
// src/features/tasks/create-tasks-service.ts
import type { TaskService } from '@/services/tasks.interface';
import { starterConfig } from '@/config/starter.config';
import { noOpTasks } from './no-op-tasks';

const providers: Record<string, () => Promise<TaskService>> = {
  backend: () => import('./providers/backend').then((m) => m.backendTaskService),
};

export async function createTasksService(): Promise<TaskService> {
  if (!starterConfig.features.tasks.enabled) {
    return noOpTasks;
  }

  const { provider } = starterConfig.features.tasks;
  const factory = providers[provider];
  if (!factory) {
    console.warn(`[tasks] Unknown tasks provider: ${provider}. Falling back to no-op.`);
    return noOpTasks;
  }

  try {
    return await factory();
  } catch (error) {
    console.warn(
      `[tasks] Failed to load "${provider}" provider. Falling back to no-op.`,
      error instanceof Error ? error.message : error,
    );
    return noOpTasks;
  }
}
```

- [ ] **Step 4: Create tasks provider component**

```typescript
// src/features/tasks/tasks-provider.tsx
import React, { useEffect, useState } from 'react';
import type { TaskService } from '@/services/tasks.interface';
import { starterConfig } from '@/config/starter.config';
import { TasksContext } from './tasks-context';
import { createTasksService } from './create-tasks-service';

function TasksProviderInner({ children }: { children: React.ReactNode }) {
  const [service, setService] = useState<TaskService | null>(null);

  useEffect(() => {
    createTasksService().then(setService);
  }, []);

  if (!service) return null;

  return (
    <TasksContext.Provider value={service}>
      {children}
    </TasksContext.Provider>
  );
}

export function TasksProvider({ children }: { children: React.ReactNode }) {
  if (!starterConfig.features.tasks.enabled) {
    return <>{children}</>;
  }

  return <TasksProviderInner>{children}</TasksProviderInner>;
}
```

- [ ] **Step 5: Create barrel export**

```typescript
// src/features/tasks/index.ts
export { TasksProvider } from './tasks-provider';
export { TasksContext } from './tasks-context';
```

- [ ] **Step 6: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/features/tasks/
git commit -m "feat: add tasks module scaffolding (no-op, context, factory, provider)"
```

---

### Task 9: Create backend tasks provider

**Files:**
- Create: `src/features/tasks/providers/backend.ts`

- [ ] **Step 1: Implement backend tasks provider**

```typescript
// src/features/tasks/providers/backend.ts
import { apiClient } from '@/lib/api';
import type { TaskService } from '@/services/tasks.interface';
import type { Task, TaskFilters, CreateTaskInput, UpdateTaskInput, PaginatedResult } from '@/types';

export const backendTaskService: TaskService = {
  async getTasks(filters?: TaskFilters): Promise<PaginatedResult<Task>> {
    const params: Record<string, string | number> = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.priority) params.priority = filters.priority;
    if (filters?.page !== undefined) params.page = filters.page;
    if (filters?.size !== undefined) params.size = filters.size;

    const { data } = await apiClient.get<PaginatedResult<Task>>('/api/tasks', { params });
    return data;
  },

  async getTask(id: string): Promise<Task> {
    const { data } = await apiClient.get<Task>(`/api/tasks/${id}`);
    return data;
  },

  async createTask(input: CreateTaskInput): Promise<Task> {
    const { data } = await apiClient.post<Task>('/api/tasks', input);
    return data;
  },

  async updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
    const { data } = await apiClient.put<Task>(`/api/tasks/${id}`, input);
    return data;
  },

  async deleteTask(id: string): Promise<void> {
    await apiClient.delete(`/api/tasks/${id}`);
  },
};
```

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/features/tasks/providers/backend.ts
git commit -m "feat: add backend tasks provider"
```

---

### Task 10: Create TanStack Query hooks for tasks

**Files:**
- Create: `src/features/tasks/hooks/use-tasks.ts`
- Create: `src/features/tasks/hooks/use-task.ts`
- Create: `src/features/tasks/hooks/use-create-task.ts`
- Create: `src/features/tasks/hooks/use-update-task.ts`
- Create: `src/features/tasks/hooks/use-delete-task.ts`

- [ ] **Step 1: Create use-tasks hook (list with filters)**

```typescript
// src/features/tasks/hooks/use-tasks.ts
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import type { TaskFilters } from '@/types';
import { TasksContext } from '../tasks-context';

export function useTasks(filters?: TaskFilters) {
  const service = useContext(TasksContext);

  return useQuery({
    queryKey: ['tasks', filters],
    queryFn: () => {
      if (!service) throw new Error('TasksContext not available');
      return service.getTasks(filters);
    },
    enabled: !!service,
  });
}
```

- [ ] **Step 2: Create use-task hook (single task)**

```typescript
// src/features/tasks/hooks/use-task.ts
import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { TasksContext } from '../tasks-context';

export function useTask(id: string) {
  const service = useContext(TasksContext);

  return useQuery({
    queryKey: ['tasks', id],
    queryFn: () => {
      if (!service) throw new Error('TasksContext not available');
      return service.getTask(id);
    },
    enabled: !!service && !!id,
  });
}
```

- [ ] **Step 3: Create use-create-task hook**

```typescript
// src/features/tasks/hooks/use-create-task.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import type { CreateTaskInput } from '@/types';
import { TasksContext } from '../tasks-context';

export function useCreateTask() {
  const service = useContext(TasksContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => {
      if (!service) throw new Error('TasksContext not available');
      return service.createTask(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
```

- [ ] **Step 4: Create use-update-task hook with optimistic update**

```typescript
// src/features/tasks/hooks/use-update-task.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import type { UpdateTaskInput, Task, PaginatedResult } from '@/types';
import { TasksContext } from '../tasks-context';

export function useUpdateTask() {
  const service = useContext(TasksContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateTaskInput }) => {
      if (!service) throw new Error('TasksContext not available');
      return service.updateTask(id, input);
    },
    onMutate: async ({ id, input }) => {
      // Only cancel list queries, not individual task queries
      await queryClient.cancelQueries({ queryKey: ['tasks'], exact: false });
      const previousTasks = queryClient.getQueriesData<PaginatedResult<Task>>({
        queryKey: ['tasks'],
        predicate: (query) => query.queryKey.length === 1 || (query.queryKey.length === 2 && typeof query.queryKey[1] === 'object'),
      });

      // Optimistically update list queries only
      previousTasks.forEach(([key]) => {
        queryClient.setQueryData<PaginatedResult<Task>>(key, (old) => {
          if (!old?.content) return old;
          return {
            ...old,
            content: old.content.map((t) => (t.id === id ? { ...t, ...input } : t)),
          };
        });
      });

      return { previousTasks };
    },
    onError: (_err, _vars, context) => {
      context?.previousTasks.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
```

- [ ] **Step 5: Create use-delete-task hook**

```typescript
// src/features/tasks/hooks/use-delete-task.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useContext } from 'react';
import { TasksContext } from '../tasks-context';

export function useDeleteTask() {
  const service = useContext(TasksContext);
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!service) throw new Error('TasksContext not available');
      return service.deleteTask(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });
}
```

- [ ] **Step 6: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 7: Commit**

```bash
git add src/features/tasks/hooks/
git commit -m "feat: add TanStack Query hooks for tasks CRUD"
```

---

## Chunk 3: Analytics, Crash Reporting, Notifications Backend Providers

### Task 11: Create backend analytics provider

**Files:**
- Create: `src/features/analytics/providers/backend.ts`
- Modify: `src/features/analytics/create-analytics-service.ts`

- [ ] **Step 1: Implement backend analytics provider with batching**

```typescript
// src/features/analytics/providers/backend.ts
import { AppState } from 'react-native';
import { apiClient } from '@/lib/api';
import type { AnalyticsService } from '@/services/analytics.interface';
import type { AnalyticsEvent, AnalyticsUserProperties } from '@/types';

const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 30000;

let eventBuffer: Array<{
  eventName: string;
  eventCategory: string | undefined;
  properties: Record<string, string | number | boolean> | undefined;
  screenName: string | undefined;
  sessionId: string | undefined;
  deviceInfo: Record<string, unknown> | undefined;
  timestamp: string;
}> = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let userProperties: AnalyticsUserProperties = {};

async function flushEvents() {
  if (eventBuffer.length === 0) return;

  const eventsToSend = [...eventBuffer];
  eventBuffer = [];

  try {
    await apiClient.post('/api/analytics/events/batch', { events: eventsToSend });
  } catch {
    // Re-add events on failure
    eventBuffer.unshift(...eventsToSend);
  }
}

function queueEvent(event: typeof eventBuffer[number]) {
  eventBuffer.push(event);
  if (eventBuffer.length >= BATCH_SIZE) {
    flushEvents();
  }
}

export function createBackendAnalytics(): AnalyticsService {
  return {
    async initialize() {
      flushTimer = setInterval(flushEvents, FLUSH_INTERVAL_MS);

      AppState.addEventListener('change', (state) => {
        if (state === 'background' || state === 'inactive') {
          flushEvents();
        }
      });
    },

    trackEvent(event: AnalyticsEvent) {
      queueEvent({
        eventName: event.name,
        eventCategory: undefined,
        properties: { ...event.properties, ...userProperties.traits } as Record<string, string | number | boolean> | undefined,
        screenName: undefined,
        sessionId: undefined,
        deviceInfo: undefined,
        timestamp: new Date().toISOString(),
      });
    },

    trackScreen(screenName: string, properties?: Record<string, string>) {
      queueEvent({
        eventName: `screen_view_${screenName}`,
        eventCategory: 'screen_view',
        properties: { ...properties, ...userProperties.traits },
        screenName,
        sessionId: undefined,
        deviceInfo: undefined,
        timestamp: new Date().toISOString(),
      });
    },

    setUserProperties(properties: AnalyticsUserProperties) {
      userProperties = { ...userProperties, ...properties };
    },

    reset() {
      userProperties = {};
      if (flushTimer) {
        clearInterval(flushTimer);
        flushTimer = null;
      }
      eventBuffer = [];
    },
  };
}
```

- [ ] **Step 2: Register backend in analytics factory**

Add to providers map in `src/features/analytics/create-analytics-service.ts`:
```typescript
backend: async () => {
  const { createBackendAnalytics } = await import('./providers/backend');
  return createBackendAnalytics();
},
```

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/features/analytics/providers/backend.ts src/features/analytics/create-analytics-service.ts
git commit -m "feat: add backend analytics provider with event batching"
```

---

### Task 12: Create backend crash reporting provider

**Files:**
- Create: `src/features/crash-reporting/providers/backend.ts`
- Modify: `src/features/crash-reporting/create-crash-reporting-service.ts`

- [ ] **Step 1: Implement backend crash reporting provider**

```typescript
// src/features/crash-reporting/providers/backend.ts
import { apiClient } from '@/lib/api';
import type { CrashReportingService } from '@/services/crash-reporting.interface';
import type { SeverityLevel, CrashReportContext } from '@/types';
import Constants from 'expo-constants';

const MAX_BREADCRUMBS = 50;

let breadcrumbs: Array<{ message: string; category?: string; data?: Record<string, string>; timestamp: string }> = [];
let userContext: CrashReportContext = {};

// ErrorUtils is a React Native global — TypeScript may need a declaration.
// If tsc complains, add at the top of this file:
// declare const ErrorUtils: { getGlobalHandler(): (error: Error, isFatal?: boolean) => void; setGlobalHandler(handler: (error: Error, isFatal?: boolean) => void): void };

export function createBackendCrashReporting(): CrashReportingService {
  return {
    initialize() {
      const originalHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        this.captureException(error, { extras: { isFatal: String(isFatal ?? false) } });
        originalHandler?.(error, isFatal);
      });
    },

    captureException(error: Error, context?: CrashReportContext) {
      const mergedContext = { ...userContext, ...context };
      apiClient
        .post('/api/crash-reports', {
          errorMessage: error.message,
          stackTrace: error.stack ?? '',
          breadcrumbs,
          context: mergedContext,
          severity: 'error',
          appVersion: Constants.expoConfig?.version ?? 'unknown',
          deviceInfo: {},
          timestamp: new Date().toISOString(),
        })
        .catch(() => {
          // Best-effort crash reporting
        });

      breadcrumbs = [];
    },

    captureMessage(message: string, level?: SeverityLevel) {
      apiClient
        .post('/api/crash-reports', {
          errorMessage: message,
          stackTrace: '',
          breadcrumbs,
          context: userContext,
          severity: level ?? 'info',
          appVersion: Constants.expoConfig?.version ?? 'unknown',
          deviceInfo: {},
          timestamp: new Date().toISOString(),
        })
        .catch(() => {});

      breadcrumbs = [];
    },

    setUser(user: CrashReportContext) {
      userContext = user;
    },

    clearUser() {
      userContext = {};
    },

    addBreadcrumb(message: string, category?: string, data?: Record<string, string>) {
      breadcrumbs.push({ message, category, data, timestamp: new Date().toISOString() });
      if (breadcrumbs.length > MAX_BREADCRUMBS) {
        breadcrumbs = breadcrumbs.slice(-MAX_BREADCRUMBS);
      }
    },
  };
}
```

- [ ] **Step 2: Register backend in crash reporting factory**

Add to providers map in `src/features/crash-reporting/create-crash-reporting-service.ts`:
```typescript
backend: async () => {
  const { createBackendCrashReporting } = await import('./providers/backend');
  return createBackendCrashReporting();
},
```

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/features/crash-reporting/providers/backend.ts src/features/crash-reporting/create-crash-reporting-service.ts
git commit -m "feat: add backend crash reporting provider with breadcrumb ring buffer"
```

---

### Task 13: Create backend notifications provider and hooks

**Files:**
- Create: `src/features/notifications/providers/backend.ts`
- Create: `src/features/notifications/hooks/use-notification-history.ts`
- Create: `src/features/notifications/hooks/use-send-notification.ts`
- Modify: `src/features/notifications/create-notification-service.ts`

- [ ] **Step 1: Implement backend notifications provider**

```typescript
// src/features/notifications/providers/backend.ts
import * as ExpoNotifications from 'expo-notifications';
import { Platform } from 'react-native';
import { apiClient } from '@/lib/api';
import type { NotificationService } from '@/services/notifications.interface';
import type { PushNotificationToken, NotificationPayload, NotificationResponse } from '@/types';

export function createBackendNotifications(): NotificationService {
  let storedToken: string | null = null;

  return {
    async initialize() {
      const token = await this.getToken();
      if (token) {
        try {
          await apiClient.post('/api/notifications/tokens', {
            token: token.token,
            platform: token.platform,
          });
          storedToken = token.token;
        } catch {
          // Best-effort token registration
        }
      }
    },

    async requestPermission() {
      const { status } = await ExpoNotifications.requestPermissionsAsync();
      return status === 'granted';
    },

    async getToken(): Promise<PushNotificationToken | null> {
      try {
        const { data: token } = await ExpoNotifications.getExpoPushTokenAsync();
        return {
          token,
          platform: Platform.OS as 'ios' | 'android' | 'web',
        };
      } catch {
        return null;
      }
    },

    async sendLocalNotification(payload: NotificationPayload) {
      await ExpoNotifications.scheduleNotificationAsync({
        content: {
          title: payload.title,
          body: payload.body,
          data: payload.data,
        },
        trigger: null,
      });
    },

    onNotificationReceived(callback: (response: NotificationResponse) => void) {
      const sub = ExpoNotifications.addNotificationReceivedListener((notification) => {
        callback({
          id: notification.request.identifier,
          payload: {
            title: notification.request.content.title ?? '',
            body: notification.request.content.body ?? '',
            data: notification.request.content.data as Record<string, string> | undefined,
          },
        });
      });
      return () => sub.remove();
    },

    onNotificationOpened(callback: (response: NotificationResponse) => void) {
      const sub = ExpoNotifications.addNotificationResponseReceivedListener((response) => {
        callback({
          id: response.notification.request.identifier,
          payload: {
            title: response.notification.request.content.title ?? '',
            body: response.notification.request.content.body ?? '',
            data: response.notification.request.content.data as Record<string, string> | undefined,
          },
          actionId: response.actionIdentifier,
        });
      });
      return () => sub.remove();
    },
  };
}
```

- [ ] **Step 2: Create notification history hook**

```typescript
// src/features/notifications/hooks/use-notification-history.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';
import type { PaginatedResult } from '@/types';

interface NotificationHistoryItem {
  id: string;
  title: string;
  body: string | null;
  data: Record<string, unknown> | null;
  status: string;
  sentAt: string | null;
  createdAt: string;
}

export function useNotificationHistory(page = 0, size = 20) {
  return useQuery({
    queryKey: ['notification-history', page, size],
    queryFn: async () => {
      const { data } = await apiClient.get<PaginatedResult<NotificationHistoryItem>>(
        '/api/notifications/history',
        { params: { page, size } },
      );
      return data;
    },
  });
}
```

- [ ] **Step 3: Create send notification hook**

```typescript
// src/features/notifications/hooks/use-send-notification.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

interface SendNotificationInput {
  title: string;
  body?: string;
  data?: Record<string, unknown>;
}

export function useSendNotification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: SendNotificationInput) => {
      await apiClient.post('/api/notifications/send', input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-history'] });
    },
  });
}
```

- [ ] **Step 4: Register backend in notifications factory**

Add to providers map in `src/features/notifications/create-notification-service.ts`:
```typescript
backend: async () => {
  const { createBackendNotifications } = await import('./providers/backend');
  return createBackendNotifications();
},
```

- [ ] **Step 5: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 6: Commit**

```bash
git add src/features/notifications/providers/backend.ts src/features/notifications/hooks/ src/features/notifications/create-notification-service.ts
git commit -m "feat: add backend notifications provider with history and send hooks"
```

---

## Chunk 4: Sync Module, I18n Backend Plugin, Provider Chain

### Task 14: Create sync service interface and module

**Files:**
- Create: `src/services/sync.interface.ts`
- Create: `src/features/sync/no-op-sync.ts`
- Create: `src/features/sync/sync-context.ts`
- Create: `src/features/sync/create-sync-service.ts`
- Create: `src/features/sync/sync-provider.tsx`
- Create: `src/features/sync/providers/backend.ts`
- Create: `src/features/sync/hooks/use-sync.ts`
- Create: `src/features/sync/index.ts`

- [ ] **Step 1: Create sync service interface**

```typescript
// src/services/sync.interface.ts
import type { SyncPushItem, SyncRecord, SyncPushResult } from '@/types';

export interface SyncService {
  push(items: SyncPushItem[]): Promise<SyncPushResult>;
  pull(since?: number): Promise<SyncRecord[]>;
  getLastSyncVersion(): number | null;
}
```

- [ ] **Step 2: Create no-op sync**

```typescript
// src/features/sync/no-op-sync.ts
import type { SyncService } from '@/services/sync.interface';

export const noOpSync: SyncService = {
  push: async () => ({ accepted: [], conflicts: [] }),
  pull: async () => [],
  getLastSyncVersion: () => null,
};
```

- [ ] **Step 3: Create sync context and factory**

```typescript
// src/features/sync/sync-context.ts
import { createContext } from 'react';
import type { SyncService } from '@/services/sync.interface';

export const SyncContext = createContext<SyncService | null>(null);
```

```typescript
// src/features/sync/create-sync-service.ts
import type { SyncService } from '@/services/sync.interface';
import { starterConfig } from '@/config/starter.config';
import { noOpSync } from './no-op-sync';

const providers: Record<string, () => Promise<SyncService>> = {
  backend: () => import('./providers/backend').then((m) => m.backendSyncService),
};

export async function createSyncService(): Promise<SyncService> {
  if (!starterConfig.features.sync.enabled) {
    return noOpSync;
  }

  const { provider } = starterConfig.features.sync;
  const factory = providers[provider];
  if (!factory) {
    console.warn(`[sync] Unknown sync provider: ${provider}. Falling back to no-op.`);
    return noOpSync;
  }

  try {
    return await factory();
  } catch (error) {
    console.warn(
      `[sync] Failed to load "${provider}" provider. Falling back to no-op.`,
      error instanceof Error ? error.message : error,
    );
    return noOpSync;
  }
}
```

- [ ] **Step 4: Create sync provider component**

```typescript
// src/features/sync/sync-provider.tsx
import React, { useEffect, useState } from 'react';
import type { SyncService } from '@/services/sync.interface';
import { starterConfig } from '@/config/starter.config';
import { SyncContext } from './sync-context';
import { createSyncService } from './create-sync-service';

function SyncProviderInner({ children }: { children: React.ReactNode }) {
  const [service, setService] = useState<SyncService | null>(null);

  useEffect(() => {
    createSyncService().then(setService);
  }, []);

  if (!service) return null;

  return (
    <SyncContext.Provider value={service}>
      {children}
    </SyncContext.Provider>
  );
}

export function SyncProvider({ children }: { children: React.ReactNode }) {
  if (!starterConfig.features.sync.enabled) {
    return <>{children}</>;
  }

  return <SyncProviderInner>{children}</SyncProviderInner>;
}
```

- [ ] **Step 5: Create backend sync provider**

```typescript
// src/features/sync/providers/backend.ts
import { apiClient } from '@/lib/api';
import type { SyncService } from '@/services/sync.interface';
import type { SyncPushItem, SyncRecord, SyncPushResult } from '@/types';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'sync-backend' });
const LAST_SYNC_KEY = 'lastSyncVersion';

export const backendSyncService: SyncService = {
  async push(items: SyncPushItem[]): Promise<SyncPushResult> {
    const { data } = await apiClient.post<SyncPushResult>('/api/sync/push', { items });

    // Update last sync version from accepted items
    const maxVersion = Math.max(...data.accepted.map((a) => a.version), 0);
    if (maxVersion > 0) {
      storage.set(LAST_SYNC_KEY, maxVersion);
    }

    return data;
  },

  async pull(since?: number): Promise<SyncRecord[]> {
    const version = since ?? backendSyncService.getLastSyncVersion() ?? 0;
    const { data } = await apiClient.get<{ records: SyncRecord[] }>('/api/sync/pull', {
      params: { since: version },
    });

    // Update last sync version
    const maxVersion = Math.max(...data.records.map((r) => r.version), version);
    if (maxVersion > version) {
      storage.set(LAST_SYNC_KEY, maxVersion);
    }

    return data.records;
  },

  getLastSyncVersion(): number | null {
    const version = storage.getNumber(LAST_SYNC_KEY);
    return version !== undefined ? version : null;
  },
};
```

- [ ] **Step 6: Create use-sync hook**

```typescript
// src/features/sync/hooks/use-sync.ts
import { useCallback, useContext, useEffect, useState } from 'react';
import { AppState } from 'react-native';
import { SyncContext } from '../sync-context';

export function useSync() {
  const service = useContext(SyncContext);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncVersion, setLastSyncVersion] = useState<number | null>(
    service?.getLastSyncVersion() ?? null,
  );

  const syncNow = useCallback(async () => {
    if (!service || isSyncing) return;

    setIsSyncing(true);
    try {
      await service.pull();
      setLastSyncVersion(service.getLastSyncVersion());
    } catch (error) {
      console.warn('[sync] Pull failed:', error instanceof Error ? error.message : error);
    } finally {
      setIsSyncing(false);
    }
  }, [service, isSyncing]);

  // Auto-sync on app foreground
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') {
        syncNow();
      }
    });

    return () => sub.remove();
  }, [syncNow]);

  return { syncNow, isSyncing, lastSyncVersion };
}
```

- [ ] **Step 7: Create barrel export**

```typescript
// src/features/sync/index.ts
export { SyncProvider } from './sync-provider';
export { SyncContext } from './sync-context';
```

- [ ] **Step 8: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 9: Commit**

```bash
git add src/services/sync.interface.ts src/features/sync/
git commit -m "feat: add sync module with backend provider and auto-sync hook"
```

---

### Task 15: Create i18n backend plugin

**Files:**
- Create: `src/features/i18n/backend-plugin.ts`
- Modify: `src/features/i18n/i18n.ts`

- [ ] **Step 1: Create the i18next backend plugin**

```typescript
// src/features/i18n/backend-plugin.ts
import type { BackendModule, ReadCallback } from 'i18next';
import { apiClient } from '@/lib/api';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'i18n-cache' });
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCacheKey(locale: string) {
  return `translations_${locale}`;
}

function getTimestampKey(locale: string) {
  return `translations_ts_${locale}`;
}

const BackendPlugin: BackendModule = {
  type: 'backend',

  init() {
    // No initialization needed
  },

  read(language: string, _namespace: string, callback: ReadCallback) {
    // Check cache first
    const cacheKey = getCacheKey(language);
    const tsKey = getTimestampKey(language);
    const cachedData = storage.getString(cacheKey);
    const cachedTs = storage.getNumber(tsKey);

    if (cachedData && cachedTs && Date.now() - cachedTs < CACHE_TTL_MS) {
      try {
        callback(null, JSON.parse(cachedData));
        return;
      } catch {
        // Fall through to fetch
      }
    }

    // Fetch from backend
    apiClient
      .get<Array<{ namespace: string; key: string; value: string }>>(`/api/i18n/${language}`)
      .then(({ data }) => {
        const translations: Record<string, string> = {};
        data.forEach((entry) => {
          translations[entry.key] = entry.value;
        });

        // Cache the result
        storage.set(cacheKey, JSON.stringify(translations));
        storage.set(tsKey, Date.now());

        callback(null, translations);
      })
      .catch(() => {
        // Return null to let i18next fall back to bundled resources
        callback(null, {});
      });
  },
};

export default BackendPlugin;
```

- [ ] **Step 2: Wire backend plugin into i18next configuration**

Replace the entire contents of `src/features/i18n/i18n.ts` with the following (adds BackendPlugin import and `partialBundledLanguages` option — the rest is preserved from the existing file):

```typescript
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { starterConfig } from '@/config/starter.config';
import enLocale from './locales/en.json';
import esLocale from './locales/es.json';
import BackendPlugin from './backend-plugin';

const deviceLocale = getLocales()[0]?.languageCode ?? starterConfig.features.i18n.defaultLocale;

const instance = i18next.use(initReactI18next);

// Use backend plugin when API is configured
if (starterConfig.api.baseUrl) {
  instance.use(BackendPlugin);
}

instance.init({
  compatibilityJSON: 'v4',
  lng: deviceLocale,
  fallbackLng: starterConfig.features.i18n.defaultLocale,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: { translation: enLocale },
    es: { translation: esLocale },
  },
  // When backend plugin is active, merge with bundled resources
  partialBundledLanguages: !!starterConfig.api.baseUrl,
});

export default i18next;
```

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/features/i18n/backend-plugin.ts src/features/i18n/i18n.ts
git commit -m "feat: add i18n backend plugin with MMKV caching and local fallback"
```

---

### Task 16: Wire TasksProvider and SyncProvider into app provider chain

**Files:**
- Modify: `src/lib/providers/app-providers.tsx`

- [ ] **Step 1: Add TasksProvider and SyncProvider to the chain**

Update `src/lib/providers/app-providers.tsx` imports and provider tree:

Add imports:
```typescript
import { TasksProvider } from '@/features/tasks';
import { SyncProvider } from '@/features/sync';
```

Update the provider tree inside the return to add TasksProvider and SyncProvider after NotificationProvider:

```tsx
<NotificationProvider>
  <TasksProvider>
    <SyncProvider>
      {children}
    </SyncProvider>
  </TasksProvider>
</NotificationProvider>
```

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/lib/providers/app-providers.tsx
git commit -m "feat: add TasksProvider and SyncProvider to app provider chain"
```

---

### Task 17: Update .env.example

**Files:**
- Modify or create: `.env.example`

- [ ] **Step 1: Document the API URL env var**

Add or update `.env.example`:
```
# Backend API URL - required when using 'backend' providers
EXPO_PUBLIC_API_URL=http://localhost:8080
```

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add .env.example
git commit -m "docs: add EXPO_PUBLIC_API_URL to .env.example"
```

---

## Chunk 5: Demo Screens & Navigation

### Task 18: Create Tasks tab screen

**Files:**
- Create: `src/app/(tabs)/tasks.tsx`

- [ ] **Step 1: Implement task list screen with CRUD**

Create `src/app/(tabs)/tasks.tsx` with:
- Task list using `useTasks()` hook with FlatList
- Pull-to-refresh via `refetch`
- Status/priority filter chips at the top
- Each task row shows title, status badge, priority badge, due date
- Swipe-to-delete using `useDeleteTask()`
- Header button ("+") that navigates to `tasks/create` modal using `router.push('/tasks/create')`
- Empty state when no tasks exist
- Use NativeWind className for all styling

The screen should be a functional component with approximately 150-200 lines. Use the existing `Collapsible` component pattern for filter sections if needed.

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/(tabs)/tasks.tsx
git commit -m "feat: add Tasks tab screen with list, filters, and CRUD"
```

---

### Task 19: Create task create/edit modal

**Files:**
- Create: `src/app/tasks/create.tsx`

- [ ] **Step 1: Implement task form modal**

Create `src/app/tasks/create.tsx` with:
- Form with fields: title (required), description, status picker, priority picker, due date
- Uses `useCreateTask()` mutation
- Success: navigates back, cache is invalidated automatically
- Error: displays error message
- Use the existing form components from `src/features/forms/` if available (`FormInput`, `FormSelect`)
- Use NativeWind className for styling
- Register this route in the root Stack in `src/app/_layout.tsx` as a modal

- [ ] **Step 2: Register modal route in root layout**

Add to `src/app/_layout.tsx` Stack:
```tsx
<Stack.Screen name="tasks/create" options={{ presentation: 'modal', title: 'New Task' }} />
```

- [ ] **Step 3: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 4: Commit**

```bash
git add src/app/tasks/create.tsx src/app/_layout.tsx
git commit -m "feat: add task create/edit modal screen"
```

---

### Task 20: Create Activity tab screen

**Files:**
- Create: `src/app/(tabs)/activity.tsx`

- [ ] **Step 1: Implement activity screen with collapsible sections**

Create `src/app/(tabs)/activity.tsx` with 4 collapsible sections:

**Analytics section:**
- Shows recent tracked events using an inline `useQuery` that calls `apiClient.get('/api/analytics/events', { params: { page: 0, size: 10 } })` directly (no separate hook needed for this demo-only query)
- "Fire Test Event" button that calls `trackEvent()` from analytics context

**Crash Reports section:**
- Shows list using an inline `useQuery` that calls `apiClient.get('/api/crash-reports', { params: { page: 0, size: 10 } })` directly
- "Trigger Test Crash" button that calls `captureMessage()` from crash reporting context

**Notifications section:**
- Uses `useNotificationHistory()` hook to show notification history
- "Send Test Notification" button using `useSendNotification()` hook

**Sync section:**
- Uses `useSync()` hook
- Shows `lastSyncVersion` and `isSyncing` state
- "Sync Now" button that calls `syncNow()`

Use the existing `Collapsible` component from `@/components/ui/collapsible` for each section. Use `ScrollView` as the container. NativeWind className for all styling.

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/(tabs)/activity.tsx
git commit -m "feat: add Activity tab screen with analytics, crash reports, notifications, sync sections"
```

---

### Task 21: Create Settings tab screen

**Files:**
- Create: `src/app/(tabs)/settings.tsx`

- [ ] **Step 1: Implement settings screen**

Create `src/app/(tabs)/settings.tsx` with:

**User Profile section:**
- Display current user info from `useAuth()` (name, email, avatar)
- Edit button that shows inline editing for displayName and avatarUrl
- Uses `updateProfile()` from auth context
- Delete account button with confirmation alert, calls `deleteAccount()`

**Language section:**
- Language picker showing available locales (en, es)
- Uses `useLanguage()` hook from i18n feature to change language

**Sign Out:**
- Sign out button at the bottom
- Calls `signOut()` from auth context
- On success, expo-router redirects to login (handled by auth state change)

Use `ScrollView` with NativeWind className for styling.

- [ ] **Step 2: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 3: Commit**

```bash
git add src/app/(tabs)/settings.tsx
git commit -m "feat: add Settings tab screen with profile, language picker, and sign-out"
```

---

### Task 22: Update tab layout with 4 tabs

**Files:**
- Modify: `src/app/(tabs)/_layout.tsx`
- Delete: `src/app/(tabs)/explore.tsx`

- [ ] **Step 1: Add new icon mappings to IconSymbol**

Add the following entries to the `MAPPING` object in `src/components/ui/icon-symbol.tsx`:
```typescript
'checklist': 'checklist',
'chart.bar.fill': 'bar-chart',
'gearshape.fill': 'settings',
```

- [ ] **Step 2: Replace explore tab with Tasks, Activity, Settings tabs**

Update `src/app/(tabs)/_layout.tsx`:

```typescript
import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tasks',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="checklist" color={color} />,
        }}
      />
      <Tabs.Screen
        name="activity"
        options={{
          title: 'Activity',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="chart.bar.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
    </Tabs>
  );
}
```

- [ ] **Step 3: Delete the old explore screen**

Delete `src/app/(tabs)/explore.tsx`.

- [ ] **Step 4: Run lint**

Run: `pnpm lint`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git rm src/app/(tabs)/explore.tsx
git add src/app/(tabs)/_layout.tsx src/components/ui/icon-symbol.tsx
git commit -m "feat: update tab navigation with Tasks, Activity, Settings tabs

BREAKING CHANGE: removes Explore tab, replaced by functional demo screens"
```

---

### Task 23: Final integration verification

- [ ] **Step 1: Run full lint check**

Run: `pnpm lint`
Expected: PASS with no errors

- [ ] **Step 2: Verify Metro bundler compiles**

Run: `pnpm start`
Expected: Expo dev server starts without errors. Metro bundler compiles the JavaScript bundle successfully. This verifies all imports resolve and TypeScript compiles.

Note: Full integration testing requires the backend running (`docker-compose up` in the backend repo). This step only verifies the frontend builds correctly.

- [ ] **Step 3: Commit any remaining fixes**

If lint or bundler reveals issues, fix and commit.
