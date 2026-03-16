import { createContext } from 'react';
import type { SyncService } from '@/services/sync.interface';

export const SyncContext = createContext<SyncService | null>(null);
