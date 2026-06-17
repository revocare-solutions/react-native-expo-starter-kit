export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
}

export interface AnalyticsUserProperties {
  userId?: string;
  traits?: Record<string, string | number | boolean>;
}
