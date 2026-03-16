import { createContext } from 'react';
import type { AuthResult, User, Session } from '@/types';

export interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (email: string, password: string, attrs?: Record<string, string>) => Promise<AuthResult>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmResetPassword: (email: string, code: string, newPassword: string) => Promise<void>;
  getSession: () => Promise<Session | null>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  updateProfile: (data: { displayName?: string; avatarUrl?: string }) => Promise<User>;
  deleteAccount: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
