import React from 'react';
import { View, Text } from 'react-native';
import { useHasRole, type AppRole } from '@/hooks/use-role';

interface RequireRoleProps {
  role: AppRole | AppRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function RequireRole({ role, children, fallback }: RequireRoleProps) {
  const hasAccess = useHasRole(role);

  if (!hasAccess) {
    if (fallback) return <>{fallback}</>;

    return (
      <View className="flex-1 items-center justify-center p-6">
        <Text className="text-4xl mb-4">🔒</Text>
        <Text className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Access Denied
        </Text>
        <Text className="text-sm text-gray-500 dark:text-gray-400 text-center">
          You don&apos;t have permission to view this content.
        </Text>
      </View>
    );
  }

  return <>{children}</>;
}
