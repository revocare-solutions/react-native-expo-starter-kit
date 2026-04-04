import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';

export interface FormCheckboxProps {
  name: string;
  label: string;
}

export function FormCheckbox({ name, label }: FormCheckboxProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className="mb-4">
          <Pressable
            className="flex-row items-center"
            onPress={() => onChange(!value)}
          >
            <View
              className={`h-5 w-5 rounded border mr-2 items-center justify-center ${
                value
                  ? 'bg-blue-500 border-blue-500'
                  : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600'
              }`}
            >
              {value && (
                <Text className="text-white text-xs font-bold">✓</Text>
              )}
            </View>
            <Text className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </Text>
          </Pressable>
          {error?.message && (
            <Text className="text-sm text-red-500 mt-1">{error.message}</Text>
          )}
        </View>
      )}
    />
  );
}
