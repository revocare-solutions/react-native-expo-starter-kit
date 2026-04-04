import { renderHook, act } from '@testing-library/react-native';
import { useSplashScreen } from '../hooks/use-splash-screen';
import { basekitConfig } from '@/config/basekit.config';

jest.mock(
  'expo-splash-screen',
  () => ({
    hideAsync: jest.fn().mockResolvedValue(true),
    preventAutoHideAsync: jest.fn().mockResolvedValue(true),
  }),
  { virtual: true },
);

jest.mock('@/config/basekit.config', () => ({
  basekitConfig: {
    features: { splashAppIcon: { enabled: true } },
  },
}));

describe('useSplashScreen', () => {
  const mockConfig = basekitConfig as {
    features: { splashAppIcon: { enabled: boolean } };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfig.features.splashAppIcon.enabled = true;
  });

  it('hideSplash calls SplashScreen.hideAsync when enabled', async () => {
    const { result } = renderHook(() => useSplashScreen());

    await act(async () => {
      await result.current.hideSplash();
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SplashScreen = require('expo-splash-screen');
    expect(SplashScreen.hideAsync).toHaveBeenCalled();
    expect(result.current.isReady).toBe(true);
  });

  it('hideSplash does nothing when feature is disabled', async () => {
    mockConfig.features.splashAppIcon.enabled = false;

    const { result } = renderHook(() => useSplashScreen());

    await act(async () => {
      await result.current.hideSplash();
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SplashScreen = require('expo-splash-screen');
    expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
    expect(result.current.isReady).toBe(false);
  });

  it('preventAutoHide calls SplashScreen.preventAutoHideAsync when enabled', async () => {
    const { result } = renderHook(() => useSplashScreen());

    await act(async () => {
      await result.current.preventAutoHide();
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SplashScreen = require('expo-splash-screen');
    expect(SplashScreen.preventAutoHideAsync).toHaveBeenCalled();
    expect(result.current.isReady).toBe(false);
  });

  it('preventAutoHide does nothing when feature is disabled', async () => {
    mockConfig.features.splashAppIcon.enabled = false;

    const { result } = renderHook(() => useSplashScreen());

    await act(async () => {
      await result.current.preventAutoHide();
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SplashScreen = require('expo-splash-screen');
    expect(SplashScreen.preventAutoHideAsync).not.toHaveBeenCalled();
  });

  it('hideSplash handles errors gracefully', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const SplashScreen = require('expo-splash-screen');
    (SplashScreen.hideAsync as jest.Mock).mockRejectedValueOnce(
      new Error('Not available'),
    );

    const { result } = renderHook(() => useSplashScreen());

    await act(async () => {
      await result.current.hideSplash();
    });

    // Should still set isReady to true even on error
    expect(result.current.isReady).toBe(true);
  });
});
