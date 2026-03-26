import { useState, useEffect, useCallback } from 'react';
import * as LocalAuthentication from 'expo-local-authentication';
import type { BiometricType, BiometricOptions, BiometricResult } from '@/types';

const AUTH_TYPE_MAP: Record<number, BiometricType> = {
  [LocalAuthentication.AuthenticationType.FINGERPRINT]: 'fingerprint',
  [LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION]: 'facial',
  [LocalAuthentication.AuthenticationType.IRIS]: 'iris',
};

export function useBiometrics() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType | null>(null);

  useEffect(() => {
    async function checkBiometrics() {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();

      if (hasHardware && isEnrolled) {
        setIsAvailable(true);
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        if (types.length > 0) {
          setBiometricType(AUTH_TYPE_MAP[types[0]] ?? null);
        }
      }
    }

    checkBiometrics();
  }, []);

  const authenticate = useCallback(
    async (options?: BiometricOptions): Promise<BiometricResult> => {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: options?.promptMessage,
        cancelLabel: options?.cancelLabel,
        fallbackEnabled: options?.fallbackToPasscode,
      });

      if (result.success) {
        return { success: true };
      }

      return {
        success: false,
        error: (result.error as BiometricResult['error']) ?? 'unknown',
      };
    },
    [],
  );

  return { isAvailable, biometricType, authenticate };
}
