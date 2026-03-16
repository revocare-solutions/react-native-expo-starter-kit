import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { starterConfig } from '@/config/starter.config';
import enLocale from './locales/en.json';
import esLocale from './locales/es.json';
import BackendPlugin from './backend-plugin';

const deviceLocale = getLocales()[0]?.languageCode ?? starterConfig.features.i18n.defaultLocale;

const instance = i18next.use(initReactI18next);

if (starterConfig.api.baseUrl) {
  instance.use(BackendPlugin);
}

instance.init({
  compatibilityJSON: 'v4',
  lng: deviceLocale,
  fallbackLng: starterConfig.features.i18n.defaultLocale,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: { translation: enLocale },
    es: { translation: esLocale },
  },
  partialBundledLanguages: !!starterConfig.api.baseUrl,
});

export default i18next;
