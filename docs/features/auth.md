# Authentication

## Overview

The auth feature provides a complete authentication flow with sign-in, sign-up, password reset, and session management. It follows the starter kit's service-interface pattern with a swappable provider, feature toggle, and no-op fallback.

When `auth.enabled` is `false` in `starter.config.ts`, the entire feature becomes a passthrough -- no provider is loaded, hooks return safe defaults, and auth screens redirect to `(tabs)`.

## Default Implementation

**AWS Amplify Cognito** is the default provider. It uses Amplify v6 (`aws-amplify/auth`) and connects to an Amazon Cognito User Pool.

Capabilities:
- Email/password sign-in and sign-up
- Password reset with verification code
- Session management with JWT access tokens
- Auth state change listener (via Amplify Hub)
- Automatic API client token injection

## Configuration

### starter.config.ts

```ts
features: {
  auth: { enabled: true, provider: 'amplify' },
}
```

### Environment Variables

Create a `.env` file (or set in your CI/CD):

```bash
EXPO_PUBLIC_COGNITO_USER_POOL_ID=us-east-1_XXXXXXXXX
EXPO_PUBLIC_COGNITO_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
EXPO_PUBLIC_COGNITO_IDENTITY_POOL_ID=us-east-1:xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx  # optional
```

Amplify is configured lazily in `AppProviders` via `configureAmplify()`. If the env vars are missing, a warning is logged but the app does not crash.

## Usage

### Hooks

```tsx
import { useAuth, useCurrentUser, useSession } from '@/features/auth';

// Full auth context
const { user, isLoading, signIn, signUp, signOut, resetPassword, confirmResetPassword } = useAuth();

// Just user data
const { user, isLoading } = useCurrentUser();

// Session / tokens
const { session, isLoading, refresh } = useSession();
```

### Auth Screens

Four screens are provided under `src/app/(auth)/`:

| Route | Description |
| --- | --- |
| `/(auth)/login` | Email + password sign-in |
| `/(auth)/register` | Email + password sign-up |
| `/(auth)/forgot-password` | Request password reset code |
| `/(auth)/verify-code` | Enter code + new password |

All screens use `FormInput` with Zod validation via `useAppForm`.

### Protecting Routes

The auth provider automatically injects the access token into the API client via `setAuthTokenGetter`. To guard routes, check `useAuth().user` in your layout:

```tsx
const { user, isLoading } = useAuth();

if (isLoading) return <LoadingScreen />;
if (!user) return <Redirect href="/(auth)/login" />;
```

## Swapping the Provider

1. Create a new file at `src/features/auth/providers/<name>.ts` exporting an object that implements `AuthService` (from `src/services/auth.interface.ts`).
2. Register it in the `providers` map in `src/features/auth/create-auth-service.ts`.
3. Update `starter.config.ts`:
   ```ts
   auth: { enabled: true, provider: '<name>' },
   ```

The factory uses dynamic imports, so the new provider is only loaded when selected.

## Removing the Feature

1. Set `auth.enabled` to `false` in `starter.config.ts`.
2. Optionally delete `src/features/auth/` and `src/app/(auth)/`.
3. Remove `AuthProvider` from `src/lib/providers/app-providers.tsx`.
4. Remove `configureAmplify()` call if no other feature uses Amplify.
5. Run `pnpm remove aws-amplify @aws-amplify/react-native amazon-cognito-identity-js @react-native-community/netinfo`.
