import axios from 'axios';
import { starterConfig } from '@/config/starter.config';

export const apiClient = axios.create({
  baseURL: starterConfig.api.baseUrl,
  timeout: starterConfig.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

let getAccessToken: (() => Promise<string | null>) | null = null;

export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  getAccessToken = getter;
}

apiClient.interceptors.request.use(async (config) => {
  if (getAccessToken) {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: {
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}[] = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token);
    }
  });
  failedQueue = [];
}

let getRefreshToken: (() => Promise<string | null>) | null = null;
let onTokenRefreshed: ((accessToken: string, refreshToken: string, expiresIn: number) => void) | null = null;
let onRefreshFailed: (() => void) | null = null;

export function setRefreshTokenHandlers(handlers: {
  getRefreshToken: () => Promise<string | null>;
  onTokenRefreshed: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  onRefreshFailed: () => void;
}) {
  getRefreshToken = handlers.getRefreshToken;
  onTokenRefreshed = handlers.onTokenRefreshed;
  onRefreshFailed = handlers.onRefreshFailed;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const url = originalRequest?.url ?? '';

    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      url.includes('/api/auth/login') ||
      url.includes('/api/auth/refresh') ||
      url.includes('/api/auth/register')
    ) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return apiClient(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await getRefreshToken?.();
      if (!refreshToken) throw new Error('No refresh token');

      const { data } = await apiClient.post<{ accessToken: string; refreshToken: string; expiresIn: number }>(
        '/api/auth/refresh',
        { refreshToken },
      );
      onTokenRefreshed?.(data.accessToken, data.refreshToken, data.expiresIn);
      processQueue(null, data.accessToken);

      originalRequest.headers.Authorization = `Bearer ${data.accessToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      onRefreshFailed?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
