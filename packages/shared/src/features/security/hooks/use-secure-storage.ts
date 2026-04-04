import { useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';

export function useSecureStorage() {
  const get = useCallback(async (key: string): Promise<string | null> => {
    return SecureStore.getItemAsync(key);
  }, []);

  const set = useCallback(async (key: string, value: string): Promise<void> => {
    await SecureStore.setItemAsync(key, value);
  }, []);

  const remove = useCallback(async (key: string): Promise<void> => {
    await SecureStore.deleteItemAsync(key);
  }, []);

  const clearKeys = useCallback(async (keys: string[]): Promise<void> => {
    await Promise.all(keys.map((key) => SecureStore.deleteItemAsync(key)));
  }, []);

  return { get, set, remove, clearKeys };
}
