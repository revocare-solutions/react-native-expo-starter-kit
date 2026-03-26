import type { ThemeConfig, ColorScale } from '@/types';

function colorScaleToTailwind(scale: ColorScale): Record<string, string> {
  return Object.fromEntries(
    Object.entries(scale).map(([key, value]) => [key, value]),
  );
}

export function generateTailwindTheme(config: ThemeConfig) {
  const spacingEntries: Record<string, string> = {};
  for (let i = 0; i <= 20; i++) {
    spacingEntries[String(i)] = `${i * config.spacing.unit}px`;
  }

  return {
    colors: {
      primary: colorScaleToTailwind(config.colors.primary),
      secondary: colorScaleToTailwind(config.colors.secondary),
      accent: colorScaleToTailwind(config.colors.accent),
      neutral: colorScaleToTailwind(config.colors.neutral),
      success: config.colors.semantic.success,
      warning: config.colors.semantic.warning,
      error: config.colors.semantic.error,
      info: config.colors.semantic.info,
    },
    borderRadius: Object.fromEntries(
      Object.entries(config.borderRadius)
        .filter(([key]) => key !== 'none' && key !== 'full')
        .map(([key, value]) => [key, `${value}px`]),
    ),
    spacing: spacingEntries,
  };
}
