import React, { useEffect, useState } from 'react';
import type { SyncService } from '@/services/sync.interface';
import { starterConfig } from '@/config/starter.config';
import { SyncContext } from './sync-context';
import { createSyncService } from './create-sync-service';

function SyncProviderInner({ children }: { children: React.ReactNode }) {
  const [service, setService] = useState<SyncService | null>(null);

  useEffect(() => {
    createSyncService().then(setService);
  }, []);

  if (!service) return null;

  return (
    <SyncContext.Provider value={service}>
      {children}
    </SyncContext.Provider>
  );
}

export function SyncProvider({ children }: { children: React.ReactNode }) {
  if (!starterConfig.features.sync.enabled) {
    return <>{children}</>;
  }

  return <SyncProviderInner>{children}</SyncProviderInner>;
}
