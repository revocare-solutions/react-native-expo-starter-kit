import type { AuthResult, User, Session } from '@/types';

export interface AuthService {
  signIn(email: string, password: string): Promise<AuthResult>;
  signUp(email: string, password: string, attrs?: Record<string, string>): Promise<AuthResult>;
  signOut(): Promise<void>;
  resetPassword(email: string): Promise<void>;
  confirmResetPassword(email: string, code: string, newPassword: string): Promise<void>;
  getCurrentUser(): Promise<User | null>;
  getSession(): Promise<Session | null>;
  onAuthStateChange(callback: (user: User | null) => void): () => void;
  verifyEmail?(email: string, code: string): Promise<void>;
  updateProfile?(data: { displayName?: string; avatarUrl?: string }): Promise<User>;
  deleteAccount?(): Promise<void>;
}
