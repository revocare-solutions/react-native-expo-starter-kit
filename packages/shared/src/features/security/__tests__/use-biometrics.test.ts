import { renderHook, act } from '@testing-library/react-native';
import { useBiometrics } from '../hooks/use-biometrics';

jest.mock('expo-local-authentication', () => ({
  hasHardwareAsync: jest.fn(),
  isEnrolledAsync: jest.fn(),
  supportedAuthenticationTypesAsync: jest.fn(),
  authenticateAsync: jest.fn(),
  AuthenticationType: {
    FINGERPRINT: 1,
    FACIAL_RECOGNITION: 2,
    IRIS: 3,
  },
}));

// eslint-disable-next-line import/first
import * as LocalAuthentication from 'expo-local-authentication';

const mockLocalAuth = LocalAuthentication as jest.Mocked<typeof LocalAuthentication>;

describe('useBiometrics', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should detect available biometric hardware', async () => {
    mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
    mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
    mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([
      LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION,
    ]);

    const { result } = renderHook(() => useBiometrics());
    await act(async () => {});

    expect(result.current.isAvailable).toBe(true);
    expect(result.current.biometricType).toBe('facial');
  });

  it('should return not available when no hardware', async () => {
    mockLocalAuth.hasHardwareAsync.mockResolvedValue(false);
    mockLocalAuth.isEnrolledAsync.mockResolvedValue(false);
    mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([]);

    const { result } = renderHook(() => useBiometrics());
    await act(async () => {});

    expect(result.current.isAvailable).toBe(false);
    expect(result.current.biometricType).toBeNull();
  });

  it('should authenticate successfully', async () => {
    mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
    mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
    mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([
      LocalAuthentication.AuthenticationType.FINGERPRINT,
    ]);
    mockLocalAuth.authenticateAsync.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useBiometrics());
    await act(async () => {});

    let authResult: { success: boolean; error?: string };
    await act(async () => {
      authResult = await result.current.authenticate({ promptMessage: 'Verify' });
    });

    expect(authResult!.success).toBe(true);
  });

  it('should handle authentication failure', async () => {
    mockLocalAuth.hasHardwareAsync.mockResolvedValue(true);
    mockLocalAuth.isEnrolledAsync.mockResolvedValue(true);
    mockLocalAuth.supportedAuthenticationTypesAsync.mockResolvedValue([
      LocalAuthentication.AuthenticationType.FINGERPRINT,
    ]);
    mockLocalAuth.authenticateAsync.mockResolvedValue({
      success: false,
      error: 'user_cancel',
    });

    const { result } = renderHook(() => useBiometrics());
    await act(async () => {});

    let authResult: { success: boolean; error?: string };
    await act(async () => {
      authResult = await result.current.authenticate();
    });

    expect(authResult!.success).toBe(false);
    expect(authResult!.error).toBe('user_cancel');
  });
});
