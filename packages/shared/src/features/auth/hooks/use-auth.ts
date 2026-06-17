import { useContext } from 'react';
import { basekitConfig } from '@/config/basekit.config';
import { AuthContext, type AuthContextValue } from '../auth-context';

const noOpAuthContext: AuthContextValue = {
  user: null,
  isLoading: false,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  resetPassword: async () => {},
  confirmResetPassword: async () => {},
  verifyEmail: async () => ({ success: false }),
  resendVerificationEmail: async () => {},
  getSession: async () => null,
};

export function useAuth(): AuthContextValue {
  if (!basekitConfig.features.auth.enabled) {
    return noOpAuthContext;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
