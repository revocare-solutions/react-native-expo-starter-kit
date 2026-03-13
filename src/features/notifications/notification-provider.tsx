import React, { createContext, useEffect, useState } from 'react';
import type { NotificationService } from '@/services/notifications.interface';
import { starterConfig } from '@/config/starter.config';
import { createNotificationService } from './create-notification-service';

export const NotificationContext = createContext<NotificationService | null>(null);

function NotificationProviderInner({ children }: { children: React.ReactNode }) {
  const [service, setService] = useState<NotificationService | null>(null);

  useEffect(() => {
    createNotificationService().then(setService);
  }, []);

  if (!service) return null;

  return (
    <NotificationContext.Provider value={service}>
      {children}
    </NotificationContext.Provider>
  );
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  if (!starterConfig.features.notifications.enabled) {
    return <>{children}</>;
  }

  return <NotificationProviderInner>{children}</NotificationProviderInner>;
}
