import React, { useState } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { themeConfig } from '@/config/theme.config';
import { ThemeContext } from './hooks/use-theme';
import { basekitConfig } from '@/config/basekit.config';

export function BasekitThemeProvider({ children }: { children: React.ReactNode }) {
  if (!basekitConfig.features.theme?.enabled) {
    return <>{children}</>;
  }

  return <ThemeProviderInner>{children}</ThemeProviderInner>;
}

function ThemeProviderInner({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [modeOverride, setModeOverride] = useState<'light' | 'dark' | 'system'>('system');

  const resolvedMode: 'light' | 'dark' =
    modeOverride === 'system' ? (systemColorScheme ?? 'light') : modeOverride;

  const setMode = (mode: 'light' | 'dark' | 'system') => {
    setModeOverride(mode);
  };

  return (
    <ThemeContext.Provider value={{ config: themeConfig, mode: resolvedMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
