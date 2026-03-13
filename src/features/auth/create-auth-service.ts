import type { AuthService } from '@/services/auth.interface';
import { starterConfig } from '@/config/starter.config';
import { noOpAuth } from './no-op-auth';

const providers: Record<string, () => Promise<AuthService>> = {
  amplify: () => import('./providers/amplify').then((m) => m.amplifyAuthService),
};

export async function createAuthService(): Promise<AuthService> {
  if (!starterConfig.features.auth.enabled) {
    return noOpAuth;
  }

  const { provider } = starterConfig.features.auth;
  const factory = providers[provider];
  if (!factory) {
    console.warn(`[auth] Unknown auth provider: ${provider}. Falling back to no-op auth.`);
    return noOpAuth;
  }

  try {
    return await factory();
  } catch (error) {
    console.warn(
      `[auth] Failed to load "${provider}" provider. Falling back to no-op auth.`,
      error instanceof Error ? error.message : error,
    );
    return noOpAuth;
  }
}
