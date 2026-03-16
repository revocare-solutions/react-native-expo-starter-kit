import type { AuthService } from '@/services/auth.interface';

export const noOpAuth: AuthService = {
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  resetPassword: async () => {},
  confirmResetPassword: async () => {},
  getCurrentUser: async () => null,
  getSession: async () => null,
  onAuthStateChange: () => () => {},
  verifyEmail: async () => {},
  updateProfile: async () => ({ id: '', email: '', emailVerified: false }),
  deleteAccount: async () => {},
};
