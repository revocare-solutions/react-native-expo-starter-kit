import React from 'react';
import { basekitConfig } from '@/config/basekit.config';

export function SecurityProvider({ children }: { children: React.ReactNode }) {
  if (!basekitConfig.features.security?.enabled) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
