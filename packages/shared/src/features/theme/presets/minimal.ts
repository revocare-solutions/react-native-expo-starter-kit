import type { ThemeConfig } from '../../../types/theme.types';

export const minimalPreset: ThemeConfig = {
  colors: {
    primary: {
      50: '#eef2ff', 100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc',
      400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca',
      800: '#3730a3', 900: '#312e81', 950: '#1e1b4b',
    },
    secondary: {
      50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1',
      400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155',
      800: '#1e293b', 900: '#0f172a', 950: '#020617',
    },
    accent: {
      50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7',
      400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857',
      800: '#065f46', 900: '#064e3b', 950: '#022c22',
    },
    neutral: {
      50: '#fafafa', 100: '#f5f5f5', 200: '#e5e5e5', 300: '#d4d4d4',
      400: '#a3a3a3', 500: '#737373', 600: '#525252', 700: '#404040',
      800: '#262626', 900: '#171717', 950: '#0a0a0a',
    },
    semantic: { success: '#22c55e', warning: '#f59e0b', error: '#ef4444', info: '#3b82f6' },
    surface: {
      light: { background: '#ffffff', card: '#f9fafb', border: '#e5e7eb' },
      dark: { background: '#0a0a0a', card: '#171717', border: '#262626' },
    },
  },
  typography: {
    fontFamily: { sans: 'Inter', mono: 'JetBrains Mono' },
    scale: {
      xs: { size: 12, lineHeight: 16 },
      sm: { size: 14, lineHeight: 20 },
      base: { size: 16, lineHeight: 24 },
      lg: { size: 18, lineHeight: 28 },
      xl: { size: 20, lineHeight: 28 },
      '2xl': { size: 24, lineHeight: 32 },
      '3xl': { size: 30, lineHeight: 36 },
      '4xl': { size: 36, lineHeight: 40 },
    },
  },
  spacing: { unit: 4 },
  borderRadius: { none: 0, sm: 4, md: 8, lg: 12, xl: 16, full: 9999 },
  shadows: {
    sm: { offsetY: 1, blur: 2, color: 'rgba(0,0,0,0.05)' },
    md: { offsetY: 4, blur: 6, color: 'rgba(0,0,0,0.07)' },
    lg: { offsetY: 10, blur: 15, color: 'rgba(0,0,0,0.1)' },
  },
};
