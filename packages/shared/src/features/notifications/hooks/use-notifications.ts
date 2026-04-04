import { useContext } from 'react';
import { NotificationContext } from '../notification-provider';
import { noOpNotifications } from '../no-op-notifications';

export function useNotifications() {
  const service = useContext(NotificationContext);

  if (!service) {
    return noOpNotifications;
  }

  return service;
}
