import { createContext, useContext, useCallback } from 'react';
import type { ThemeConfig } from '@/types';
import { FONT_FAMILY_MAP } from '../font-map';

interface ThemeContextValue {
  config: ThemeConfig;
  mode: 'light' | 'dark';
  setMode: (mode: 'light' | 'dark' | 'system') => void;
}

export const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme must be used within a BasekitThemeProvider');
  }

  const { config, mode, setMode } = ctx;

  const spacing = useCallback(
    (n: number) => n * config.spacing.unit,
    [config.spacing.unit],
  );

  return {
    colors: {
      primary: config.colors.primary,
      secondary: config.colors.secondary,
      accent: config.colors.accent,
      neutral: config.colors.neutral,
      semantic: config.colors.semantic,
      surface: config.colors.surface[mode],
    },
    typography: config.typography,
    spacing,
    borderRadius: config.borderRadius,
    shadows: config.shadows,
    fonts: FONT_FAMILY_MAP[config.typography.fontFamily.sans] ?? {
      regular: undefined,
      semiBold: undefined,
      bold: undefined,
    },
    mode,
    setMode,
    isDark: mode === 'dark',
  };
}
