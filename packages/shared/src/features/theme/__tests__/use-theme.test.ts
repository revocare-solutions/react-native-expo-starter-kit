import { renderHook } from '@testing-library/react-native';
import React from 'react';
import { useTheme, ThemeContext } from '../hooks/use-theme';
import { minimalPreset } from '../presets/minimal';

describe('useTheme', () => {
  function createWrapper(mode: 'light' | 'dark' = 'light') {
    return function Wrapper({ children }: { children: React.ReactNode }) {
      return React.createElement(
        ThemeContext.Provider,
        { value: { config: minimalPreset, mode, setMode: jest.fn() } },
        children,
      );
    };
  }

  it('should return theme colors for light mode', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper('light') });

    expect(result.current.colors.surface.background).toBe('#ffffff');
    expect(result.current.mode).toBe('light');
    expect(result.current.isDark).toBe(false);
  });

  it('should return theme colors for dark mode', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper('dark') });

    expect(result.current.colors.surface.background).toBe('#0a0a0a');
    expect(result.current.mode).toBe('dark');
    expect(result.current.isDark).toBe(true);
  });

  it('should calculate spacing correctly', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

    expect(result.current.spacing(1)).toBe(4);
    expect(result.current.spacing(2)).toBe(8);
    expect(result.current.spacing(4)).toBe(16);
  });

  it('should expose border radius and shadows', () => {
    const { result } = renderHook(() => useTheme(), { wrapper: createWrapper() });

    expect(result.current.borderRadius.md).toBe(8);
    expect(result.current.shadows.sm.offsetY).toBe(1);
  });
});
