import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryProvider } from '@/lib/api';
import { StorageProvider } from '@/features/offline-storage';
import { AuthProvider } from '@/features/auth';
import { configureAmplify } from '@/lib/amplify/configure';
import { starterConfig } from '@/config/starter.config';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CrashReportingProvider } from '@/features/crash-reporting';
import { AnalyticsProvider } from '@/features/analytics';
import { I18nProvider } from '@/features/i18n';
import { NotificationProvider } from '@/features/notifications';
import { TasksProvider } from '@/features/tasks';
import { SyncProvider } from '@/features/sync';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();

  useEffect(() => {
    const { auth, analytics, notifications } = starterConfig.features;
    const usesAmplify =
      auth.provider === 'amplify' ||
      analytics.provider === 'amplify' ||
      notifications.provider === 'amplify';

    if (usesAmplify) {
      configureAmplify();
    }
  }, []);

  // Provider ordering (spec-defined, dependency-aware):
  // SafeArea → Theme → QueryClient → OfflineStorage → Auth → Analytics → CrashReporting → i18n → Notifications → Tasks → Sync → ...children
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryProvider>
        <StorageProvider>
          <AuthProvider>
            <AnalyticsProvider>
              <CrashReportingProvider>
                <I18nProvider>
                  <NotificationProvider>
                    <TasksProvider>
                      <SyncProvider>
                        {children}
                      </SyncProvider>
                    </TasksProvider>
                  </NotificationProvider>
                </I18nProvider>
              </CrashReportingProvider>
            </AnalyticsProvider>
          </AuthProvider>
        </StorageProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
