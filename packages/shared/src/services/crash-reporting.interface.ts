import type { SeverityLevel, CrashReportContext } from '@/types';

export interface CrashReportingService {
  initialize(): void;
  captureException(error: Error, context?: CrashReportContext): void;
  captureMessage(message: string, level?: SeverityLevel): void;
  setUser(user: CrashReportContext): void;
  clearUser(): void;
  addBreadcrumb(message: string, category?: string, data?: Record<string, string>): void;
}
