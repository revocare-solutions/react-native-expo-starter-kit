import React, { useState } from 'react';
import { useFonts } from 'expo-font';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { themeConfig } from '@/config/theme.config';
import { ThemeContext } from './hooks/use-theme';
import { basekitConfig } from '@/config/basekit.config';
import { FONT_MAP } from './font-assets';

export function BasekitThemeProvider({ children }: { children: React.ReactNode }) {
  if (!basekitConfig.features.theme?.enabled) {
    return <>{children}</>;
  }

  return <ThemeProviderInner>{children}</ThemeProviderInner>;
}

function ThemeProviderInner({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [modeOverride, setModeOverride] = useState<'light' | 'dark' | 'system'>('system');

  // Load fonts for the active theme
  const sansFamily = themeConfig.typography.fontFamily.sans;
  const monoFamily = themeConfig.typography.fontFamily.mono;
  const fontsToLoad: Record<string, number> = {
    ...(FONT_MAP[sansFamily] ?? {}),
    ...(FONT_MAP[monoFamily] ?? {}),
  };

  const [fontsLoaded] = useFonts(fontsToLoad);

  const resolvedMode: 'light' | 'dark' =
    modeOverride === 'system' ? (systemColorScheme ?? 'light') : modeOverride;

  const setMode = (mode: 'light' | 'dark' | 'system') => {
    setModeOverride(mode);
  };

  if (!fontsLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ config: themeConfig, mode: resolvedMode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}
