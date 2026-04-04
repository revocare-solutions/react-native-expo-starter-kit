import { supabase } from '@/lib/supabase/client';
import type { AuthService } from '@/services/auth.interface';
import type { User, Session } from '@/types';

function mapUser(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, string> }): User {
  return {
    id: supabaseUser.id,
    email: supabaseUser.email ?? '',
    displayName: supabaseUser.user_metadata?.display_name ?? supabaseUser.user_metadata?.name,
    emailVerified: true,
    attributes: supabaseUser.user_metadata as Record<string, string> | undefined,
  };
}

export const supabaseAuthService: AuthService = {
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        return { success: true, user: mapUser(data.user) };
      }

      return { success: false, error: 'Sign-in failed' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign-in failed',
      };
    }
  },

  async signUp(email: string, password: string, attrs?: Record<string, string>) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: attrs,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        return { success: true, user: mapUser(data.user) };
      }

      return { success: false, error: 'Sign-up failed' };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign-up failed',
      };
    }
  },

  async signOut() {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.warn(
        '[auth:supabase] Sign-out error:',
        error instanceof Error ? error.message : error,
      );
    }
  },

  async resetPassword(email: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) {
      throw new Error(error.message);
    }
  },

  async confirmResetPassword(_email: string, _code: string, newPassword: string) {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      throw new Error(error.message);
    }
  },

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser();
    return user ? mapUser(user) : null;
  },

  async getSession() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      expiresAt: session.expires_at ? session.expires_at * 1000 : 0,
    } satisfies Session;
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user ? mapUser(session.user) : null);
    });

    return () => subscription.unsubscribe();
  },
};
