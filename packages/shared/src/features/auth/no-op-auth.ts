import type { AuthService } from '@/services/auth.interface';

export const noOpAuth: AuthService = {
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  resetPassword: async () => {},
  confirmResetPassword: async () => {},
  verifyEmail: async () => ({ success: false }),
  resendVerificationEmail: async () => {},
  getCurrentUser: async () => null,
  getSession: async () => null,
  onAuthStateChange: () => () => {},
};
