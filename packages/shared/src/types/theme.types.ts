export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface SemanticColors {
  success: string;
  warning: string;
  error: string;
  info: string;
}

export interface SurfaceColors {
  background: string;
  card: string;
  border: string;
}

export interface TypographyEntry {
  size: number;
  lineHeight: number;
}

export interface ShadowEntry {
  offsetY: number;
  blur: number;
  color: string;
}

export interface ThemeConfig {
  colors: {
    primary: ColorScale;
    secondary: ColorScale;
    accent: ColorScale;
    neutral: ColorScale;
    semantic: SemanticColors;
    surface: {
      light: SurfaceColors;
      dark: SurfaceColors;
    };
  };
  typography: {
    fontFamily: {
      sans: string;
      mono: string;
    };
    scale: Record<string, TypographyEntry>;
  };
  spacing: {
    unit: number;
  };
  borderRadius: Record<string, number>;
  shadows: Record<string, ShadowEntry>;
}
