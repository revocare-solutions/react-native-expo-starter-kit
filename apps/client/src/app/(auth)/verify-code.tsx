import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { useAppForm, FormInput, passwordSchema, requiredString } from '@/features/forms';
import { useAuth } from '@/features/auth';

const verifyCodeSchema = z.object({
  code: requiredString,
  newPassword: passwordSchema,
});

type VerifyCodeFormData = z.infer<typeof verifyCodeSchema>;

export default function VerifyCodeScreen() {
  const { confirmResetPassword } = useAuth();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const form = useAppForm<VerifyCodeFormData>(verifyCodeSchema, {
    defaultValues: { code: '', newPassword: '' },
  });

  const onSubmit = async (data: VerifyCodeFormData) => {
    if (!email) {
      setError('Email is required. Please go back and try again.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await confirmResetPassword(email, data.code, data.newPassword);
      setSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-900 justify-center px-6">
        <Text className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
          Password Reset
        </Text>
        <Text className="text-base text-center text-gray-500 dark:text-gray-400 mb-8">
          Your password has been reset successfully.
        </Text>
        <Pressable
          className="bg-blue-600 rounded-lg py-3.5 items-center active:bg-blue-700"
          onPress={() => router.replace('/(auth)/login')}
        >
          <Text className="text-white font-semibold text-base">Back to Sign In</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-gray-900"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
          Enter Code
        </Text>
        <Text className="text-base text-center text-gray-500 dark:text-gray-400 mb-8">
          Check your email for a verification code
        </Text>

        {error && (
          <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <Text className="text-sm text-red-700 dark:text-red-400">{error}</Text>
          </View>
        )}

        <FormProvider {...form}>
          <FormInput
            name="code"
            label="Verification Code"
            placeholder="Enter the code from your email"
            keyboardType="number-pad"
            autoComplete="one-time-code"
          />

          <FormInput
            name="newPassword"
            label="New Password"
            placeholder="At least 8 characters"
            secureTextEntry
            autoComplete="new-password"
          />

          <Pressable
            className="bg-blue-600 rounded-lg py-3.5 mt-2 items-center active:bg-blue-700"
            onPress={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold text-base">Reset Password</Text>
            )}
          </Pressable>
        </FormProvider>
      </View>
    </KeyboardAvoidingView>
  );
}
