import type { ThemeConfig } from '@/types';

export const corporatePreset: ThemeConfig = {
  colors: {
    primary: {
      50: '#eff6ff', 100: '#dce6f5', 200: '#b8cce8', 300: '#8badd6',
      400: '#5d8ec4', 500: '#1e3a5f', 600: '#1a3354', 700: '#162c49',
      800: '#12253e', 900: '#0e1e33', 950: '#0a1628',
    },
    secondary: {
      50: '#f0fdf4', 100: '#dcfce7', 200: '#bbf7d0', 300: '#86efac',
      400: '#4ade80', 500: '#16a34a', 600: '#15803d', 700: '#166534',
      800: '#14532d', 900: '#052e16', 950: '#022c22',
    },
    accent: {
      50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d',
      400: '#fbbf24', 500: '#d97706', 600: '#b45309', 700: '#92400e',
      800: '#78350f', 900: '#451a03', 950: '#271000',
    },
    neutral: {
      50: '#f9fafb', 100: '#f3f4f6', 200: '#e5e7eb', 300: '#d1d5db',
      400: '#9ca3af', 500: '#6b7280', 600: '#4b5563', 700: '#374151',
      800: '#1f2937', 900: '#111827', 950: '#030712',
    },
    semantic: { success: '#16a34a', warning: '#d97706', error: '#dc2626', info: '#1e3a5f' },
    surface: {
      light: { background: '#ffffff', card: '#f9fafb', border: '#e5e7eb' },
      dark: { background: '#030712', card: '#111827', border: '#1f2937' },
    },
  },
  typography: {
    fontFamily: { sans: 'IBM Plex Sans', mono: 'IBM Plex Mono' },
    scale: {
      xs: { size: 12, lineHeight: 16 }, sm: { size: 14, lineHeight: 20 },
      base: { size: 16, lineHeight: 24 }, lg: { size: 18, lineHeight: 28 },
      xl: { size: 20, lineHeight: 28 }, '2xl': { size: 24, lineHeight: 32 },
      '3xl': { size: 30, lineHeight: 36 }, '4xl': { size: 36, lineHeight: 40 },
    },
  },
  spacing: { unit: 4 },
  borderRadius: { none: 0, sm: 2, md: 4, lg: 6, xl: 8, full: 9999 },
  shadows: {
    sm: { offsetY: 1, blur: 2, color: 'rgba(0,0,0,0.04)' },
    md: { offsetY: 3, blur: 6, color: 'rgba(0,0,0,0.06)' },
    lg: { offsetY: 8, blur: 12, color: 'rgba(0,0,0,0.08)' },
  },
};
