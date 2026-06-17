import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

const AVAILABLE_LANGUAGES = ['en', 'es'] as const;

/**
 * Hook to get and set the current language.
 */
export function useLanguage() {
  const { i18n } = useTranslation();

  const setLanguage = useCallback(
    (lang: string) => {
      return i18n.changeLanguage(lang);
    },
    [i18n],
  );

  return {
    language: i18n.language,
    setLanguage,
    availableLanguages: AVAILABLE_LANGUAGES,
  };
}
