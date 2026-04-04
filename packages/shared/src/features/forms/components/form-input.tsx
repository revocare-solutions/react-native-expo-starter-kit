import React from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';
import { useFormContext, Controller } from 'react-hook-form';

export interface FormInputProps extends Omit<TextInputProps, 'value' | 'onChangeText'> {
  name: string;
  label: string;
}

export function FormInput({ name, label, ...rest }: FormInputProps) {
  const { control } = useFormContext();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field: { onChange, onBlur, value }, fieldState: { error } }) => (
        <View className="mb-4">
          <Text className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </Text>
          <TextInput
            className={`border rounded-lg px-4 py-3 text-base text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 ${
              error
                ? 'border-red-500'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            value={value}
            onChangeText={onChange}
            onBlur={onBlur}
            {...rest}
          />
          {error?.message && (
            <Text className="text-sm text-red-500 mt-1">{error.message}</Text>
          )}
        </View>
      )}
    />
  );
}
