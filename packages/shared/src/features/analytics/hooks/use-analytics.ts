import { useContext } from 'react';
import { AnalyticsContext } from '../analytics-provider';
import { noOpAnalytics } from '../no-op-analytics';

export function useAnalytics() {
  const service = useContext(AnalyticsContext);

  if (!service) {
    return noOpAnalytics;
  }

  return service;
}
