import axios, { type AxiosError } from 'axios';
import { basekitConfig } from '@/config/basekit.config';

export const apiClient = axios.create({
  baseURL: basekitConfig.api.baseUrl,
  timeout: basekitConfig.api.timeout,
  headers: {
    'Content-Type': 'application/json',
  },
});

let getAccessToken: (() => Promise<string | null>) | null = null;
let onAuthExpired: (() => void) | null = null;

export function setAuthTokenGetter(getter: () => Promise<string | null>) {
  getAccessToken = getter;
}

export function setAuthExpiredHandler(handler: () => void) {
  onAuthExpired = handler;
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
let failedQueue: { resolve: (token: string | null) => void; reject: (err: unknown) => void }[] = [];

function processQueue(token: string | null, error?: unknown) {
  for (const { resolve, reject } of failedQueue) {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  }
  failedQueue = [];
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    if (!originalRequest || error.response?.status !== 401) {
      return Promise.reject(error);
    }

    // If already retried, give up and trigger auth expired
    if ((originalRequest as unknown as Record<string, unknown>)._retry) {
      onAuthExpired?.();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // Queue this request until the token refresh completes
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(apiClient(originalRequest));
          },
          reject,
        });
      });
    }

    (originalRequest as unknown as Record<string, unknown>)._retry = true;
    isRefreshing = true;

    try {
      // Re-fetch token (the auth provider may have refreshed it)
      const newToken = getAccessToken ? await getAccessToken() : null;

      if (!newToken) {
        processQueue(null, error);
        onAuthExpired?.();
        return Promise.reject(error);
      }

      processQueue(newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(null, refreshError);
      onAuthExpired?.();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  },
);
