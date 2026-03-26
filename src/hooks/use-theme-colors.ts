import { useContext } from 'react';
import { ThemeContext } from '@/features/theme/hooks/use-theme';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { FONT_FAMILY_MAP } from '@/features/theme/font-map';

/**
 * Returns theme-aware colors. Uses the theme system when available,
 * falls back to the base Colors constants when theme feature is disabled.
 */
export function useThemeColors() {
  const themeCtx = useContext(ThemeContext);
  const colorScheme = useColorScheme() ?? 'light';

  if (themeCtx) {
    const mode = themeCtx.mode;
    const c = themeCtx.config.colors;
    const sansFamily = themeCtx.config.typography.fontFamily.sans;
    const fonts = FONT_FAMILY_MAP[sansFamily] ?? {
      regular: undefined,
      semiBold: undefined,
      bold: undefined,
    };

    return {
      text: c.surface[mode].background === '#ffffff' ? '#11181C' : '#ECEDEE',
      background: c.surface[mode].background,
      card: c.surface[mode].card,
      border: c.surface[mode].border,
      tint: c.primary[500],
      icon: c.neutral[500],
      primary: c.primary,
      secondary: c.secondary,
      accent: c.accent,
      semantic: c.semantic,
      fonts,
      mode,
      isDark: mode === 'dark',
    };
  }

  // Fallback to old Colors constants
  const colors = Colors[colorScheme];
  return {
    text: colors.text,
    background: colors.background,
    card: colorScheme === 'dark' ? '#1e1e1e' : '#f9fafb',
    border: colorScheme === 'dark' ? '#333' : '#e5e7eb',
    tint: colors.tint,
    icon: colors.icon,
    primary: null,
    secondary: null,
    accent: null,
    semantic: null,
    fonts: { regular: undefined, semiBold: undefined, bold: undefined },
    mode: colorScheme,
    isDark: colorScheme === 'dark',
  };
}
