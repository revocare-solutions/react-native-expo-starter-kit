import { createClient } from '@supabase/supabase-js';
import { basekitConfig } from '@/config/basekit.config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (
  basekitConfig.features.auth.provider === 'supabase' &&
  basekitConfig.features.auth.enabled &&
  (!supabaseUrl || !supabaseAnonKey)
) {
  console.warn(
    '[supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Supabase auth will not work until these are set in your .env file.',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
