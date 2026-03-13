import { starterConfig } from '@/config/starter.config';
import { useAppStore } from '@/store/app-store';

export function useOnboarding() {
  const hasCompleted = useAppStore((s) => s.hasCompletedOnboarding);
  const setCompleted = useAppStore((s) => s.setHasCompletedOnboarding);
  const enabled = starterConfig.features.onboarding.enabled;

  return {
    /** Whether onboarding should be shown */
    shouldShow: enabled && !hasCompleted,
    /** Mark onboarding as complete */
    complete: () => setCompleted(true),
    /** Reset onboarding (for development) */
    reset: () => setCompleted(false),
    /** Whether onboarding feature is enabled */
    enabled,
  };
}
