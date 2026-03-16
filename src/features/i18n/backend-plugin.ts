import type { BackendModule, ReadCallback } from 'i18next';
import { apiClient } from '@/lib/api';
import { MMKV } from 'react-native-mmkv';

const storage = new MMKV({ id: 'i18n-cache' });
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function getCacheKey(locale: string) {
  return `translations_${locale}`;
}

function getTimestampKey(locale: string) {
  return `translations_ts_${locale}`;
}

const BackendPlugin: BackendModule = {
  type: 'backend',

  init() {},

  read(language: string, _namespace: string, callback: ReadCallback) {
    const cacheKey = getCacheKey(language);
    const tsKey = getTimestampKey(language);
    const cachedData = storage.getString(cacheKey);
    const cachedTs = storage.getNumber(tsKey);

    if (cachedData && cachedTs && Date.now() - cachedTs < CACHE_TTL_MS) {
      try {
        callback(null, JSON.parse(cachedData));
        return;
      } catch {
        // Fall through to fetch
      }
    }

    apiClient
      .get<{ namespace: string; key: string; value: string }[]>(`/api/i18n/${language}`)
      .then(({ data }) => {
        const translations: Record<string, string> = {};
        data.forEach((entry) => {
          translations[entry.key] = entry.value;
        });

        storage.set(cacheKey, JSON.stringify(translations));
        storage.set(tsKey, Date.now());

        callback(null, translations);
      })
      .catch(() => {
        callback(null, {});
      });
  },
};

export default BackendPlugin;
