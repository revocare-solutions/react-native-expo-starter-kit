import type { useAppStore as UseAppStoreType } from '../app-store';

type AppStore = typeof UseAppStoreType;

function getStore(): AppStore {
  jest.mock('@/config/starter.config', () => ({
    starterConfig: {
      features: {
        offlineStorage: { enabled: false, provider: 'mmkv' },
      },
    },
  }));

  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { useAppStore } = require('../app-store') as { useAppStore: AppStore };
  return useAppStore;
}

describe('useAppStore', () => {
  let useAppStore: AppStore;

  beforeEach(() => {
    jest.resetModules();
    useAppStore = getStore();
    useAppStore.setState({
      hasCompletedOnboarding: false,
      theme: 'system',
    });
  });

  it('has default state', () => {
    const state = useAppStore.getState();
    expect(state.hasCompletedOnboarding).toBe(false);
    expect(state.theme).toBe('system');
  });

  it('can set onboarding completed', () => {
    useAppStore.getState().setHasCompletedOnboarding(true);
    expect(useAppStore.getState().hasCompletedOnboarding).toBe(true);
  });

  it('can set theme', () => {
    useAppStore.getState().setTheme('dark');
    expect(useAppStore.getState().theme).toBe('dark');
  });
});
