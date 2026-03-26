import { useContext } from 'react';
import { ThemeContext } from '@/features/theme/hooks/use-theme';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export function useThemeColor(
  props: { light?: string; dark?: string },
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  const themeCtx = useContext(ThemeContext);
  const systemScheme = useColorScheme() ?? 'light';
  const mode = themeCtx?.mode ?? systemScheme;
  const colorFromProps = props[mode];

  if (colorFromProps) {
    return colorFromProps;
  }

  if (themeCtx) {
    const surface = themeCtx.config.colors.surface[mode];
    const mapping: Record<string, string> = {
      text: mode === 'dark' ? '#ECEDEE' : '#11181C',
      background: surface.background,
      tint: themeCtx.config.colors.primary[500],
      icon: themeCtx.config.colors.neutral[500],
      tabIconDefault: themeCtx.config.colors.neutral[500],
      tabIconSelected: themeCtx.config.colors.primary[500],
    };
    return mapping[colorName] ?? Colors[mode][colorName];
  }

  return Colors[mode][colorName];
}
