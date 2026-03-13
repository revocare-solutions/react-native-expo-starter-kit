import { useTranslation } from 'react-i18next';
import { starterConfig } from '@/config/starter.config';

/**
 * Wrapper around react-i18next's useTranslation hook.
 * Returns a no-op when i18n is disabled (returns the key as-is).
 */
export function useAppTranslation(ns?: string) {
  const translation = useTranslation(ns);

  if (!starterConfig.features.i18n.enabled) {
    return {
      ...translation,
      t: ((key: string) => key) as typeof translation.t,
    };
  }

  return translation;
}
