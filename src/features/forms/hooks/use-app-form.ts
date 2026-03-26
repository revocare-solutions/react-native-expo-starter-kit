import { useForm, type UseFormProps, type UseFormReturn, type FieldValues, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { ZodType, ZodTypeDef } from 'zod';
import { basekitConfig } from '@/config/basekit.config';

export function useAppForm<T extends FieldValues>(
  schema: ZodType<T, ZodTypeDef, T>,
  options?: Omit<UseFormProps<T>, 'resolver'>,
): UseFormReturn<T, unknown, T> {
  if (!basekitConfig.features.forms.enabled) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useForm<T>(options) as UseFormReturn<T, unknown, T>;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  return useForm<T>({
    // @hookform/resolvers v5 types expect an internal Zod3Type that doesn't match zod v3's ZodType
    resolver: zodResolver(schema as unknown as Parameters<typeof zodResolver>[0]) as unknown as Resolver<T>,
    ...options,
  }) as UseFormReturn<T, unknown, T>;
}
