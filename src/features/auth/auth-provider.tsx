import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { basekitConfig } from '@/config/basekit.config';
import { setAuthTokenGetter, setAuthExpiredHandler } from '@/lib/api';
import type { AuthService } from '@/services/auth.interface';
import type { AuthResult, User, Session } from '@/types';
import { AuthContext, type AuthContextValue } from './auth-context';
import { createAuthService } from './create-auth-service';

function AuthProviderInner({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const serviceRef = useRef<AuthService | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    async function init() {
      const service = await createAuthService();
      serviceRef.current = service;

      // Wire auth token into API client
      setAuthTokenGetter(async () => {
        const session = await service.getSession();
        return session?.accessToken ?? null;
      });

      // Handle expired auth (401 after token refresh fails)
      setAuthExpiredHandler(() => {
        setUser(null);
      });

      // Get initial user
      const currentUser = await service.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);

      // Listen for auth state changes
      unsubscribe = service.onAuthStateChange((updatedUser) => {
        setUser(updatedUser);
      });
    }

    init();

    return () => {
      unsubscribe?.();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    const service = serviceRef.current;
    if (!service) return { success: false, error: 'Auth service not initialized' };

    const result = await service.signIn(email, password);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  }, []);

  const signUp = useCallback(
    async (
      email: string,
      password: string,
      attrs?: Record<string, string>,
    ): Promise<AuthResult> => {
      const service = serviceRef.current;
      if (!service) return { success: false, error: 'Auth service not initialized' };

      return service.signUp(email, password, attrs);
    },
    [],
  );

  const signOut = useCallback(async (): Promise<void> => {
    const service = serviceRef.current;
    if (!service) return;

    await service.signOut();
    setUser(null);
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<void> => {
    const service = serviceRef.current;
    if (!service) return;

    await service.resetPassword(email);
  }, []);

  const confirmResetPassword = useCallback(
    async (email: string, code: string, newPassword: string): Promise<void> => {
      const service = serviceRef.current;
      if (!service) return;

      await service.confirmResetPassword(email, code, newPassword);
    },
    [],
  );

  const verifyEmail = useCallback(async (email: string, token: string): Promise<AuthResult> => {
    const service = serviceRef.current;
    if (!service) return { success: false, error: 'Auth service not initialized' };

    const result = await service.verifyEmail(email, token);
    if (result.success && result.user) {
      setUser(result.user);
    }
    return result;
  }, []);

  const resendVerificationEmail = useCallback(async (email: string): Promise<void> => {
    const service = serviceRef.current;
    if (!service) return;

    await service.resendVerificationEmail(email);
  }, []);

  const getSession = useCallback(async (): Promise<Session | null> => {
    const service = serviceRef.current;
    if (!service) return null;

    return service.getSession();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      confirmResetPassword,
      verifyEmail,
      resendVerificationEmail,
      getSession,
    }),
    [user, isLoading, signIn, signUp, signOut, resetPassword, confirmResetPassword, verifyEmail, resendVerificationEmail, getSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!basekitConfig.features.auth.enabled) {
    return <>{children}</>;
  }

  return <AuthProviderInner>{children}</AuthProviderInner>;
}
