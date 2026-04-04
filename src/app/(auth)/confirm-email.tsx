import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { useAppForm, FormInput, requiredString } from '@/features/forms';
import { useAuth } from '@/features/auth';

const confirmEmailSchema = z.object({
  token: requiredString,
});

type ConfirmEmailFormData = z.infer<typeof confirmEmailSchema>;

export default function ConfirmEmailScreen() {
  const { verifyEmail, resendVerificationEmail } = useAuth();
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  const form = useAppForm<ConfirmEmailFormData>(confirmEmailSchema, {
    defaultValues: { token: '' },
  });

  const onSubmit = async (data: ConfirmEmailFormData) => {
    if (!email) {
      setError('Email is required. Please go back and register again.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const result = await verifyEmail(email, data.token);

      if (result.success) {
        router.replace('/(tabs)');
      } else {
        setError(result.error ?? 'Verification failed. Please try again.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!email) return;

    setIsResending(true);
    setResendSuccess(false);
    setError(null);

    try {
      await resendVerificationEmail(email);
      setResendSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to resend email.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-gray-900"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-6">
        <Text className="text-5xl text-center mb-4">📧</Text>
        <Text className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
          Check Your Email
        </Text>
        <Text className="text-base text-center text-gray-500 dark:text-gray-400 mb-2">
          {"We've sent a verification code to"}
        </Text>
        <Text className="text-base font-semibold text-center text-gray-900 dark:text-gray-100 mb-6">
          {email}
        </Text>

        <View className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 mb-4">
          <Text className="text-sm text-blue-700 dark:text-blue-400 text-center">
            View emails at{' '}
            <Text className="font-semibold">http://localhost:9000</Text>
            {' '}(Inbucket)
          </Text>
        </View>

        {error && (
          <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <Text className="text-sm text-red-700 dark:text-red-400">{error}</Text>
          </View>
        )}

        {resendSuccess && (
          <View className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3 mb-4">
            <Text className="text-sm text-green-700 dark:text-green-400">
              Verification email sent! Check your inbox.
            </Text>
          </View>
        )}

        <FormProvider {...form}>
          <FormInput
            name="token"
            label="Verification Code"
            placeholder="Enter the 6-digit code"
            keyboardType="number-pad"
            autoComplete="one-time-code"
          />

          <Pressable
            className="bg-blue-600 rounded-lg py-3.5 mt-2 items-center active:bg-blue-700"
            onPress={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold text-base">Verify Email</Text>
            )}
          </Pressable>
        </FormProvider>

        <Pressable
          className="mt-4 items-center"
          onPress={handleResend}
          disabled={isResending}
        >
          {isResending ? (
            <ActivityIndicator size="small" />
          ) : (
            <Text className="text-blue-600 dark:text-blue-400 text-sm">
              {"Didn't receive the code? Resend"}
            </Text>
          )}
        </Pressable>

        <Pressable
          className="mt-3 items-center"
          onPress={() => router.back()}
        >
          <Text className="text-gray-500 dark:text-gray-400 text-sm">Back to Register</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}
