import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';

export interface FormSelectOption {
  label: string;
  value: string;
}

export interface FormSelectProps {
  name: string;
  label: string;
  options: FormSelectOption[];
}

export function FormSelect({ name, label, options }: FormSelectProps) {
  const { control } = useFormContext();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </Text>
          <Pressable
            className={`border rounded-lg px-4 py-3 bg-white dark:bg-gray-800 ${
              error
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onPress={() => setIsOpen((prev) => !prev)}
          >
            <Text className="text-base text-gray-900 dark:text-gray-100">
              {options.find((o) => o.value === value)?.label || 'Select...'}
            </Text>
          </Pressable>
          {isOpen && (
            <View className="border border-gray-300 dark:border-gray-600 rounded-lg mt-1 bg-white dark:bg-gray-800">
              {options.map((option) => (
                <Pressable
                  key={option.value}
                  className={`px-4 py-3 ${
                    value === option.value
                      ? 'bg-blue-50 dark:bg-blue-900'
                      : ''
                  }`}
                  onPress={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <Text className="text-base text-gray-900 dark:text-gray-100">
                    {option.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
          {error?.message && (
            <Text className="text-sm text-red-500 mt-1">{error.message}</Text>
          )}
        </View>
      )}
    />
  );
}
