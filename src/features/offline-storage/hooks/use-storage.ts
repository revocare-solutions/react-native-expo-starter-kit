import { useContext } from 'react';
import { StorageContext } from '../storage-provider';
import { noOpStorage } from '../no-op-storage';
import { starterConfig } from '@/config/starter.config';

export function useStorage() {
  const storage = useContext(StorageContext);

  if (!starterConfig.features.offlineStorage.enabled) {
    return noOpStorage;
  }

  if (!storage) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return storage;
}
