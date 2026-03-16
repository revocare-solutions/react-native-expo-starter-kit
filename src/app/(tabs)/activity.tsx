import { useQuery } from '@tanstack/react-query';
import { useContext } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Collapsible } from '@/components/ui/collapsible';
import { AnalyticsContext } from '@/features/analytics/analytics-provider';
import { CrashReportingContext } from '@/features/crash-reporting/crash-reporting-provider';
import { useNotificationHistory } from '@/features/notifications/hooks/use-notification-history';
import { useSendNotification } from '@/features/notifications/hooks/use-send-notification';
import { useSync } from '@/features/sync/hooks/use-sync';
import { apiClient } from '@/lib/api';

interface AnalyticsEventItem {
  id: string;
  eventName: string;
  timestamp: string;
}

interface CrashReportItem {
  id: string;
  errorMessage: string;
  severity: string;
  timestamp: string;
}

function ActionButton({
  label,
  onPress,
  loading,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={loading}
      className={`rounded-lg py-2 px-4 mt-3 items-center ${
        loading ? 'bg-blue-300' : 'bg-blue-500'
      }`}>
      <ThemedText className="text-white text-sm font-semibold">
        {loading ? 'Working...' : label}
      </ThemedText>
    </Pressable>
  );
}

function AnalyticsSection() {
  const analytics = useContext(AnalyticsContext);

  const { data, isLoading } = useQuery({
    queryKey: ['analytics-events'],
    queryFn: async () => {
      const response = await apiClient.get<{ content: AnalyticsEventItem[] }>(
        '/api/analytics/events',
        { params: { page: 0, size: 10 } },
      );
      return response.data;
    },
  });

  const handleFireEvent = () => {
    if (analytics) {
      analytics.trackEvent({ name: 'test_event', properties: { source: 'activity_screen' } });
      Alert.alert('Event Fired', 'Test analytics event has been tracked.');
    } else {
      Alert.alert('Not Available', 'Analytics service is not enabled.');
    }
  };

  return (
    <Collapsible title="Analytics Events">
      {isLoading ? (
        <ActivityIndicator size="small" />
      ) : (
        <View>
          {data?.content?.length ? (
            data.content.map((event) => (
              <View key={event.id} className="py-1">
                <ThemedText className="text-sm font-medium">{event.eventName}</ThemedText>
                <ThemedText className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(event.timestamp).toLocaleString()}
                </ThemedText>
              </View>
            ))
          ) : (
            <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
              No events recorded yet.
            </ThemedText>
          )}
        </View>
      )}
      <ActionButton label="Fire Test Event" onPress={handleFireEvent} />
    </Collapsible>
  );
}

function CrashReportsSection() {
  const crashReporting = useContext(CrashReportingContext);

  const { data, isLoading } = useQuery({
    queryKey: ['crash-reports'],
    queryFn: async () => {
      const response = await apiClient.get<{ content: CrashReportItem[] }>('/api/crash-reports', {
        params: { page: 0, size: 10 },
      });
      return response.data;
    },
  });

  const handleTriggerCrash = () => {
    if (crashReporting) {
      crashReporting.captureMessage('Test crash report', 'warning');
      Alert.alert('Report Sent', 'Test crash report has been captured.');
    } else {
      Alert.alert('Not Available', 'Crash reporting service is not enabled.');
    }
  };

  return (
    <Collapsible title="Crash Reports">
      {isLoading ? (
        <ActivityIndicator size="small" />
      ) : (
        <View>
          {data?.content?.length ? (
            data.content.map((report) => (
              <View key={report.id} className="py-1">
                <ThemedText className="text-sm font-medium">{report.errorMessage}</ThemedText>
                <ThemedText className="text-xs text-gray-500 dark:text-gray-400">
                  {report.severity} — {new Date(report.timestamp).toLocaleString()}
                </ThemedText>
              </View>
            ))
          ) : (
            <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
              No crash reports yet.
            </ThemedText>
          )}
        </View>
      )}
      <ActionButton label="Trigger Test Crash" onPress={handleTriggerCrash} />
    </Collapsible>
  );
}

function NotificationsSection() {
  const { data, isLoading } = useNotificationHistory();
  const sendNotification = useSendNotification();

  const handleSendNotification = () => {
    sendNotification.mutate(
      { title: 'Test Notification', body: 'This is a test notification from the Activity screen.' },
      {
        onSuccess: () => Alert.alert('Sent', 'Test notification has been sent.'),
        onError: (error) =>
          Alert.alert('Error', error instanceof Error ? error.message : 'Failed to send'),
      },
    );
  };

  return (
    <Collapsible title="Notifications">
      {isLoading ? (
        <ActivityIndicator size="small" />
      ) : (
        <View>
          {data?.content?.length ? (
            data.content.map((notification) => (
              <View key={notification.id} className="py-1">
                <ThemedText className="text-sm font-medium">{notification.title}</ThemedText>
                <ThemedText className="text-xs text-gray-500 dark:text-gray-400">
                  {notification.body ?? 'No body'} — {notification.status}
                </ThemedText>
              </View>
            ))
          ) : (
            <ThemedText className="text-sm text-gray-500 dark:text-gray-400">
              No notifications yet.
            </ThemedText>
          )}
        </View>
      )}
      <ActionButton
        label="Send Test Notification"
        onPress={handleSendNotification}
        loading={sendNotification.isPending}
      />
    </Collapsible>
  );
}

function SyncSection() {
  const { syncNow, isSyncing, lastSyncVersion } = useSync();

  return (
    <Collapsible title="Sync">
      <View className="py-1">
        <ThemedText className="text-sm">
          <ThemedText className="text-sm font-semibold">Last Sync Version: </ThemedText>
          {lastSyncVersion ?? 'Never synced'}
        </ThemedText>
        <ThemedText className="text-sm mt-1">
          <ThemedText className="text-sm font-semibold">Status: </ThemedText>
          {isSyncing ? 'Syncing...' : 'Idle'}
        </ThemedText>
      </View>
      <ActionButton label="Sync Now" onPress={syncNow} loading={isSyncing} />
    </Collapsible>
  );
}

export default function ActivityScreen() {
  return (
    <ThemedView className="flex-1 pt-12">
      <View className="px-4 mb-4">
        <ThemedText type="title">Activity</ThemedText>
        <ThemedText className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Monitor backend integrations and trigger test actions.
        </ThemedText>
      </View>
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 32 }}>
        <View className="gap-4">
          <AnalyticsSection />
          <CrashReportsSection />
          <NotificationsSection />
          <SyncSection />
        </View>
      </ScrollView>
    </ThemedView>
  );
}
