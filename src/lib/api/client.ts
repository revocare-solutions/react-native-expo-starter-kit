import axios from 'axios';
import { basekitConfig } from '@/config/basekit.config';

export const apiClient = axios.create({
  baseURL: basekitConfig.api.baseUrl,
  timeout: basekitConfig.api.timeout,
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

