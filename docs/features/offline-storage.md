# Offline Storage

## Overview

Typed key-value storage with a swappable backend. The default provider is **react-native-mmkv** (synchronous, fast); an **AsyncStorage** provider is also included.

## Default Implementation

[react-native-mmkv](https://github.com/mrousavy/react-native-mmkv) -- a JSI-based storage library that is synchronous and significantly faster than AsyncStorage for most workloads.

## Configuration

In `src/config/starter.config.ts`:

```ts
features: {
  offlineStorage: {
    enabled: true,       // set false to disable entirely
    provider: 'mmkv',    // or 'async-storage'
  },
}
```

## Usage

```tsx
import { useStorage } from '@/features/offline-storage';

function MyComponent() {
  const storage = useStorage();

  // Store a value
  storage.set('user.name', 'Alice');

  // Read a value (returns null if missing)
  const name = storage.get<string>('user.name');

  // Check existence
  if (storage.contains('user.name')) {
    // ...
  }

  // Delete a key
  storage.delete('user.name');

  // List all keys
  const keys = storage.getAllKeys();

  // Clear everything
  storage.clearAll();
}
```

The `useStorage()` hook returns an object implementing the `StorageService` interface (`src/services/storage.interface.ts`):

```ts
interface StorageService {
  get<T extends StorageValue>(key: string): T | null;
  set<T extends StorageValue>(key: string, value: T): void;
  delete(key: string): void;
  contains(key: string): boolean;
  clearAll(): void;
  getAllKeys(): string[];
}
```

## Swapping the Provider

### Use the built-in AsyncStorage provider

```ts
// starter.config.ts
offlineStorage: { enabled: true, provider: 'async-storage' },
```

No other changes needed.

### Implement a custom provider

1. Create `src/features/offline-storage/providers/my-provider.ts`.
2. Export an object that satisfies `StorageService`.
3. Register it in `src/features/offline-storage/create-storage-service.ts`:

```ts
const providers: Record<string, () => Promise<StorageService>> = {
  mmkv: () => import('./providers/mmkv').then((m) => m.mmkvStorageService),
  'async-storage': () => import('./providers/async-storage').then((m) => m.asyncStorageService),
  'my-provider': () => import('./providers/my-provider').then((m) => m.myProviderService),
};
```

4. Update the `provider` union type in `StarterConfig` to include `'my-provider'`.

## Removing the Feature

**Option A** -- disable it:

```ts
offlineStorage: { enabled: false, provider: 'mmkv' },
```

The provider becomes a pass-through and the hook returns a no-op implementation. Existing `useStorage()` calls remain safe.

**Option B** -- delete it entirely:

1. Remove `src/features/offline-storage/`.
2. Remove the `StorageProvider` import from `src/lib/providers/app-providers.tsx`.
3. Remove the `offlineStorage` key from `starter.config.ts`.
4. Remove any `useStorage()` calls in your code.
