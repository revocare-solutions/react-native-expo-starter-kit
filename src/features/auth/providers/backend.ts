import { apiClient, setRefreshTokenHandlers } from '@/lib/api';
import type { AuthService } from '@/services/auth.interface';
import type { User, Session } from '@/types';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'auth-backend' });

type AuthChangeCallback = (user: User | null) => void;
const listeners = new Set<AuthChangeCallback>();

function notifyListeners(user: User | null) {
  listeners.forEach((cb) => cb(user));
}

function storeTokens(accessToken: string, refreshToken: string, expiresIn: number) {
  storage.set('accessToken', accessToken);
  storage.set('refreshToken', refreshToken);
  storage.set('expiresAt', Date.now() + expiresIn * 1000);
}

function clearTokens() {
  storage.delete('accessToken');
  storage.delete('refreshToken');
  storage.delete('expiresAt');
}

function getStoredSession(): Session | null {
  const accessToken = storage.getString('accessToken');
  const refreshToken = storage.getString('refreshToken');
  const expiresAt = storage.getNumber('expiresAt');
  if (!accessToken || !refreshToken || !expiresAt) return null;
  return { accessToken, refreshToken, expiresAt };
}

function mapUserProfile(data: {
  id: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
}): User {
  return {
    id: data.id,
    email: data.email,
    displayName: data.displayName ?? undefined,
    avatarUrl: data.avatarUrl ?? undefined,
    emailVerified: true,
  };
}

let refreshHandlersInitialized = false;

function initRefreshHandlers() {
  if (refreshHandlersInitialized) return;
  refreshHandlersInitialized = true;

  setRefreshTokenHandlers({
    getRefreshToken: async () => storage.getString('refreshToken') ?? null,
    onTokenRefreshed: (accessToken, refreshToken, expiresIn) => {
      storeTokens(accessToken, refreshToken, expiresIn);
    },
    onRefreshFailed: () => {
      clearTokens();
      notifyListeners(null);
    },
  });
}

export const backendAuthService: AuthService = {
  async signIn(email, password) {
    initRefreshHandlers();
    try {
      const { data } = await apiClient.post<{
        accessToken: string;
        refreshToken: string;
        idToken: string;
        expiresIn: number;
      }>('/api/auth/login', { email, password });

      storeTokens(data.accessToken, data.refreshToken, data.expiresIn);

      const user = await backendAuthService.getCurrentUser();
      if (user) notifyListeners(user);
      return { success: true, user: user ?? undefined };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign-in failed',
      };
    }
  },

  async signUp(email, password, attrs) {
    try {
      await apiClient.post('/api/auth/register', {
        email,
        password,
        displayName: attrs?.displayName,
      });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Sign-up failed',
      };
    }
  },

  async signOut() {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {
      // Best-effort server-side logout
    }
    clearTokens();
    notifyListeners(null);
  },

  async resetPassword(email) {
    await apiClient.post('/api/auth/forgot-password', { email });
  },

  async confirmResetPassword(email, code, newPassword) {
    await apiClient.post('/api/auth/confirm-reset', { email, code, newPassword });
  },

  async getCurrentUser() {
    initRefreshHandlers();
    const session = getStoredSession();
    if (!session) return null;

    try {
      const { data } = await apiClient.get<{
        id: string;
        email: string;
        displayName: string | null;
        avatarUrl: string | null;
      }>('/api/auth/me');
      return mapUserProfile(data);
    } catch {
      return null;
    }
  },

  async getSession() {
    initRefreshHandlers();
    return getStoredSession();
  },

  onAuthStateChange(callback) {
    listeners.add(callback);
    return () => {
      listeners.delete(callback);
    };
  },

  async verifyEmail(email, code) {
    await apiClient.post('/api/auth/verify-email', { email, code });
  },

  async updateProfile(data) {
    const { data: updated } = await apiClient.put<{
      id: string;
      email: string;
      displayName: string | null;
      avatarUrl: string | null;
    }>('/api/auth/me', data);
    const user = mapUserProfile(updated);
    notifyListeners(user);
    return user;
  },

  async deleteAccount() {
    await apiClient.delete('/api/auth/me');
    clearTokens();
    notifyListeners(null);
  },
};
