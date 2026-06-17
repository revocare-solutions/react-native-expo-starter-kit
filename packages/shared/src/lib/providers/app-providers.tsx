import React, { useEffect } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryProvider } from '@/lib/api';
import { StorageProvider } from '@/features/offline-storage';
import { AuthProvider } from '@/features/auth';
import { configureAmplify } from '@/lib/amplify/configure';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { CrashReportingProvider } from '@/features/crash-reporting';
import { AnalyticsProvider } from '@/features/analytics';
import { I18nProvider } from '@/features/i18n';
import { NotificationProvider } from '@/features/notifications';
import { SecurityProvider } from '@/features/security';
import { BasekitThemeProvider } from '@/features/theme';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();

  useEffect(() => {
    configureAmplify();
  }, []);

  // Provider ordering (spec-defined, dependency-aware):
  // SafeArea → Theme → BasekitTheme → QueryClient → OfflineStorage → Security → Auth → Analytics → CrashReporting → i18n → Notifications → ...children
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <BasekitThemeProvider>
        <QueryProvider>
          <StorageProvider>
            <SecurityProvider>
              <AuthProvider>
                <AnalyticsProvider>
                  <CrashReportingProvider>
                    <I18nProvider>
                      <NotificationProvider>
                        {children}
                      </NotificationProvider>
                    </I18nProvider>
                  </CrashReportingProvider>
                </AnalyticsProvider>
              </AuthProvider>
            </SecurityProvider>
          </StorageProvider>
        </QueryProvider>
      </BasekitThemeProvider>
    </ThemeProvider>
  );
}
