import { renderHook, act } from '@testing-library/react-native';
import { useOtaUpdates } from '../hooks/use-ota-updates';
import { basekitConfig } from '@/config/basekit.config';

jest.mock(
  'expo-updates',
  () => ({
    checkForUpdateAsync: jest.fn(),
    fetchUpdateAsync: jest.fn(),
    reloadAsync: jest.fn(),
  }),
  { virtual: true },
);

jest.mock('@/config/basekit.config', () => ({
  basekitConfig: {
    features: { otaUpdates: { enabled: true } },
  },
}));

describe('useOtaUpdates', () => {
  const mockConfig = basekitConfig as {
    features: { otaUpdates: { enabled: boolean } };
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockConfig.features.otaUpdates.enabled = true;
  });

  it('returns initial status with all false/null', () => {
    const { result } = renderHook(() => useOtaUpdates());

    expect(result.current.status).toEqual({
      isChecking: false,
      isDownloading: false,
      isAvailable: false,
      error: null,
    });
  });

  it('checkForUpdate does nothing when feature is disabled', async () => {
    mockConfig.features.otaUpdates.enabled = false;

    const { result } = renderHook(() => useOtaUpdates());
    await act(async () => {
      await result.current.checkForUpdate();
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Updates = require('expo-updates');
    expect(Updates.checkForUpdateAsync).not.toHaveBeenCalled();
  });

  it('checkForUpdate sets isChecking then resolves with availability', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Updates = require('expo-updates');
    (Updates.checkForUpdateAsync as jest.Mock).mockResolvedValue({
      isAvailable: true,
    });

    const { result } = renderHook(() => useOtaUpdates());

    await act(async () => {
      await result.current.checkForUpdate();
    });

    expect(Updates.checkForUpdateAsync).toHaveBeenCalled();
    expect(result.current.status.isChecking).toBe(false);
    expect(result.current.status.isAvailable).toBe(true);
    expect(result.current.status.error).toBeNull();
  });

  it('checkForUpdate handles errors', async () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Updates = require('expo-updates');
    (Updates.checkForUpdateAsync as jest.Mock).mockRejectedValue(
      new Error('Network error'),
    );

    const { result } = renderHook(() => useOtaUpdates());

    await act(async () => {
      await result.current.checkForUpdate();
    });

    expect(result.current.status.isChecking).toBe(false);
    expect(result.current.status.error).toBe('Network error');
  });

  it('downloadAndApply does nothing when feature is disabled', async () => {
    mockConfig.features.otaUpdates.enabled = false;

    const { result } = renderHook(() => useOtaUpdates());
    await act(async () => {
      await result.current.downloadAndApply();
    });

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Updates = require('expo-updates');
    expect(Updates.fetchUpdateAsync).not.toHaveBeenCalled();
    expect(Updates.reloadAsync).not.toHaveBeenCalled();
  });
});
