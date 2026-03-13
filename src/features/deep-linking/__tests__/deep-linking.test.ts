import * as Linking from 'expo-linking';
import { renderHook } from '@testing-library/react-native';
import { useDeepLink } from '../hooks/use-deep-link';
import { starterConfig } from '@/config/starter.config';

jest.mock('expo-linking', () => ({
  getInitialURL: jest.fn().mockResolvedValue(null),
  addEventListener: jest.fn().mockReturnValue({ remove: jest.fn() }),
}));

jest.mock('@/config/starter.config', () => ({
  starterConfig: {
    app: { scheme: 'myapp' },
    features: { deepLinking: { enabled: true } },
  },
}));

describe('buildDeepLink', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  it('constructs correct URL from config scheme', () => {
    jest.mock('@/config/starter.config', () => ({
      starterConfig: {
        app: { scheme: 'myapp' },
        features: { deepLinking: { enabled: true } },
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { buildDeepLink } = require('../utils/build-deep-link') as {
      buildDeepLink: (path: string) => string;
    };

    expect(buildDeepLink('profile/123')).toBe('myapp://profile/123');
  });

  it('handles path with leading slash', () => {
    jest.mock('@/config/starter.config', () => ({
      starterConfig: {
        app: { scheme: 'myapp' },
        features: { deepLinking: { enabled: true } },
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { buildDeepLink } = require('../utils/build-deep-link') as {
      buildDeepLink: (path: string) => string;
    };

    expect(buildDeepLink('/settings')).toBe('myapp://settings');
  });

  it('handles path without leading slash', () => {
    jest.mock('@/config/starter.config', () => ({
      starterConfig: {
        app: { scheme: 'testapp' },
        features: { deepLinking: { enabled: true } },
      },
    }));

    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { buildDeepLink } = require('../utils/build-deep-link') as {
      buildDeepLink: (path: string) => string;
    };

    expect(buildDeepLink('home')).toBe('testapp://home');
  });
});

describe('useDeepLink', () => {
  const mockGetInitialURL = Linking.getInitialURL as jest.Mock;
  const mockAddEventListener = Linking.addEventListener as jest.Mock;
  const mockConfig = starterConfig as { app: { scheme: string }; features: { deepLinking: { enabled: boolean } } };

  beforeEach(() => {
    jest.clearAllMocks();
    mockGetInitialURL.mockResolvedValue(null);
    mockAddEventListener.mockReturnValue({ remove: jest.fn() });
    mockConfig.features.deepLinking.enabled = true;
  });

  it('returns null initially when deep linking is disabled', () => {
    mockConfig.features.deepLinking.enabled = false;

    const { result } = renderHook(() => useDeepLink());
    expect(result.current.lastUrl).toBeNull();
    expect(mockGetInitialURL).not.toHaveBeenCalled();
    expect(mockAddEventListener).not.toHaveBeenCalled();
  });

  it('returns null initially when deep linking is enabled but no URL', () => {
    const { result } = renderHook(() => useDeepLink());
    expect(result.current.lastUrl).toBeNull();
  });

  it('calls getInitialURL and addEventListener when enabled', () => {
    renderHook(() => useDeepLink());
    expect(mockGetInitialURL).toHaveBeenCalled();
    expect(mockAddEventListener).toHaveBeenCalledWith('url', expect.any(Function));
  });

  it('cleans up subscription on unmount', () => {
    const removeMock = jest.fn();
    mockAddEventListener.mockReturnValue({ remove: removeMock });

    const { unmount } = renderHook(() => useDeepLink());
    unmount();
    expect(removeMock).toHaveBeenCalled();
  });
});
