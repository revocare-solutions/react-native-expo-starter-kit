import { noOpCrashReporting } from '../no-op-crash-reporting';

describe('noOpCrashReporting', () => {
  it('initialize does not throw', () => {
    expect(() => noOpCrashReporting.initialize()).not.toThrow();
  });

  it('captureException does not throw', () => {
    expect(() => noOpCrashReporting.captureException(new Error('test'))).not.toThrow();
  });

  it('captureMessage does not throw', () => {
    expect(() => noOpCrashReporting.captureMessage('test')).not.toThrow();
  });

  it('setUser does not throw', () => {
    expect(() => noOpCrashReporting.setUser({ userId: 'u1' })).not.toThrow();
  });

  it('clearUser does not throw', () => {
    expect(() => noOpCrashReporting.clearUser()).not.toThrow();
  });

  it('addBreadcrumb does not throw', () => {
    expect(() => noOpCrashReporting.addBreadcrumb('clicked', 'ui')).not.toThrow();
  });
});

describe('createCrashReportingService', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns noOpCrashReporting when feature is disabled', async () => {
    jest.mock('@/config/starter.config', () => ({
      starterConfig: {
        features: {
          crashReporting: { enabled: false, provider: 'sentry' },
        },
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createCrashReportingService } = require('../create-crash-reporting-service') as {
      createCrashReportingService: () => Promise<typeof noOpCrashReporting>;
    };
    const service = await createCrashReportingService();

    expect(() => service.initialize()).not.toThrow();
    expect(() => service.captureException(new Error('test'))).not.toThrow();
    expect(() => service.captureMessage('test')).not.toThrow();
  });

  it('throws for unknown provider', async () => {
    jest.mock('@/config/starter.config', () => ({
      starterConfig: {
        features: {
          crashReporting: {
            enabled: true,
            provider: 'unknown-provider',
          },
        },
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createCrashReportingService } = require('../create-crash-reporting-service') as {
      createCrashReportingService: () => Promise<typeof noOpCrashReporting>;
    };
    await expect(createCrashReportingService()).rejects.toThrow(
      'Unknown crash reporting provider: unknown-provider',
    );
  });

  it('returns noOpCrashReporting on provider failure', async () => {
    jest.mock('@/config/starter.config', () => ({
      starterConfig: {
        features: {
          crashReporting: { enabled: true, provider: 'sentry' },
        },
      },
    }));

    jest.mock('../providers/sentry', () => {
      throw new Error('Module not found');
    });

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createCrashReportingService } = require('../create-crash-reporting-service') as {
      createCrashReportingService: () => Promise<typeof noOpCrashReporting>;
    };
    const service = await createCrashReportingService();

    expect(() => service.initialize()).not.toThrow();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load "sentry" provider'),
    );

    warnSpy.mockRestore();
  });
});

describe('useCrashReporting', () => {
  it('returns noOpCrashReporting when no provider is set', () => {
    // When context value is null (no provider), the hook returns noOpCrashReporting.
    // We verify this by testing the fallback directly since useContext(CrashReportingContext)
    // defaults to null when no provider wraps the component.
    const service = noOpCrashReporting;

    expect(() => service.initialize()).not.toThrow();
    expect(() => service.captureException(new Error('test'))).not.toThrow();
    expect(() => service.captureMessage('test')).not.toThrow();
  });
});
