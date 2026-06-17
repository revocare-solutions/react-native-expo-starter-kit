import { View, Text } from 'react-native';

interface OnboardingPageProps {
  title: string;
  description: string;
  icon?: string;
}

export function OnboardingPage({ title, description, icon }: OnboardingPageProps) {
  return (
    <View className="flex-1 items-center justify-center px-8">
      {icon && <Text className="text-6xl mb-8">{icon}</Text>}
      <Text className="text-2xl font-bold text-center mb-4 text-gray-900 dark:text-white">
        {title}
      </Text>
      <Text className="text-base text-center text-gray-500 dark:text-gray-400">
        {description}
      </Text>
    </View>
  );
}
