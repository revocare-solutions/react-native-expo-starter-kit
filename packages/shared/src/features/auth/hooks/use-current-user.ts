import { useAuth } from './use-auth';

export function useCurrentUser() {
  const { user, isLoading } = useAuth();
  return { user, isLoading };
}
