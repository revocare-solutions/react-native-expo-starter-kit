import { useContext } from 'react';
import { CrashReportingContext } from '../crash-reporting-provider';
import { noOpCrashReporting } from '../no-op-crash-reporting';

export function useCrashReporting() {
  const service = useContext(CrashReportingContext);

  if (!service) {
    return noOpCrashReporting;
  }

  return service;
}
