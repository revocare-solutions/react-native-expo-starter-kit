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

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    return Promise.reject(error);
  },
);
