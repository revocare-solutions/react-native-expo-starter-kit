export type BiometricType = 'fingerprint' | 'facial' | 'iris';

export interface BiometricOptions {
  promptMessage?: string;
  cancelLabel?: string;
  fallbackToPasscode?: boolean;
}

export type BiometricError =
  | 'user_cancel'
  | 'not_available'
  | 'not_enrolled'
  | 'lockout'
  | 'unknown';

export interface BiometricResult {
  success: boolean;
  error?: BiometricError;
}

export interface AppLockConfig {
  lockOnBackground: boolean;
  backgroundTimeout: number;
  requireOnLaunch: boolean;
}

export interface PinningPin {
  hostname: string;
  sha256: string[];
}

export interface PinningConfig {
  enabled: boolean;
  pins: PinningPin[];
  environment: {
    development: boolean;
    staging: boolean;
    production: boolean;
  };
}
