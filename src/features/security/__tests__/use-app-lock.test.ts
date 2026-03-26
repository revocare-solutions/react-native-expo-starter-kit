import { renderHook, act } from '@testing-library/react-native';
import { AppState } from 'react-native';
import { useAppLock } from '../hooks/use-app-lock';

jest.mock('../hooks/use-biometrics', () => ({
  useBiometrics: () => ({
    isAvailable: true,
    biometricType: 'facial' as const,
    authenticate: jest.fn().mockResolvedValue({ success: true }),
  }),
}));

jest.spyOn(AppState, 'addEventListener').mockImplementation(jest.fn());

describe('useAppLock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should start unlocked by default', () => {
    const { result } = renderHook(() =>
      useAppLock({ lockOnBackground: false, backgroundTimeout: 30, requireOnLaunch: false }),
    );

    expect(result.current.isLocked).toBe(false);
  });

  it('should start locked when requireOnLaunch is true', () => {
    const { result } = renderHook(() =>
      useAppLock({ lockOnBackground: false, backgroundTimeout: 30, requireOnLaunch: true }),
    );

    expect(result.current.isLocked).toBe(true);
  });

  it('should unlock via biometrics', async () => {
    const { result } = renderHook(() =>
      useAppLock({ lockOnBackground: false, backgroundTimeout: 30, requireOnLaunch: true }),
    );

    expect(result.current.isLocked).toBe(true);

    await act(async () => {
      const unlockResult = await result.current.unlock();
      expect(unlockResult.success).toBe(true);
    });

    expect(result.current.isLocked).toBe(false);
  });

  it('should lock manually', () => {
    const { result } = renderHook(() =>
      useAppLock({ lockOnBackground: false, backgroundTimeout: 30, requireOnLaunch: false }),
    );

    expect(result.current.isLocked).toBe(false);

    act(() => {
      result.current.lock();
    });

    expect(result.current.isLocked).toBe(true);
  });
});
