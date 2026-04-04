import type { CrashReportingService } from '@/services/crash-reporting.interface';

export const noOpCrashReporting: CrashReportingService = {
  initialize: () => {},
  captureException: () => {},
  captureMessage: () => {},
  setUser: () => {},
  clearUser: () => {},
  addBreadcrumb: () => {},
};
