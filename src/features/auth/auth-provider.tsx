import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { starterConfig } from '@/config/starter.config';
import { setAuthTokenGetter } from '@/lib/api';
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

  const getSession = useCallback(async (): Promise<Session | null> => {
    const service = serviceRef.current;
    if (!service) return null;

    return service.getSession();
  }, []);

  const verifyEmail = useCallback(async (email: string, code: string): Promise<void> => {
    const service = serviceRef.current;
    if (!service?.verifyEmail) return;
    await service.verifyEmail(email, code);
  }, []);

  const updateProfile = useCallback(
    async (data: { displayName?: string; avatarUrl?: string }): Promise<User> => {
      const service = serviceRef.current;
      if (!service?.updateProfile) return { id: '', email: '', emailVerified: false };
      const updated = await service.updateProfile(data);
      setUser(updated);
      return updated;
    },
    [],
  );

  const deleteAccount = useCallback(async (): Promise<void> => {
    const service = serviceRef.current;
    if (!service?.deleteAccount) return;
    await service.deleteAccount();
    setUser(null);
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
      getSession,
      verifyEmail,
      updateProfile,
      deleteAccount,
    }),
    [
      user,
      isLoading,
      signIn,
      signUp,
      signOut,
      resetPassword,
      confirmResetPassword,
      getSession,
      verifyEmail,
      updateProfile,
      deleteAccount,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  if (!starterConfig.features.auth.enabled) {
    return <>{children}</>;
  }

  return <AuthProviderInner>{children}</AuthProviderInner>;
}
