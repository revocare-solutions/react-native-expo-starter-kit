import React, { createContext, useEffect, useState } from 'react';
import type { CrashReportingService } from '@/services/crash-reporting.interface';
import { basekitConfig } from '@/config/basekit.config';
import { createCrashReportingService } from './create-crash-reporting-service';

export const CrashReportingContext = createContext<CrashReportingService | null>(null);

function CrashReportingProviderInner({ children }: { children: React.ReactNode }) {
  const [service, setService] = useState<CrashReportingService | null>(null);

  useEffect(() => {
    createCrashReportingService().then(setService);
  }, []);

  if (!service) return null;

  return (
    <CrashReportingContext.Provider value={service}>
      {children}
    </CrashReportingContext.Provider>
  );
}

export function CrashReportingProvider({ children }: { children: React.ReactNode }) {
  if (!basekitConfig.features.crashReporting.enabled) {
    return <>{children}</>;
  }

  return <CrashReportingProviderInner>{children}</CrashReportingProviderInner>;
}
