import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { useAppForm, FormInput, emailSchema } from '@/features/forms';
import { useAuth } from '@/features/auth';

const forgotPasswordSchema = z.object({
  email: emailSchema,
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordScreen() {
  const { resetPassword } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useAppForm<ForgotPasswordFormData>(forgotPasswordSchema, {
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      await resetPassword(data.email);
      router.push({
        pathname: '/(auth)/verify-code',
        params: { email: data.email },
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-white dark:bg-gray-900"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-6">
        <Text className="text-3xl font-bold text-center text-gray-900 dark:text-gray-100 mb-2">
          Reset Password
        </Text>
        <Text className="text-base text-center text-gray-500 dark:text-gray-400 mb-8">
          {"Enter your email and we'll send you a verification code"}
        </Text>

        {error && (
          <View className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
            <Text className="text-sm text-red-700 dark:text-red-400">{error}</Text>
          </View>
        )}

        <FormProvider {...form}>
          <FormInput
            name="email"
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <Pressable
            className="bg-blue-600 rounded-lg py-3.5 mt-2 items-center active:bg-blue-700"
            onPress={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold text-base">Send Reset Code</Text>
            )}
          </Pressable>
        </FormProvider>

        <Link href="/(auth)/login" asChild>
          <Pressable className="mt-4 items-center">
            <Text className="text-blue-600 dark:text-blue-400 text-sm">Back to Sign In</Text>
          </Pressable>
        </Link>
      </View>
    </KeyboardAvoidingView>
  );
}
