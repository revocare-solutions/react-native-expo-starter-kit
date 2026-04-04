import React, { useState } from 'react';
import { View, Text, Pressable, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { FormProvider } from 'react-hook-form';
import { z } from 'zod';
import { useAppForm, FormInput, emailSchema, passwordSchema } from '@/features/forms';
import { useAuth } from '@/features/auth';

const loginSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function AdminLoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useAppForm<LoginFormData>(loginSchema, {
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await signIn(data.email, data.password);

      if (result.success) {
        router.replace('/(tabs)');
      } else {
        setError(result.error ?? 'Sign-in failed. Please try again.');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-slate-900"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View className="flex-1 justify-center px-6">
        <View className="bg-blue-600 w-16 h-16 rounded-2xl items-center justify-center self-center mb-6">
          <Text className="text-white text-2xl font-bold">A</Text>
        </View>
        <Text className="text-3xl font-bold text-center text-white mb-2">
          Admin Portal
        </Text>
        <Text className="text-base text-center text-slate-400 mb-8">
          Sign in with your admin credentials
        </Text>

        {error && (
          <View className="bg-red-900/30 border border-red-700 rounded-lg p-3 mb-4">
            <Text className="text-sm text-red-400">{error}</Text>
          </View>
        )}

        <FormProvider {...form}>
          <FormInput
            name="email"
            label="Email"
            placeholder="admin@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
          />

          <FormInput
            name="password"
            label="Password"
            placeholder="Enter your password"
            secureTextEntry
            autoComplete="password"
          />

          <Pressable
            className="bg-blue-600 rounded-lg py-3.5 mt-2 items-center active:bg-blue-700"
            onPress={form.handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text className="text-white font-semibold text-base">Sign In</Text>
            )}
          </Pressable>
        </FormProvider>
      </View>
    </KeyboardAvoidingView>
  );
}
