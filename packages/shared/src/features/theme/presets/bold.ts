import type { ThemeConfig } from '../../../types/theme.types';

export const boldPreset: ThemeConfig = {
  colors: {
    primary: {
      50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
      400: '#60a5fa', 500: '#2563eb', 600: '#1d4ed8', 700: '#1e40af',
      800: '#1e3a8a', 900: '#1e3b8a', 950: '#172554',
    },
    secondary: {
      50: '#fdf4ff', 100: '#fae8ff', 200: '#f5d0fe', 300: '#f0abfc',
      400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf',
      800: '#86198f', 900: '#701a75', 950: '#4a044e',
    },
    accent: {
      50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
      400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
      800: '#9a3412', 900: '#7c2d12', 950: '#431407',
    },
    neutral: {
      50: '#fafafa', 100: '#f4f4f5', 200: '#e4e4e7', 300: '#d4d4d8',
      400: '#a1a1aa', 500: '#71717a', 600: '#52525b', 700: '#3f3f46',
      800: '#27272a', 900: '#18181b', 950: '#09090b',
    },
    semantic: { success: '#22c55e', warning: '#eab308', error: '#dc2626', info: '#2563eb' },
    surface: {
      light: { background: '#ffffff', card: '#fafafa', border: '#e4e4e7' },
      dark: { background: '#09090b', card: '#18181b', border: '#27272a' },
    },
  },
  typography: {
    fontFamily: { sans: 'Plus Jakarta Sans', mono: 'JetBrains Mono' },
    scale: {
      xs: { size: 12, lineHeight: 16 }, sm: { size: 14, lineHeight: 20 },
      base: { size: 16, lineHeight: 24 }, lg: { size: 18, lineHeight: 28 },
      xl: { size: 20, lineHeight: 28 }, '2xl': { size: 24, lineHeight: 32 },
      '3xl': { size: 30, lineHeight: 36 }, '4xl': { size: 36, lineHeight: 40 },
    },
  },
  spacing: { unit: 4 },
  borderRadius: { none: 0, sm: 6, md: 10, lg: 14, xl: 18, full: 9999 },
  shadows: {
    sm: { offsetY: 1, blur: 3, color: 'rgba(0,0,0,0.06)' },
    md: { offsetY: 4, blur: 8, color: 'rgba(0,0,0,0.08)' },
    lg: { offsetY: 10, blur: 20, color: 'rgba(0,0,0,0.12)' },
  },
};
