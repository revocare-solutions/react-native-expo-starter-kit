import { AppState } from 'react-native';
import { apiClient } from '@/lib/api';
import type { AnalyticsService } from '@/services/analytics.interface';
import type { AnalyticsEvent, AnalyticsUserProperties } from '@/types';

const BATCH_SIZE = 10;
const FLUSH_INTERVAL_MS = 30000;

let eventBuffer: {
  eventName: string;
  eventCategory: string | undefined;
  properties: Record<string, string | number | boolean> | undefined;
  screenName: string | undefined;
  sessionId: string | undefined;
  deviceInfo: Record<string, unknown> | undefined;
  timestamp: string;
}[] = [];
let flushTimer: ReturnType<typeof setInterval> | null = null;
let userProperties: AnalyticsUserProperties = {};

async function flushEvents() {
  if (eventBuffer.length === 0) return;

  const eventsToSend = [...eventBuffer];
  eventBuffer = [];

  try {
    await apiClient.post('/api/analytics/events/batch', { events: eventsToSend });
  } catch {
    eventBuffer.unshift(...eventsToSend);
  }
}

function queueEvent(event: (typeof eventBuffer)[number]) {
  eventBuffer.push(event);
  if (eventBuffer.length >= BATCH_SIZE) {
    flushEvents();
  }
}

export function createBackendAnalytics(): AnalyticsService {
  return {
    async initialize() {
      flushTimer = setInterval(flushEvents, FLUSH_INTERVAL_MS);
      AppState.addEventListener('change', (state) => {
        if (state === 'background' || state === 'inactive') {
          flushEvents();
        }
      });
    },

    trackEvent(event: AnalyticsEvent) {
      queueEvent({
        eventName: event.name,
        eventCategory: undefined,
        properties: { ...event.properties, ...userProperties.traits } as
          | Record<string, string | number | boolean>
          | undefined,
        screenName: undefined,
        sessionId: undefined,
        deviceInfo: undefined,
        timestamp: new Date().toISOString(),
      });
    },

    trackScreen(screenName: string, properties?: Record<string, string>) {
      queueEvent({
        eventName: `screen_view_${screenName}`,
        eventCategory: 'screen_view',
        properties: { ...properties, ...userProperties.traits },
        screenName,
        sessionId: undefined,
        deviceInfo: undefined,
        timestamp: new Date().toISOString(),
      });
    },

    setUserProperties(properties: AnalyticsUserProperties) {
      userProperties = { ...userProperties, ...properties };
    },

    reset() {
      userProperties = {};
      if (flushTimer) {
        clearInterval(flushTimer);
        flushTimer = null;
      }
      eventBuffer = [];
    },
  };
}
