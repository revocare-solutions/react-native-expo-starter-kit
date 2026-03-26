import { basekitConfig } from '@/config/basekit.config';

let configured = false;

export async function configureAmplify(): Promise<void> {
  if (configured) return;

  const { features } = basekitConfig;

  const f = features as Record<string, { enabled?: boolean; provider?: string } | undefined>;
  const usesAmplify =
    (f.auth?.enabled && f.auth?.provider === 'amplify') ||
    (f.analytics?.enabled && f.analytics?.provider === 'amplify') ||
    (f.notifications?.enabled && f.notifications?.provider === 'amplify');

  if (!usesAmplify) return;

  try {
    const { Amplify } = await import('aws-amplify');

    const userPoolId = process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID;
    const userPoolClientId = process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID;
    const identityPoolId = process.env.EXPO_PUBLIC_COGNITO_IDENTITY_POOL_ID;

    if (!userPoolId || !userPoolClientId) {
      console.warn(
        '[amplify] Missing EXPO_PUBLIC_COGNITO_USER_POOL_ID or EXPO_PUBLIC_COGNITO_CLIENT_ID. ' +
          'Amplify auth will not work until these are set in your .env file.',
      );
      return;
    }

    const cognitoConfig: Record<string, string> = {
      userPoolId,
      userPoolClientId,
    };
    if (identityPoolId) {
      cognitoConfig.identityPoolId = identityPoolId;
    }

    Amplify.configure({
      Auth: {
        Cognito: cognitoConfig as { userPoolId: string; userPoolClientId: string; identityPoolId: string },
      },
    });

    configured = true;
  } catch (error) {
    console.warn(
      '[amplify] Failed to configure Amplify:',
      error instanceof Error ? error.message : error,
    );
  }
}
