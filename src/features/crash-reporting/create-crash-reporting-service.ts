import type { CrashReportingService } from '@/services/crash-reporting.interface';
import { starterConfig } from '@/config/starter.config';
import { noOpCrashReporting } from './no-op-crash-reporting';

const providers: Record<string, () => Promise<CrashReportingService>> = {
  sentry: async () => {
    const { createSentryCrashReporting } = await import('./providers/sentry');
    return createSentryCrashReporting();
  },
  backend: async () => {
    const { createBackendCrashReporting } = await import('./providers/backend');
    return createBackendCrashReporting();
  },
};

export async function createCrashReportingService(): Promise<CrashReportingService> {
  if (!starterConfig.features.crashReporting.enabled) {
    return noOpCrashReporting;
  }

  const { provider } = starterConfig.features.crashReporting;
  const factory = providers[provider];
  if (!factory) throw new Error(`Unknown crash reporting provider: ${provider}`);

  try {
    return await factory();
  } catch {
    console.warn(
      `[crash-reporting] Failed to load "${provider}" provider (native module not available). Falling back to no-op crash reporting. ` +
      `If you need crash reporting, install the provider SDK and create a dev build with: npx expo run:ios / npx expo run:android`,
    );
    return noOpCrashReporting;
  }
}
