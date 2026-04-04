import React, { createContext, useEffect, useState } from 'react';
import type { StorageService } from '@/services/storage.interface';
import { basekitConfig } from '@/config/basekit.config';
import { createStorageService } from './create-storage-service';

export const StorageContext = createContext<StorageService | null>(null);

function StorageProviderInner({ children }: { children: React.ReactNode }) {
  const [storage, setStorage] = useState<StorageService | null>(null);

  useEffect(() => {
    createStorageService().then(setStorage);
  }, []);

  return (
    <StorageContext.Provider value={storage}>
      {children}
    </StorageContext.Provider>
  );
}

export function StorageProvider({ children }: { children: React.ReactNode }) {
  if (!basekitConfig.features.offlineStorage.enabled) {
    return <>{children}</>;
  }

  return <StorageProviderInner>{children}</StorageProviderInner>;
}
