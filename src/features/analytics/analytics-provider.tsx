import React, { createContext, useEffect, useState } from 'react';
import type { AnalyticsService } from '@/services/analytics.interface';
import { basekitConfig } from '@/config/basekit.config';
import { createAnalyticsService } from './create-analytics-service';

export const AnalyticsContext = createContext<AnalyticsService | null>(null);

function AnalyticsProviderInner({ children }: { children: React.ReactNode }) {
  const [service, setService] = useState<AnalyticsService | null>(null);

  useEffect(() => {
    createAnalyticsService().then(setService);
  }, []);

  if (!service) return null;

  return (
    <AnalyticsContext.Provider value={service}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  if (!basekitConfig.features.analytics.enabled) {
    return <>{children}</>;
  }

  return <AnalyticsProviderInner>{children}</AnalyticsProviderInner>;
}
