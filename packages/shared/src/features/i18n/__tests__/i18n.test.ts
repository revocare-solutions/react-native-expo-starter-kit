describe('i18n', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('initializes with default locale and resolves translation keys', async () => {
    jest.mock('expo-localization', () => ({
      getLocales: () => [{ languageCode: 'en' }],
    }));

    jest.mock('@/config/basekit.config', () => ({
      basekitConfig: {
        features: {
          i18n: { enabled: true, defaultLocale: 'en' },
        },
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const i18next = require('../i18n').default as typeof import('i18next').default;

    // Wait for initialization to complete
    await i18next.init;

    expect(i18next.language).toBe('en');
    expect(i18next.t('common.loading')).toBe('Loading...');
    expect(i18next.t('auth.login')).toBe('Log In');
    expect(i18next.t('tabs.home')).toBe('Home');
  });

  it('falls back to default locale for unsupported device language', async () => {
    jest.mock('expo-localization', () => ({
      getLocales: () => [{ languageCode: 'fr' }],
    }));

    jest.mock('@/config/basekit.config', () => ({
      basekitConfig: {
        features: {
          i18n: { enabled: true, defaultLocale: 'en' },
        },
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const i18next = require('../i18n').default as typeof import('i18next').default;

    await i18next.init;

    // Should fall back to English
    expect(i18next.t('common.loading')).toBe('Loading...');
  });

  it('resolves Spanish translations when locale is es', async () => {
    jest.mock('expo-localization', () => ({
      getLocales: () => [{ languageCode: 'es' }],
    }));

    jest.mock('@/config/basekit.config', () => ({
      basekitConfig: {
        features: {
          i18n: { enabled: true, defaultLocale: 'en' },
        },
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const i18next = require('../i18n').default as typeof import('i18next').default;

    await i18next.init;

    expect(i18next.language).toBe('es');
    expect(i18next.t('common.loading')).toBe('Cargando...');
    expect(i18next.t('auth.login')).toBe('Iniciar sesi\u00f3n');
  });
});
