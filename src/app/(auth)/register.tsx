import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { useAppForm, FormInput, emailSchema, passwordSchema } from '@/features/forms';
import { useAuth } from '@/features/auth';

const registerSchema = z
  .object({
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterScreen() {
  const { signUp, signIn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useAppForm<RegisterFormData>(registerSchema, {
    defaultValues: { email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signUp(data.email, data.password);

      if (result.success) {
        // Auto-login after registration (email verification is disabled)
        const loginResult = await signIn(data.email, data.password);
        if (loginResult.success) {
          router.replace('/(tabs)');
        } else {
          router.replace('/(auth)/login');
        }
      } else {
        setError(result.error ?? 'Sign-up failed. Please try again.');
      }
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
          Create Account
        </Text>
        <Text className="text-base text-center text-gray-500 dark:text-gray-400 mb-8">
          Sign up to get started
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

          <FormInput
            name="password"
            label="Password"
            placeholder="At least 8 characters"
            secureTextEntry
            autoComplete="new-password"
          />

          <FormInput
            name="confirmPassword"
            label="Confirm Password"
            placeholder="Re-enter your password"
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
              <Text className="text-white font-semibold text-base">Create Account</Text>
            )}
          </Pressable>
        </FormProvider>

        <View className="flex-row justify-center mt-6">
          <Text className="text-gray-500 dark:text-gray-400 text-sm">
            Already have an account?{' '}
          </Text>
          <Link href="/(auth)/login" asChild>
            <Pressable>
              <Text className="text-blue-600 dark:text-blue-400 font-semibold text-sm">
                Sign In
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}
