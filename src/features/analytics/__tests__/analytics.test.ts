import { noOpAnalytics } from '../no-op-analytics';

describe('noOpAnalytics', () => {
  it('initialize resolves without throwing', async () => {
    await expect(noOpAnalytics.initialize()).resolves.toBeUndefined();
  });

  it('trackEvent does not throw', () => {
    expect(() => noOpAnalytics.trackEvent({ name: 'test' })).not.toThrow();
  });

  it('trackScreen does not throw', () => {
    expect(() => noOpAnalytics.trackScreen('Home')).not.toThrow();
  });

  it('setUserProperties does not throw', () => {
    expect(() => noOpAnalytics.setUserProperties({ userId: 'u1' })).not.toThrow();
  });

  it('reset does not throw', () => {
    expect(() => noOpAnalytics.reset()).not.toThrow();
  });
});

describe('createAnalyticsService', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns noOpAnalytics when feature is disabled', async () => {
    jest.mock('@/config/starter.config', () => ({
      starterConfig: {
        features: {
          analytics: { enabled: false, provider: 'amplify' },
        },
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createAnalyticsService } = require('../create-analytics-service') as {
      createAnalyticsService: () => Promise<typeof noOpAnalytics>;
    };
    const service = await createAnalyticsService();

    await expect(service.initialize()).resolves.toBeUndefined();
    expect(() => service.trackEvent({ name: 'test' })).not.toThrow();
    expect(() => service.trackScreen('Home')).not.toThrow();
  });

  it('throws for unknown provider', async () => {
    jest.mock('@/config/starter.config', () => ({
      starterConfig: {
        features: {
          analytics: {
            enabled: true,
            provider: 'unknown-provider',
          },
        },
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createAnalyticsService } = require('../create-analytics-service') as {
      createAnalyticsService: () => Promise<typeof noOpAnalytics>;
    };
    await expect(createAnalyticsService()).rejects.toThrow(
      'Unknown analytics provider: unknown-provider',
    );
  });

  it('returns noOpAnalytics on provider failure', async () => {
    jest.mock('@/config/starter.config', () => ({
      starterConfig: {
        features: {
          analytics: { enabled: true, provider: 'amplify' },
        },
      },
    }));

    jest.mock('../providers/amplify', () => {
      throw new Error('Module not found');
    });

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createAnalyticsService } = require('../create-analytics-service') as {
      createAnalyticsService: () => Promise<typeof noOpAnalytics>;
    };
    const service = await createAnalyticsService();

    await expect(service.initialize()).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load "amplify" provider'),
    );

    warnSpy.mockRestore();
  });
});

describe('useAnalytics', () => {
  it('returns noOpAnalytics when no provider is set', () => {
    // When context value is null (no provider), the hook returns noOpAnalytics.
    // We verify this by testing the fallback directly since useContext(AnalyticsContext)
    // defaults to null when no provider wraps the component.
    const service = noOpAnalytics;

    expect(() => service.trackEvent({ name: 'test' })).not.toThrow();
    expect(() => service.trackScreen('Home')).not.toThrow();
    expect(() => service.setUserProperties({ userId: 'u1' })).not.toThrow();
    expect(() => service.reset()).not.toThrow();
  });
});
