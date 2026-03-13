import React from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { QueryProvider } from '@/lib/api';
import { StorageProvider } from '@/features/offline-storage';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function AppProviders({ children }: { children: React.ReactNode }) {
  const colorScheme = useColorScheme();

  // Provider ordering (spec-defined, dependency-aware):
  // SafeArea → Theme → QueryClient → OfflineStorage → Auth → Analytics → CrashReporting → i18n → Notifications → ...children
  // Future tasks will add providers in this exact order.
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <QueryProvider>
        <StorageProvider>
          {/* Auth, Analytics, CrashReporting, i18n, Notifications providers added here by Tasks 9-13 */}
          {children}
        </StorageProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
