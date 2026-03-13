import { noOpStorage } from '../no-op-storage';

describe('noOpStorage', () => {
  it('get returns null', () => {
    expect(noOpStorage.get('any-key')).toBeNull();
  });

  it('set does not throw', () => {
    expect(() => noOpStorage.set('key', 'value')).not.toThrow();
  });

  it('delete does not throw', () => {
    expect(() => noOpStorage.delete('key')).not.toThrow();
  });

  it('contains returns false', () => {
    expect(noOpStorage.contains('key')).toBe(false);
  });

  it('clearAll does not throw', () => {
    expect(() => noOpStorage.clearAll()).not.toThrow();
  });

  it('getAllKeys returns empty array', () => {
    expect(noOpStorage.getAllKeys()).toEqual([]);
  });
});

describe('createStorageService', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('returns noOpStorage when feature is disabled', async () => {
    jest.mock('@/config/starter.config', () => ({
      starterConfig: {
        features: {
          offlineStorage: { enabled: false, provider: 'mmkv' },
        },
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createStorageService } = require('../create-storage-service') as {
      createStorageService: () => Promise<typeof noOpStorage>;
    };
    const storage = await createStorageService();

    expect(storage.get('test')).toBeNull();
    expect(storage.contains('test')).toBe(false);
    expect(storage.getAllKeys()).toEqual([]);
  });

  it('throws for unknown provider', async () => {
    jest.mock('@/config/starter.config', () => ({
      starterConfig: {
        features: {
          offlineStorage: {
            enabled: true,
            provider: 'unknown-provider',
          },
        },
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { createStorageService } = require('../create-storage-service') as {
      createStorageService: () => Promise<typeof noOpStorage>;
    };
    await expect(createStorageService()).rejects.toThrow(
      'Unknown storage provider: unknown-provider',
    );
  });
});
