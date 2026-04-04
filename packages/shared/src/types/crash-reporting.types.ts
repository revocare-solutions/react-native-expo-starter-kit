export type SeverityLevel = 'fatal' | 'error' | 'warning' | 'info' | 'debug';

export interface CrashReportContext {
  userId?: string;
  email?: string;
  extras?: Record<string, string | number | boolean>;
}
