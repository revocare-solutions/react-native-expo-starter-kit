# Basekit Setup Wizard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an interactive setup wizard (`pnpm setup`) that strips unselected features from the starter kit, plus two new feature modules (Security, Theme).

**Architecture:** All features ship in the repo. The setup script reads `basekit.manifest.json` to know which files belong to which feature, then deletes directories/files for unselected features, rewrites `app-providers.tsx` and `basekit.config.ts`, cleans `package.json`, and self-destructs. Two new feature modules (Security and Theme) are added following the existing feature module pattern.

**Tech Stack:** TypeScript, `@clack/prompts` (terminal UI), `fs-extra` (file ops), `execa` (shell commands), `yaml` (config parsing), `picocolors` (colors), `expo-local-authentication`, `expo-secure-store`

**Spec:** `docs/superpowers/specs/2026-03-26-basekit-design.md`

**Branch:** Create `ft/basekit-setup-wizard` from `main`

---

## File Map

### New Files

```
setup/
├── index.ts                          # CLI entry point, arg parsing, orchestration
├── prompts.ts                        # @clack/prompts interactive wizard
├── generator.ts                      # Core strip/keep logic
├── providers.ts                      # Rewrites app-providers.tsx from manifest
├── utils.ts                          # File deletion, JSON mutation, env rewriting
└── __tests__/
    ├── generator.test.ts             # Unit tests for strip logic
    ├── providers.test.ts             # Unit tests for provider chain rewriter
    └── utils.test.ts                 # Unit tests for file/JSON helpers

src/features/security/
├── index.ts                          # Barrel exports
├── security-provider.tsx             # React context provider
├── hooks/
│   ├── use-biometrics.ts             # Biometric authentication hook
│   ├── use-secure-storage.ts         # Secure key-value storage hook
│   └── use-app-lock.ts              # App lock combining biometrics + background timeout
├── config/
│   └── pinning.ts                    # SSL pinning configuration
├── utils/
│   └── secure-auth-storage.ts        # Drop-in auth token storage adapter
└── __tests__/
    ├── use-biometrics.test.ts
    ├── use-secure-storage.test.ts
    └── use-app-lock.test.ts

src/features/theme/
├── index.ts                          # Barrel exports
├── theme-provider.tsx                # React context with token resolution
├── hooks/
│   └── use-theme.ts                  # Full design token hook
├── utils/
│   └── generate-tailwind.ts          # Converts theme config to Tailwind extend object
├── presets/
│   ├── minimal.ts                    # Minimal theme token values
│   ├── bold.ts                       # Bold theme token values
│   └── corporate.ts                  # Corporate theme token values
└── __tests__/
    ├── use-theme.test.ts
    └── generate-tailwind.test.ts

src/config/theme.config.ts            # Design token config (imports from active preset)
src/types/theme.types.ts              # ThemeConfig, color scale, typography types
src/types/security.types.ts           # Biometric, secure storage, pinning types
src/services/security.interface.ts    # Security service contract (not needed - hooks-only)

basekit.manifest.json                 # Feature-to-file mapping for setup script
.env.example                          # Template env vars for all features
```

### Modified Files

```
src/config/starter.config.ts          # Rename to basekit.config.ts, add security + theme
src/lib/providers/app-providers.tsx    # Add SecurityProvider and BasekitThemeProvider
src/types/index.ts                    # Export new types
src/hooks/use-theme-color.ts          # Conditional: use theme tokens if theme feature present
src/components/themed-text.tsx         # Support theme tokens when available
src/components/themed-view.tsx         # Support theme tokens when available
tailwind.config.js                    # Wire up theme token generation
package.json                          # Add new deps + setup script
```

---

## Task 1: Branch Setup and Dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Create feature branch**

```bash
git checkout main
git checkout -b ft/basekit-setup-wizard
```

- [ ] **Step 2: Install security feature dependencies**

```bash
pnpm add expo-local-authentication expo-secure-store
```

- [ ] **Step 3: Install setup wizard devDependencies**

```bash
pnpm add -D @clack/prompts fs-extra @types/fs-extra yaml execa picocolors tsx
```

- [ ] **Step 4: Add `setup` script to package.json**

Add to `scripts` in `package.json`:

```json
"setup": "tsx setup/index.ts"
```

- [ ] **Step 5: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add security, theme, and setup wizard dependencies"
```

---

## Task 2: Security Types

**Files:**
- Create: `src/types/security.types.ts`
- Modify: `src/types/index.ts`

- [ ] **Step 1: Create security types**

Create `src/types/security.types.ts`:

```typescript
export type BiometricType = 'fingerprint' | 'facial' | 'iris';

export interface BiometricOptions {
  promptMessage?: string;
  cancelLabel?: string;
  fallbackToPasscode?: boolean;
}

export type BiometricError =
  | 'user_cancel'
  | 'not_available'
  | 'not_enrolled'
  | 'lockout'
  | 'unknown';

export interface BiometricResult {
  success: boolean;
  error?: BiometricError;
}

export interface AppLockConfig {
  lockOnBackground: boolean;
  backgroundTimeout: number;
  requireOnLaunch: boolean;
}

export interface PinningPin {
  hostname: string;
  sha256: string[];
}

export interface PinningConfig {
  enabled: boolean;
  pins: PinningPin[];
  environment: {
    development: boolean;
    staging: boolean;
    production: boolean;
  };
}
```

- [ ] **Step 2: Export from types barrel**

Add to `src/types/index.ts`:

```typescript
export type {
  BiometricType,
  BiometricOptions,
  BiometricError,
  BiometricResult,
  AppLockConfig,
  PinningConfig,
  PinningPin,
} from './security.types';
```

- [ ] **Step 3: Commit**

```bash
git add src/types/security.types.ts src/types/index.ts
git commit -m "feat: add security feature types"
```

---

## Task 3: Security Feature — Biometrics Hook

**Files:**
- Create: `src/features/security/hooks/use-biometrics.ts`
- Create: `src/features/security/__tests__/use-biometrics.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/features/security/__tests__/use-biometrics.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useBiometrics } from '../hooks/use-biometrics';

// Mock expo-local-authentication
jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
    IRIS: 3,
  },
}));

import * as LocalAuthentication from 'expo-local-authentication';

const mockLocalAuth = LocalAuthentication as jest.Mocked<typeof LocalAuthentication>;

describe('useBiometrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should detect available biometric hardware', async () => {
    mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
    mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
    mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([
      LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
    ]);

    const { result } = renderHook(() => useBiometrics());

    // Wait for async initialization
    await act(async () => {});

    expect(result.current.isAvailable).toBe(true);
    expect(result.current.biometricType).toBe('facial');
  });

  it('should return not available when no hardware', async () => {
    mockLocalAuth.hasHardwareAsync.mockResolvedValue(false);
    mockLocalAuth.isEnrolledAsync.mockResolvedValue(false);
    mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([]);

    const { result } = renderHook(() => useBiometrics());

    await act(async () => {});

    expect(result.current.isAvailable).toBe(false);
    expect(result.current.biometricType).toBeNull();
  });

  it('should authenticate successfully', async () => {
    mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
    mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
    mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([
      LocalAuthentication.AuthenticationType.FINGERPRINT,
    ]);
    mockLocalAuth.authenticateAsync.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useBiometrics());
    await act(async () => {});

    let authResult: { success: boolean; error?: string };
    await act(async () => {
      authResult = await result.current.authenticate({ promptMessage: 'Verify' });
    });

    expect(authResult!.success).toBe(true);
    expect(mockLocalAuth.authenticateAsync).toHaveBeenCalledWith({
      promptMessage: 'Verify',
      cancelLabel: undefined,
      fallbackEnabled: undefined,
    });
  });

  it('should handle authentication failure', async () => {
    mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
    mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
    mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([
      LocalAuthentication.AuthenticationType.FINGERPRINT,
    ]);
    mockLocalAuth.authenticateAsync.mockResolvedValue({
      success: false,
      error: 'user_cancel',
    });

    const { result } = renderHook(() => useBiometrics());
    await act(async () => {});

    let authResult: { success: boolean; error?: string };
    await act(async () => {
      authResult = await result.current.authenticate();
    });

    expect(authResult!.success).toBe(false);
    expect(authResult!.error).toBe('user_cancel');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- src/features/security/__tests__/use-biometrics.test.ts --no-coverage
```

Expected: FAIL — module `../hooks/use-biometrics` not found

- [ ] **Step 3: Implement use-biometrics hook**

Create `src/features/security/hooks/use-biometrics.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import type { BiometricType, BiometricOptions, BiometricResult } from '@/types';

const AUTH_TYPE_MAP: Record<number, BiometricType> = {
  [LocalAuthentication.AuthenticationType.FINGERPRINT]: 'fingerprint',
  [LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION]: 'facial',
  [LocalAuthentication.AuthenticationType.IRIS]: 'iris',
};

export function useBiometrics() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType | null>(null);

  useEffect(() => {
    async function checkBiometrics() {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        setIsAvailable(true);
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.length > 0) {
          setBiometricType(AUTH_TYPE_MAP[types[0]] ?? null);
        }
      }
    }

    checkBiometrics();
  }, []);

  const authenticate = useCallback(
    async (options?: BiometricOptions): Promise<BiometricResult> => {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: options?.promptMessage,
        cancelLabel: options?.cancelLabel,
        fallbackEnabled: options?.fallbackToPasscode,
      });

      if (result.success) {
        return { success: true };
      }

      return {
        success: false,
        error: (result.error as BiometricResult['error']) ?? 'unknown',
      };
    },
    [],
  );

  return { isAvailable, biometricType, authenticate };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- src/features/security/__tests__/use-biometrics.test.ts --no-coverage
```

Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/security/hooks/use-biometrics.ts src/features/security/__tests__/use-biometrics.test.ts
git commit -m "feat: add biometric authentication hook"
```

---

## Task 4: Security Feature — Secure Storage Hook

**Files:**
- Create: `src/features/security/hooks/use-secure-storage.ts`
- Create: `src/features/security/__tests__/use-secure-storage.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/features/security/__tests__/use-secure-storage.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { useSecureStorage } from '../hooks/use-secure-storage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

import * as SecureStore from 'expo-secure-store';

const mockStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('useSecureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get a value', async () => {
    mockStore.getItemAsync.mockResolvedValue('secret-token');

    const { result } = renderHook(() => useSecureStorage());

    let value: string | null;
    await act(async () => {
      value = await result.current.get('auth_token');
    });

    expect(value!).toBe('secret-token');
    expect(mockStore.getItemAsync).toHaveBeenCalledWith('auth_token');
  });

  it('should set a value', async () => {
    mockStore.setItemAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSecureStorage());

    await act(async () => {
      await result.current.set('auth_token', 'new-token');
    });

    expect(mockStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'new-token');
  });

  it('should remove a value', async () => {
    mockStore.deleteItemAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSecureStorage());

    await act(async () => {
      await result.current.remove('auth_token');
    });

    expect(mockStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
  });

  it('should clear all secure values', async () => {
    const keys = ['key1', 'key2'];
    mockStore.deleteItemAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSecureStorage());

    await act(async () => {
      await result.current.clearKeys(keys);
    });

    expect(mockStore.deleteItemAsync).toHaveBeenCalledTimes(2);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- src/features/security/__tests__/use-secure-storage.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Implement secure storage hook**

Create `src/features/security/hooks/use-secure-storage.ts`:

```typescript
import { useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

export function useSecureStorage() {
  const get = useCallback(async (key: string): Promise<string | null> => {
    return SecureStore.getItemAsync(key);
  }, []);

  const set = useCallback(async (key: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(key, value);
  }, []);

  const remove = useCallback(async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key);
  }, []);

  const clearKeys = useCallback(async (keys: string[]): Promise<void> => {
    await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
  }, []);

  return { get, set, remove, clearKeys };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- src/features/security/__tests__/use-secure-storage.test.ts --no-coverage
```

Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/security/hooks/use-secure-storage.ts src/features/security/__tests__/use-secure-storage.test.ts
git commit -m "feat: add secure storage hook"
```

---

## Task 5: Security Feature — App Lock Hook

**Files:**
- Create: `src/features/security/hooks/use-app-lock.ts`
- Create: `src/features/security/__tests__/use-app-lock.test.ts`

- [ ] **Step 1: Write failing test**

Create `src/features/security/__tests__/use-app-lock.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useAppLock } from '../hooks/use-app-lock';

// Mock the biometrics hook
jest.mock('../hooks/use-biometrics', () => ({
  useBiometrics: () => ({
    isAvailable: true,
    biometricType: 'facial',
    authenticate: jest.fn().mockResolvedValue({ success: true }),
  }),
}));

// Mock AppState
const mockAddEventListener = jest.fn();
jest.spyOn(AppState, 'addEventListener').mockImplementation(mockAddEventListener);

describe('useAppLock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should start unlocked by default', () => {
    const { result } = renderHook(() =>
      useAppLock({ lockOnBackground: false, backgroundTimeout: 30, requireOnLaunch: false }),
    );

    expect(result.current.isLocked).toBe(false);
  });

  it('should start locked when requireOnLaunch is true', () => {
    const { result } = renderHook(() =>
      useAppLock({ lockOnBackground: false, backgroundTimeout: 30, requireOnLaunch: true }),
    );

    expect(result.current.isLocked).toBe(true);
  });

  it('should unlock via biometrics', async () => {
    const { result } = renderHook(() =>
      useAppLock({ lockOnBackground: false, backgroundTimeout: 30, requireOnLaunch: true }),
    );

    expect(result.current.isLocked).toBe(true);

    await act(async () => {
      const unlockResult = await result.current.unlock();
      expect(unlockResult.success).toBe(true);
    });

    expect(result.current.isLocked).toBe(false);
  });

  it('should lock manually', () => {
    const { result } = renderHook(() =>
      useAppLock({ lockOnBackground: false, backgroundTimeout: 30, requireOnLaunch: false }),
    );

    expect(result.current.isLocked).toBe(false);

    act(() => {
      result.current.lock();
    });

    expect(result.current.isLocked).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- src/features/security/__tests__/use-app-lock.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Implement app lock hook**

Create `src/features/security/hooks/use-app-lock.ts`:

```typescript
import { useState, useCallback, useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import type { AppLockConfig, BiometricResult } from '@/types';
import { useBiometrics } from './use-biometrics';

export function useAppLock(config: AppLockConfig) {
  const [isLocked, setIsLocked] = useState(config.requireOnLaunch);
  const { authenticate } = useBiometrics();
  const backgroundTimestamp = useRef<number | null>(null);

  const lock = useCallback(() => {
    setIsLocked(true);
  }, []);

  const unlock = useCallback(async (): Promise<BiometricResult> => {
    const result = await authenticate({ promptMessage: 'Unlock app' });
    if (result.success) {
      setIsLocked(false);
    }
    return result;
  }, [authenticate]);

  useEffect(() => {
    if (!config.lockOnBackground) return;

    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'background') {
        backgroundTimestamp.current = Date.now();
      } else if (nextState === 'active' && backgroundTimestamp.current) {
        const elapsed = (Date.now() - backgroundTimestamp.current) / 1000;
        if (elapsed >= config.backgroundTimeout) {
          setIsLocked(true);
        }
        backgroundTimestamp.current = null;
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [config.lockOnBackground, config.backgroundTimeout]);

  return { isLocked, lock, unlock };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- src/features/security/__tests__/use-app-lock.test.ts --no-coverage
```

Expected: 4 tests PASS

- [ ] **Step 5: Commit**

```bash
git add src/features/security/hooks/use-app-lock.ts src/features/security/__tests__/use-app-lock.test.ts
git commit -m "feat: add app lock hook with biometric unlock"
```

---

## Task 6: Security Feature — SSL Pinning Config, Provider, and Barrel

**Files:**
- Create: `src/features/security/config/pinning.ts`
- Create: `src/features/security/utils/secure-auth-storage.ts`
- Create: `src/features/security/security-provider.tsx`
- Create: `src/features/security/index.ts`

- [ ] **Step 1: Create SSL pinning config**

Create `src/features/security/config/pinning.ts`:

```typescript
import type { PinningConfig } from '@/types';

export const pinningConfig: PinningConfig = {
  enabled: false,
  pins: [
    // Add your SSL pins here:
    // { hostname: 'api.myapp.com', sha256: ['AAAA...='] },
  ],
  environment: {
    development: false,
    staging: true,
    production: true,
  },
};
```

- [ ] **Step 2: Create secure auth storage adapter**

Create `src/features/security/utils/secure-auth-storage.ts`:

```typescript
import * as SecureStore from 'expo-secure-store';

const AUTH_TOKEN_KEY = 'basekit_auth_token';
const REFRESH_TOKEN_KEY = 'basekit_refresh_token';

export const secureAuthStorage = {
  async getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(AUTH_TOKEN_KEY);
  },

  async setAccessToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(AUTH_TOKEN_KEY, token);
  },

  async getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
  },

  async setRefreshToken(token: string): Promise<void> {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token);
  },

  async clearTokens(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(AUTH_TOKEN_KEY),
      SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    ]);
  },
};
```

- [ ] **Step 3: Create security provider**

Create `src/features/security/security-provider.tsx`:

```typescript
import React from 'react';
import { starterConfig } from '@/config/starter.config';

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  if (!starterConfig.features.security?.enabled) {
    return <>{children}</>;
  }

  // Security provider initializes secure storage and pinning config.
  // Individual hooks (useBiometrics, useSecureStorage, useAppLock) are used directly.
  return <>{children}</>;
}
```

- [ ] **Step 4: Create barrel export**

Create `src/features/security/index.ts`:

```typescript
export { SecurityProvider } from './security-provider';
export { useBiometrics } from './hooks/use-biometrics';
export { useSecureStorage } from './hooks/use-secure-storage';
export { useAppLock } from './hooks/use-app-lock';
export { secureAuthStorage } from './utils/secure-auth-storage';
export { pinningConfig } from './config/pinning';
```

- [ ] **Step 5: Commit**

```bash
git add src/features/security/
git commit -m "feat: add security provider, SSL pinning config, and secure auth storage"
```

---

## Task 7: Theme Types and Design Token Config

**Files:**
- Create: `src/types/theme.types.ts`
- Modify: `src/types/index.ts`
- Create: `src/features/theme/presets/minimal.ts`
- Create: `src/features/theme/presets/bold.ts`
- Create: `src/features/theme/presets/corporate.ts`
- Create: `src/config/theme.config.ts`

- [ ] **Step 1: Create theme types**

Create `src/types/theme.types.ts`:

```typescript
export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface SurfaceColors {
  background: string;
  card: string;
  border: string;
}

export interface TypographyEntry {
  size: number;
  lineHeight: number;
}

export interface ShadowEntry {
  offsetY: number;
  blur: number;
  color: string;
}

export interface ThemeConfig {
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    accent: ColorScale;
    neutral: ColorScale;
    semantic: SemanticColors;
    surface: {
      light: SurfaceColors;
      dark: SurfaceColors;
    };
  };
  typography: {
    fontFamily: {
      sans: string;
      mono: string;
    };
    scale: Record<string, TypographyEntry>;
  };
  spacing: {
    unit: number;
  };
  borderRadius: Record<string, number>;
  shadows: Record<string, ShadowEntry>;
}
```

- [ ] **Step 2: Export from types barrel**

Add to `src/types/index.ts`:

```typescript
export type {
  ThemeConfig,
  ColorScale,
  SemanticColors,
  SurfaceColors,
  TypographyEntry,
  ShadowEntry,
} from './theme.types';
```

- [ ] **Step 3: Create minimal preset**

Create `src/features/theme/presets/minimal.ts`:

```typescript
import type { ThemeConfig } from '@/types';

export const minimalPreset: ThemeConfig = {
  colors: {
    primary: {
      50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
      400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
      800: '#3730a3', 900: '#312e81', 950: '#1e1b4b',
    },
    secondary: {
      50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
      400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
      800: '#1e293b', 900: '#0f172a', 950: '#020617',
    },
    accent: {
      50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
      400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
      800: '#065f46', 900: '#064e3b', 950: '#022c22',
    },
    neutral: {
      50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4',
      400: '#a3a3a3', 500: '#737373', 600: '#525252', 700: '#404040',
      800: '#262626', 900: '#171717', 950: '#0a0a0a',
    },
    semantic: {
      success: '#22c55e',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
    surface: {
      light: { background: '#ffffff', card: '#f9fafb', border: '#e5e7eb' },
      dark: { background: '#0a0a0a', card: '#171717', border: '#262626' },
    },
  },
  typography: {
    fontFamily: { sans: 'Inter', mono: 'JetBrains Mono' },
    scale: {
      xs: { size: 12, lineHeight: 16 },
      sm: { size: 14, lineHeight: 20 },
      base: { size: 16, lineHeight: 24 },
      lg: { size: 18, lineHeight: 28 },
      xl: { size: 20, lineHeight: 28 },
      '2xl': { size: 24, lineHeight: 32 },
      '3xl': { size: 30, lineHeight: 36 },
      '4xl': { size: 36, lineHeight: 40 },
    },
  },
  spacing: { unit: 4 },
  borderRadius: { none: 0, sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
  shadows: {
    sm: { offsetY: 1, blur: 2, color: 'rgba(0,0,0,0.05)' },
    md: { offsetY: 4, blur: 6, color: 'rgba(0,0,0,0.07)' },
    lg: { offsetY: 10, blur: 15, color: 'rgba(0,0,0,0.1)' },
  },
};
```

- [ ] **Step 4: Create bold preset**

Create `src/features/theme/presets/bold.ts`:

```typescript
import type { ThemeConfig } from '@/types';

export const boldPreset: ThemeConfig = {
  colors: {
    primary: {
      50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
      400: '#60a5fa', 500: '#2563eb', 600: '#1d4ed8', 700: '#1e40af',
      800: '#1e3a8a', 900: '#1e3b8a', 950: '#172554',
    },
    secondary: {
      50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc',
      400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf',
      800: '#86198f', 900: '#701a75', 950: '#4a044e',
    },
    accent: {
      50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
      400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
      800: '#9a3412', 900: '#7c2d12', 950: '#431407',
    },
    neutral: {
      50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8',
      400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46',
      800: '#27272a', 900: '#18181b', 950: '#09090b',
    },
    semantic: {
      success: '#22c55e',
      warning: '#eab308',
      error: '#dc2626',
      info: '#2563eb',
    },
    surface: {
      light: { background: '#ffffff', card: '#fafafa', border: '#e4e4e7' },
      dark: { background: '#09090b', card: '#18181b', border: '#27272a' },
    },
  },
  typography: {
    fontFamily: { sans: 'Plus Jakarta Sans', mono: 'JetBrains Mono' },
    scale: {
      xs: { size: 12, lineHeight: 16 },
      sm: { size: 14, lineHeight: 20 },
      base: { size: 16, lineHeight: 24 },
      lg: { size: 18, lineHeight: 28 },
      xl: { size: 20, lineHeight: 28 },
      '2xl': { size: 24, lineHeight: 32 },
      '3xl': { size: 30, lineHeight: 36 },
      '4xl': { size: 36, lineHeight: 40 },
    },
  },
  spacing: { unit: 4 },
  borderRadius: { none: 0, sm: 6, md: 10, lg: 14, xl: 18, full: 9999 },
  shadows: {
    sm: { offsetY: 1, blur: 3, color: 'rgba(0,0,0,0.06)' },
    md: { offsetY: 4, blur: 8, color: 'rgba(0,0,0,0.08)' },
    lg: { offsetY: 10, blur: 20, color: 'rgba(0,0,0,0.12)' },
  },
};
```

- [ ] **Step 5: Create corporate preset**

Create `src/features/theme/presets/corporate.ts`:

```typescript
import type { ThemeConfig } from '@/types';

export const corporatePreset: ThemeConfig = {
  colors: {
    primary: {
      50: '#eff6ff', 100: '#dce6f5', 200: '#b8cce8', 300: '#8badd6',
      400: '#5d8ec4', 500: '#1e3a5f', 600: '#1a3354', 700: '#162c49',
      800: '#12253e', 900: '#0e1e33', 950: '#0a1628',
    },
    secondary: {
      50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
      400: '#4ade80', 500: '#16a34a', 600: '#15803d', 700: '#166534',
      800: '#14532d', 900: '#052e16', 950: '#022c22',
    },
    accent: {
      50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
      400: '#fbbf24', 500: '#d97706', 600: '#b45309', 700: '#92400e',
      800: '#78350f', 900: '#451a03', 950: '#271000',
    },
    neutral: {
      50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db',
      400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151',
      800: '#1f2937', 900: '#111827', 950: '#030712',
    },
    semantic: {
      success: '#16a34a',
      warning: '#d97706',
      error: '#dc2626',
      info: '#1e3a5f',
    },
    surface: {
      light: { background: '#ffffff', card: '#f9fafb', border: '#e5e7eb' },
      dark: { background: '#030712', card: '#111827', border: '#1f2937' },
    },
  },
  typography: {
    fontFamily: { sans: 'IBM Plex Sans', mono: 'IBM Plex Mono' },
    scale: {
      xs: { size: 12, lineHeight: 16 },
      sm: { size: 14, lineHeight: 20 },
      base: { size: 16, lineHeight: 24 },
      lg: { size: 18, lineHeight: 28 },
      xl: { size: 20, lineHeight: 28 },
      '2xl': { size: 24, lineHeight: 32 },
      '3xl': { size: 30, lineHeight: 36 },
      '4xl': { size: 36, lineHeight: 40 },
    },
  },
  spacing: { unit: 4 },
  borderRadius: { none: 0, sm: 2, md: 4, lg: 6, xl: 8, full: 9999 },
  shadows: {
    sm: { offsetY: 1, blur: 2, color: 'rgba(0,0,0,0.04)' },
    md: { offsetY: 3, blur: 6, color: 'rgba(0,0,0,0.06)' },
    lg: { offsetY: 8, blur: 12, color: 'rgba(0,0,0,0.08)' },
  },
};
```

- [ ] **Step 6: Create theme config entry point**

Create `src/config/theme.config.ts`:

```typescript
import type { ThemeConfig } from '@/types';
import { minimalPreset } from '@/features/theme/presets/minimal';

// This file is rewritten by the setup wizard to use the selected preset.
// To change themes, replace the import above with another preset:
//   import { boldPreset as activePreset } from '@/features/theme/presets/bold';
//   import { corporatePreset as activePreset } from '@/features/theme/presets/corporate';

export const themeConfig: ThemeConfig = minimalPreset;
```

- [ ] **Step 7: Commit**

```bash
git add src/types/theme.types.ts src/types/index.ts src/features/theme/presets/ src/config/theme.config.ts
git commit -m "feat: add theme types, design token presets, and theme config"
```

---

## Task 8: Theme Feature — Tailwind Generator and Hook

**Files:**
- Create: `src/features/theme/utils/generate-tailwind.ts`
- Create: `src/features/theme/__tests__/generate-tailwind.test.ts`
- Create: `src/features/theme/hooks/use-theme.ts`
- Create: `src/features/theme/__tests__/use-theme.test.ts`

- [ ] **Step 1: Write failing test for Tailwind generator**

Create `src/features/theme/__tests__/generate-tailwind.test.ts`:

```typescript
import { generateTailwindTheme } from '../utils/generate-tailwind';
import { minimalPreset } from '../presets/minimal';

describe('generateTailwindTheme', () => {
  it('should generate color scales', () => {
    const result = generateTailwindTheme(minimalPreset);

    expect(result.colors.primary['500']).toBe('#6366f1');
    expect(result.colors.secondary['500']).toBe('#64748b');
    expect(result.colors.accent['500']).toBe('#10b981');
    expect(result.colors.neutral['500']).toBe('#737373');
  });

  it('should generate semantic colors', () => {
    const result = generateTailwindTheme(minimalPreset);

    expect(result.colors.success).toBe('#22c55e');
    expect(result.colors.warning).toBe('#f59e0b');
    expect(result.colors.error).toBe('#ef4444');
    expect(result.colors.info).toBe('#3b82f6');
  });

  it('should generate border radius values', () => {
    const result = generateTailwindTheme(minimalPreset);

    expect(result.borderRadius.sm).toBe('4px');
    expect(result.borderRadius.md).toBe('8px');
    expect(result.borderRadius.lg).toBe('12px');
  });

  it('should generate spacing scale', () => {
    const result = generateTailwindTheme(minimalPreset);

    // spacing unit is 4, so spacing-1 = 4px, spacing-2 = 8px, etc.
    expect(result.spacing['1']).toBe('4px');
    expect(result.spacing['2']).toBe('8px');
    expect(result.spacing['4']).toBe('16px');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- src/features/theme/__tests__/generate-tailwind.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Implement Tailwind generator**

Create `src/features/theme/utils/generate-tailwind.ts`:

```typescript
import type { ThemeConfig, ColorScale } from '@/types';

function colorScaleToTailwind(scale: ColorScale): Record<string, string> {
  return Object.fromEntries(
    Object.entries(scale).map(([key, value]) => [key, value]),
  );
}

export function generateTailwindTheme(config: ThemeConfig) {
  const spacingEntries: Record<string, string> = {};
  for (let i = 0; i <= 20; i++) {
    spacingEntries[String(i)] = `${i * config.spacing.unit}px`;
  }

  return {
    colors: {
      primary: colorScaleToTailwind(config.colors.primary),
      secondary: colorScaleToTailwind(config.colors.secondary),
      accent: colorScaleToTailwind(config.colors.accent),
      neutral: colorScaleToTailwind(config.colors.neutral),
      success: config.colors.semantic.success,
      warning: config.colors.semantic.warning,
      error: config.colors.semantic.error,
      info: config.colors.semantic.info,
    },
    borderRadius: Object.fromEntries(
      Object.entries(config.borderRadius)
        .filter(([key]) => key !== 'none' && key !== 'full')
        .map(([key, value]) => [key, `${value}px`]),
    ),
    spacing: spacingEntries,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- src/features/theme/__tests__/generate-tailwind.test.ts --no-coverage
```

Expected: 4 tests PASS

- [ ] **Step 5: Write failing test for useTheme hook**

Create `src/features/theme/__tests__/use-theme.test.ts`:

```typescript
import { renderHook, act } from '@testing-library/react-native';
import React from 'react';
import { useTheme, ThemeContext } from '../hooks/use-theme';
import { minimalPreset } from '../presets/minimal';

describe('useTheme', () => {
  function createWrapper(mode: 'light' | 'dark' = 'light') {
    return function Wrapper({ children }: { children: React.ReactNode }) {
      return (
        <ThemeContext.Provider value={{ config: minimalPreset, mode, setMode: jest.fn() }}>
          {children}
        </ThemeContext.Provider>
      );
    };
  }

  it('should return theme colors for light mode', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper('light') });

    expect(result.current.colors.surface.background).toBe('#ffffff');
    expect(result.current.mode).toBe('light');
    expect(result.current.isDark).toBe(false);
  });

  it('should return theme colors for dark mode', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper('dark') });

    expect(result.current.colors.surface.background).toBe('#0a0a0a');
    expect(result.current.mode).toBe('dark');
    expect(result.current.isDark).toBe(true);
  });

  it('should calculate spacing correctly', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

    expect(result.current.spacing(1)).toBe(4);
    expect(result.current.spacing(2)).toBe(8);
    expect(result.current.spacing(4)).toBe(16);
  });

  it('should expose border radius and shadows', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

    expect(result.current.borderRadius.md).toBe(8);
    expect(result.current.shadows.sm.offsetY).toBe(1);
  });
});
```

- [ ] **Step 6: Run test to verify it fails**

```bash
pnpm test -- src/features/theme/__tests__/use-theme.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 7: Implement useTheme hook**

Create `src/features/theme/hooks/use-theme.ts`:

```typescript
import { createContext, useContext, useCallback } from 'react';
import type { ThemeConfig } from '@/types';

interface ThemeContextValue {
  config: ThemeConfig;
  mode: 'light' | 'dark';
  setMode: (mode: 'light' | 'dark' | 'system') => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a BasekitThemeProvider');
  }

  const { config, mode, setMode } = ctx;

  const spacing = useCallback(
    (n: number) => n * config.spacing.unit,
    [config.spacing.unit],
  );

  return {
    colors: {
      primary: config.colors.primary,
      secondary: config.colors.secondary,
      accent: config.colors.accent,
      neutral: config.colors.neutral,
      semantic: config.colors.semantic,
      surface: config.colors.surface[mode],
    },
    typography: config.typography,
    spacing,
    borderRadius: config.borderRadius,
    shadows: config.shadows,
    mode,
    setMode,
    isDark: mode === 'dark',
  };
}
```

- [ ] **Step 8: Run test to verify it passes**

```bash
pnpm test -- src/features/theme/__tests__/use-theme.test.ts --no-coverage
```

Expected: 4 tests PASS

- [ ] **Step 9: Commit**

```bash
git add src/features/theme/utils/ src/features/theme/hooks/ src/features/theme/__tests__/
git commit -m "feat: add Tailwind theme generator and useTheme hook"
```

---

## Task 9: Theme Feature — Provider and Integration

**Files:**
- Create: `src/features/theme/theme-provider.tsx`
- Create: `src/features/theme/index.ts`
- Modify: `src/lib/providers/app-providers.tsx`
- Modify: `tailwind.config.js`
- Modify: `src/config/starter.config.ts`

- [ ] **Step 1: Create theme provider**

Create `src/features/theme/theme-provider.tsx`:

```typescript
import React, { useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { themeConfig } from '@/config/theme.config';
import { ThemeContext } from './hooks/use-theme';
import { starterConfig } from '@/config/starter.config';

export function BasekitThemeProvider({ children }: { children: React.ReactNode }) {
  if (!starterConfig.features.theme?.enabled) {
    return <>{children}</>;
  }

  return <ThemeProviderInner>{children}</ThemeProviderInner>;
}

function ThemeProviderInner({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [modeOverride, setModeOverride] = useState<'light' | 'dark' | 'system'>('system');

  const resolvedMode: 'light' | 'dark' =
    modeOverride === 'system' ? (systemColorScheme ?? 'light') : modeOverride;

  const setMode = (mode: 'light' | 'dark' | 'system') => {
    setModeOverride(mode);
  };

  return (
    <ThemeContext.Provider value={{ config: themeConfig, mode: resolvedMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
```

- [ ] **Step 2: Create barrel export**

Create `src/features/theme/index.ts`:

```typescript
export { BasekitThemeProvider } from './theme-provider';
export { useTheme, ThemeContext } from './hooks/use-theme';
export { generateTailwindTheme } from './utils/generate-tailwind';
```

- [ ] **Step 3: Add security and theme to starter config**

Modify `src/config/starter.config.ts` — add `security` and `theme` to the `StarterConfig` interface and the default config:

Add to the `features` type:

```typescript
security: { enabled: boolean };
theme: { enabled: boolean; preset: 'minimal' | 'bold' | 'corporate' };
```

Add to the `features` value:

```typescript
security: { enabled: true },
theme: { enabled: true, preset: 'minimal' },
```

- [ ] **Step 4: Add providers to app-providers.tsx**

Modify `src/lib/providers/app-providers.tsx` — add SecurityProvider and BasekitThemeProvider imports and wrap them in the provider chain:

```typescript
import { SecurityProvider } from '@/features/security';
import { BasekitThemeProvider } from '@/features/theme';
```

Update the return JSX to add BasekitThemeProvider (order 5, outermost after ThemeProvider) and SecurityProvider (order 25, before AuthProvider):

```tsx
<ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
  <BasekitThemeProvider>
    <QueryProvider>
      <StorageProvider>
        <SecurityProvider>
          <AuthProvider>
            <AnalyticsProvider>
              <CrashReportingProvider>
                <I18nProvider>
                  <NotificationProvider>
                    {children}
                  </NotificationProvider>
                </I18nProvider>
              </CrashReportingProvider>
            </AnalyticsProvider>
          </AuthProvider>
        </SecurityProvider>
      </StorageProvider>
    </QueryProvider>
  </BasekitThemeProvider>
</ThemeProvider>
```

- [ ] **Step 5: Wire up Tailwind config**

Modify `tailwind.config.js`:

```javascript
const { generateTailwindTheme } = require('./src/features/theme/utils/generate-tailwind');
const { themeConfig } = require('./src/config/theme.config');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: generateTailwindTheme(themeConfig),
  },
  plugins: [],
};
```

Note: `tailwind.config.js` uses `require()`, so `theme.config.ts` and `generate-tailwind.ts` need to be importable via CommonJS. If this fails due to TS imports, the `generate-tailwind.ts` file may need a `.js` companion or the Tailwind config needs `ts-node` registration. Test this and adjust.

- [ ] **Step 6: Run lint and type check**

```bash
pnpm lint && pnpm typecheck
```

Fix any issues.

- [ ] **Step 7: Run all tests**

```bash
pnpm test --no-coverage
```

All existing and new tests should pass.

- [ ] **Step 8: Commit**

```bash
git add src/features/theme/theme-provider.tsx src/features/theme/index.ts src/config/starter.config.ts src/lib/providers/app-providers.tsx tailwind.config.js
git commit -m "feat: integrate theme and security providers into app"
```

---

## Task 10: Basekit Manifest

**Files:**
- Create: `basekit.manifest.json`
- Create: `.env.example`

- [ ] **Step 1: Create the manifest**

Create `basekit.manifest.json` at the project root. This is the full manifest covering ALL existing features plus the two new ones. Each feature entry maps to its files, dependencies, env vars, and provider chain position.

Reference the spec (Section 1, `basekit.manifest.json`) for the schema. The manifest must include entries for: `auth`, `analytics`, `crash-reporting`, `notifications`, `i18n`, `offline-storage`, `onboarding`, `ota-updates`, `deep-linking`, `splash-app-icon`, `forms`, `security`, `theme`.

For each feature, populate:
- `displayName`, `description`, `category`
- `providers` (with `files`, `dependencies`, `envVars` per provider)
- `sharedFiles` (files that belong to the feature regardless of provider)
- `sharedDependencies` (deps needed regardless of provider)
- `requires` (hard dependency on other features)
- `enhancedBy` (soft dependency)
- `providerChain` (component name, import path, order number)
- `routes` (route groups to strip if feature is removed)

Look at the current `src/features/` directories and `package.json` to populate accurate file paths and dependency versions.

- [ ] **Step 2: Create .env.example**

Create `.env.example`:

```bash
# API
EXPO_PUBLIC_API_URL=https://api.example.com

# Auth - AWS Amplify (Cognito)
EXPO_PUBLIC_COGNITO_USER_POOL_ID=
EXPO_PUBLIC_COGNITO_CLIENT_ID=
EXPO_PUBLIC_COGNITO_IDENTITY_POOL_ID=

# Auth - Firebase
# (Configure via google-services.json / GoogleService-Info.plist)

# Auth - Supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=

# Crash Reporting - Sentry
EXPO_PUBLIC_SENTRY_DSN=
```

- [ ] **Step 3: Commit**

```bash
git add basekit.manifest.json .env.example
git commit -m "feat: add basekit manifest and env example"
```

---

## Task 11: Setup Wizard — Utility Functions

**Files:**
- Create: `setup/utils.ts`
- Create: `setup/__tests__/utils.test.ts`

- [ ] **Step 1: Write failing tests**

Create `setup/__tests__/utils.test.ts`:

```typescript
import { removeFeatureFiles, cleanPackageJson, updateEnvExample } from '../utils';
import fs from 'fs-extra';
import path from 'path';
import os from 'os';

describe('removeFeatureFiles', () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'basekit-test-'));
    // Create mock feature directories
    await fs.ensureDir(path.join(tmpDir, 'src/features/auth/providers'));
    await fs.writeFile(path.join(tmpDir, 'src/features/auth/index.ts'), 'export {}');
    await fs.ensureDir(path.join(tmpDir, 'src/features/analytics'));
    await fs.writeFile(path.join(tmpDir, 'src/features/analytics/index.ts'), 'export {}');
  });

  afterEach(async () => {
    await fs.remove(tmpDir);
  });

  it('should delete feature directory', async () => {
    await removeFeatureFiles(tmpDir, ['src/features/analytics/']);

    expect(await fs.pathExists(path.join(tmpDir, 'src/features/analytics'))).toBe(false);
    expect(await fs.pathExists(path.join(tmpDir, 'src/features/auth'))).toBe(true);
  });

  it('should delete specific files', async () => {
    await removeFeatureFiles(tmpDir, ['src/features/auth/index.ts']);

    expect(await fs.pathExists(path.join(tmpDir, 'src/features/auth/index.ts'))).toBe(false);
    expect(await fs.pathExists(path.join(tmpDir, 'src/features/auth/providers'))).toBe(true);
  });
});

describe('cleanPackageJson', () => {
  it('should remove specified dependencies', () => {
    const pkg = {
      dependencies: {
        react: '19.0.0',
        'aws-amplify': '^6.0.0',
        axios: '^1.0.0',
      },
      devDependencies: {
        typescript: '^5.0.0',
        '@clack/prompts': '^0.1.0',
      },
    };

    const result = cleanPackageJson(pkg, ['aws-amplify'], ['@clack/prompts']);

    expect(result.dependencies['aws-amplify']).toBeUndefined();
    expect(result.dependencies['react']).toBe('19.0.0');
    expect(result.devDependencies['@clack/prompts']).toBeUndefined();
    expect(result.devDependencies['typescript']).toBe('^5.0.0');
  });
});

describe('updateEnvExample', () => {
  it('should keep only specified env vars', () => {
    const content = `# API
EXPO_PUBLIC_API_URL=https://api.example.com

# Auth - AWS Amplify
EXPO_PUBLIC_COGNITO_USER_POOL_ID=
EXPO_PUBLIC_COGNITO_CLIENT_ID=

# Auth - Supabase
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
`;

    const result = updateEnvExample(content, [
      'EXPO_PUBLIC_API_URL',
      'EXPO_PUBLIC_SUPABASE_URL',
      'EXPO_PUBLIC_SUPABASE_ANON_KEY',
    ]);

    expect(result).toContain('EXPO_PUBLIC_API_URL');
    expect(result).toContain('EXPO_PUBLIC_SUPABASE_URL');
    expect(result).not.toContain('EXPO_PUBLIC_COGNITO');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- setup/__tests__/utils.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Implement utils**

Create `setup/utils.ts`:

```typescript
import fs from 'fs-extra';
import path from 'path';

export async function removeFeatureFiles(projectRoot: string, filePaths: string[]): Promise<void> {
  for (const filePath of filePaths) {
    const fullPath = path.join(projectRoot, filePath);
    if (await fs.pathExists(fullPath)) {
      await fs.remove(fullPath);
    }
  }
}

export function cleanPackageJson(
  pkg: Record<string, unknown>,
  depsToRemove: string[],
  devDepsToRemove: string[],
): Record<string, unknown> {
  const deps = { ...(pkg.dependencies as Record<string, string> | undefined) };
  const devDeps = { ...(pkg.devDependencies as Record<string, string> | undefined) };

  for (const dep of depsToRemove) {
    delete deps[dep];
  }
  for (const dep of devDepsToRemove) {
    delete devDeps[dep];
  }

  return { ...pkg, dependencies: deps, devDependencies: devDeps };
}

export function updateEnvExample(content: string, keepVars: string[]): string {
  const lines = content.split('\n');
  const result: string[] = [];
  let lastLineWasKept = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Keep empty lines only if the previous kept line was content
    if (trimmed === '') {
      if (lastLineWasKept) {
        result.push(line);
      }
      continue;
    }

    // Keep comment lines if the next non-empty, non-comment line is a kept var
    if (trimmed.startsWith('#')) {
      result.push(line);
      lastLineWasKept = true;
      continue;
    }

    // Check if this env var line should be kept
    const varName = trimmed.split('=')[0];
    if (keepVars.includes(varName)) {
      result.push(line);
      lastLineWasKept = true;
    } else {
      // Remove the preceding comment if we're removing this var
      while (result.length > 0 && result[result.length - 1].trim().startsWith('#')) {
        result.pop();
      }
      // Remove trailing empty line
      while (result.length > 0 && result[result.length - 1].trim() === '') {
        result.pop();
      }
      lastLineWasKept = false;
    }
  }

  return result.join('\n').trim() + '\n';
}

export async function updateAppJson(
  projectRoot: string,
  appName: string,
  bundleId: string,
  scheme: string,
): Promise<void> {
  const appJsonPath = path.join(projectRoot, 'app.json');
  const appJson = await fs.readJson(appJsonPath);

  appJson.expo.name = appName;
  appJson.expo.slug = appName.toLowerCase().replace(/\s+/g, '-');
  appJson.expo.scheme = scheme;

  if (appJson.expo.ios) {
    appJson.expo.ios.bundleIdentifier = bundleId;
  } else {
    appJson.expo.ios = { bundleIdentifier: bundleId };
  }

  if (appJson.expo.android) {
    appJson.expo.android.package = bundleId;
  } else {
    appJson.expo.android = { package: bundleId };
  }

  await fs.writeJson(appJsonPath, appJson, { spaces: 2 });
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- setup/__tests__/utils.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add setup/utils.ts setup/__tests__/utils.test.ts
git commit -m "feat: add setup utility functions for file ops and config cleaning"
```

---

## Task 12: Setup Wizard — Provider Chain Rewriter

**Files:**
- Create: `setup/providers.ts`
- Create: `setup/__tests__/providers.test.ts`

- [ ] **Step 1: Write failing test**

Create `setup/__tests__/providers.test.ts`:

```typescript
import { generateAppProviders } from '../providers';

describe('generateAppProviders', () => {
  it('should generate provider chain with selected features', () => {
    const features = [
      { component: 'AuthProvider', importPath: '@/features/auth', order: 30 },
      { component: 'BasekitThemeProvider', importPath: '@/features/theme', order: 5 },
      { component: 'StorageProvider', importPath: '@/features/offline-storage', order: 20 },
    ];

    const result = generateAppProviders(features, true);

    // Should import all providers
    expect(result).toContain("import { AuthProvider } from '@/features/auth'");
    expect(result).toContain("import { BasekitThemeProvider } from '@/features/theme'");
    expect(result).toContain("import { StorageProvider } from '@/features/offline-storage'");

    // Should nest in order (lowest order = outermost)
    const themeIdx = result.indexOf('BasekitThemeProvider');
    const storageIdx = result.indexOf('StorageProvider');
    const authIdx = result.indexOf('AuthProvider');
    expect(themeIdx).toBeLessThan(storageIdx);
    expect(storageIdx).toBeLessThan(authIdx);
  });

  it('should generate minimal chain with no features', () => {
    const result = generateAppProviders([], false);

    expect(result).toContain('ThemeProvider');
    expect(result).toContain('QueryProvider');
    expect(result).not.toContain('AuthProvider');
    expect(result).not.toContain('configureAmplify');
  });

  it('should include Amplify config when amplify features present', () => {
    const features = [
      { component: 'AuthProvider', importPath: '@/features/auth', order: 30 },
    ];

    const result = generateAppProviders(features, true);

    expect(result).toContain('configureAmplify');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- setup/__tests__/providers.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Implement provider chain generator**

Create `setup/providers.ts`:

```typescript
interface ProviderEntry {
  component: string;
  importPath: string;
  order: number;
}

export function generateAppProviders(features: ProviderEntry[], needsAmplify: boolean): string {
  const sorted = [...features].sort((a, b) => a.order - b.order);

  const imports = [
    "import React, { useEffect } from 'react';",
    "import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';",
    "import { QueryProvider } from '@/lib/api';",
    "import { useColorScheme } from '@/hooks/use-color-scheme';",
  ];

  if (needsAmplify) {
    imports.push("import { configureAmplify } from '@/lib/amplify/configure';");
  }

  for (const entry of sorted) {
    imports.push(`import { ${entry.component} } from '${entry.importPath}';`);
  }

  // Build nested JSX
  const indent = '      ';
  let childrenJsx = `${indent}{children}`;

  for (const entry of [...sorted].reverse()) {
    const openTag = `${indent}<${entry.component}>`;
    const closeTag = `${indent}</${entry.component}>`;
    childrenJsx = `${openTag}\n${childrenJsx}\n${closeTag}`;
  }

  const amplifyEffect = needsAmplify
    ? `
  useEffect(() => {
    configureAmplify();
  }, []);
`
    : '';

  return `${imports.join('\n')}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();
${amplifyEffect}
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryProvider>
${childrenJsx}
      </QueryProvider>
    </ThemeProvider>
  );
}
`;
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- setup/__tests__/providers.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add setup/providers.ts setup/__tests__/providers.test.ts
git commit -m "feat: add provider chain rewriter for setup wizard"
```

---

## Task 13: Setup Wizard — Generator (Core Strip Logic)

**Files:**
- Create: `setup/generator.ts`
- Create: `setup/__tests__/generator.test.ts`

- [ ] **Step 1: Write failing test**

Create `setup/__tests__/generator.test.ts`:

```typescript
import { resolveFeaturesToStrip, collectDepsToRemove, collectEnvVarsToKeep } from '../generator';

// Minimal manifest for testing
const testManifest = {
  features: {
    auth: {
      displayName: 'Authentication',
      description: 'Auth',
      category: 'auth',
      providers: {
        amplify: {
          files: ['src/features/auth/providers/amplify.ts'],
          dependencies: { 'aws-amplify': '^6.0.0' },
          envVars: { required: ['EXPO_PUBLIC_COGNITO_USER_POOL_ID'], optional: [] },
        },
        firebase: {
          files: ['src/features/auth/providers/firebase.ts'],
          dependencies: { '@react-native-firebase/auth': '^21.0.0' },
          envVars: { required: [], optional: [] },
        },
      },
      sharedFiles: ['src/features/auth/'],
      sharedDependencies: {},
      requires: [],
      enhancedBy: ['security'],
      providerChain: { component: 'AuthProvider', import: '@/features/auth', order: 30 },
      routes: ['src/app/(auth)/'],
    },
    analytics: {
      displayName: 'Analytics',
      description: 'Analytics',
      category: 'analytics',
      providers: {
        amplify: {
          files: ['src/features/analytics/providers/amplify.ts'],
          dependencies: {},
          envVars: { required: [], optional: [] },
        },
      },
      sharedFiles: ['src/features/analytics/'],
      sharedDependencies: {},
      requires: [],
      enhancedBy: [],
      providerChain: { component: 'AnalyticsProvider', import: '@/features/analytics', order: 40 },
      routes: [],
    },
  },
  categories: {
    auth: { exclusive: true, label: 'Authentication' },
    analytics: { exclusive: true, label: 'Analytics' },
  },
};

describe('resolveFeaturesToStrip', () => {
  it('should return features not in selection', () => {
    const selected = { auth: 'firebase' };
    const result = resolveFeaturesToStrip(testManifest, selected);

    expect(result.featuresToRemove).toContain('analytics');
    expect(result.featuresToRemove).not.toContain('auth');
  });

  it('should identify provider files to remove', () => {
    const selected = { auth: 'firebase' };
    const result = resolveFeaturesToStrip(testManifest, selected);

    expect(result.providerFilesToRemove).toContain('src/features/auth/providers/amplify.ts');
    expect(result.providerFilesToRemove).not.toContain('src/features/auth/providers/firebase.ts');
  });
});

describe('collectDepsToRemove', () => {
  it('should collect deps from removed features', () => {
    const result = collectDepsToRemove(testManifest, ['analytics'], {});

    // Analytics amplify deps should be in the remove list
    expect(result).toEqual(expect.arrayContaining([]));
  });

  it('should collect deps from removed providers', () => {
    const removedProviderDeps = { 'aws-amplify': true };
    const result = collectDepsToRemove(testManifest, [], removedProviderDeps);

    expect(result).toContain('aws-amplify');
  });
});

describe('collectEnvVarsToKeep', () => {
  it('should keep env vars for selected features and providers', () => {
    const selected = { auth: 'amplify' };
    const result = collectEnvVarsToKeep(testManifest, selected);

    expect(result).toContain('EXPO_PUBLIC_COGNITO_USER_POOL_ID');
  });

  it('should not keep env vars for removed providers', () => {
    const selected = { auth: 'firebase' };
    const result = collectEnvVarsToKeep(testManifest, selected);

    expect(result).not.toContain('EXPO_PUBLIC_COGNITO_USER_POOL_ID');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

```bash
pnpm test -- setup/__tests__/generator.test.ts --no-coverage
```

Expected: FAIL

- [ ] **Step 3: Implement generator**

Create `setup/generator.ts`:

```typescript
interface ManifestProvider {
  files: string[];
  dependencies: Record<string, string>;
  envVars: { required: string[]; optional: string[] };
}

interface ManifestFeature {
  displayName: string;
  description: string;
  category: string;
  providers: Record<string, ManifestProvider>;
  sharedFiles: string[];
  sharedDependencies: Record<string, string>;
  requires: string[];
  enhancedBy: string[];
  providerChain: { component: string; import: string; order: number };
  routes: string[];
}

interface Manifest {
  features: Record<string, ManifestFeature>;
  categories: Record<string, { exclusive: boolean; label: string }>;
}

interface StripResult {
  featuresToRemove: string[];
  providerFilesToRemove: string[];
  routesToRemove: string[];
  filesToRemove: string[];
}

export function resolveFeaturesToStrip(
  manifest: Manifest,
  selectedFeatures: Record<string, string>,
): StripResult {
  const featuresToRemove: string[] = [];
  const providerFilesToRemove: string[] = [];
  const routesToRemove: string[] = [];
  const filesToRemove: string[] = [];

  for (const [featureName, feature] of Object.entries(manifest.features)) {
    if (!(featureName in selectedFeatures)) {
      // Feature not selected — remove entirely
      featuresToRemove.push(featureName);
      filesToRemove.push(...feature.sharedFiles);
      routesToRemove.push(...feature.routes);

      // Also remove all provider files
      for (const provider of Object.values(feature.providers)) {
        filesToRemove.push(...provider.files);
      }
    } else {
      // Feature selected — remove unselected providers
      const selectedProvider = selectedFeatures[featureName];
      for (const [providerName, provider] of Object.entries(feature.providers)) {
        if (providerName !== selectedProvider) {
          providerFilesToRemove.push(...provider.files);
        }
      }
    }
  }

  return { featuresToRemove, providerFilesToRemove, routesToRemove, filesToRemove };
}

export function collectDepsToRemove(
  manifest: Manifest,
  removedFeatures: string[],
  removedProviderDeps: Record<string, boolean>,
): string[] {
  const depsToRemove: string[] = [];

  for (const featureName of removedFeatures) {
    const feature = manifest.features[featureName];
    if (!feature) continue;

    // Collect shared deps
    depsToRemove.push(...Object.keys(feature.sharedDependencies));

    // Collect all provider deps
    for (const provider of Object.values(feature.providers)) {
      depsToRemove.push(...Object.keys(provider.dependencies));
    }
  }

  // Add explicitly removed provider deps
  depsToRemove.push(...Object.keys(removedProviderDeps));

  return [...new Set(depsToRemove)];
}

export function collectEnvVarsToKeep(
  manifest: Manifest,
  selectedFeatures: Record<string, string>,
): string[] {
  const envVars: string[] = ['EXPO_PUBLIC_API_URL'];

  for (const [featureName, selectedProvider] of Object.entries(selectedFeatures)) {
    const feature = manifest.features[featureName];
    if (!feature) continue;

    const provider = feature.providers[selectedProvider];
    if (provider) {
      envVars.push(...provider.envVars.required, ...provider.envVars.optional);
    }
  }

  return [...new Set(envVars)];
}
```

- [ ] **Step 4: Run test to verify it passes**

```bash
pnpm test -- setup/__tests__/generator.test.ts --no-coverage
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add setup/generator.ts setup/__tests__/generator.test.ts
git commit -m "feat: add setup generator with feature strip/keep logic"
```

---

## Task 14: Setup Wizard — Prompts

**Files:**
- Create: `setup/prompts.ts`

- [ ] **Step 1: Create interactive prompts**

Create `setup/prompts.ts`:

```typescript
import * as p from '@clack/prompts';
import color from 'picocolors';
import type { Manifest } from './generator';

interface SetupAnswers {
  appName: string;
  bundleId: string;
  scheme: string;
  theme: string | null;
  backend: string | null;
  features: Record<string, string>;
}

export async function runInteractivePrompts(manifest: Manifest): Promise<SetupAnswers> {
  p.intro(color.bgCyan(color.black(' Welcome to Basekit! Let\'s configure your app. ')));

  const appInfo = await p.group({
    appName: () =>
      p.text({
        message: 'App name',
        placeholder: 'my-app',
        validate: (v) => (v.length === 0 ? 'App name is required' : undefined),
      }),
    bundleId: () =>
      p.text({
        message: 'Bundle ID',
        placeholder: 'com.mycompany.myapp',
        validate: (v) => (v.length === 0 ? 'Bundle ID is required' : undefined),
      }),
    scheme: () =>
      p.text({
        message: 'URL scheme (for deep linking)',
        placeholder: 'myapp',
        validate: (v) => (v.length === 0 ? 'Scheme is required' : undefined),
      }),
  });

  if (p.isCancel(appInfo)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  const theme = await p.select({
    message: 'Choose a theme preset',
    options: [
      { value: 'minimal', label: 'Minimal', hint: 'Clean, subtle, lots of white space' },
      { value: 'bold', label: 'Bold', hint: 'Vibrant, high contrast, startup feel' },
      { value: 'corporate', label: 'Corporate', hint: 'Professional, muted, enterprise-safe' },
      { value: 'none', label: 'None', hint: 'Use basic theme constants' },
    ],
  });

  if (p.isCancel(theme)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  const backend = await p.select({
    message: 'Choose a backend provider',
    options: [
      { value: 'none', label: 'None', hint: "I'll add one later" },
      { value: 'amplify', label: 'AWS Amplify', hint: 'Cognito, Analytics, Push' },
      { value: 'firebase', label: 'Firebase', hint: 'Auth, Firestore, Crashlytics, FCM' },
      { value: 'supabase', label: 'Supabase', hint: 'Auth, Postgres, Realtime' },
      { value: 'custom', label: 'Custom', hint: 'REST/GraphQL with JWT auth' },
    ],
  });

  if (p.isCancel(backend)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  // Build feature options from manifest
  const featureOptions = Object.entries(manifest.features)
    .filter(([name]) => name !== 'theme') // Theme is handled separately
    .map(([name, feature]) => ({
      value: name,
      label: feature.displayName,
      hint: feature.description,
    }));

  const selectedFeatureNames = await p.multiselect({
    message: 'Select features (space to toggle)',
    options: featureOptions,
    required: false,
  });

  if (p.isCancel(selectedFeatureNames)) {
    p.cancel('Setup cancelled.');
    process.exit(0);
  }

  // Map selected features to their provider (based on backend choice)
  const features: Record<string, string> = {};
  for (const name of selectedFeatureNames as string[]) {
    const feature = manifest.features[name];
    const providerNames = Object.keys(feature.providers);

    if (providerNames.length === 0) {
      // Feature has no providers (e.g., forms, onboarding)
      features[name] = '';
    } else if (providerNames.length === 1) {
      features[name] = providerNames[0];
    } else if (backend !== 'none' && providerNames.includes(backend as string)) {
      features[name] = backend as string;
    } else {
      // Ask which provider to use
      const providerChoice = await p.select({
        message: `Choose provider for ${feature.displayName}`,
        options: providerNames.map((pn) => ({ value: pn, label: pn })),
      });
      if (p.isCancel(providerChoice)) {
        p.cancel('Setup cancelled.');
        process.exit(0);
      }
      features[name] = providerChoice as string;
    }
  }

  // Add theme if selected
  if (theme !== 'none') {
    features['theme'] = theme as string;
  }

  return {
    appName: appInfo.appName,
    bundleId: appInfo.bundleId,
    scheme: appInfo.scheme,
    theme: theme === 'none' ? null : (theme as string),
    backend: backend === 'none' ? null : (backend as string),
    features,
  };
}

export function getQuickDefaults(): SetupAnswers {
  return {
    appName: 'my-app',
    bundleId: 'com.mycompany.myapp',
    scheme: 'myapp',
    theme: 'minimal',
    backend: null,
    features: {
      'offline-storage': 'mmkv',
      i18n: '',
      forms: '',
      theme: 'minimal',
    },
  };
}
```

- [ ] **Step 2: Commit**

```bash
git add setup/prompts.ts
git commit -m "feat: add setup wizard interactive prompts"
```

---

## Task 15: Setup Wizard — Entry Point (Orchestration)

**Files:**
- Create: `setup/index.ts`

- [ ] **Step 1: Create entry point**

Create `setup/index.ts`:

```typescript
import fs from 'fs-extra';
import path from 'path';
import { execa } from 'execa';
import * as p from '@clack/prompts';
import color from 'picocolors';
import YAML from 'yaml';
import { runInteractivePrompts, getQuickDefaults } from './prompts';
import { resolveFeaturesToStrip, collectDepsToRemove, collectEnvVarsToKeep } from './generator';
import { generateAppProviders } from './providers';
import { removeFeatureFiles, cleanPackageJson, updateEnvExample, updateAppJson } from './utils';

const PROJECT_ROOT = path.resolve(__dirname, '..');

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isQuick = args.includes('--quick');
  const fromIndex = args.indexOf('--from');
  const fromFile = fromIndex !== -1 ? args[fromIndex + 1] : null;

  // Load manifest
  const manifestPath = path.join(PROJECT_ROOT, 'basekit.manifest.json');
  const manifest = await fs.readJson(manifestPath);

  // Get user choices
  let answers;
  if (isQuick) {
    answers = getQuickDefaults();
    p.intro(color.bgCyan(color.black(' Basekit — Quick Setup ')));
  } else if (fromFile) {
    const configContent = await fs.readFile(fromFile, 'utf-8');
    const config = YAML.parse(configContent);
    answers = {
      appName: config.app.name,
      bundleId: config.app.bundleId,
      scheme: config.app.scheme,
      theme: config.theme ?? null,
      backend: config.backend ?? null,
      features: {} as Record<string, string>,
    };
    for (const feat of config.features ?? []) {
      const feature = manifest.features[feat];
      if (!feature) continue;
      const providerNames = Object.keys(feature.providers);
      if (providerNames.length === 0) {
        answers.features[feat] = '';
      } else if (config.backend && providerNames.includes(config.backend)) {
        answers.features[feat] = config.backend;
      } else {
        answers.features[feat] = providerNames[0];
      }
    }
    if (answers.theme) {
      answers.features['theme'] = answers.theme;
    }
    p.intro(color.bgCyan(color.black(` Basekit — Config: ${fromFile} `)));
  } else {
    answers = await runInteractivePrompts(manifest);
  }

  // Resolve what to strip
  const { featuresToRemove, providerFilesToRemove, routesToRemove, filesToRemove } =
    resolveFeaturesToStrip(manifest, answers.features);

  // Collect deps to remove
  const removedProviderDeps: Record<string, boolean> = {};
  for (const featureName of Object.keys(answers.features)) {
    const feature = manifest.features[featureName];
    if (!feature) continue;
    const selectedProvider = answers.features[featureName];
    for (const [provName, prov] of Object.entries(feature.providers)) {
      if (provName !== selectedProvider) {
        for (const dep of Object.keys(prov.dependencies)) {
          removedProviderDeps[dep] = true;
        }
      }
    }
  }
  const depsToRemove = collectDepsToRemove(manifest, featuresToRemove, removedProviderDeps);
  const envVarsToKeep = collectEnvVarsToKeep(manifest, answers.features);

  // Determine if Amplify is needed
  const needsAmplify = Object.values(answers.features).some((p) => p === 'amplify');

  // Build provider chain entries for selected features
  const providerChainEntries = Object.keys(answers.features)
    .map((featureName) => manifest.features[featureName]?.providerChain)
    .filter((entry): entry is { component: string; import: string; order: number } => !!entry);

  if (isDryRun) {
    p.note(
      [
        `Features to remove: ${featuresToRemove.join(', ') || 'none'}`,
        `Provider files to remove: ${providerFilesToRemove.length}`,
        `Routes to remove: ${routesToRemove.join(', ') || 'none'}`,
        `Dependencies to remove: ${depsToRemove.length}`,
        `Env vars to keep: ${envVarsToKeep.join(', ')}`,
      ].join('\n'),
      'Dry Run Summary',
    );
    p.outro('No files were modified.');
    return;
  }

  const s = p.spinner();

  // Step 1: Update app.json
  s.start('Updating app.json');
  await updateAppJson(PROJECT_ROOT, answers.appName, answers.bundleId, answers.scheme);
  s.stop(color.green('✔ Updated app.json'));

  // Step 2: Strip feature files
  s.start('Removing unselected features');
  await removeFeatureFiles(PROJECT_ROOT, [...filesToRemove, ...providerFilesToRemove, ...routesToRemove]);
  s.stop(color.green(`✔ Removed ${featuresToRemove.length} features`));

  // Step 3: Rewrite app-providers.tsx
  s.start('Rewriting app-providers.tsx');
  const providersContent = generateAppProviders(
    providerChainEntries.map((e) => ({
      component: e.component,
      importPath: e.import,
      order: e.order,
    })),
    needsAmplify,
  );
  await fs.writeFile(
    path.join(PROJECT_ROOT, 'src/lib/providers/app-providers.tsx'),
    providersContent,
  );
  s.stop(color.green('✔ Rewrote app-providers.tsx'));

  // Step 4: Rewrite basekit.config.ts
  s.start('Updating config');
  const configContent = generateBasekitConfig(answers);
  await fs.writeFile(
    path.join(PROJECT_ROOT, 'src/config/starter.config.ts'),
    configContent,
  );
  s.stop(color.green('✔ Updated config'));

  // Step 5: Clean package.json
  s.start('Cleaning package.json');
  const setupDevDeps = ['@clack/prompts', 'fs-extra', '@types/fs-extra', 'yaml', 'execa', 'picocolors', 'tsx'];
  const pkgPath = path.join(PROJECT_ROOT, 'package.json');
  const pkg = await fs.readJson(pkgPath);
  const cleanedPkg = cleanPackageJson(pkg, depsToRemove, setupDevDeps);
  // Remove setup script
  if (cleanedPkg.scripts && typeof cleanedPkg.scripts === 'object') {
    delete (cleanedPkg.scripts as Record<string, string>)['setup'];
  }
  await fs.writeJson(pkgPath, cleanedPkg, { spaces: 2 });
  s.stop(color.green('✔ Cleaned package.json'));

  // Step 6: Update .env.example
  s.start('Updating .env.example');
  const envPath = path.join(PROJECT_ROOT, '.env.example');
  if (await fs.pathExists(envPath)) {
    const envContent = await fs.readFile(envPath, 'utf-8');
    const updatedEnv = updateEnvExample(envContent, envVarsToKeep);
    await fs.writeFile(envPath, updatedEnv);
  }
  s.stop(color.green('✔ Updated .env.example'));

  // Step 7: Handle theme
  if (!answers.theme) {
    // Remove theme feature entirely and revert tailwind.config.js
    s.start('Removing theme feature');
    await removeFeatureFiles(PROJECT_ROOT, ['src/features/theme/', 'src/config/theme.config.ts']);
    const basicTailwind = `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
};
`;
    await fs.writeFile(path.join(PROJECT_ROOT, 'tailwind.config.js'), basicTailwind);
    s.stop(color.green('✔ Removed theme feature'));
  }

  // Step 8: pnpm install
  s.start('Installing dependencies');
  await execa('pnpm', ['install'], { cwd: PROJECT_ROOT });
  s.stop(color.green('✔ Installed dependencies'));

  // Step 9: Self-destruct
  s.start('Cleaning up setup files');
  await removeFeatureFiles(PROJECT_ROOT, ['setup/', 'basekit.manifest.json']);
  s.stop(color.green('✔ Removed setup files'));

  // Step 10: Git commit
  s.start('Creating initial commit');
  await execa('git', ['add', '-A'], { cwd: PROJECT_ROOT });
  await execa('git', ['commit', '-m', 'Initial project setup via Basekit'], { cwd: PROJECT_ROOT });
  s.stop(color.green('✔ Created initial commit'));

  p.outro(color.green(`Done! cd ${answers.appName} && pnpm start`));
}

function generateBasekitConfig(answers: {
  appName: string;
  bundleId: string;
  scheme: string;
  features: Record<string, string>;
}): string {
  const featureEntries = Object.entries(answers.features)
    .map(([name, provider]) => {
      const camelName = name.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
      if (provider) {
        return `    ${camelName}: { enabled: true, provider: '${provider}' },`;
      }
      return `    ${camelName}: { enabled: true },`;
    })
    .join('\n');

  return `export const starterConfig = {
  app: {
    name: '${answers.appName}',
    bundleId: '${answers.bundleId}',
    scheme: '${answers.scheme}',
  },

  features: {
${featureEntries}
  },

  api: {
    baseUrl: process.env.EXPO_PUBLIC_API_URL,
    timeout: 30000,
  },
};
`;
}

main().catch((err) => {
  console.error('Setup failed:', err);
  process.exit(1);
});
```

- [ ] **Step 2: Commit**

```bash
git add setup/index.ts
git commit -m "feat: add setup wizard entry point with full orchestration"
```

---

## Task 16: Integration Test and Final Verification

**Files:**
- All files from previous tasks

- [ ] **Step 1: Run lint**

```bash
pnpm lint
```

Fix any issues.

- [ ] **Step 2: Run type check**

```bash
pnpm typecheck
```

Fix any type errors.

- [ ] **Step 3: Run all tests**

```bash
pnpm test --no-coverage
```

All tests should pass.

- [ ] **Step 4: Test the setup wizard dry-run**

```bash
pnpm setup -- --dry-run --quick
```

Should print a summary of what would be stripped without modifying files.

- [ ] **Step 5: Verify the project still builds**

```bash
pnpm start --web
```

App should start without errors. Kill the server after verifying.

- [ ] **Step 6: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "fix: address lint, type, and integration issues"
```

---

## Summary

| Task | Description | Estimated Steps |
|------|-------------|-----------------|
| 1 | Branch setup + dependencies | 5 |
| 2 | Security types | 3 |
| 3 | Biometrics hook (TDD) | 5 |
| 4 | Secure storage hook (TDD) | 5 |
| 5 | App lock hook (TDD) | 5 |
| 6 | Security provider, SSL config, barrel | 5 |
| 7 | Theme types + presets + config | 7 |
| 8 | Tailwind generator + useTheme hook (TDD) | 9 |
| 9 | Theme provider + integration | 8 |
| 10 | Basekit manifest + .env.example | 3 |
| 11 | Setup utils (TDD) | 5 |
| 12 | Provider chain rewriter (TDD) | 5 |
| 13 | Generator / strip logic (TDD) | 5 |
| 14 | Setup prompts | 2 |
| 15 | Setup entry point | 2 |
| 16 | Integration test + verification | 6 |
| **Total** | | **90 steps** |

---

## Addendum: Review Fixes

The following corrections apply to the tasks above. Implementers MUST apply these before starting each task.

### A1: Rename `starter.config.ts` to `basekit.config.ts` (applies to Task 1)

Add a step to Task 1 after Step 3:

```bash
git mv src/config/starter.config.ts src/config/basekit.config.ts
```

Then run a find-and-replace across the entire `src/` directory:

- Replace all `from '@/config/starter.config'` with `from '@/config/basekit.config'`
- Replace all `starterConfig` with `basekitConfig`

This affects: `create-auth-service.ts`, `auth-provider.tsx`, `analytics-provider.tsx`, `crash-reporting-provider.tsx`, `notification-provider.tsx`, `i18n-provider.tsx`, `storage-provider.tsx`, `create-analytics-service.ts`, `create-crash-reporting-service.ts`, `create-notification-service.ts`, `create-storage-service.ts`, and any other file importing from `starter.config`.

Update all code in Tasks 6 and 9 to use `basekitConfig` instead of `starterConfig`.

### A2: Tailwind config cannot `require()` TypeScript (applies to Task 9, Step 5)

Use `jiti` (which NativeWind already uses internally) to load TS files from `tailwind.config.js`:

```javascript
const { createJiti } = require("jiti");
const jiti = createJiti(__filename);

const { generateTailwindTheme } = jiti("./src/features/theme/utils/generate-tailwind");
const { themeConfig } = jiti("./src/config/theme.config");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: generateTailwindTheme(themeConfig),
  },
  plugins: [],
};
```

Add `jiti` as a devDependency in Task 1: `pnpm add -D jiti`

### A3: Feature dependency validation (applies to Task 14)

Add a `validateDependencies` function to `setup/prompts.ts` that runs after feature selection:

```typescript
export function validateDependencies(
  manifest: Manifest,
  selected: Record<string, string>,
): { valid: boolean; missing: Array<{ feature: string; requires: string }> } {
  const missing: Array<{ feature: string; requires: string }> = [];

  for (const featureName of Object.keys(selected)) {
    const feature = manifest.features[featureName];
    if (!feature) continue;
    for (const req of feature.requires) {
      if (!(req in selected)) {
        missing.push({ feature: featureName, requires: req });
      }
    }
  }

  return { valid: missing.length === 0, missing };
}
```

Call this after the multiselect in `runInteractivePrompts`. For each missing dependency, prompt:

```typescript
const { missing } = validateDependencies(manifest, features);
for (const { feature, requires } of missing) {
  const addIt = await p.confirm({
    message: `${manifest.features[feature].displayName} requires ${manifest.features[requires].displayName}. Add it?`,
  });
  if (addIt) {
    // Add the required feature with its default provider
    features[requires] = Object.keys(manifest.features[requires].providers)[0] ?? '';
  } else {
    delete features[feature];
  }
}
```

### A4: Type ordering fix (applies to Tasks 2 and 6)

Move the `StarterConfig` type update (adding `security` and `theme` fields) from Task 9 to **Task 2**. This prevents TypeScript errors in Tasks 6 and 9.

In Task 2, after creating security types, also modify `src/config/basekit.config.ts`:
- Add `security: { enabled: boolean }` and `theme: { enabled: boolean; preset: string }` to the interface
- Add `security: { enabled: true }` and `theme: { enabled: true, preset: 'minimal' }` to the default values

### A5: `execa` ESM compatibility (applies to Task 1)

Install `execa` v5 (last CommonJS version) instead of v6+:

```bash
pnpm add -D execa@5
```

This avoids ESM-only issues with Jest. The API is the same for the usage in the plan.

### A6: Task 10 manifest must be complete

Task 10 must contain the full `basekit.manifest.json` with entries for all 13 features. The implementer should generate this by reading every `src/features/*/` directory and mapping:
- `sharedFiles`: all files in the feature directory except `providers/`
- `providers`: each file in `providers/` with its corresponding deps from `package.json`
- `sharedDependencies`: deps shared across all providers
- `providerChain`: read from the current `app-providers.tsx` ordering
- `routes`: check `src/app/` for route groups belonging to each feature
- `envVars`: read from the spec and current `.env` references

This is a data-entry task, not a code task. The implementer should verify each entry against the codebase.
