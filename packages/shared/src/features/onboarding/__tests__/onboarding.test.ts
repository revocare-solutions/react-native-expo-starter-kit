import { renderHook, act } from '@testing-library/react-native';
import { useOnboarding } from '../hooks/use-onboarding';
import { basekitConfig } from '@/config/basekit.config';
import { useAppStore } from '@/store/app-store';

jest.mock('@/config/basekit.config', () => ({
  basekitConfig: {
    features: { onboarding: { enabled: true } },
  },
}));

const mockSetHasCompletedOnboarding = jest.fn();

jest.mock('@/store/app-store', () => ({
  useAppStore: jest.fn(),
}));

const mockUseAppStore = useAppStore as unknown as jest.Mock;

const mockConfig = basekitConfig as {
  features: { onboarding: { enabled: boolean } };
};

describe('useOnboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockConfig.features.onboarding.enabled = true;
    mockUseAppStore.mockImplementation((selector: (state: Record<string, unknown>) => unknown) =>
      selector({
        hasCompletedOnboarding: false,
        setHasCompletedOnboarding: mockSetHasCompletedOnboarding,
      }),
    );
  });

  it('returns shouldShow=true when enabled and not completed', () => {
    const { result } = renderHook(() => useOnboarding());
    expect(result.current.shouldShow).toBe(true);
    expect(result.current.enabled).toBe(true);
  });

  it('returns shouldShow=false when disabled', () => {
    mockConfig.features.onboarding.enabled = false;

    const { result } = renderHook(() => useOnboarding());
    expect(result.current.shouldShow).toBe(false);
    expect(result.current.enabled).toBe(false);
  });

  it('returns shouldShow=false when completed', () => {
    mockUseAppStore.mockImplementation((selector: (state: Record<string, unknown>) => unknown) =>
      selector({
        hasCompletedOnboarding: true,
        setHasCompletedOnboarding: mockSetHasCompletedOnboarding,
      }),
    );

    const { result } = renderHook(() => useOnboarding());
    expect(result.current.shouldShow).toBe(false);
  });

  it('complete() calls setHasCompletedOnboarding(true)', () => {
    const { result } = renderHook(() => useOnboarding());
    act(() => {
      result.current.complete();
    });
    expect(mockSetHasCompletedOnboarding).toHaveBeenCalledWith(true);
  });

  it('reset() calls setHasCompletedOnboarding(false)', () => {
    const { result } = renderHook(() => useOnboarding());
    act(() => {
      result.current.reset();
    });
    expect(mockSetHasCompletedOnboarding).toHaveBeenCalledWith(false);
  });
});
