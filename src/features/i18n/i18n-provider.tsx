import React from 'react';
import { I18nextProvider } from 'react-i18next';
import { starterConfig } from '@/config/starter.config';
import i18next from './i18n';

export function I18nProvider({ children }: { children: React.ReactNode }) {
  if (!starterConfig.features.i18n.enabled) {
    return <>{children}</>;
  }

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
