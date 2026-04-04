import { renderHook, act } from '@testing-library/react-native';
import { useSecureStorage } from '../hooks/use-secure-storage';

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// eslint-disable-next-line import/first
import * as SecureStore from 'expo-secure-store';

const mockStore = SecureStore as jest.Mocked<typeof SecureStore>;

describe('useSecureStorage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should get a value', async () => {
    mockStore.getItemAsync.mockResolvedValue('secret-token');

    const { result } = renderHook(() => useSecureStorage());

    let value: string | null;
    await act(async () => {
      value = await result.current.get('auth_token');
    });

    expect(value!).toBe('secret-token');
    expect(mockStore.getItemAsync).toHaveBeenCalledWith('auth_token');
  });

  it('should set a value', async () => {
    mockStore.setItemAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSecureStorage());

    await act(async () => {
      await result.current.set('auth_token', 'new-token');
    });

    expect(mockStore.setItemAsync).toHaveBeenCalledWith('auth_token', 'new-token');
  });

  it('should remove a value', async () => {
    mockStore.deleteItemAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSecureStorage());

    await act(async () => {
      await result.current.remove('auth_token');
    });

    expect(mockStore.deleteItemAsync).toHaveBeenCalledWith('auth_token');
  });

  it('should clear specified keys', async () => {
    mockStore.deleteItemAsync.mockResolvedValue(undefined);

    const { result } = renderHook(() => useSecureStorage());

    await act(async () => {
      await result.current.clearKeys(['key1', 'key2']);
    });

    expect(mockStore.deleteItemAsync).toHaveBeenCalledTimes(2);
    expect(mockStore.deleteItemAsync).toHaveBeenCalledWith('key1');
    expect(mockStore.deleteItemAsync).toHaveBeenCalledWith('key2');
  });
});
