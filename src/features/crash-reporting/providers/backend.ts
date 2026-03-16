import { apiClient } from '@/lib/api';
import type { CrashReportingService } from '@/services/crash-reporting.interface';
import type { SeverityLevel, CrashReportContext } from '@/types';
import Constants from 'expo-constants';

const MAX_BREADCRUMBS = 50;

let breadcrumbs: { message: string; category?: string; data?: Record<string, string>; timestamp: string }[] = [];
let userContext: CrashReportContext = {};

// ErrorUtils is a React Native global
declare const ErrorUtils: {
  getGlobalHandler(): (error: Error, isFatal?: boolean) => void;
  setGlobalHandler(handler: (error: Error, isFatal?: boolean) => void): void;
};

export function createBackendCrashReporting(): CrashReportingService {
  const service: CrashReportingService = {
    initialize() {
      const originalHandler = ErrorUtils.getGlobalHandler();
      ErrorUtils.setGlobalHandler((error, isFatal) => {
        service.captureException(error, { extras: { isFatal: String(isFatal ?? false) } });
        originalHandler?.(error, isFatal);
      });
    },

    captureException(error: Error, context?: CrashReportContext) {
      const mergedContext = { ...userContext, ...context };
      apiClient
        .post('/api/crash-reports', {
          errorMessage: error.message,
          stackTrace: error.stack ?? '',
          breadcrumbs,
          context: mergedContext,
          severity: 'error',
          appVersion: Constants.expoConfig?.version ?? 'unknown',
          deviceInfo: {},
          timestamp: new Date().toISOString(),
        })
        .catch(() => {});

      breadcrumbs = [];
    },

    captureMessage(message: string, level?: SeverityLevel) {
      apiClient
        .post('/api/crash-reports', {
          errorMessage: message,
          stackTrace: '',
          breadcrumbs,
          context: userContext,
          severity: level ?? 'info',
          appVersion: Constants.expoConfig?.version ?? 'unknown',
          deviceInfo: {},
          timestamp: new Date().toISOString(),
        })
        .catch(() => {});

      breadcrumbs = [];
    },

    setUser(user: CrashReportContext) {
      userContext = user;
    },

    clearUser() {
      userContext = {};
    },

    addBreadcrumb(message: string, category?: string, data?: Record<string, string>) {
      breadcrumbs.push({ message, category, data, timestamp: new Date().toISOString() });
      if (breadcrumbs.length > MAX_BREADCRUMBS) {
        breadcrumbs = breadcrumbs.slice(-MAX_BREADCRUMBS);
      }
    },
  };

  return service;
}
