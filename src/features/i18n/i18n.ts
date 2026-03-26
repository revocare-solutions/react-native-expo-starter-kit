import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import { getLocales } from 'expo-localization';
import { basekitConfig } from '@/config/basekit.config';
import enLocale from './locales/en.json';
import esLocale from './locales/es.json';

const deviceLocale = getLocales()[0]?.languageCode ?? basekitConfig.features.i18n.defaultLocale;

i18next.use(initReactI18next).init({
  compatibilityJSON: 'v4',
  lng: deviceLocale,
  fallbackLng: basekitConfig.features.i18n.defaultLocale,
  interpolation: {
    escapeValue: false,
  },
  resources: {
    en: { translation: enLocale },
    es: { translation: esLocale },
  },
});

export default i18next;
