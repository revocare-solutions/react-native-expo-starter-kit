import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@/types';
import { useAuth } from './use-auth';

export function useSession() {
  const { getSession } = useAuth();
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const s = await getSession();
    setSession(s);
    setIsLoading(false);
  }, [getSession]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { session, isLoading, refresh };
}
