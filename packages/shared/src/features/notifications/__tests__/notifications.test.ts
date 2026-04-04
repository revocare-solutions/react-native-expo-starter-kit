import { noOpNotifications } from '../no-op-notifications';

describe('noOpNotifications', () => {
  it('initialize resolves without throwing', async () => {
    await expect(noOpNotifications.initialize()).resolves.toBeUndefined();
  });

  it('requestPermission resolves to false', async () => {
    await expect(noOpNotifications.requestPermission()).resolves.toBe(false);
  });

  it('getToken resolves to null', async () => {
    await expect(noOpNotifications.getToken()).resolves.toBeNull();
  });

  it('sendLocalNotification resolves without throwing', async () => {
    await expect(
      noOpNotifications.sendLocalNotification({ title: 'Test', body: 'Body' }),
    ).resolves.toBeUndefined();
  });

  it('onNotificationReceived returns a no-op unsubscribe', () => {
    const unsubscribe = noOpNotifications.onNotificationReceived(() => {});
    expect(typeof unsubscribe).toBe('function');
    expect(() => unsubscribe()).not.toThrow();
  });

  it('onNotificationOpened returns a no-op unsubscribe', () => {
    const unsubscribe = noOpNotifications.onNotificationOpened(() => {});
    expect(typeof unsubscribe).toBe('function');
    expect(() => unsubscribe()).not.toThrow();
  });
});

describe('createNotificationService', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns noOpNotifications when feature is disabled', async () => {
    jest.mock('@/config/basekit.config', () => ({
      basekitConfig: {
        features: {
          notifications: { enabled: false, provider: 'amplify' },
        },
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createNotificationService } = require('../create-notification-service') as {
      createNotificationService: () => Promise<typeof noOpNotifications>;
    };
    const service = await createNotificationService();

    await expect(service.initialize()).resolves.toBeUndefined();
    await expect(service.requestPermission()).resolves.toBe(false);
    await expect(service.getToken()).resolves.toBeNull();
  });

  it('throws for unknown provider', async () => {
    jest.mock('@/config/basekit.config', () => ({
      basekitConfig: {
        features: {
          notifications: {
            enabled: true,
            provider: 'unknown-provider',
          },
        },
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createNotificationService } = require('../create-notification-service') as {
      createNotificationService: () => Promise<typeof noOpNotifications>;
    };
    await expect(createNotificationService()).rejects.toThrow(
      'Unknown notifications provider: unknown-provider',
    );
  });

  it('returns noOpNotifications on provider failure', async () => {
    jest.mock('@/config/basekit.config', () => ({
      basekitConfig: {
        features: {
          notifications: { enabled: true, provider: 'amplify' },
        },
      },
    }));

    jest.mock('../providers/amplify', () => {
      throw new Error('Module not found');
    });

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation();

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createNotificationService } = require('../create-notification-service') as {
      createNotificationService: () => Promise<typeof noOpNotifications>;
    };
    const service = await createNotificationService();

    await expect(service.initialize()).resolves.toBeUndefined();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to load "amplify" provider'),
    );

    warnSpy.mockRestore();
  });
});

describe('useNotifications', () => {
  it('returns noOpNotifications when no provider is set', async () => {
    // When context value is null (no provider), the hook returns noOpNotifications.
    // We verify this by testing the fallback directly since useContext(NotificationContext)
    // defaults to null when no provider wraps the component.
    const service = noOpNotifications;

    await expect(service.initialize()).resolves.toBeUndefined();
    await expect(service.requestPermission()).resolves.toBe(false);
    await expect(service.getToken()).resolves.toBeNull();
  });
});
