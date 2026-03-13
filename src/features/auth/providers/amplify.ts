import {
  signIn,
  signUp,
  signOut,
  resetPassword,
  confirmResetPassword,
  getCurrentUser,
  fetchAuthSession,
  fetchUserAttributes,
} from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import type { AuthService } from '@/services/auth.interface';
import type { User, Session } from '@/types';

async function mapCurrentUser(): Promise<User | null> {
  try {
    const amplifyUser = await getCurrentUser();
    let attributes: Record<string, string> = {};

    try {
      const attrs = await fetchUserAttributes();
      attributes = Object.fromEntries(
        Object.entries(attrs).filter((entry): entry is [string, string] => entry[1] != null),
      );
    } catch {
      // attributes may not be available in all flows
    }

    return {
      id: amplifyUser.userId,
      email: attributes.email ?? '',
      displayName: attributes.name ?? attributes.preferred_username ?? undefined,
      emailVerified: attributes.email_verified === 'true',
      attributes,
    };
  } catch {
    return null;
  }
}

async function mapSession(): Promise<Session | null> {
  try {
    const session = await fetchAuthSession();
    const tokens = session.tokens;

    if (!tokens?.accessToken || !tokens?.idToken) {
      return null;
    }

    return {
      accessToken: tokens.accessToken.toString(),
      refreshToken: '', // Amplify v6 does not expose the refresh token directly
      expiresAt: tokens.accessToken.payload.exp
        ? Number(tokens.accessToken.payload.exp) * 1000
        : 0,
    };
  } catch {
    return null;
  }
}

export const amplifyAuthService: AuthService = {
  async signIn(email: string, password: string) {
    try {
      const result = await signIn({ username: email, password });

      if (result.isSignedIn) {
        const user = await mapCurrentUser();
        return { success: true, user: user ?? undefined };
      }

      return {
        success: false,
        error: `Sign-in requires additional step: ${result.nextStep.signInStep}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign-in failed',
      };
    }
  },

  async signUp(email: string, password: string, attrs?: Record<string, string>) {
    try {
      const result = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            ...attrs,
          },
        },
      });

      if (result.isSignUpComplete) {
        return { success: true };
      }

      return {
        success: false,
        error: `Sign-up requires confirmation: ${result.nextStep.signUpStep}`,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign-up failed',
      };
    }
  },

  async signOut() {
    try {
      await signOut();
    } catch (error) {
      console.warn(
        '[auth:amplify] Sign-out error:',
        error instanceof Error ? error.message : error,
      );
    }
  },

  async resetPassword(email: string) {
    try {
      await resetPassword({ username: email });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Reset password failed');
    }
  },

  async confirmResetPassword(email: string, code: string, newPassword: string) {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword,
      });
    } catch (error) {
      throw new Error(
        error instanceof Error ? error.message : 'Confirm reset password failed',
      );
    }
  },

  getCurrentUser: mapCurrentUser,
  getSession: mapSession,

  onAuthStateChange(callback: (user: User | null) => void) {
    const hubListener = Hub.listen('auth', async ({ payload }) => {
      switch (payload.event) {
        case 'signedIn': {
          const user = await mapCurrentUser();
          callback(user);
          break;
        }
        case 'signedOut':
          callback(null);
          break;
        case 'tokenRefresh': {
          const user = await mapCurrentUser();
          callback(user);
          break;
        }
      }
    });

    return hubListener;
  },
};
