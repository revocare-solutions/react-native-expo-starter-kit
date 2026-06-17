import type { CrashReportingService } from '@/services/crash-reporting.interface';

export function createSentryCrashReporting(): CrashReportingService {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Sentry = require('@sentry/react-native');

  return {
    initialize() {
      Sentry.init({
        dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      });
    },

    captureException(error, context) {
      Sentry.captureException(error, context ? { extra: context } : undefined);
    },

    captureMessage(message, level) {
      Sentry.captureMessage(message, level);
    },

    setUser(user) {
      Sentry.setUser(user);
    },

    clearUser() {
      Sentry.setUser(null);
    },

    addBreadcrumb(message, category, data) {
      Sentry.addBreadcrumb({ message, category, data });
    },
  };
}
