# State Management

## Overview

| Concern | Library | Location |
| --- | --- | --- |
| Client state | [Zustand](https://github.com/pmndrs/zustand) | `src/store/` |
| Server state | [TanStack Query](https://tanstack.com/query) | `src/lib/api/` |

## Zustand (Client State)

### Existing store

`src/store/app-store.ts` ships with the starter kit as an example:

```ts
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

### Adding a new store

1. Create `src/store/my-store.ts`:

```ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createZustandMMKVStorage } from './mmkv-storage-middleware';

interface MyState {
  count: number;
  increment: () => void;
}

export const useMyStore = create<MyState>()(
  persist(
    (set) => ({
      count: 0,
      increment: () => set((s) => ({ count: s.count + 1 })),
    }),
    {
      name: 'my-store',
      storage: createJSONStorage(() => createZustandMMKVStorage()),
    },
  ),
);
```

2. Re-export from `src/store/index.ts`:

```ts
export { useMyStore } from './my-store';
```

If you do not need persistence, omit the `persist` wrapper:

```ts
export const useMyStore = create<MyState>()((set) => ({
  count: 0,
  increment: () => set((s) => ({ count: s.count + 1 })),
}));
```

## MMKV Persistence Middleware

`src/store/mmkv-storage-middleware.ts` creates a Zustand-compatible `StateStorage` backed by MMKV. When offline storage is disabled, it falls back to an in-memory `Map` so stores still work without crashing.

## TanStack Query (Server State)

The `QueryProvider` in `src/lib/api/query-provider.tsx` supplies a shared `QueryClient` to the component tree. Use standard TanStack Query hooks for server data:

```tsx
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api';

function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: () => apiClient.get('/users').then((r) => r.data),
  });
}
```

### API client

The Axios instance (`src/lib/api/client.ts`) is pre-configured with:

- Base URL and timeout from `starter.config.ts`
- An auth interceptor that attaches a Bearer token when registered

See the [Architecture](../architecture.md) doc for more detail.
