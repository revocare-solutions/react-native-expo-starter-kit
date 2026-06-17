import { z } from 'zod';

const envSchema = z.object({
  // API
  EXPO_PUBLIC_API_URL: z.string().optional(),

  // Auth - Supabase
  EXPO_PUBLIC_SUPABASE_URL: z.string().optional(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),

  // Auth - AWS Amplify (Cognito)
  EXPO_PUBLIC_COGNITO_USER_POOL_ID: z.string().optional(),
  EXPO_PUBLIC_COGNITO_CLIENT_ID: z.string().optional(),
  EXPO_PUBLIC_COGNITO_IDENTITY_POOL_ID: z.string().optional(),

  // Crash Reporting - Sentry
  EXPO_PUBLIC_SENTRY_DSN: z.string().optional(),

  // App Environment
  EXPO_PUBLIC_APP_ENV: z
    .enum(['development', 'staging', 'production'])
    .default('development'),
});

type Env = z.infer<typeof envSchema>;

function parseEnv(): Env {
  const raw = {
    EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_COGNITO_USER_POOL_ID: process.env.EXPO_PUBLIC_COGNITO_USER_POOL_ID,
    EXPO_PUBLIC_COGNITO_CLIENT_ID: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID,
    EXPO_PUBLIC_COGNITO_IDENTITY_POOL_ID: process.env.EXPO_PUBLIC_COGNITO_IDENTITY_POOL_ID,
    EXPO_PUBLIC_SENTRY_DSN: process.env.EXPO_PUBLIC_SENTRY_DSN,
    EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
  };

  const result = envSchema.safeParse(raw);

  if (!result.success) {
    console.error('[env] Invalid environment variables:', result.error.flatten().fieldErrors);
    // Fall back to defaults rather than crashing — dev experience matters
    return envSchema.parse({});
  }

  return result.data;
}

export const env = parseEnv();

export const isDev = env.EXPO_PUBLIC_APP_ENV === 'development';
export const isStaging = env.EXPO_PUBLIC_APP_ENV === 'staging';
export const isProd = env.EXPO_PUBLIC_APP_ENV === 'production';
